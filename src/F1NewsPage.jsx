// src/F1NewsPage.jsx
import React from "react";
import { Link } from "react-router-dom";

import AdBar from "./AdBar.jsx";
import SiteHeader from "./components/SiteHeader";
import { newsArchive } from "./content/newsArchive";
import {
  buildArchiveGroups,
  dateLabelToSlug,
} from "./archiveUtils";

// Allow only safe external article links
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

function archiveSectionId(dateLabel) {
  return `archive-${String(dateLabel || "past-f1-news")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")}`;
}

function trackArchiveClick(article) {
  if (!window.gtag) return;

  window.gtag("event", "article_click", {
    article_title: article?.title || "",
    article_url: article?.url || "",
    article_location: "news_archive",
    transport_type: "beacon",
  });
}

export default function F1NewsPage() {
  const archiveGroups = buildArchiveGroups(
    Array.isArray(newsArchive) ? newsArchive : []
  );
  const archivedArticleCount = archiveGroups.reduce(
    (total, group) => total + group.articles.length,
    0
  );

  return (
    <div className="relative min-h-screen bg-[#454545] text-white">
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-4 px-4 pb-8 pt-3 sm:pb-10 sm:pt-4">
        <SiteHeader />

        <header className="rounded-3xl border border-cyan-400/30 bg-black/60 px-5 py-6 text-center shadow-lg sm:px-8">
          <h1 className="text-2xl font-extrabold text-cyan-300 sm:text-3xl">
            In Case You Missed It
          </h1>

          <p className="mx-auto mt-2 max-w-3xl text-sm leading-relaxed text-slate-200 sm:text-base">
            Catch up on Formula 1 stories previously featured on
            KC’s Worldwide F1 Update. Every entry preserves KC’s
            quick-read summary, commentary and a link to the
            original publisher.
          </p>

          <p className="mx-auto mt-3 max-w-3xl border-t border-white/10 pt-3 text-xs leading-relaxed text-slate-400">
            Showing {archivedArticleCount} archived{" "}
            {archivedArticleCount === 1 ? "story" : "stories"}.
            KC’s Worldwide F1 Update does not reproduce the
            publishers’ original articles or images.
          </p>
        </header>

        {archiveGroups.length > 1 && (
          <nav
            aria-label="Recent archive dates"
            className="rounded-2xl border border-white/10 bg-black/50 px-4 py-3"
          >
            <div className="mb-2 text-xs font-bold uppercase tracking-wide text-cyan-300">
              Browse recent dates
            </div>

            <div className="flex flex-wrap gap-2">
              {archiveGroups.slice(0, 8).map((group) => (
                <Link
                  key={group.dateLabel}
                  to={`/news/${dateLabelToSlug(group.dateLabel)}`}
                  className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1.5 text-xs font-semibold text-cyan-100 transition hover:bg-cyan-400/20 hover:text-white"
                >
                  {group.dateLabel}
                </Link>
              ))}
            </div>
          </nav>
        )}

        <main className="space-y-5">
          {archiveGroups.length > 0 ? (
            archiveGroups.map((group, groupIndex) => {
              const articles = Array.isArray(group?.articles)
                ? group.articles
                : [];

              return (
                <section
                  key={`${group?.dateLabel || "archive"}-${groupIndex}`}
                  id={archiveSectionId(group?.dateLabel)}
                  className="scroll-mt-4 overflow-hidden rounded-3xl border border-white/10 bg-black/60 shadow-lg"
                >
                  <div className="border-b border-cyan-400/20 bg-cyan-400/10 px-5 py-3">
                    <div className="flex items-center justify-between gap-4">
                      <h2 className="text-lg font-bold text-cyan-300">
                        {group?.dateLabel || "Past F1 News"}
                      </h2>

                      <div className="flex shrink-0 items-center gap-3">
                        <span className="text-xs text-slate-300">
                          {articles.length}{" "}
                          {articles.length === 1 ? "story" : "stories"}
                        </span>

                        {dateLabelToSlug(group?.dateLabel) && (
                          <Link
                            to={`/news/${dateLabelToSlug(group.dateLabel)}`}
                            className="text-xs font-bold text-cyan-200 transition hover:text-white"
                          >
                            Open day →
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="divide-y divide-white/10">
                    {articles.map((article, articleIndex) => {
                      const href = safeUrl(article?.url);

                      return (
                        <article
                          key={`${groupIndex}-${articleIndex}-${article?.title || "article"}`}
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
                                {renderQuickShift(
                                  article.kcsQuickShift
                                )}
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
                </section>
              );
            })
          ) : (
            <section className="rounded-3xl border border-white/10 bg-black/60 px-5 py-8 text-center shadow-lg">
              <h2 className="text-lg font-bold text-cyan-300">
                Past stories will appear here
              </h2>

              <p className="mt-2 text-sm leading-relaxed text-slate-300">
                Previous Formula 1 headlines and links will be
                added as the daily news is updated.
              </p>
            </section>
          )}
        </main>

        <AdBar />
      </div>
    </div>
  );
}