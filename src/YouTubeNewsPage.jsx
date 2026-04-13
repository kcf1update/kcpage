// src/YouTubeNewsPage.jsx
import React, { useMemo } from "react";


import AdBar from "./AdBar.jsx";
import TopCard from "./components/TopCard";
import PageNav from "./components/PageNav";

// ✅ Stage A content source
import { youtubeSlots } from "./content/youtubeSlots";

function extractYouTubeId(input) {
  if (!input) return "";
  const trimmed = String(input).trim();

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  try {
    const url = new URL(trimmed);

    if (url.hostname === "youtu.be") {
      return url.pathname.replace("/", "").trim();
    }

    const v = url.searchParams.get("v");
    if (v) return v.trim();

    if (url.pathname.includes("/shorts/")) {
      return url.pathname.split("/shorts/")[1]?.split("/")[0]?.trim() || "";
    }

    return trimmed;
  } catch {
    return trimmed;
  }
}

function looksLive(input) {
  const s = String(input || "").toLowerCase();
  return s.includes("/live") || s.includes("live") || s.includes("live_stream");
}

function buildEmbedUrl(slot) {
  const { youtubeInput, videoId, channelId, playlistId, isLive } = slot || {};

  if (playlistId) {
    return `https://www.youtube.com/embed/videoseries?list=${encodeURIComponent(
      playlistId
    )}`;
  }

  const input = youtubeInput || videoId || "";
  const live = !!isLive || looksLive(input);

  if (live && channelId) {
    return `https://www.youtube.com/embed/live_stream?channel=${encodeURIComponent(
      channelId
    )}`;
  }

  const id = extractYouTubeId(videoId || youtubeInput || "");
  return id ? `https://www.youtube.com/embed/${id}` : "";
}

export default function YouTubeNewsPage() {
  const slots = useMemo(() => (Array.isArray(youtubeSlots) ? youtubeSlots : []), []);

  return (
    <div className="relative min-h-screen bg-[#545454] text-white">
      {/* Foreground content — MATCH F1NewsPage rhythm */}
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-3 sm:gap-4 px-4 pt-3 pb-8 sm:pt-4 sm:pb-10">
        
        {/* ✅ TOP CARD FIRST */}
        <TopCard>
  <TopCard.Header
    title="F1 YouTube News"
    subtitle="Latest videos, highlights, interviews, and race coverage."
    logoSrc="/img/kcs-f1-car.png"
  />
</TopCard>

        {/* ✅ NAV UNDER TOP CARD — SAME spacing as F1NewsPage */}
        <div className="flex items-center">
          <PageNav />
          <div className="shrink-0"></div>
        </div>

        

        {/* Video grid */}
        <main className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {slots.map((slot, idx) => {
            const embedUrl = buildEmbedUrl(slot);

            
            const title = slot?.title || "F1 video";
            const description = slot?.description || "";
          

            
            const showWatchButton = !!slot?.forceExternal;

            const videoIdForWatch = extractYouTubeId(slot?.videoId || slot?.youtubeInput || "");

            const watchUrl = videoIdForWatch
              ? `https://www.youtube.com/watch?v=${videoIdForWatch}`
              : "";

            return (
              <article
                key={slot?.slotId || `${idx}`}
                className="relative flex flex-col overflow-hidden rounded-3xl border border-red-400/40 bg-black/60 backdrop-blur shadow-[0_0_25px_rgba(248,113,113,0.7)] transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-[0_0_35px_rgba(248,113,113,0.9)] hover:border-red-400/70"
              >
                
                

                <div className="aspect-video bg-black/40">
                  {embedUrl ? (
                    <iframe
                      className="h-full w-full"
                      src={embedUrl}
                      title={title}
                      frameBorder="0"
                      allowFullScreen
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-gray-400 px-4 text-center">
                      No video set yet.
                    </div>
                  )}
                </div>

                <div className="p-4">
  <h2 className="text-sm font-semibold text-white">
    {title}
  </h2>
</div>

                  
                
              </article>
            );
          })}
        </main>
        <AdBar />
      </div>
    </div>
  );
}
