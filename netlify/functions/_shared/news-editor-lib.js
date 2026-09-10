const JSON5 = require("json5");

const NEWS_PATH = "src/content/newsSlots.js";
const ARCHIVE_PATH = "src/content/newsArchive.js";
const FIELDS = ["sourceLabel", "title", "summary", "kcsQuickShift", "url", "imagePath", "photoCredit", "dateLabel"];

function parseExportedArray(source, name) {
  const marker = `export const ${name}`;
  const markerIndex = source.indexOf(marker);
  const equalsIndex = source.indexOf("=", markerIndex + marker.length);
  if (markerIndex < 0 || equalsIndex < 0) throw new Error(`Could not read ${name}.`);
  const value = JSON5.parse(source.slice(equalsIndex + 1).trim().replace(/;\s*$/, ""));
  if (!Array.isArray(value)) throw new Error(`${name} must be an array.`);
  return value;
}

function validateArticles(input) {
  if (!Array.isArray(input) || input.length !== 10) {
    return { ok: false, error: "Exactly 10 news stories are required." };
  }

  const articles = [];
  for (let index = 0; index < input.length; index += 1) {
    const article = { slotId: index + 1 };
    for (const field of FIELDS) article[field] = String(input[index]?.[field] ?? "").trim();

    const missing = FIELDS.filter((field) => !article[field]);
    if (missing.length) return { ok: false, error: `Story ${index + 1} is missing: ${missing.join(", ")}.` };

    let url;
    try { url = new URL(article.url); } catch { return { ok: false, error: `Story ${index + 1} has an invalid article URL.` }; }
    if (!["http:", "https:"].includes(url.protocol)) {
      return { ok: false, error: `Story ${index + 1} must use an http or https article URL.` };
    }
    if (!article.imagePath.startsWith("/")) {
      return { ok: false, error: `Story ${index + 1} must use a local image path beginning with /.` };
    }
    if (article.title.length > 500 || article.summary.length > 2000 || article.kcsQuickShift.length > 2000) {
      return { ok: false, error: `Story ${index + 1} contains text that is unexpectedly long.` };
    }
    articles.push(article);
  }

  if (new Set(articles.map((article) => article.dateLabel)).size !== 1) {
    return { ok: false, error: "All 10 stories must use the same date." };
  }
  return { ok: true, articles };
}

function serializeNewsSlots(articles) {
  return `export const newsSlots = ${JSON.stringify(articles, null, 2)};\n`;
}

function makeArchiveGroup(articles) {
  return {
    dateLabel: articles[0]?.dateLabel || "",
    articles: articles.map((article, index) => ({
      slotId: `news-${String(index + 1).padStart(2, "0")}`,
      sourceLabel: article.sourceLabel,
      title: article.title,
      summary: article.summary,
      kcsQuickShift: article.kcsQuickShift,
      url: article.url,
      dateLabel: article.dateLabel,
    })),
  };
}

function prependArchiveGroup(source, group) {
  const marker = "export const newsArchive = [";
  const index = source.indexOf(marker);
  if (index < 0) throw new Error("Could not find the news archive export.");
  const insertAt = index + marker.length;
  const serialized = JSON.stringify(group, null, 2).split("\n").map((line) => `  ${line}`).join("\n");
  return `${source.slice(0, insertAt)}\n${serialized},${source.slice(insertAt)}`;
}

function buildContentUpdate({ currentArticles, nextArticles, archiveSource, archiveGroups }) {
  const currentDate = currentArticles[0]?.dateLabel || "";
  const nextDate = nextArticles[0]?.dateLabel || "";
  let nextArchiveSource = archiveSource;
  let archivedPreviousDay = false;

  if (currentDate && currentDate !== nextDate && !archiveGroups.some((group) => group?.dateLabel === currentDate)) {
    nextArchiveSource = prependArchiveGroup(archiveSource, makeArchiveGroup(currentArticles));
    archivedPreviousDay = true;
  }

  return { newsSource: serializeNewsSlots(nextArticles), archiveSource: nextArchiveSource, archivedPreviousDay };
}

module.exports = { ARCHIVE_PATH, NEWS_PATH, buildContentUpdate, parseExportedArray, validateArticles };
