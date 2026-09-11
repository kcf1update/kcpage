export const ARTICLE_FIELDS = [
  "sourceLabel",
  "title",
  "summary",
  "kcsQuickShift",
  "url",
  "imagePath",
  "photoCredit",
  "dateLabel",
];

export const REQUIRED_FIELDS = ARTICLE_FIELDS.filter(
  (field) => field !== "kcsQuickShift"
);

export const FOREIGN_LANGUAGE_SLOTS = new Set([2, 4, 8]);

export function cleanArticle(article = {}, index = 0) {
  const cleaned = { slotId: String(index + 1) };
  for (const field of ARTICLE_FIELDS) {
    cleaned[field] = String(article[field] ?? "").trim();
  }
  return cleaned;
}

export function createEmptyArticles() {
  return Array.from({ length: 10 }, (_, index) => cleanArticle({}, index));
}

function extractArrayLiteral(source, exportName) {
  const marker = `export const ${exportName}`;
  const markerIndex = source.indexOf(marker);
  if (markerIndex < 0) throw new Error(`Could not find “${marker}”.`);

  const equalsIndex = source.indexOf("=", markerIndex + marker.length);
  const start = source.indexOf("[", equalsIndex + 1);
  if (equalsIndex < 0 || start < 0) {
    throw new Error(`Could not find the ${exportName} array.`);
  }

  let depth = 0;
  let quote = "";
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = start; index < source.length; index += 1) {
    const char = source[index];
    const next = source[index + 1];

    if (lineComment) {
      if (char === "\n") lineComment = false;
      continue;
    }
    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = "";
      continue;
    }
    if (char === "/" && next === "/") {
      lineComment = true;
      index += 1;
      continue;
    }
    if (char === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      continue;
    }
    if (char === "[") depth += 1;
    if (char === "]") {
      depth -= 1;
      if (depth === 0) return source.slice(start, index + 1);
    }
  }

  throw new Error(`The ${exportName} array is incomplete.`);
}

function stripCommentsAndQuoteKeys(literal) {
  let output = "";
  let quote = "";
  let escaped = false;
  let lineComment = false;
  let blockComment = false;

  for (let index = 0; index < literal.length; index += 1) {
    const char = literal[index];
    const next = literal[index + 1];

    if (lineComment) {
      if (char === "\n") {
        lineComment = false;
        output += char;
      }
      continue;
    }
    if (blockComment) {
      if (char === "*" && next === "/") {
        blockComment = false;
        index += 1;
      }
      continue;
    }
    if (quote) {
      if (quote === "'") {
        throw new Error("Single-quoted text is not supported. Use normal double quotes.");
      }
      output += char;
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = "";
      continue;
    }
    if (char === "/" && next === "/") {
      lineComment = true;
      index += 1;
      continue;
    }
    if (char === "/" && next === "*") {
      blockComment = true;
      index += 1;
      continue;
    }
    if (char === '"' || char === "'") {
      quote = char;
      output += char;
      continue;
    }

    const previous = output.trimEnd().slice(-1);
    if ((previous === "{" || previous === ",") && /[A-Za-z_$]/.test(char)) {
      let end = index + 1;
      while (end < literal.length && /[A-Za-z0-9_$]/.test(literal[end])) end += 1;
      let colon = end;
      while (colon < literal.length && /\s/.test(literal[colon])) colon += 1;
      if (literal[colon] === ":") {
        output += `"${literal.slice(index, end)}"`;
        index = end - 1;
        continue;
      }
    }
    output += char;
  }

  let strict = "";
  quote = "";
  escaped = false;
  for (let index = 0; index < output.length; index += 1) {
    const char = output[index];
    if (quote) {
      strict += char;
      if (escaped) escaped = false;
      else if (char === "\\") escaped = true;
      else if (char === quote) quote = "";
      continue;
    }
    if (char === '"') {
      quote = char;
      strict += char;
      continue;
    }
    if (char === ",") {
      let nextIndex = index + 1;
      while (nextIndex < output.length && /\s/.test(output[nextIndex])) nextIndex += 1;
      if (output[nextIndex] === "}" || output[nextIndex] === "]") continue;
    }
    strict += char;
  }
  return strict;
}

export function parseExportedArray(source, exportName) {
  if (typeof source !== "string") throw new Error("The selected file could not be read.");
  const literal = extractArrayLiteral(source, exportName);
  let value;
  try {
    value = JSON.parse(stripCommentsAndQuoteKeys(literal));
  } catch (error) {
    throw new Error(`Could not safely read ${exportName}: ${error.message}`);
  }
  if (!Array.isArray(value)) throw new Error(`${exportName} must be an array.`);
  return value;
}

export function validateArticles(input) {
  const errors = [];
  const warnings = [];
  if (!Array.isArray(input) || input.length !== 10) {
    return { ok: false, errors: ["Exactly 10 news stories are required."], warnings, articles: [] };
  }

  const articles = input.map(cleanArticle);
  for (let index = 0; index < articles.length; index += 1) {
    const article = articles[index];
    const slot = index + 1;
    const missing = REQUIRED_FIELDS.filter((field) => !article[field]);
    if (missing.length) errors.push(`Story ${slot} is missing: ${missing.join(", ")}.`);
    if (!article.kcsQuickShift) warnings.push(`Story ${slot} has no KC QuickShift.`);

    try {
      const url = new URL(article.url);
      if (!["http:", "https:"].includes(url.protocol)) throw new Error();
    } catch {
      if (article.url) errors.push(`Story ${slot} needs a safe http or https article link.`);
    }

    if (article.imagePath && !article.imagePath.startsWith("/")) {
      errors.push(`Story ${slot} must use a local image path beginning with /.`);
    }

    if (FOREIGN_LANGUAGE_SLOTS.has(slot)) {
      if (article.title && !article.title.includes("|")) {
        errors.push(`Story ${slot} title needs “foreign language | English”.`);
      }
      if (article.summary && !article.summary.includes("|")) {
        errors.push(`Story ${slot} summary needs “foreign language | English”.`);
      }
      if (article.kcsQuickShift && !article.kcsQuickShift.includes("|")) {
        errors.push(`Story ${slot} QuickShift needs “English | foreign language”.`);
      }
    }
  }

  const dates = new Set(articles.map((article) => article.dateLabel).filter(Boolean));
  if (dates.size > 1) errors.push("All 10 stories must use the same date.");
  return { ok: errors.length === 0, errors, warnings, articles };
}

export function serializeNewsSlots(articles) {
  return `export const newsSlots = ${JSON.stringify(articles.map(cleanArticle), null, 2)};\n`;
}

export function makeArchiveGroup(articles) {
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

export function prependArchiveGroup(source, group) {
  const marker = "export const newsArchive = [";
  const index = source.indexOf(marker);
  if (index < 0) throw new Error("Could not find the newsArchive export.");
  const insertAt = index + marker.length;
  const serialized = JSON.stringify(group, null, 2)
    .split("\n")
    .map((line) => `  ${line}`)
    .join("\n");
  return `${source.slice(0, insertAt)}\n${serialized},${source.slice(insertAt)}`;
}

function archiveContainsDate(groups, dateLabel) {
  return groups.some(
    (group) =>
      group?.dateLabel === dateLabel ||
      group?.articles?.some((article) => article?.dateLabel === dateLabel)
  );
}

export function prepareFiles({ currentArticles, nextArticles, archiveSource, archiveGroups }) {
  const validation = validateArticles(nextArticles);
  if (!validation.ok) throw new Error(validation.errors.join("\n"));

  const current = currentArticles.map(cleanArticle);
  const next = validation.articles;
  const currentDate = current[0]?.dateLabel || "";
  const nextDate = next[0]?.dateLabel || "";
  let nextArchiveSource = archiveSource;
  let archivedPreviousDay = false;

  if (currentDate && currentDate !== nextDate && !archiveContainsDate(archiveGroups, currentDate)) {
    if (!archiveSource) throw new Error("Import newsArchive.js before changing to a new date.");
    nextArchiveSource = prependArchiveGroup(archiveSource, makeArchiveGroup(current));
    archivedPreviousDay = true;
  }

  return {
    newsSource: serializeNewsSlots(next),
    archiveSource: nextArchiveSource,
    archivedPreviousDay,
    warnings: validation.warnings,
  };
}
