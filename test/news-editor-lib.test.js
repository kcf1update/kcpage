const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const { buildContentUpdate, parseExportedArray, validateArticles } = require("../netlify/functions/_shared/news-editor-lib");

const root = path.resolve(__dirname, "..");
const newsSource = fs.readFileSync(path.join(root, "src/content/newsSlots.js"), "utf8");
const archiveSource = fs.readFileSync(path.join(root, "src/content/newsArchive.js"), "utf8");
const currentArticles = parseExportedArray(newsSource, "newsSlots");
const archiveGroups = parseExportedArray(archiveSource, "newsArchive");

test("reads and validates the current content", () => {
  assert.equal(currentArticles.length, 10);
  assert.ok(archiveGroups.length > 0);
  assert.equal(validateArticles(currentArticles).ok, true);
});

test("rejects unsafe image paths", () => {
  const changed = currentArticles.map((article) => ({ ...article }));
  changed[0].imagePath = "https://example.com/image.jpg";
  assert.equal(validateArticles(changed).ok, false);
});

test("archives the current day when the date changes", () => {
  const nextArticles = currentArticles.map((article) => ({ ...article, dateLabel: "September 11, 2026" }));
  const result = buildContentUpdate({ currentArticles, nextArticles, archiveSource, archiveGroups });
  assert.equal(result.archivedPreviousDay, true);
  const updated = parseExportedArray(result.archiveSource, "newsArchive");
  assert.equal(updated[0].dateLabel, currentArticles[0].dateLabel);
  assert.equal(updated[0].articles.length, 10);
});

test("does not duplicate the archive on a same-day correction", () => {
  const result = buildContentUpdate({ currentArticles, nextArticles: currentArticles, archiveSource, archiveGroups });
  assert.equal(result.archivedPreviousDay, false);
  assert.equal(result.archiveSource, archiveSource);
});
