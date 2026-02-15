// src/F1NewsPage.jsx
import React from "react";
import { Link } from "react-router-dom";

import PageHero from "./components/PageHero";
import PageNav from "./components/PageNav";
import TopCard from "./components/TopCard";
import AdBar from "./AdBar.jsx";

import { newsSlots } from "./content/newsSlots";

/**
 * SAFETY RULES (Stage A beta):
 * - External article links are allowed (https://...)
 * - Images are LOCAL ONLY (imagePath must start with "/")
 *   Example: "/img/news/stock-01.jpg"
 * - No "imageUrl" anywhere.
 */

// Allow only safe http(s) URLs for outbound links (and mailto if you ever need it)
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
  // enforce local only
  if (!imagePath.startsWith("/")) return "";
  return imagePath;
}

export default function F1NewsPage() {
  // Home uses the first 3 slots
  // This page shows news4..news9 (6 cards)
  const newsPageCards = newsSlots.slice(3, 9);

  return (
    <div className="relative min-h-screen bg-[#454545] text-white">
      {/* Hero */}
      <PageHero img="hero-worldwide4.png" alt="F1 News" />

      {/* Foreground content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-1 sm:pt-4 pb-10 lg:px-8">
        {/* Nav row */}
        <div className="mt-1 flex items-center justify-between gap-4">
          <PageNav />
          <div className="shrink-0">{/* language selector hidden for launch */}</div>
        </div>

        <div className="mt-4" />

        {/* TopCard (keep consistent with other pages) */}
        <TopCard>
          <TopCard.Header
            title="F1 News"
            subtitle="Latest F1 headlines and links from around the web."
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

        {/* Main ad banner */}
        <div className="mt-6">
          <AdBar />
        </div>

        {/* News grid */}
        <main className="mt-6 grid gap-4 lg:grid-cols-2">
          {newsPageCards.map((item) => {
            const href = safeUrl(item.url);
            const imgPath = safeLocalImagePath(item.imagePath);

            // NEW FIELD NAME (renamed from kcOuttake)
            const quickShift = (item.kcsQuickShift || "").trim();

            return (
              <article
                key={item.slotId}
                className="flex flex-col overflow-hidden rounded-3xl border border-cyan-400/30 bg-black/60 backdrop-blur shadow-[0_0_20px_rgba(34,211,238,0.35)]"
              >
                {/* Image (optional – LOCAL ONLY) */}
                {imgPath ? (
                  href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="block"
                      title="Open article"
                    >
                      <div className="aspect-[16/9] w-full bg-black/40 overflow-hidden">
                        <img
                          src={imgPath}
                          alt={item.title || "F1 news"}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </a>
                  ) : (
                    <div className="aspect-[16/9] w-full bg-black/40 overflow-hidden">
                      <img
                        src={imgPath}
                        alt={item.title || "F1 news"}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )
                ) : (
                  <div className="aspect-[16/9] w-full bg-black/40 flex items-center justify-center text-xs text-gray-400">
                    Image optional (use local stock/original via imagePath)
                  </div>
                )}

                {/* Text */}
                <div className="p-4 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-[11px] uppercase tracking-wide text-cyan-200/80">
                      {item.sourceLabel || "Source"}
                    </div>

                    {item.badge ? (
                      <span className="rounded-full bg-white/10 px-3 py-1 text-[11px] text-white/80">
                        {item.badge}
                      </span>
                    ) : null}
                  </div>

                  {/* ✅ Title clickable */}
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="block"
                      title="Open article"
                    >
                      <h3 className="text-lg font-semibold leading-snug text-white hover:text-cyan-200 transition">
                        {item.title || "Headline (replace me)"}
                      </h3>
                    </a>
                  ) : (
                    <h3 className="text-lg font-semibold leading-snug text-white">
                      {item.title || "Headline (replace me)"}
                    </h3>
                  )}

                  {item.summary ? (
                    <p className="text-sm text-white/75 leading-relaxed">
                      {item.summary}
                    </p>
                  ) : (
                    <p className="text-sm text-white/50 leading-relaxed">
                      Add a summary in{" "}
                      <span className="font-mono">newsSlots.js</span>
                    </p>
                  )}

                  {/* KC’s Quick Shift (only shows if filled in newsSlots.js) */}
                  {quickShift ? (
                    <div className="mt-3 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 shadow-[0_0_18px_rgba(34,211,238,0.25)]">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-cyan-300">
                        KC’s Quick Shift
                      </div>

                      <p className="mt-1 text-sm text-white/90 leading-relaxed">
                        {quickShift}
                      </p>
                    </div>
                  ) : null}

                  <div className="pt-2 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {href ? (
                        <a
                          href={href}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-2 rounded-full border border-cyan-300/40 bg-cyan-300/10 px-4 py-2 text-sm font-semibold text-cyan-100 hover:bg-cyan-300/15 transition"
                        >
                          Read article
                          <span className="text-cyan-200/80">&rarr;</span>
                        </a>
                      ) : (
                        <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/40">
                          Add a url in newsSlots.js
                        </span>
                      )}

                      <Link
                        to={`/comments?ref=${encodeURIComponent(item.slotId || "")}`}
                        className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 transition"
                        title="Go to Comments page"
                      >
                        💬 Comment and join the discussion
                      </Link>
                    </div>

                    {item.dateLabel ? (
                      <span className="text-xs text-white/45">{item.dateLabel}</span>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </main>
      </div>
    </div>
  );
}
