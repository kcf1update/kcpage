// src/CommentsPage.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import AdBar from "./AdBar.jsx";
import TopCard from "./components/TopCard";
import PageNav from "./components/PageNav";
import PageHero from "./components/PageHero";

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const nowText = () => new Date().toLocaleString();

// ---- Beta anti-spam rules (client-side friction) -------------------
const MIN_LEN = 15;
const COOLDOWN_MS = 30_000;
const LAST_POST_KEY = "kc_comments_lastPostMs";

const containsLinkyStuff = (s) => {
  const t = (s || "").toLowerCase();
  return t.includes("http://") || t.includes("https://") || t.includes("www.");
};

// ✅ Netlify Function endpoint (works on Netlify + netlify dev)
// If you open the site on :3000 during dev, functions are actually on :8888 (netlify dev proxy).
const COMMENTS_API =
  process.env.NODE_ENV === "development" && window.location.port === "3000"
    ? "http://localhost:8888/.netlify/functions/comments"
    : "/.netlify/functions/comments";

export default function CommentsPage() {
  // ✅ comments now come from server
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

  // ✅ Load comments from function
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

  // ✅ Post comment to function (server owns the stored list)
  const addRootComment = async (text) => {
    const payload = {
      // match what you tested in PowerShell: { name, message }
      name: "Anon",
      message: text,
      // optional extras; harmless if function ignores them
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

    // If your function returns the updated list (best case)
    if (Array.isArray(data.comments)) {
      setComments(data.comments);
    } else {
      // Otherwise just reload from server
      await loadComments();
    }
  };

  // Replies & delete: keep UI, but for now keep them client-side only
  // (We can add server support later without changing look.)
  const addReply = (list, parentId, reply) =>
    (list || []).map((n) =>
      n.id === parentId
        ? { ...n, replies: [...(n.replies || []), reply] }
        : { ...n, replies: addReply(n.replies || [], parentId, reply) }
    );

  const handleReply = (parentId, text) =>
    setComments((prev) =>
      addReply(prev, parentId, {
        id: uid(),
        author: "Anon",
        text,
        createdAt: nowText(),
        replies: [],
      })
    );

  const deleteNode = (list, id) =>
    (list || [])
      .filter((n) => n.id !== id)
      .map((n) => ({ ...n, replies: deleteNode(n.replies || [], id) }));

  const handleDelete = (id) => {
    setComments((prev) => deleteNode(prev, id));
  };

  // --- UI helpers (define BEFORE use) ------------------------------
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

      if (!isHuman) {
        setError("Please confirm you’re human (beta).");
        return;
      }

      if (t.length < MIN_LEN) {
        setError(`Please write at least ${MIN_LEN} characters.`);
        return;
      }

      if (containsLinkyStuff(t)) {
        setError("Links are blocked during beta to reduce spam. (No http/https/www)");
        return;
      }

      const remain = getCooldownRemainingMs();
      if (remain > 0) {
        const secs = Math.ceil(remain / 1000);
        setError(`Please wait ${secs}s before posting again.`);
        return;
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
        {/* Beta notice */}
        <div className="mb-3 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-xs text-gray-200 backdrop-blur">
          <div className="font-semibold">🚧 Beta note</div>
          <div className="mt-1 text-gray-300">
            This comments section is part of our public beta.
            To keep things clean and respectful, links are disabled and posting is limited.
            Comments may be cleared as we continue testing and improving the site.
          </div>
        </div>
<p className="mb-2 text-sm font-medium text-cyan-200
  drop-shadow-[0_0_14px_rgba(34,211,238,0.7)]">
  Have your say on the latest F1 news — fans welcome.
</p>

        <div className="flex items-center gap-2">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Write a comment…"
            className="flex-1 rounded-full border border-white/20 bg-black/60 px-4 py-2 text-sm text-white placeholder:text-gray-400 backdrop-blur"
          />
          <button
            type="button"
            onClick={tryPost}
            className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition"
            title={cooldownLabel}
          >
            Post
          </button>
        </div>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <label className="inline-flex items-center gap-2 text-xs text-gray-200">
            <input
              type="checkbox"
              checked={isHuman}
              onChange={(e) => setIsHuman(e.target.checked)}
              className="h-4 w-4 accent-red-500"
            />
            I’m human (beta)
          </label>

          <div className="text-[11px] text-gray-400">{cooldownLabel}</div>
        </div>

        {error ? (
          <div className="mt-2 text-xs text-red-200">{error}</div>
        ) : null}
      </div>
    );
  }

  function Comment({ node }) {
    const [reply, setReply] = useState("");
    const [replyError, setReplyError] = useState("");

    const tryReply = () => {
      const t = reply.trim();
      setReplyError("");

      if (t.length < MIN_LEN) {
        setReplyError(`Replies must be at least ${MIN_LEN} characters.`);
        return;
      }

      if (containsLinkyStuff(t)) {
        setReplyError("Links are blocked during beta. (No http/https/www)");
        return;
      }

      handleReply(node.id, t);
      setReply("");
    };

    return (
      <li className="mb-4">
        <div className="mb-3 rounded-2xl border border-orange-700/60 bg-orange-900/80 p-3 text-sm text-white shadow-[0_0_12px_rgba(255,140,0,0.35)] backdrop-blur">
          <div className="text-[11px] text-orange-100/80">
            {node.author || node.name || "Anon"} • {node.createdAt || ""}
          </div>

          <div className="mt-2 text-sm">{node.text || node.message}</div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              placeholder="Reply…"
              className="min-w-[160px] flex-1 rounded-full border border-white/40 bg-orange-800/80 px-3 py-1 text-xs text-white placeholder:text-white/70"
            />

            <button
              type="button"
              onClick={tryReply}
              className="rounded-full bg-red-600 px-3 py-1 text-xs font-semibold text-white hover:bg-red-700 transition"
            >
              Reply
            </button>

            <button
              type="button"
              onClick={() => handleDelete(node.id)}
              className="text-xs underline text-gray-300 hover:text-white transition"
            >
              Delete
            </button>
          </div>

          {replyError ? <div className="mt-2 text-xs text-red-200">{replyError}</div> : null}
        </div>

        {node.replies?.length ? (
          <ul className="ml-4 mt-2 border-l border-white/10 pl-3">
            {node.replies.map((r) => (
              <Comment key={r.id} node={r} />
            ))}
          </ul>
        ) : null}
      </li>
    );
  }

  // --- PAGE LAYOUT (glassy style) ---------------------------------
  return (
    <div className="relative min-h-screen">
      <div aria-hidden className="absolute inset-0 -z-10 bg-[#545454]" />
      <PageHero img="hero-worldwide4.png" alt="Comments" />

      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-2 pb-8 lg:px-8">
        <div className="mt-3 flex items-center justify-between gap-4">
          <PageNav />
          <div className="shrink-0">{/* language selector hidden for launch */}</div>
        </div>

        <div className="mt-4"></div>

        <TopCard>
          <TopCard.Header
            title="Race Comments & Discussion"
            subtitle="Share your thoughts on the races and other F1 news. Keep it respectful and enjoy the conversation."
            logoSrc="/img/kcs-f1-car.png"
            right={
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full border border-red-600 bg-red-600 text-white px-4 py-1 text-xs sm:text-sm shadow-[0_0_18px_rgba(239,68,68,0.55)] hover:bg-red-700 transition"
              >
                <span className="text-lg leading-none">&larr;</span>
                <span>Back to home</span>
              </Link>
            }
          />
        </TopCard>

        <div className="mt-6" />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12 items-start">
          <main className="md:col-span-9 lg:col-span-10">
            <section className="rounded-3xl border border-white/10 bg-black/60 p-4 backdrop-blur">
              <AddBox onAdd={addRootComment} />

              <ul className="mt-4">
                {loading ? (
                  <li className="text-sm text-gray-400">Loading comments…</li>
                ) : (
                  <>
                    {comments.map((c) => (
                      <Comment key={c.id || c._id || `${c.name}-${c.createdAt}`} node={c} />
                    ))}
                    {comments.length === 0 && (
                      <li className="text-sm text-gray-400">No comments yet.</li>
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
