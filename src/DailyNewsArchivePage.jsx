// src/DailyNewsArchivePage.jsx
import React from "react";
import { Link, useParams } from "react-router-dom";

import AdBar from "./AdBar.jsx";
import SiteHeader from "./components/SiteHeader";
import { newsArchive } from "./content/newsArchive";
import {
  buildArchiveGroups,
  dateLabelToSlug,
} from "./archiveUtils";

function safeUrl(url) {
  if (!url || typeof url !== "string") return "";

  try {
    const parsedUrl = new URL(url);

    if (
      parsedUrl.protocol === "http:" ||
      parsedUrl.protocol === "https:"
    ) {
      return parsedUrl.toString();
    }

    return "";
  } catch {
    return "";
  }
}

function renderBilingualTitle(title) {
  if (
    !title ||
    typeof title !== "string" ||
    !title.includes("|")
  ) {
    return title;
  }

  const [foreignTitle, ...rest] = title.split("|");
  const englishTitle = rest.join("|");

  return (
    <>
      <span className="text-sky-300">
        {foreignTitle.trim()}
      </span>

      <span className="text-cyan-300"> | </span>

      <span className="text-white">
        {englishTitle.trim()}
      </span>
    </>
  );
}

function renderQuickShift(quickShift) {
  if (
    !quickShift ||
    typeof quickShift !== "string" ||
    !quickShift.includes("|")
  ) {
    return quickShift;
  }

  const [englishQuickShift, ...rest] = quickShift.split("|");
  const foreignQuickShift = rest.join("|");

  return (
    <>
      <span className="block">
        {englishQuickShift.trim()}
      </span>

      <span className="mt-2 block text-sky-200">
        {foreignQuickShift.trim()}
      </span>
    </>
  );
}

function trackArchiveClick(article) {
  if (!window.gtag) return;

  window.gtag("event", "article_click", {
    article_title: article?.title || "",
    article_url: article?.url || "",
    article_location: "daily_news_archive",
    transport_type: "beacon",
  });
}

export default function DailyNewsArchivePage() {
  const { dateSlug } = useParams();
  const archiveGroups = buildArchiveGroups(
    Array.isArray(newsArchive) ? newsArchive : []
  );
  const groupIndex = archiveGroups.findIndex(
    (group) => dateLabelToSlug(group.dateLabel) === dateSlug
  );
  const group = groupIndex >= 0 ? archiveGroups[groupIndex] : null;

  if (!group) {
    return (
      <div className="relative min-h-screen bg-[#454545] text-white">
        <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-4 px-4 pb-8 pt-3 sm:pb-10 sm:pt-4">
          <SiteHeader />

          <main className="rounded-3xl border border-white/10 bg-black/60 px-5 py-10 text-center shadow-lg">
            <h1 className="text-2xl font-extrabold text-cyan-300 sm:text-3xl">
              Archive date not found
            </h1>

            <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-slate-300 sm:text-base">
              There are no archived Formula 1 stories for this
              date.
            </p>

            <Link
              to="/news"
              className="mt-5 inline-flex rounded-full border border-cyan-300/50 bg-cyan-400/15 px-5 py-2.5 text-sm font-bold text-cyan-100 transition hover:bg-cyan-400/25 hover:text-white"
            >
              Return to In Case You Missed It
            </Link>
          </main>

          <AdBar />
        </div>
      </div>
    );
  }

  const newerGroup =
    groupIndex > 0 ? archiveGroups[groupIndex - 1] : null;
  const olderGroup =
    groupIndex < archiveGroups.length - 1
      ? archiveGroups[groupIndex + 1]
      : null;

  return (
    <div className="relative min-h-screen bg-[#454545] text-white">
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-4 px-4 pb-8 pt-3 sm:pb-10 sm:pt-4">
        <SiteHeader />

        <header className="rounded-3xl border border-cyan-400/30 bg-black/60 px-5 py-6 text-center shadow-lg sm:px-8">
          <div className="text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
            Daily F1 News Archive
          </div>

          <h1 className="mt-2 text-2xl font-extrabold text-cyan-300 sm:text-3xl">
            {group.dateLabel}
          </h1>

          <p className="mx-auto mt-2 max-w-3xl text-sm leading-relaxed text-slate-200 sm:text-base">
            {group.articles.length}{" "}
            {group.articles.length === 1 ? "story" : "stories"}{" "}
            previously featured on KC’s Worldwide F1 Update,
            including KC’s quick-read summaries and commentary.
          </p>

          <Link
            to="/news"
            className="mt-4 inline-flex text-sm font-semibold text-cyan-200 transition hover:text-white"
          >
            ← View the complete In Case You Missed It archive
          </Link>
        </header>

        <main className="overflow-hidden rounded-3xl border border-white/10 bg-black/60 shadow-lg">
          <div className="divide-y divide-white/10">
            {group.articles.map((article, articleIndex) => {
              const href = safeUrl(article?.url);

              return (
                <article
                  key={`${articleIndex}-${article?.title || "article"}`}
                  className="px-5 py-4 transition hover:bg-white/5"
                >
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-cyan-200/75">
                    {article?.sourceLabel || "Source"}
                  </div>

                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 block text-base font-semibold leading-snug text-white transition hover:text-cyan-300 sm:text-lg"
                      onClick={() => trackArchiveClick(article)}
                    >
                      {renderBilingualTitle(
                        article?.title || "F1 article"
                      )}
                    </a>
                  ) : (
                    <div className="mt-1 text-base font-semibold leading-snug text-white sm:text-lg">
                      {renderBilingualTitle(
                        article?.title || "F1 article"
                      )}
                    </div>
                  )}

                  {article?.summary && (
                    <p className="mt-2 text-sm leading-relaxed text-slate-300 sm:text-base">
                      {article.summary}
                    </p>
                  )}

                  {article?.kcsQuickShift && (
                    <div className="mt-3 border-l-4 border-cyan-400 bg-cyan-400/10 px-4 py-3">
                      <div className="text-xs font-bold uppercase tracking-wide text-cyan-300">
                        KC’s QuickShift
                      </div>

                      <p className="mt-1 text-sm leading-relaxed text-white sm:text-base">
                        {renderQuickShift(article.kcsQuickShift)}
                      </p>
                    </div>
                  )}

                  {href && (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex text-sm font-semibold text-cyan-200 transition hover:text-white"
                      onClick={() => trackArchiveClick(article)}
                    >
                      Read the original article →
                    </a>
                  )}
                </article>
              );
            })}
          </div>
        </main>

        {(newerGroup || olderGroup) && (
          <nav
            aria-label="Daily archive navigation"
            className="grid gap-3 rounded-2xl border border-white/10 bg-black/50 px-4 py-4 sm:grid-cols-2"
          >
            <div>
              {newerGroup && (
                <Link
                  to={`/news/${dateLabelToSlug(newerGroup.dateLabel)}`}
                  className="inline-flex text-sm font-semibold text-cyan-200 transition hover:text-white"
                >
                  ← Newer: {newerGroup.dateLabel}
                </Link>
              )}
            </div>

            <div className="sm:text-right">
              {olderGroup && (
                <Link
                  to={`/news/${dateLabelToSlug(olderGroup.dateLabel)}`}
                  className="inline-flex text-sm font-semibold text-cyan-200 transition hover:text-white"
                >
                  Older: {olderGroup.dateLabel} →
                </Link>
              )}
            </div>
          </nav>
        )}

        <AdBar />
      </div>
    </div>
  );
}
