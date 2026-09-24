import assert from "node:assert/strict";
import fs from "node:fs";
import { createHash } from "node:crypto";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  imagePreviewUrl,
  normalizeImagePath,
  parseExportedArray,
  prepareFiles,
  splitBilingualText,
  validateArticles,
} from "../dist/core.mjs";
import { createEditorServer } from "../server.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(here, "../../../");
const newsSource = fs.readFileSync(path.join(repositoryRoot, "src/content/newsSlots.js"), "utf8");
const archiveSource = fs.readFileSync(path.join(repositoryRoot, "src/content/newsArchive.js"), "utf8");
const currentArticles = parseExportedArray(newsSource, "newsSlots");
const archiveGroups = parseExportedArray(archiveSource, "newsArchive");
const consistentArticles = currentArticles.map((article) => ({ ...article, dateLabel: currentArticles[0].dateLabel }));

test("safely reads the website's current 10 news stories", () => {
  assert.equal(currentArticles.length, 10);
  assert.ok(currentArticles.every((article) => typeof article.title === "string"));
  assert.equal(validateArticles(consistentArticles).ok, true);
});

test("reads the existing archive without evaluating JavaScript", () => {
  assert.ok(archiveGroups.length > 0);
  assert.equal(typeof archiveGroups[0].articles[0].title, "string");
});

test("a same-day correction does not alter the archive", () => {
  const prepared = prepareFiles({ currentArticles: consistentArticles, nextArticles: consistentArticles, archiveSource, archiveGroups });
  assert.equal(prepared.archivedPreviousDay, false);
  assert.equal(prepared.archiveSource, archiveSource);
});

test("a new day prepends one group and preserves the old archive byte-for-byte", () => {
  const unarchivedArticles = currentArticles.map((article) => ({ ...article, dateLabel: "September 30, 2099" }));
  const nextArticles = currentArticles.map((article) => ({ ...article, dateLabel: "October 1, 2099" }));
  const prepared = prepareFiles({ currentArticles: unarchivedArticles, nextArticles, archiveSource, archiveGroups });
  assert.equal(prepared.archivedPreviousDay, true);
  const marker = "export const newsArchive = [";
  const originalArchiveTail = archiveSource.slice(archiveSource.indexOf(marker) + marker.length);
  assert.ok(prepared.archiveSource.endsWith(originalArchiveTail));
  const updatedGroups = parseExportedArray(prepared.archiveSource, "newsArchive");
  assert.equal(updatedGroups[0].dateLabel, "September 30, 2099");
  assert.equal(updatedGroups[0].articles.length, 10);
});

test("unsafe image paths and incomplete bilingual slots are rejected", () => {
  const changed = currentArticles.map((article) => ({ ...article }));
  changed[0].imagePath = "https://example.com/image.jpg";
  changed[1].title = "English only";
  const result = validateArticles(changed);
  assert.equal(result.ok, false);
  assert.ok(result.errors.some((error) => error.includes("begin with /img/")));
  assert.ok(result.errors.some((error) => error.includes("foreign language | English")));
});

test("deep reorganized image paths are accepted and resolve in the offline editor", () => {
  const imagePath = "/img/news/mercedes/kimi/race-report.jpg";
  assert.equal(normalizeImagePath(imagePath), imagePath);
  assert.equal(
    imagePreviewUrl(imagePath, "file:///repo/tools/daily-news-editor-v2/dist/index.html"),
    "file:///repo/public/img/news/mercedes/kimi/race-report.jpg"
  );
  assert.equal(
    imagePreviewUrl(imagePath, "https://preview.example/tools/editor/"),
    "https://preview.example/img/news/mercedes/kimi/race-report.jpg"
  );
});

test("image paths cannot escape the public image folder", () => {
  assert.throws(() => normalizeImagePath("/img/news/../secret.txt"), /cannot move outside/);
  assert.throws(() => normalizeImagePath("/public/img/news/photo.jpg"), /begin with \/img\//);
});

test("bilingual preview keeps the website's text order", () => {
  assert.deepEqual(splitBilingualText("Italiano | English"), { first: "Italiano", second: "English" });
  assert.deepEqual(splitBilingualText("English | Italiano | extra"), { first: "English", second: "Italiano | extra" });
  assert.equal(splitBilingualText("English only"), null);
});

test("foreign slots accept an English-only QuickShift but reject a half translation", () => {
  const articles = consistentArticles.map((article) => ({ ...article }));
  articles[3].kcsQuickShift = "English commentary only.";
  assert.equal(validateArticles(articles).ok, true);
  articles[3].kcsQuickShift = "English commentary | ";
  assert.ok(validateArticles(articles).errors.some((error) => error.includes("both sides")));
});

test("prepared files retain all 10 current stories and archive content", () => {
  const prepared = prepareFiles({ currentArticles: consistentArticles, nextArticles: consistentArticles, archiveSource, archiveGroups });
  const exported = parseExportedArray(prepared.newsSource, "newsSlots");
  assert.equal(exported.length, 10);
  for (let index = 0; index < 10; index += 1) {
    for (const field of ["sourceLabel", "title", "summary", "kcsQuickShift", "url", "imagePath", "photoCredit", "dateLabel"]) {
      assert.equal(exported[index][field], String(consistentArticles[index][field] ?? "").trim());
    }
  }
  assert.equal(prepared.archiveSource, archiveSource);
});

test("a partial daily update cannot silently discard the unarchived previous day", () => {
  const mixed = consistentArticles.map((article, index) => ({ ...article, dateLabel: index < 2 ? "September 24, 2099" : "September 23, 2099" }));
  const next = consistentArticles.map((article) => ({ ...article, dateLabel: "September 24, 2099" }));
  assert.throws(
    () => prepareFiles({ currentArticles: mixed, nextArticles: next, archiveSource, archiveGroups }),
    /mixed or missing dates/
  );
});

test("local editor serves its modules and current images without exposing website source", async () => {
  const server = createEditorServer();
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const page = await fetch(`${base}/`);
    assert.equal(page.status, 200);
    assert.match(await page.text(), /Daily News Editor/);
    const module = await fetch(`${base}/core.mjs`);
    assert.equal(module.status, 200);
    const status = await fetch(`${base}/source-status`);
    assert.equal(status.status, 200);
    const hashes = await status.json();
    assert.deepEqual(hashes, {
      news: createHash("sha256").update(newsSource).digest("hex"),
      archive: createHash("sha256").update(archiveSource).digest("hex"),
    });
    assert.notEqual(hashes.news, createHash("sha256").update(`${newsSource}\nchanged`).digest("hex"));
    const image = await fetch(`${base}${currentArticles[0].imagePath}`);
    assert.equal(image.status, 200, `Current story 1 image must be available: ${currentArticles[0].imagePath}`);
    await image.arrayBuffer();
    assert.equal((await fetch(`${base}/src/content/newsSlots.js`)).status, 404);
    assert.equal((await fetch(`${base}/img/%2e%2e/content/newsSlots.js`)).status, 404);
    assert.equal((await fetch(`${base}/img/news/missing.jpg`)).status, 404);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
