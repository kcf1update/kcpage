// src/F1NewsPage.jsx
import React from "react";

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

export default function F1NewsPage() {
  // Home uses the first 3 slots
  // This page shows news4..news9 (6 cards)
  const newsPageCards = newsSlots.slice(4, 10);

  return (
    <div className="relative min-h-screen bg-[#454545] text-white">
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-3 px-4 pt-3 pb-8 sm:gap-4 sm:pt-4 sm:pb-10">
        <TopCard>
          <TopCard.Header
            title="F1 News – Quick, Clear, Updated Daily"
                        logoSrc="/img/kcs-f1-car.png"
          />
        </TopCard>

        <div className="flex items-center">
          <PageNav />
          <div className="shrink-0">{/* language selector hidden for launch */}</div>
        </div>

        <main className="grid gap-4 lg:grid-cols-2">
          {newsPageCards.map((item) => {
            const href = safeUrl(item.url);
            const imgPath = safeLocalImagePath(item.imagePath);
            const quickShift = (item.kcsQuickShift || "").trim();
            const altText = (item.imageAlt || item.title || "F1 news").trim();

            return (
              <article
                key={item.slotId}
                className="flex flex-col overflow-hidden rounded-3xl border border-white/10 bg-black/60 shadow-lg"
              >
                {imgPath ? (
                  href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="block"
                      title="Open article"
                    >
                      <div className="aspect-[16/9] w-full overflow-hidden bg-black/40">
                        <img
                          src={imgPath}
                          alt={altText}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      </div>
                    </a>
                  ) : (
                    <div className="aspect-[16/9] w-full overflow-hidden bg-black/40">
                      <img
                        src={imgPath}
                        alt={altText}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  )
                ) : null}

                <div className="p-4 space-y-3">
                  <div className="text-[11px] uppercase tracking-wide text-cyan-200/80">
                    {item.sourceLabel || "Source"}
                  </div>

                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="block"
                      title="Open article"
                    >
                      <h3 className="text-lg font-semibold leading-snug text-white hover:text-cyan-200 transition">
                        {item.title || "Headline"}
                      </h3>
                    </a>
                  ) : (
                    <h3 className="text-lg font-semibold leading-snug text-white">
                      {item.title || "Headline"}
                    </h3>
                  )}

                  {item.summary ? (
                    <p className="text-sm leading-relaxed text-white/75">
                      {item.summary}
                    </p>
                  ) : null}

                  {quickShift ? (
                    <div className="rounded-2xl border border-cyan-400/25 bg-cyan-400/10 px-4 py-3">
                      <div className="text-[11px] font-semibold uppercase tracking-wide text-cyan-300">
                        KC’s Quick Shift
                      </div>
                      <p className="mt-1 text-sm leading-relaxed text-white/90">
                        {quickShift}
                      </p>
                    </div>
                  ) : null}
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