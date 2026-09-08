// src/F1NewsPage.jsx
import React from "react";

import AdBar from "./AdBar.jsx";
import SiteHeader from "./components/SiteHeader";
import { newsArchive } from "./content/newsArchive";

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

export default function F1NewsPage() {
  const archiveGroups = Array.isArray(newsArchive)
    ? newsArchive
    : [];

  return (
    <div className="relative min-h-screen bg-[#454545] text-white">
      <div className="relative z-10 mx-auto flex max-w-6xl flex-col gap-4 px-4 pb-8 pt-3 sm:pb-10 sm:pt-4">
        <SiteHeader />

        <header className="rounded-3xl border border-cyan-400/30 bg-black/60 px-5 py-6 text-center shadow-lg sm:px-8">
          <h1 className="text-2xl font-extrabold text-cyan-300 sm:text-3xl">
            In Case You Missed It
          </h1>

          <p className="mx-auto mt-2 max-w-3xl text-sm leading-relaxed text-slate-200 sm:text-base">
            Catch up on recent Formula 1 stories featured on
            KC’s Worldwide F1 Update. Select a headline to read
            the original article.
          </p>
          <p className="mx-auto mt-3 max-w-3xl border-t border-white/10 pt-3 text-xs leading-relaxed text-slate-400">
  Each headline links to the original publisher. KC’s Worldwide F1 Update
  provides brief summaries and commentary and does not reproduce the
  original articles or their images.
</p>
        </header>

        <main className="space-y-5">
          {archiveGroups.length > 0 ? (
            archiveGroups.map((group, groupIndex) => {
              const articles = Array.isArray(group?.articles)
                ? group.articles
                : [];

              return (
                <section
                  key={`${group?.dateLabel || "archive"}-${groupIndex}`}
                  className="overflow-hidden rounded-3xl border border-white/10 bg-black/60 shadow-lg"
                >
                  <div className="border-b border-cyan-400/20 bg-cyan-400/10 px-5 py-3">
                    <h2 className="text-lg font-bold text-cyan-300">
                      {group?.dateLabel || "Past F1 News"}
                    </h2>
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