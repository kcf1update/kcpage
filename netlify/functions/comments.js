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
  try {
    const data = await ghRequest(
      `/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}?ref=${encodeURIComponent(branch)}`,
      token
    );

    const raw = decodeBase64(data.content || "");
    const parsed = raw ? JSON.parse(raw) : [];
    return { comments: Array.isArray(parsed) ? parsed : [], sha: data.sha };
  } catch (e) {
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

  return ghRequest(
    `/repos/${owner}/${repo}/contents/${encodeURIComponent(path)}`,
    token,
    {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
}

function makeId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
}

// Recursively append a reply to a node with id === parentId
function addReplyToTree(list, parentId, replyObj) {
  let found = false;

  const next = (list || []).map((n) => {
    if (!n || typeof n !== "object") return n;

    if (n.id === parentId) {
      found = true;
      const replies = Array.isArray(n.replies) ? n.replies : [];
      return { ...n, replies: [...replies, replyObj] };
    }

    const childReplies = Array.isArray(n.replies) ? n.replies : [];
    const updatedChildReplies = addReplyToTree(childReplies, parentId, replyObj);

    // If children changed, update this node
    if (updatedChildReplies !== childReplies) {
      found = true;
      return { ...n, replies: updatedChildReplies };
    }

    return n;
  });

  // If we never touched anything, return original list reference
  return found ? next : list;
}

exports.handler = async (event) => {
  const headers = corsHeaders();

  // Preflight
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 200, headers, body: "" };
  }

  try {
    const token = requireEnv("GITHUB_TOKEN");
    const owner = requireEnv("GITHUB_OWNER"); // kcf1update
    const repo = requireEnv("GITHUB_REPO");   // kcpage
    const branch = process.env.GITHUB_BRANCH || "main";
    const path = process.env.COMMENTS_FILE_PATH || "data/comments.json";

    if (event.httpMethod === "GET") {
      const { comments } = await readCommentsFile({ owner, repo, branch, path, token });
      return json(200, headers, { ok: true, comments });
    }

    if (event.httpMethod !== "POST") {
      return json(405, headers, { ok: false, error: "Method not allowed" });
    }

    console.log("COMMENTS POST RECEIVED:", event.body);

    let data = {};
    try {
      data = JSON.parse(event.body || "{}");
    } catch {
      console.log("COMMENTS JSON PARSE ERROR");
      return json(400, headers, { ok: false, error: "Invalid JSON" });
    }

    console.log("COMMENTS PARSED DATA:", data);

    const action = String(data.action || "comment").trim().toLowerCase();

    // Normalize fields
    const message = String(data.message || data.text || "").trim();
    const name = String(data.name || data.author || "Anon").trim() || "Anon";

    if (!message) {
      return json(400, headers, { ok: false, error: "Message is required" });
    }

    // Read current
    const { comments, sha } = await readCommentsFile({ owner, repo, branch, path, token });

    // ---------- NEW TOP-LEVEL COMMENT ----------
    if (action === "comment") {
      const newComment = {
        id: data.id || makeId(),
        name,
        message,
        createdAt: data.createdAt || new Date().toLocaleString(),
        replies: [], // do NOT accept client-provided replies
      };

      const updated = [newComment, ...(comments || [])];

      await writeCommentsFile({ owner, repo, branch, path, token, comments: updated, sha });

      return json(200, headers, { ok: true, comments: updated });
    }

    // ---------- REPLY TO EXISTING COMMENT ----------
    if (action === "reply") {
      const parentId = String(data.parentId || "").trim();
      if (!parentId) {
        return json(400, headers, { ok: false, error: "parentId is required for reply" });
      }

      const replyObj = {
        id: data.id || makeId(),
        name,
        message,
        createdAt: data.createdAt || new Date().toLocaleString(),
        replies: [], // allow nested replies later (same structure)
      };

      const updated = addReplyToTree(comments || [], parentId, replyObj);

      // If parentId wasn't found, updated will be same reference as comments
      if (updated === (comments || [])) {
        return json(404, headers, { ok: false, error: "Parent comment not found" });
      }

      await writeCommentsFile({ owner, repo, branch, path, token, comments: updated, sha });

      return json(200, headers, { ok: true, comments: updated });
    }

    return json(400, headers, { ok: false, error: `Unknown action: ${action}` });
  } catch (e) {
    console.error("comments function error:", e);
    return json(500, headers, {
      ok: false,
      error: e.message || "Server error",
    });
  }
};
