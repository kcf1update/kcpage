// src/KCpage.jsx
import React from "react";
import { Link } from "react-router-dom";

import AdBar from "./AdBar.jsx";
import PageNav from "./components/PageNav";
import HeroHeader from "./components/HeroHeader";

// ✅ Stage A content sources (edit file + redeploy)
import { newsSlots } from "./content/newsSlots";
import { youtubeSlots } from "./content/youtubeSlots";

// =======================================================
// ✅ BETA FEEDBACK (Formspree)
// 1) Create a Formspree form for kcf1update@gmail.com
// 2) Paste your endpoint URL below
// Example: https://formspree.io/f/abcdwxyz
// =======================================================
const FORMSPREE_ENDPOINT = "https://formspree.io/f/mbddyppn";

// Simple glassy card helper for the lower sections
function GlassyCard({ title, subtitle, highlight = "none", children, className = "" }) {
  const highlightRing = {
    blue: "shadow-[0_0_25px_rgba(56,189,248,0.7)] border-cyan-400/40",
    red: "shadow-[0_0_25px_rgba(248,113,113,0.7)] border-red-400/40",
    yellow: "shadow-[0_0_25px_rgba(250,204,21,0.8)] border-yellow-400/40",
    none: "shadow-[0_0_20px_rgba(0,0,0,0.7)] border-white/10",
  };

  return (
    <section
      className={
        "relative rounded-3xl border bg-black/65 backdrop-blur-2xl text-slate-100 " +
        "px-5 py-4 sm:px-7 sm:py-6 transition-transform duration-200 hover:-translate-y-0.5 " +
        highlightRing[highlight] +
        " " +
        className
      }
    >
      {(title || subtitle) && (
        <header className="mb-3">
          {title && <h2 className="text-lg sm:text-xl font-semibold tracking-tight">{title}</h2>}
          {subtitle && <p className="mt-1 text-xs sm:text-sm text-slate-300/80">{subtitle}</p>}
        </header>
      )}
      {children}
    </section>
  );
}

// helper functions — TOP of file
function getYouTubeId(input = "") {
  try {
    const s = String(input).trim();
    if (!s) return "";

    const shortMatch = s.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
    if (shortMatch?.[1]) return shortMatch[1];

    const vMatch = s.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
    if (vMatch?.[1]) return vMatch[1];

    const embedMatch = s.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{6,})/);
    if (embedMatch?.[1]) return embedMatch[1];

    if (/^[a-zA-Z0-9_-]{6,}$/.test(s)) return s;

    return "";
  } catch {
    return "";
  }
}

// Allow only safe http(s) URLs for outbound links
function safeUrl(url) {
  if (!url || typeof url !== "string") return "";
  try {
    const u = new URL(url);
    if (u.protocol === "http:" || u.protocol === "https:") return u.toString();
    return "";
  } catch {
    return "";
  }
}

// Only allow local image paths that start with "/"
function safeLocalImagePath(imagePath) {
  if (!imagePath || typeof imagePath !== "string") return "";
  if (!imagePath.startsWith("/")) return "";
  return imagePath;
}

export default function KCpage() {
  // ✅ Stage A: Featured content is file-driven (not localStorage)
  const featuredNews = Array.isArray(newsSlots) ? newsSlots.slice(0, 3) : [];
  const featuredVideo = Array.isArray(youtubeSlots) && youtubeSlots.length ? youtubeSlots[0] : null;

  return (
    <div className="relative min-h-screen text-white">
      {/* Background image behind the whole page */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center"
        style={{ backgroundImage: "url('/img/header-car.png')" }}
      />
      <div className="absolute inset-0 -z-10 bg-black/70" />

      {/* HOME HERO (full width) */}
      <HeroHeader />

      {/* Page content wrapper */}
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-3 sm:gap-4 px-4 pt-3 pb-8 sm:pt-4 sm:pb-10">
        {/* Update cadence note */}
<div className="rounded-2xl border border-white/10 bg-black/50 backdrop-blur px-4 py-3 text-center">
  <p className="text-xs sm:text-sm text-slate-200 tracking-wide">
  Updated daily • Breaking F1 news added throughout the day • Atlantic Time
  <img
  src="/img/icons/flag-ca.png"
  alt="Canada"
  className="inline-block ml-1 w-4 h-4 align-text-bottom"
/>
</p>

</div>




        {/* Nav + language selector in one row */}
        <div className="flex items-center justify-between gap-4">
          <PageNav />
          <div className="shrink-0">{/* Language selector hidden for launch */}</div>
        </div>

        {/* HERO CARD */}
        <section className="relative rounded-none border border-orange-400/70 bg-white text-slate-900 shadow-[0_0_30px_rgba(255,165,0,0.35)]">
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            {/* LEFT: Car image */}
            <div className="flex items-center justify-start w-full">
              <div className="relative w-full max-w-3xl h-20 sm:h-24 md:h-28 rounded-none overflow-hidden flex items-center">
                <img
                  src="/img/kcs-f1-car.png"
                  alt="KC's F1 Worldwide Update car"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>

            {/* RIGHT: Next race info */}
            <div className="flex flex-col items-start sm:items-end gap-2 sm:pl-6 pr-4">
              <span className="text-xs font-semibold uppercase tracking-wide text-orange-600">
                Next Race
              </span>

              <Link
                to="/next-race"
                className={
                  "inline-flex items-center gap-2 rounded-full border border-yellow-300/70 " +
                  "bg-black text-yellow-100 px-4 py-2 text-sm font-semibold " +
                  "shadow-[0_0_20px_rgba(250,204,21,0.8)] hover:bg-yellow-300/10"
                }
              >
                View next race info
                <span className="text-xs text-yellow-200/80">&rarr;</span>
              </Link>

              <p className="text-[11px] text-slate-600 text-left sm:text-right">
                Weekend schedule, weather, and session results.
              </p>

              <a
                href="https://www.instagram.com/kcf1update"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center rounded-xl bg-black/80 px-4 py-2 text-sm sm:text-base font-semibold text-pink-600 border border-white/10 hover:bg-black transition"
              >
                Follow on Instagram ↗
              </a>
            </div>
          </div>
        </section>

        {/* BETA NOTICE */}
        <section className="mt-4 rounded-3xl border border-yellow-300/50 bg-black/60 p-4 text-white backdrop-blur shadow-[0_0_25px_rgba(250,204,21,0.35)]">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-yellow-300">
                Beta Preview (Week 1)
              </p>
              <p className="mt-1 text-sm text-white font-semibold">
                KC’s Worldwide F1 Update is live in beta. Please explore the site, share it, and leave
                feedback — it helps to improve my website.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href="https://www.youtube.com/@KevinChisholm-z6b"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/15 transition"
              >
                <span>My YouTube</span>
                <span className="text-base leading-none">↗</span>
              </a>
            </div>
          </div>
        </section>

        {/* MAIN TOP AD BANNER */}
        <AdBar />

        {/* CONTENT GRID */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          {/* LEFT COLUMN — News cards */}
          <div className="space-y-5 sm:space-y-6">
            {featuredNews.map((item, idx) => {
              const href = safeUrl(item?.url);
              const imgPath = safeLocalImagePath(item?.imagePath);
              const showImage = !!imgPath;

              // ✅ NEW: KC’s Quick Shift (blue) — only shows if text exists
              const quickShift = (item?.kcsQuickShift || "").trim();

              return (
                <GlassyCard
                  key={item?.slotId || `featured-${idx}`}
                  highlight="blue"
                  title={item?.title || `News ${idx + 1}`}
                  subtitle={item?.sourceLabel || "Source"}
                >
                  <div className="space-y-3">
                    {showImage ? (
                      <img
                        src={imgPath}
                        alt={item?.title || "News image"}
                        className="w-full h-44 object-cover rounded-2xl"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    ) : null}

                    {item?.summary ? (
                      <div className="text-sm text-slate-100/90">{item.summary}</div>
                    ) : (
                      <div className="text-sm text-slate-300">
                        Add a summary in <span className="font-mono">newsSlots.js</span>
                      </div>
                    )}

                    {/* ✅ NEW: KC’s Quick Shift block (blue theme, white text) */}
                    {quickShift ? (
                      <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 shadow-[0_0_18px_rgba(34,211,238,0.25)]">
                        <div className="text-[11px] font-semibold uppercase tracking-wide text-cyan-300">
                          KC’s Quick Shift
                        </div>
                        <p className="mt-1 text-sm text-white/90 leading-relaxed">{quickShift}</p>
                      </div>
                    ) : null}

                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex text-sm text-cyan-200 hover:text-cyan-100"
                      >
                        Read full article →
                      </a>
                    ) : null}
                  </div>
                </GlassyCard>
              );
            })}
          </div>

          {/* RIGHT COLUMN — YouTube + other cards */}
          <div className="space-y-5 sm:space-y-6">
            {/* YOUTUBE CARD */}
            <GlassyCard
              highlight="red"
              title={featuredVideo?.title || "Race weekend highlights"}
              subtitle="Race weekend highlights"
            >
              <>
                {getYouTubeId(featuredVideo?.youtubeInput) ? (
                  <div className="aspect-video rounded-xl overflow-hidden border border-red-400/40">
                    <iframe
                      className="w-full h-full"
                      src={`https://www.youtube.com/embed/${getYouTubeId(
                        featuredVideo.youtubeInput
                      )}`}
                      allowFullScreen
                      title={featuredVideo?.title || "Race highlights"}
                    />
                  </div>
                ) : (
                  <p className="text-sm text-slate-300">No video selected yet.</p>
                )}

                {featuredVideo?.description ? (
                  <p className="text-sm text-slate-300 mt-2">{featuredVideo.description}</p>
                ) : null}

                {featuredVideo?.ctaUrl ? (
                  <a
                    href={featuredVideo.ctaUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-red-300 hover:text-red-200 transition"
                  >
                    {featuredVideo?.ctaLabel || "Open link"} <span aria-hidden>↗</span>
                  </a>
                ) : null}
              </>
            </GlassyCard>

            {/* Coming soon card */}
            <GlassyCard
              highlight="red"
              title="KC’s Worldwide F1 Update — YouTube (Coming Soon)"
              subtitle="Race recaps, highlights, and analysis."
            >
              <p className="text-sm text-yellow-100/95">
                Full race recap videos will be published after every Grand Prix.
                <br />
                <a
                  href="https://www.youtube.com/@KevinChisholm-z6b"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-block font-semibold text-red-300 underline hover:text-red-200"
                >
                  Visit the KC’s Worldwide F1 Update YouTube channel →
                </a>
              </p>
            </GlassyCard>

            {/* Small ad card */}
            <GlassyCard highlight="yellow" title="Place Your Ad Here" subtitle="Smaller ad block (yellow highlight).">
              <p className="text-xs sm:text-sm text-yellow-100/90">
                Ideal for a secondary sponsor, affiliate link, merch promo, ticket partner.
              </p>
            </GlassyCard>
          </div>
        </section>
      </div>
    </div>
  );
}
