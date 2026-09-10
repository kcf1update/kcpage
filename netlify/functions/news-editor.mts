import { getUser } from "@netlify/identity";
import type { Config, Context } from "@netlify/functions";
import lib from "./_shared/news-editor-lib.js";

const { ARCHIVE_PATH, NEWS_PATH, buildContentUpdate, parseExportedArray, validateArticles } = lib;
const GH_API = "https://api.github.com";

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function requireEnv(name: string) {
  const value = Netlify.env.get(name);
  if (!value) throw new Error(`Missing required editor setting: ${name}`);
  return value;
}

async function ghRequest(path: string, token: string, options: RequestInit = {}) {
  const result = await fetch(`${GH_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
      "User-Agent": "kcf1update-news-editor",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers || {}),
    },
  });
  const text = await result.text();
  let data: any;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!result.ok) {
    const error: Error & { status?: number } = new Error(data?.message || `GitHub returned ${result.status}.`);
    error.status = result.status;
    throw error;
  }
  return data;
}

function decodeContent(file: { content?: string }) {
  return Buffer.from(file.content || "", "base64").toString("utf8");
}

async function readState(owner: string, repo: string, branch: string, token: string) {
  const ref = await ghRequest(`/repos/${owner}/${repo}/git/ref/heads/${encodeURIComponent(branch)}`, token);
  const headSha = ref.object.sha;
  const [commit, newsFile, archiveFile] = await Promise.all([
    ghRequest(`/repos/${owner}/${repo}/git/commits/${headSha}`, token),
    ghRequest(`/repos/${owner}/${repo}/contents/${NEWS_PATH}?ref=${headSha}`, token),
    ghRequest(`/repos/${owner}/${repo}/contents/${ARCHIVE_PATH}?ref=${headSha}`, token),
  ]);
  const newsSource = decodeContent(newsFile);
  const archiveSource = decodeContent(archiveFile);
  return {
    headSha,
    treeSha: commit.tree.sha,
    newsSource,
    archiveSource,
    articles: parseExportedArray(newsSource, "newsSlots"),
    archiveGroups: parseExportedArray(archiveSource, "newsArchive"),
  };
}

async function createBlob(owner: string, repo: string, token: string, content: string) {
  return ghRequest(`/repos/${owner}/${repo}/git/blobs`, token, {
    method: "POST",
    body: JSON.stringify({ content, encoding: "utf-8" }),
  });
}

async function publish(owner: string, repo: string, branch: string, token: string, expectedHeadSha: string, articles: any[]) {
  const state = await readState(owner, repo, branch, token);
  if (state.headSha !== expectedHeadSha) {
    const error: Error & { status?: number } = new Error(
      "The website changed after this editor was loaded. Reload before publishing so no newer work is overwritten."
    );
    error.status = 409;
    throw error;
  }

  const content = buildContentUpdate({
    currentArticles: state.articles,
    nextArticles: articles,
    archiveSource: state.archiveSource,
    archiveGroups: state.archiveGroups,
  });
  const newsBlob = await createBlob(owner, repo, token, content.newsSource);
  const entries: any[] = [{ path: NEWS_PATH, mode: "100644", type: "blob", sha: newsBlob.sha }];
  if (content.archiveSource !== state.archiveSource) {
    const archiveBlob = await createBlob(owner, repo, token, content.archiveSource);
    entries.push({ path: ARCHIVE_PATH, mode: "100644", type: "blob", sha: archiveBlob.sha });
  }

  const tree = await ghRequest(`/repos/${owner}/${repo}/git/trees`, token, {
    method: "POST",
    body: JSON.stringify({ base_tree: state.treeSha, tree: entries }),
  });
  const date = String(articles[0]?.dateLabel || "daily news");
  const commit = await ghRequest(`/repos/${owner}/${repo}/git/commits`, token, {
    method: "POST",
    body: JSON.stringify({ message: `Update daily news for ${date}`, tree: tree.sha, parents: [state.headSha] }),
  });

  try {
    await ghRequest(`/repos/${owner}/${repo}/git/refs/heads/${encodeURIComponent(branch)}`, token, {
      method: "PATCH",
      body: JSON.stringify({ sha: commit.sha, force: false }),
    });
  } catch (error: any) {
    if (error.status === 409 || error.status === 422) {
      const conflict: Error & { status?: number } = new Error(
        "The website changed while publishing. Nothing was overwritten. Reload and try again."
      );
      conflict.status = 409;
      throw conflict;
    }
    throw error;
  }
  return { commitSha: commit.sha, archivedPreviousDay: content.archivedPreviousDay };
}

function emailAllowed(email?: string) {
  const allowed = requireEnv("NEWS_EDITOR_ALLOWED_EMAILS").split(",").map((value) => value.trim().toLowerCase()).filter(Boolean);
  return Boolean(email && allowed.includes(email.toLowerCase()));
}

export default async (request: Request, _context: Context) => {
  if (request.method !== "POST") return json(405, { ok: false, error: "Method not allowed." });
  if (request.headers.get("x-kc-editor") !== "1") return json(403, { ok: false, error: "Request not allowed." });

  try {
    const user = await getUser();
    if (!user) return json(401, { ok: false, error: "Please sign in to continue." });
    if (!emailAllowed(user.email)) return json(403, { ok: false, error: "This account is not allowed to publish website news." });

    let input: any;
    try { input = await request.json(); } catch { return json(400, { ok: false, error: "Invalid request." }); }
    const token = requireEnv("GITHUB_TOKEN");
    const owner = Netlify.env.get("GITHUB_OWNER") || "kcf1update";
    const repo = Netlify.env.get("GITHUB_REPO") || "kcpage";
    const branch = Netlify.env.get("NEWS_EDITOR_BRANCH") || "main";

    if (input.action === "load") {
      const state = await readState(owner, repo, branch, token);
      return json(200, { ok: true, articles: state.articles, headSha: state.headSha, branch });
    }
    if (input.action === "publish") {
      const validation = validateArticles(input.articles);
      if (!validation.ok) return json(400, validation);
      const headSha = String(input.headSha || "");
      if (!headSha) return json(400, { ok: false, error: "Reload before publishing." });
      const result = await publish(owner, repo, branch, token, headSha, validation.articles);
      return json(200, { ok: true, ...result });
    }
    return json(400, { ok: false, error: "Unknown editor action." });
  } catch (error: any) {
    console.error("news editor error", error);
    const status = Number(error.status) || 500;
    return json(status, {
      ok: false,
      error: status >= 500 ? "The editor hit a problem. Nothing was published. Please try again." : error.message,
    });
  }
};

export const config: Config = { path: "/api/kc-news-editor", method: ["POST"] };
