// src/YouTubeNewsPage.jsx
import React, { useMemo } from "react";
import { Link } from "react-router-dom";

import AdBar from "./AdBar.jsx";
import TopCard from "./components/TopCard";
import PageNav from "./components/PageNav";
import PageHero from "./components/PageHero";

// ✅ Stage A content source (edit file + redeploy)
// If your file is at src/youtubeSlots.js, use this:
import { youtubeSlots } from "./content/youtubeSlots";

// If your file is at src/data/youtubeSlots.js, use this instead:
// import { youtubeSlots } from "./data/youtubeSlots";

function extractYouTubeId(input) {
  if (!input) return "";
  const trimmed = String(input).trim();

  // already looks like an 11-char YouTube ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);

    // youtu.be/<id>
    if (url.hostname === "youtu.be") {
      return url.pathname.replace("/", "").trim();
    }

    // youtube.com/watch?v=<id>
    const v = url.searchParams.get("v");
    if (v) return v.trim();

    // youtube.com/shorts/<id>
    if (url.pathname.includes("/shorts/")) {
      return url.pathname.split("/shorts/")[1]?.split("/")[0]?.trim() || "";
    }

    return trimmed;
  } catch {
    // Not a URL; return as-is (maybe an ID)
    return trimmed;
  }
}

// Super-light “live stream detect” for Stage A
// - If user sets isLive: true => treat as live
// - If the url contains "live" or "/live" => treat as live
function looksLive(input) {
  const s = String(input || "").toLowerCase();
  return s.includes("/live") || s.includes("live") || s.includes("live_stream");
}

// Build embed URL
// Supports:
// 1) normal videoId => https://www.youtube.com/embed/<id>
// 2) live via channelId => https://www.youtube.com/embed/live_stream?channel=<channelId>
// 3) playlistId => https://www.youtube.com/embed/videoseries?list=<playlistId>
function buildEmbedUrl(slot) {
  const { youtubeInput, videoId, channelId, playlistId, isLive } = slot || {};

  // Playlist (optional)
  if (playlistId) {
    return `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(
      playlistId
    )}`;
  }

  // Live stream mode (best if you provide channelId)
  const input = youtubeInput || videoId || "";
  const live = !!isLive || looksLive(input);

  if (live && channelId) {
    return `https://www.youtube.com/embed/live_stream?channel=${encodeURIComponent(
      channelId
    )}`;
  }

  // Normal video
  const id = extractYouTubeId(videoId || youtubeInput || "");
  return id ? `https://www.youtube.com/embed/${id}` : "";
}

export default function YouTubeNewsPage() {
  // Ensure we always have an array
  const slots = useMemo(() => (Array.isArray(youtubeSlots) ? youtubeSlots : []), []);

  return (
    <div className="relative min-h-screen bg-[#545454] text-white">
      {/* HERO — full width */}
      <PageHero img="hero-worldwide4.png" alt="F1 YouTube News" />

      {/* Foreground content */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-1 sm:pt-4 pb-8 lg:px-8">
        {/* Nav row (standard on all pages) */}
        <div className="mt-1 flex items-center justify-between gap-4">
          <PageNav />
          <div className="shrink-0">{/* language selector hidden for launch */}</div>
        </div>

        <div className="mt-4" />

        {/* TOP CARD */}
        <TopCard>
          <TopCard.Header
            title="F1 YouTube News"
            subtitle="Latest videos, highlights, interviews, and race coverage."
            logoSrc="/img/kcs-f1-car.png"
            right={
              <Link
                to="/"
                className="inline-flex items-center gap-2 rounded-full border border-red-600 bg-red-600 text-white px-4 py-1 text-xs sm:text-sm shadow-[0_0_18px_rgba(239,68,68,0.55)]"
              >
                <span className="text-lg leading-none">&larr;</span>
                <span>Back to home</span>
              </Link>
            }
          />
        </TopCard>

        <AdBar />

        {/* Video grid — 1 col mobile, 2 tablet, 3 desktop */}
        <main className="mt-6 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {slots.map((slot, idx) => {
            const embedUrl = buildEmbedUrl(slot);
            const showSubscribeBadge = idx === 0; // Badge overlay on card #1

            const title = slot?.title || "F1 video";
            const description = slot?.description || "";
            const sponsor = !!slot?.isSponsor;

            const commentRef = slot?.slotId ? String(slot.slotId) : `video-${idx + 1}`;

            return (
              <article
                key={slot?.slotId || `${idx}`}
                className="relative flex flex-col overflow-hidden rounded-3xl border border-red-400/40 bg-black/60 backdrop-blur shadow-[0_0_25px_rgba(248,113,113,0.7)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_35px_rgba(248,113,113,0.9)] hover:border-red-400/70"
              >
                {/* overlays */}
                {showSubscribeBadge && (
                  <div className="absolute left-3 top-3 z-20 rounded-full bg-red-600 px-3 py-1 text-[11px] font-semibold text-white shadow-[0_0_12px_rgba(255,0,0,0.55)]">
                    Subscribe
                  </div>
                )}

                {sponsor && (
                  <div className="absolute right-3 top-3 z-20 rounded-full bg-yellow-400 px-3 py-1 text-[11px] font-semibold text-black">
                    Sponsor
                  </div>
                )}

                {/* Video or placeholder */}
                <div className="aspect-video bg-black/40">
                  {embedUrl ? (
                    <iframe
                      className="h-full w-full"
                      src={embedUrl}
                      title={title}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerPolicy="strict-origin-when-cross-origin"
                      allowFullScreen
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-gray-400 px-4 text-center">
                      No video set yet. Edit{" "}
                      <span className="mx-1 text-white/70">youtubeSlots</span> and
                      redeploy.
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-2 p-4 text-sm">
                  <h2 className="text-base font-semibold text-white">{title}</h2>

                  {description ? <p className="text-xs text-gray-300">{description}</p> : null}

                  {/* Optional CTA link (e.g., channel link, sponsor link) */}
                  {slot?.ctaUrl ? (
                    <a
                      href={slot.ctaUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-semibold text-red-300 hover:text-red-200 transition"
                    >
                      {slot?.ctaLabel || "Open link"} <span aria-hidden>↗</span>
                    </a>
                  ) : null}

                  {/* NEW: Comments link */}
                  <Link
                    to={`/comments?ref=${encodeURIComponent(commentRef)}`}
                    className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 transition"
                    title="Go to Comments page"
                  >
                    💬 Comment and join the discussion
                  </Link>
                </div>
              </article>
            );
          })}
        </main>
      </div>
    </div>
  );
}
