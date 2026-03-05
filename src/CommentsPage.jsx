// src/CommentsPage.jsx
import React, { useState, useEffect } from "react";

import AdBar from "./AdBar.jsx";
import TopCard from "./components/TopCard";
import PageNav from "./components/PageNav";

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const nowText = () => new Date().toLocaleString();

// --- Author identity (no sign-in, no user input) ---
function makeFanHandle() {
  const n = Math.floor(1000 + Math.random() * 9000);
  return `Fan-${n}`;
}

function getAuthorName() {
  try {
    if (localStorage.getItem("kc_is_owner") === "1") return "KC";

    let fan = localStorage.getItem("kc_fan_handle");
    if (!fan) {
      fan = makeFanHandle();
      localStorage.setItem("kc_fan_handle", fan);
    }
    return fan;
  } catch {
    return "Fan";
  }
}

// ---- Beta anti-spam rules (client-side friction) -------------------
const MIN_LEN = 15;
const COOLDOWN_MS = 30_000;
const LAST_POST_KEY = "kc_comments_lastPostMs";

const containsLinkyStuff = (s) => {
  const t = (s || "").toLowerCase();
  return t.includes("http://") || t.includes("https://") || t.includes("www.");
};

const COMMENTS_API =
  process.env.NODE_ENV === "development" && window.location.port === "3000"
    ? "http://localhost:8888/.netlify/functions/comments"
    : "/.netlify/functions/comments";

export default function CommentsPage() {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  const getCooldownRemainingMs = () => {
    const last = Number(localStorage.getItem(LAST_POST_KEY) || 0);
    const remain = last + COOLDOWN_MS - Date.now();
    return Math.max(0, remain);
  };

  const stampPostNow = () => {
    try {
      localStorage.setItem(LAST_POST_KEY, String(Date.now()));
    } catch {
      // ignore
    }
  };

  const loadComments = async () => {
    try {
      setLoading(true);
      const res = await fetch(COMMENTS_API, { method: "GET" });
      if (!res.ok) throw new Error(`GET failed: ${res.status}`);
      const data = await res.json();
      setComments(Array.isArray(data.comments) ? data.comments : []);
    } catch (e) {
      console.error("Failed to load comments:", e);
      setComments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComments();
  }, []);

  const addRootComment = async (text) => {
    const payload = {
      name: getAuthorName(),
      message: text,
      id: uid(),
      createdAt: nowText(),
    };

    const res = await fetch(COMMENTS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`POST failed: ${res.status}`);
    const data = await res.json();

    if (Array.isArray(data.comments)) setComments(data.comments);
    else await loadComments();
  };

  const addServerReply = async (parentId, text) => {
    const payload = {
      action: "reply",
      parentId,
      name: getAuthorName(),
      message: text,
      id: uid(),
      createdAt: nowText(),
    };

    const res = await fetch(COMMENTS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) throw new Error(`REPLY POST failed: ${res.status}`);
    const data = await res.json();

    if (Array.isArray(data.comments)) setComments(data.comments);
    else await loadComments();
  };

  function AddBox({ onAdd }) {
    const [text, setText] = useState("");
    const [isHuman, setIsHuman] = useState(false);
    const [error, setError] = useState("");
    const [cooldownMs, setCooldownMs] = useState(() => getCooldownRemainingMs());

    useEffect(() => {
      const t = setInterval(() => setCooldownMs(getCooldownRemainingMs()), 500);
      return () => clearInterval(t);
    }, []);

    const tryPost = async () => {
      const t = text.trim();
      setError("");

      if (!isHuman) return setError("Please confirm you’re human (beta).");
      if (t.length < MIN_LEN) return setError(`Please write at least ${MIN_LEN} characters.`);
      if (containsLinkyStuff(t))
        return setError("Links are blocked during beta to reduce spam. (No http/https/www)");

      const remain = getCooldownRemainingMs();
      if (remain > 0) {
        const secs = Math.ceil(remain / 1000);
        return setError(`Please wait ${secs}s before posting again.`);
      }

      await onAdd(t);
      stampPostNow();
      setText("");
      setIsHuman(false);
      setCooldownMs(getCooldownRemainingMs());
    };

    const cooldownLabel =
      cooldownMs > 0 ? `Cooldown: ${Math.ceil(cooldownMs / 1000)}s` : "Ready";

    return (
      <div>
        <p className="mb-2 text-sm font-medium text-blue-800">
          Have your say on the latest F1 news — fans welcome.
        </p>

        <div className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment…"
            className="flex-1 rounded-full border border-blue-300 bg-white px-4 py-2 text-sm text-blue-900 placeholder:text-blue-400 backdrop-blur"
          />
          <button
            type="button"
            onClick={tryPost}
            className="rounded-full bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-800 transition"
            title={cooldownLabel}
          >
            Post
          </button>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <label className="inline-flex items-center gap-2 text-xs text-blue-800">
            <input
              type="checkbox"
              checked={isHuman}
              onChange={(e) => setIsHuman(e.target.checked)}
              className="h-4 w-4 accent-blue-700"
            />
            I’m human (beta)
          </label>

          <div className="text-[11px] text-blue-600">{cooldownLabel}</div>
        </div>

        {error ? <div className="mt-2 text-xs text-red-600">{error}</div> : null}
      </div>
    );
  }

  function Comment({ node }) {
    const [reply, setReply] = useState("");
    const [replyError, setReplyError] = useState("");

    const tryReply = async () => {
      const t = reply.trim();
      setReplyError("");

      if (t.length < MIN_LEN) return setReplyError(`Replies must be at least ${MIN_LEN} characters.`);
      if (containsLinkyStuff(t)) return setReplyError("Links are blocked during beta. (No http/https/www)");

      try {
        await addServerReply(node.id, t);
        setReply("");
      } catch (e) {
        console.error("Reply failed:", e);
        setReplyError("Reply failed to post. Please try again.");
      }
    };

    return (
      <li className="mb-4">
        <div className="mb-3 rounded-2xl border border-blue-200 bg-white p-3 text-sm text-blue-900 shadow-[0_0_12px_rgba(30,58,138,0.12)] backdrop-blur">
          <div className="text-[11px] text-blue-700">
            {node.author || node.name || "Anon"} • {node.createdAt || ""}
          </div>

          <div className="mt-2 text-sm">{node.text || node.message}</div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Reply…"
              className="min-w-[160px] flex-1 rounded-full border border-blue-300 bg-white px-3 py-1 text-xs text-blue-900 placeholder:text-blue-400"
            />

            <button
              type="button"
              onClick={tryReply}
              className="rounded-full bg-blue-700 px-3 py-1 text-xs font-semibold text-white hover:bg-blue-800 transition"
            >
              Reply
            </button>
          </div>

          {replyError ? <div className="mt-2 text-xs text-red-600">{replyError}</div> : null}
        </div>

        {node.replies?.length ? (
          <ul className="ml-4 mt-2 border-l border-blue-200 pl-3">
            {node.replies.map((r) => (
              <Comment key={r.id} node={r} />
            ))}
          </ul>
        ) : null}
      </li>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#545454]">
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-3 sm:gap-4 px-4 pt-3 pb-8 sm:pt-4 sm:pb-10">
        <TopCard>
          <TopCard.Header
            title="Comments"
            subtitle="Have your say — quick, friendly, and spam-resistant."
            logoSrc="/img/kcs-f1-car.png"
          />
        </TopCard>

        <div className="flex items-center">
          <PageNav />
          <div className="shrink-0" />
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12 items-start">
          <main className="md:col-span-9 lg:col-span-10">
            <section className="rounded-3xl border border-blue-200 bg-white p-4 backdrop-blur text-blue-900">
              <AddBox onAdd={addRootComment} />

              <ul className="mt-4">
                {loading ? (
                  <li className="text-sm text-blue-600">Loading comments…</li>
                ) : (
                  <>
                    {comments.map((c) => (
                      <Comment key={c.id || c._id || `${c.name}-${c.createdAt}`} node={c} />
                    ))}
                    {comments.length === 0 && (
                      <li className="text-sm text-blue-600">No comments yet.</li>
                    )}
                  </>
                )}
              </ul>
            </section>
          </main>

          <aside className="hidden md:block md:col-span-3 lg:col-span-2 sticky top-24">
            <AdBar vertical />
          </aside>
        </div>
      </div>
    </div>
  );
}