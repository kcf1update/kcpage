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
  // Option A change: show a Top Story above the fold, without duplicating it below.
  // We pull 4 items to keep the two-left + one-under-video structure intact after removing Top Story.
  const featuredNewsAll = Array.isArray(newsSlots) ? newsSlots.slice(0, 4) : [];

  const topStory = featuredNewsAll.length ? featuredNewsAll[0] : null;

  // Left column gets the next two items (after top story)
  const featuredNews = featuredNewsAll.length ? featuredNewsAll.slice(1, 3) : [];

  // Under video gets the last one (4th item)
  const featuredNewsUnderVideo =
    featuredNewsAll.length >= 4
      ? featuredNewsAll[3]
      : featuredNewsAll.length
        ? featuredNewsAll[featuredNewsAll.length - 1]
        : null;

  // ✅ Feature KC’s YouTube slot on the main page (without changing youtubeSlots.js order)
  const featuredVideo =
    Array.isArray(youtubeSlots) && youtubeSlots.length
      ? youtubeSlots.find((v) => v?.slotId === "slot5") ||
        youtubeSlots.find((v) => String(v?.title || "").toLowerCase().includes("kc")) ||
        youtubeSlots[0]
      : null;

  const YouTubeCard = () => (
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
              src={`https://www.youtube.com/embed/${getYouTubeId(featuredVideo.youtubeInput)}`}
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

        <div className="mt-3 flex items-center gap-3">
          <Link
            to={`/comments?ref=${encodeURIComponent(featuredVideo?.slotId || "youtube")}`}
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 transition"
            title="Go to Comments page"
          >
            💬 Comment and join the discussion
          </Link>

          <Link
            to="/youtube"
            className="inline-flex items-center gap-2 rounded-full border border-red-400/40 bg-red-400/10 px-4 py-2 text-sm font-semibold text-red-200 hover:bg-red-400/15 transition"
            title="See all videos"
          >
            More videos <span aria-hidden>↗</span>
          </Link>
        </div>

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
  );

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
             🟢 Live F1 news updates daily • Breaking stories added throughout the day • Atlantic Time (Canada)
            <img
              src="/img/icons/flag-ca.png"
              alt="Canada"
              className="inline-block ml-1 w-4 h-4 align-text-bottom"
            />
          </p>
        </div>

        {/* ✅ NEW: TOP STORY (Option A) — placed right under the update bar (mobile-first, not clickbait) */}
        {topStory
          ? (() => {
              const item = topStory;
              const href = safeUrl(item?.url);
              const imgPath = safeLocalImagePath(item?.imagePath);
              const showImage = !!imgPath;
              const quickShift = (item?.kcsQuickShift || "").trim();

              return (
                <section className="mt-1">
                  <div className="mb-2 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/80">
                      Top Story
                    </p>

                    {href ? (
                      <a
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-[11px] font-semibold text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.25)] hover:bg-cyan-300/15 hover:text-cyan-100 transition"
                        title="Open the full article"
                      >
                        Read full story →
                      </a>
                    ) : null}

                    <Link
                      to="/news"
                      className="text-xs text-blue-300 hover:text-blue-200 whitespace-nowrap"
                    >
                      More headlines →
                    </Link>
                  </div>

                  <GlassyCard
                    highlight="blue"
                    title={item?.title || "Top Story"}
                    subtitle={item?.sourceLabel || "Source"}
                    className=""
                  >
                    <div className="space-y-3">
                      {showImage ? (
                        <img
                          src={imgPath}
                          alt={item?.title || "News image"}
                          className="w-full h-44 sm:h-48 md:h-52 lg:h-64 object-cover lg:object-contain lg:bg-black/30 rounded-2xl"
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

                      {quickShift ? (
                        <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 shadow-[0_0_18px_rgba(34,211,238,0.25)]">
                          <div className="text-[11px] font-semibold uppercase tracking-wide text-cyan-300">
                            KC’s Quick Shift
                          </div>
                          <p className="mt-1 text-sm text-white/90 leading-relaxed">{quickShift}</p>
                        </div>
                      ) : null}

                      <div className="flex items-center gap-3 pt-1">
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

                        <Link
                          to={`/comments?ref=${encodeURIComponent(item?.slotId || "")}`}
                          className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 transition"
                          title="Go to Comments page"
                        >
                          💬 Comment and join the discussion
                        </Link>

                        {item?.dateLabel ? (
                          <span className="ml-auto text-xs text-white/45">{item.dateLabel}</span>
                        ) : null}
                      </div>
                    </div>
                  </GlassyCard>
                </section>
              );
            })()
          : null}

        {/* NAV (single-row handled inside PageNav now) */}
        <div className="flex items-center">
          <PageNav />
        </div>

        {/* HERO CARD (car only) */}
        <section className="relative rounded-none border border-orange-400/70 bg-white text-slate-900 shadow-[0_0_30px_rgba(255,165,0,0.35)]">
          <div className="flex items-center justify-center">
            <div className="relative w-full max-w-3xl h-20 sm:h-24 md:h-28 rounded-none overflow-hidden flex items-center">
              <img
                src="/img/kcs-f1-car.png"
                alt="KC's F1 Worldwide Update car"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </section>

        {/* MAIN TOP AD BANNER */}
        <AdBar />

        {/* CONTENT GRID */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-5 sm:gap-6">
          {/* ✅ MOBILE: YouTube card should be FIRST after the Ad spot */}
          <div className="lg:hidden">
            <YouTubeCard />
          </div>

          {/* ✅ DESKTOP LEFT: YouTube + under-video news + small ad */}
          <div className="hidden lg:block space-y-5 sm:space-y-6">
            <YouTubeCard />

            {/* Featured news under YouTube */}
            {featuredNewsUnderVideo
              ? (() => {
                  const item = featuredNewsUnderVideo;
                  const href = safeUrl(item?.url);
                  const imgPath = safeLocalImagePath(item?.imagePath);
                  const showImage = !!imgPath;
                  const quickShift = (item?.kcsQuickShift || "").trim();

                  return (
                    <GlassyCard
                      key={item?.slotId || "featured-under-video"}
                      highlight="blue"
                      title={item?.title || "News"}
                      subtitle={item?.sourceLabel || "Source"}
                    >
                      <div className="space-y-3">
                        {showImage ? (
                          <img
                            src={imgPath}
                            alt={item?.title || "News image"}
                            className="w-full h-44 sm:h-48 md:h-52 lg:h-64 object-cover lg:object-contain lg:bg-black/30 rounded-2xl"
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

                        {quickShift ? (
                          <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 shadow-[0_0_18px_rgba(34,211,238,0.25)]">
                            <div className="text-[11px] font-semibold uppercase tracking-wide text-cyan-300">
                              KC’s Quick Shift
                            </div>
                            <p className="mt-1 text-sm text-white/90 leading-relaxed">{quickShift}</p>
                          </div>
                        ) : null}

                        <div className="flex items-center gap-3 pt-1">
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

                          <Link
                            to={`/comments?ref=${encodeURIComponent(item?.slotId || "")}`}
                            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 transition"
                            title="Go to Comments page"
                          >
                            💬 Discuss
                          </Link>

                          {item?.dateLabel ? (
                            <span className="ml-auto text-xs text-white/45">{item.dateLabel}</span>
                          ) : null}
                        </div>
                      </div>
                    </GlassyCard>
                  );
                })()
              : null}

            {/* Small ad card */}
            <GlassyCard
              highlight="yellow"
              title="Place Your Ad Here"
              subtitle="Smaller ad block (yellow highlight)."
            >
              <p className="text-xs sm:text-sm text-yellow-100/90">
                Ideal for a secondary sponsor, affiliate link, merch promo, ticket partner.
              </p>
            </GlassyCard>
          </div>

          {/* ✅ NEWS COLUMN (desktop right, mobile after YouTube) */}
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
                        className="w-full h-44 sm:h-48 md:h-52 lg:h-64 object-cover lg:object-contain lg:bg-black/30 rounded-2xl"
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

                    {/* ACTIONS ROW (Read + Comment + optional date) */}
                    <div className="flex items-center gap-3 pt-1">
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

                      <Link
                        to={`/comments?ref=${encodeURIComponent(item?.slotId || "")}`}
                        className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 transition"
                        title="Go to Comments page"
                      >
                        💬 Comment and join the discussion
                      </Link>

                      {item?.dateLabel ? (
                        <span className="ml-auto text-xs text-white/45">{item.dateLabel}</span>
                      ) : null}
                    </div>
                  </div>
                </GlassyCard>
              );
            })}

            {/* ✅ MOBILE: put the “under video” featured news AFTER the two news cards */}
            <div className="lg:hidden">
              {featuredNewsUnderVideo
                ? (() => {
                    const item = featuredNewsUnderVideo;
                    const href = safeUrl(item?.url);
                    const imgPath = safeLocalImagePath(item?.imagePath);
                    const showImage = !!imgPath;
                    const quickShift = (item?.kcsQuickShift || "").trim();

                    return (
                      <GlassyCard
                        key={item?.slotId || "featured-under-video-mobile"}
                        highlight="blue"
                        title={item?.title || "News"}
                        subtitle={item?.sourceLabel || "Source"}
                      >
                        <div className="space-y-3">
                          {showImage ? (
                            <img
                              src={imgPath}
                              alt={item?.title || "News image"}
                              className="w-full h-44 sm:h-48 md:h-52 lg:h-64 object-cover lg:object-contain lg:bg-black/30 rounded-2xl"
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

                          {quickShift ? (
                            <div className="rounded-2xl border border-cyan-400/30 bg-cyan-400/10 px-4 py-3 shadow-[0_0_18px_rgba(34,211,238,0.25)]">
                              <div className="text-[11px] font-semibold uppercase tracking-wide text-cyan-300">
                                KC’s Quick Shift
                              </div>
                              <p className="mt-1 text-sm text-white/90 leading-relaxed">
                                {quickShift}
                              </p>
                            </div>
                          ) : null}

                          <div className="flex items-center gap-3 pt-1">
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

                            <Link
                              to={`/comments?ref=${encodeURIComponent(item?.slotId || "")}`}
                              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 transition"
                              title="Go to Comments page"
                            >
                              💬 Discuss
                            </Link>

                            {item?.dateLabel ? (
                              <span className="ml-auto text-xs text-white/45">{item.dateLabel}</span>
                            ) : null}
                          </div>
                        </div>
                      </GlassyCard>
                    );
                  })()
                : null}

              {/* Small ad card (mobile) */}
              <GlassyCard
                highlight="yellow"
                title="Place Your Ad Here"
                subtitle="Smaller ad block (yellow highlight)."
                className="mt-5 sm:mt-6"
              >
                <p className="text-xs sm:text-sm text-yellow-100/90">
                  Ideal for a secondary sponsor, affiliate link, merch promo, ticket partner.
                </p>
              </GlassyCard>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
