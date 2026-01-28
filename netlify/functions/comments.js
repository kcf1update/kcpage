// netlify/functions/comments.js
// Persistent comments stored in GitHub as data/comments.json

const GH_API = "https://api.github.com";

function json(statusCode, headers, obj) {
  return {
    statusCode,
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify(obj),
  };
}

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  };
}

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

async function ghRequest(path, token, options = {}) {
  const res = await fetch(`${GH_API}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      "User-Agent": "kcf1update-comments",
      Accept: "application/vnd.github+json",
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const msg =
      (data && (data.message || data.error)) ||
      `GitHub API error ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}

// GitHub "contents" API returns base64 content
function decodeBase64(b64) {
  return Buffer.from(b64, "base64").toString("utf8");
}
function encodeBase64(str) {
  return Buffer.from(str, "utf8").toString("base64");
}

async function readCommentsFile({ owner, repo, branch, path, token }) {
  // Try to read the file. If it doesn't exist, return empty list and no sha.
  try {
    const data = await ghRequest(
      `/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`,
      token
    );

    // data.content is base64
    const raw = decodeBase64(data.content || "");
    const parsed = raw ? JSON.parse(raw) : [];
    return { comments: Array.isArray(parsed) ? parsed : [], sha: data.sha };
  } catch (e) {
    // 404 means file not found — start fresh
    if (e.status === 404) return { comments: [], sha: null };
    throw e;
  }
}

async function writeCommentsFile({ owner, repo, branch, path, token, comments, sha }) {
  const content = encodeBase64(JSON.stringify(comments, null, 2));

  const body = {
    message: `Update comments (${new Date().toISOString()})`,
    content,
    branch,
    ...(sha ? { sha } : {}),
  };

  const data = await ghRequest(
    `/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`,
    token,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  return data;
}

exports.handler = async (event) => {
  const headers = corsHeaders();

  // Preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    // REQUIRED env vars
    const token = requireEnv("GITHUB_TOKEN");
    const owner = requireEnv("GITHUB_OWNER"); // kcf1update
    const repo = requireEnv("GITHUB_REPO");   // kcpage
    const branch = process.env.GITHUB_BRANCH || "main";

    // Where we store the JSON file in your repo
    const path = process.env.COMMENTS_FILE_PATH || "data/comments.json";

    if (event.httpMethod === "GET") {
      const { comments } = await readCommentsFile({ owner, repo, branch, path, token });
      return json(200, headers, { ok: true, comments });
    }

    if (event.httpMethod === "POST") {
      console.log("COMMENTS POST RECEIVED:", event.body);

      let data = {};
      try {
        data = JSON.parse(event.body || "{}");
      } catch {
        console.log("COMMENTS JSON PARSE ERROR");
        return json(400, headers, { ok: false, error: "Invalid JSON" });
      }

      console.log("COMMENTS PARSED DATA:", data);

      // Normalize fields to match your UI
      const message = String(data.message || data.text || "").trim();
      const name = String(data.name || data.author || "Anon").trim() || "Anon";

      console.log("COMMENTS NORMALIZED:", { name, messageLength: message.length });

      if (!message) {
        return json(400, headers, { ok: false, error: "Message is required" });
      }

      const newComment = {
        id: data.id || `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`,
        name,
        message,
        createdAt: data.createdAt || new Date().toLocaleString(),
        replies: Array.isArray(data.replies) ? data.replies : [],
      };

      console.log("COMMENTS NEW COMMENT:", {
        id: newComment.id,
        name: newComment.name,
        createdAt: newComment.createdAt,
        repliesCount: newComment.replies.length,
      });

      // Read current, append, write back (with sha for safe update)
      const { comments, sha } = await readCommentsFile({ owner, repo, branch, path, token });
      const updated = [newComment, ...(comments || [])];

      console.log("COMMENTS FILE READ:", { existingCount: (comments || []).length, hasSha: !!sha });
      console.log("COMMENTS FILE WRITE ATTEMPT:", { updatedCount: updated.length, path, branch });

      await writeCommentsFile({ owner, repo, branch, path, token, comments: updated, sha });

      console.log("COMMENTS FILE WRITE SUCCESS");

      return json(200, headers, { ok: true, comments: updated });
    }

    return json(405, headers, { ok: false, error: "Method not allowed" });
  } catch (e) {
    console.error("comments function error:", e);
    return json(500, headers, {
      ok: false,
      error: e.message || "Server error",
    });
  }
};
