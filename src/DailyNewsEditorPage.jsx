import React, { useEffect, useMemo, useState } from "react";
import {
  acceptInvite,
  AuthError,
  getUser,
  handleAuthCallback,
  login,
  logout,
  requestPasswordRecovery,
  updateUser,
} from "@netlify/identity";

const API_URL = "/api/kc-news-editor";
const DRAFT_KEY = "kc-daily-news-editor-draft-v1";
const fields = [
  ["sourceLabel", "Source", "Formula1.com"],
  ["title", "Headline", "Article headline", 3],
  ["summary", "Summary", "KC's accurate quick-read summary", 5],
  ["kcsQuickShift", "KC’s QuickShift", "Your own opinion on the story", 4],
  ["url", "Original article link", "https://..."],
  ["imagePath", "Website image path", "/img/news/xpb/example.jpg"],
  ["photoCredit", "Photo credit", "XPB IMAGES"],
  ["dateLabel", "Article date", "September 10, 2026"],
];

async function api(action, extra = {}) {
  const response = await fetch(API_URL, {
    method: "POST",
    credentials: "same-origin",
    headers: { "Content-Type": "application/json", "X-KC-Editor": "1" },
    body: JSON.stringify({ action, ...extra }),
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || "The editor could not complete that request.");
    error.status = response.status;
    throw error;
  }
  return data;
}

function cleanArticle(article, index) {
  const clean = { slotId: index + 1 };
  for (const [key] of fields) clean[key] = String(article?.[key] || "");
  return clean;
}

function readDraft() {
  try {
    const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
    return Array.isArray(draft?.articles) && draft.articles.length === 10 ? draft : null;
  } catch { return null; }
}

function complete(article) {
  return fields.every(([key]) => String(article?.[key] || "").trim());
}

function Preview({ article }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-cyan-400/25 bg-black/55 shadow-lg">
      <div className="border-b border-white/10 px-4 py-3 text-xs font-bold uppercase tracking-widest text-cyan-300">Preview</div>
      {article.imagePath?.startsWith("/") ? (
        <img key={article.imagePath} src={article.imagePath} alt="" className="h-40 w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
      ) : null}
      <div className="space-y-3 p-4">
        <div className="text-xs font-semibold uppercase text-cyan-200/80">{article.sourceLabel || "Source"}</div>
        <h2 className="text-xl font-bold leading-tight">{article.title || "Headline preview"}</h2>
        <p className="text-sm leading-relaxed text-slate-300">{article.summary || "Your summary will appear here."}</p>
        <div className="border-l-4 border-cyan-400 bg-cyan-400/10 px-4 py-3">
          <div className="text-xs font-bold uppercase text-cyan-300">KC’s QuickShift</div>
          <p className="mt-1 text-sm leading-relaxed">{article.kcsQuickShift || "Your opinion will appear here."}</p>
        </div>
      </div>
    </div>
  );
}

export default function DailyNewsEditorPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMode, setAuthMode] = useState("login");
  const [inviteToken, setInviteToken] = useState("");
  const [authenticated, setAuthenticated] = useState(false);
  const [articles, setArticles] = useState([]);
  const [headSha, setHeadSha] = useState("");
  const [branch, setBranch] = useState("main");
  const [selected, setSelected] = useState(0);
  const [busy, setBusy] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [draftRestored, setDraftRestored] = useState(false);
  const [dirty, setDirty] = useState(false);

  const article = articles[selected] || cleanArticle({}, selected);
  const ready = useMemo(() => articles.filter(complete).length, [articles]);

  async function loadPublished(allowDraft = true) {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const data = await api("load");
      const published = data.articles.map(cleanArticle);
      const draft = allowDraft ? readDraft() : null;
      const restore = Boolean(draft && draft.headSha === data.headSha);
      setArticles(restore ? draft.articles.map(cleanArticle) : published);
      setHeadSha(data.headSha);
      setBranch(data.branch || "main");
      setAuthenticated(true);
      setDraftRestored(restore);
      setDirty(restore);
      if (restore) setMessage("Your unfinished browser draft has been restored.");
      else if (draft) setMessage("The website changed after your older draft was saved, so it was not restored. The published copy is shown to prevent an accidental overwrite.");
    } catch (loadError) {
      if (loadError.status === 401) setAuthenticated(false);
      setError(loadError.status === 401 ? "" : loadError.message);
    } finally { setBusy(false); }
  }

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const callback = await handleAuthCallback();
        if (!active) return;
        if (callback?.type === "invite" && callback.token) {
          setInviteToken(callback.token);
          setAuthMode("invite");
          setBusy(false);
          return;
        }
        if (callback?.type === "recovery") {
          setAuthMode("recovery");
          setBusy(false);
          return;
        }
        const user = callback?.user || await getUser();
        if (!active) return;
        if (user) await loadPublished();
        else setBusy(false);
      } catch (authError) {
        if (active) {
          setError(authError instanceof AuthError ? authError.message : "Sign-in could not be checked.");
          setBusy(false);
        }
      }
    })();
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (authenticated && dirty && headSha && articles.length === 10) {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ headSha, articles, savedAt: new Date().toISOString() }));
    }
  }, [authenticated, dirty, headSha, articles]);

  async function signIn(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      if (authMode === "invite") await acceptInvite(inviteToken, password);
      else if (authMode === "recovery") await updateUser({ password });
      else await login(email.trim(), password);
      setPassword("");
      setAuthMode("login");
      setInviteToken("");
      await loadPublished();
    } catch (authError) {
      setError(authError instanceof AuthError ? "The email or password was not accepted." : authError.message);
      setBusy(false);
    }
  }

  async function forgotPassword() {
    if (!email.trim()) { setError("Enter your email address first."); return; }
    setBusy(true);
    setError("");
    try {
      await requestPasswordRecovery(email.trim());
      setMessage("A password reset link has been sent to your email.");
    } catch (recoveryError) { setError(recoveryError.message || "The reset email could not be sent."); }
    finally { setBusy(false); }
  }

  async function signOut() {
    setBusy(true);
    try { await logout(); }
    finally { setAuthenticated(false); setArticles([]); setBusy(false); }
  }

  function update(field, value) {
    setArticles((current) => current.map((item, index) => index === selected ? { ...item, [field]: value } : item));
    setDirty(true);
    setMessage("");
    setError("");
  }

  function copyDate() {
    const date = article.dateLabel.trim();
    if (!date) { setError("Enter the date for this story first."); return; }
    setArticles((current) => current.map((item) => ({ ...item, dateLabel: date })));
    setDirty(true);
    setError("");
    setMessage("The date was copied to all 10 stories.");
  }

  async function discardDraft() {
    if (!window.confirm("Discard the browser draft and reload the last published news?")) return;
    localStorage.removeItem(DRAFT_KEY);
    setDraftRestored(false);
    setDirty(false);
    await loadPublished(false);
    setMessage("The draft was discarded. You are viewing the published news.");
  }

  async function publishAll() {
    setError("");
    setMessage("");
    if (ready !== 10) {
      setSelected(Math.max(0, articles.findIndex((item) => !complete(item))));
      setError("All fields in all 10 stories must be completed before publishing.");
      return;
    }
    const date = articles[0].dateLabel.trim();
    if (!window.confirm(`Publish all 10 stories for ${date}? This will start the normal website deployment.`)) return;
    setBusy(true);
    try {
      const data = await api("publish", { headSha, articles });
      localStorage.removeItem(DRAFT_KEY);
      setHeadSha(data.commitSha);
      setDraftRestored(false);
      setDirty(false);
      setMessage(data.archivedPreviousDay
        ? "Published successfully. The previous day was also added to In Case You Missed It."
        : "Published successfully. Netlify will now deploy the update.");
    } catch (publishError) { setError(publishError.message); }
    finally { setBusy(false); }
  }

  if (!authenticated) {
    return (
      <main className="min-h-screen bg-[#20242b] px-4 py-10 text-white">
        <section className="mx-auto max-w-md rounded-3xl border border-cyan-400/30 bg-black/65 p-6 shadow-2xl sm:p-8">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Private workspace</div>
          <h1 className="mt-3 text-2xl font-extrabold">KC’s Daily News Editor</h1>
          <p className="mt-3 text-sm leading-relaxed text-slate-300">
            {authMode === "invite" ? "Choose a password to activate your private editor account."
              : authMode === "recovery" ? "Choose your new editor password."
                : "Sign in to prepare and publish the 10 daily Formula 1 stories."}
          </p>
          <form onSubmit={signIn} className="mt-6 space-y-4">
            {authMode === "login" ? (
              <label className="block text-sm font-semibold text-slate-200">Email address
                <input type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} required className="mt-2 w-full rounded-xl border border-white/20 bg-slate-950 px-4 py-3 text-base text-white outline-none focus:border-cyan-400" />
              </label>
            ) : null}
            <label className="block text-sm font-semibold text-slate-200">{authMode === "login" ? "Password" : "New password"}
              <input type="password" autoComplete={authMode === "login" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} required className="mt-2 w-full rounded-xl border border-white/20 bg-slate-950 px-4 py-3 text-base text-white outline-none focus:border-cyan-400" />
            </label>
            {error ? <p className="rounded-xl border border-red-400/30 bg-red-950/60 p-3 text-sm text-red-100">{error}</p> : null}
            {message ? <p className="rounded-xl border border-emerald-400/30 bg-emerald-950/60 p-3 text-sm text-emerald-100">{message}</p> : null}
            <button disabled={busy} className="w-full rounded-xl bg-cyan-400 px-4 py-3 font-bold text-slate-950 disabled:opacity-60">
              {busy ? "Checking…" : authMode === "invite" ? "Activate private editor" : authMode === "recovery" ? "Save new password" : "Sign in"}
            </button>
            {authMode === "login" ? <button type="button" onClick={forgotPassword} className="w-full text-sm font-semibold text-cyan-300">Forgot your password?</button> : null}
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#20242b] px-3 py-4 text-white sm:px-5 sm:py-6">
      <div className="mx-auto max-w-7xl">
        <header className="rounded-3xl border border-cyan-400/25 bg-black/65 p-5 shadow-xl sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-300">Private workspace</div>
              <h1 className="mt-1 text-2xl font-extrabold sm:text-3xl">Daily News Editor</h1>
              <p className="mt-2 text-sm text-slate-300">Story {selected + 1} of 10 · {ready} ready to publish</p>
            </div>
            <button onClick={signOut} className="self-start rounded-xl border border-white/20 px-4 py-2 text-sm font-semibold">Sign out</button>
          </div>
          <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-700"><div className="h-full bg-cyan-400" style={{ width: `${ready * 10}%` }} /></div>
        </header>

        {(message || error) ? <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${error ? "border-red-400/30 bg-red-950/70" : "border-emerald-400/30 bg-emerald-950/60"}`}>{error || message}</div> : null}

        <div className="mt-4 grid gap-4 lg:grid-cols-[210px_minmax(0,1fr)_340px]">
          <nav className="rounded-2xl border border-white/10 bg-black/55 p-3">
            <select value={selected} onChange={(e) => setSelected(Number(e.target.value))} className="w-full rounded-xl border border-white/20 bg-slate-950 px-3 py-3 lg:hidden">
              {articles.map((item, index) => <option value={index} key={index}>Story {index + 1}: {item.sourceLabel || "Not started"}</option>)}
            </select>
            <div className="hidden space-y-2 lg:block">
              {articles.map((item, index) => (
                <button key={index} onClick={() => setSelected(index)} className={`w-full rounded-xl border px-3 py-3 text-left ${selected === index ? "border-cyan-400 bg-cyan-400/15" : "border-white/10 bg-white/5"}`}>
                  <span className="block text-xs font-bold text-cyan-300">STORY {index + 1} {complete(item) ? "✓" : ""}</span>
                  <span className="mt-1 block truncate text-sm text-slate-200">{item.sourceLabel || "Not started"}</span>
                </button>
              ))}
            </div>
          </nav>

          <section className="rounded-2xl border border-white/10 bg-black/55 p-4 sm:p-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-xl font-bold text-cyan-300">Story {selected + 1}</h2>
              {[2, 4, 8].includes(selected + 1) ? <span className="rounded-full bg-amber-300/10 px-3 py-1 text-xs text-amber-100">Foreign-language story</span> : null}
            </div>
            <div className="mt-5 space-y-5">
              {fields.map(([key, label, placeholder, rows]) => (
                <label key={key} className="block">
                  <span className="flex justify-between text-sm font-semibold text-slate-200">{label}{!String(article[key] || "").trim() ? <small className="text-amber-300">Required</small> : null}</span>
                  {rows ? <textarea rows={rows} value={article[key]} onChange={(e) => update(key, e.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-white/20 bg-slate-950 px-4 py-3 text-base leading-relaxed outline-none focus:border-cyan-400" />
                    : <input type={key === "url" ? "url" : "text"} value={article[key]} onChange={(e) => update(key, e.target.value)} placeholder={placeholder} className="mt-2 w-full rounded-xl border border-white/20 bg-slate-950 px-4 py-3 text-base outline-none focus:border-cyan-400" />}
                  {key === "dateLabel" ? <button type="button" onClick={copyDate} className="mt-2 text-sm font-semibold text-cyan-300">Copy this date to all 10 stories</button> : null}
                </label>
              ))}
            </div>
            <div className="mt-6 flex justify-between border-t border-white/10 pt-5">
              <button onClick={() => setSelected(Math.max(0, selected - 1))} disabled={selected === 0} className="rounded-xl border border-white/20 px-4 py-2.5 font-semibold disabled:opacity-35">Previous</button>
              <button onClick={() => setSelected(Math.min(9, selected + 1))} disabled={selected === 9} className="rounded-xl bg-cyan-400 px-4 py-2.5 font-bold text-slate-950 disabled:opacity-35">Next story</button>
            </div>
          </section>

          <aside className="space-y-4">
            <Preview article={article} />
            <section className="rounded-2xl border border-white/10 bg-black/55 p-4">
              <h2 className="font-bold">Publishing</h2>
              <p className="mt-2 text-sm leading-relaxed text-slate-300">Your work saves automatically on this device. Publishing updates the website and safely archives the previous day when the date changes.</p>
              <button onClick={publishAll} disabled={busy || articles.length !== 10} className="mt-4 w-full rounded-xl bg-emerald-400 px-4 py-3 font-extrabold text-emerald-950 disabled:opacity-50">{busy ? "Please wait…" : "Review and publish all 10"}</button>
              <button onClick={discardDraft} disabled={busy} className="mt-3 w-full rounded-xl border border-white/20 px-4 py-2.5 text-sm font-semibold disabled:opacity-50">Discard draft and reload published news</button>
              <p className="mt-3 break-all text-xs text-slate-500">Publishing branch: {branch}</p>
              {draftRestored ? <p className="mt-2 text-xs font-semibold text-amber-200">Restored browser draft</p> : null}
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
