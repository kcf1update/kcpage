import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import {
  parseExportedArray,
  prepareFiles,
  validateArticles,
} from "../dist/core.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.resolve(here, "../../../");
const newsSource = fs.readFileSync(path.join(repositoryRoot, "src/content/newsSlots.js"), "utf8");
const archiveSource = fs.readFileSync(path.join(repositoryRoot, "src/content/newsArchive.js"), "utf8");
const currentArticles = parseExportedArray(newsSource, "newsSlots");
const archiveGroups = parseExportedArray(archiveSource, "newsArchive");

test("safely reads the website's current 10 news stories", () => {
  assert.equal(currentArticles.length, 10);
  assert.equal(validateArticles(currentArticles).ok, true);
});

test("reads the existing archive without evaluating JavaScript", () => {
  assert.ok(archiveGroups.length > 0);
  assert.equal(typeof archiveGroups[0].articles[0].title, "string");
});

test("a same-day correction does not alter the archive", () => {
  const prepared = prepareFiles({ currentArticles, nextArticles: currentArticles, archiveSource, archiveGroups });
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
  assert.ok(result.errors.some((error) => error.includes("local image path")));
  assert.ok(result.errors.some((error) => error.includes("foreign language | English")));
});
