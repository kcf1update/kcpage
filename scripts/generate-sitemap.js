const fs = require("fs");
const path = require("path");

const siteRoot = "https://kcf1update.ca";
const archiveSourcePath = path.resolve(
  __dirname,
  "../src/content/newsArchive.js"
);
const sitemapPath = path.resolve(
  __dirname,
  "../public/sitemap.xml"
);

const permanentPaths = [
  "/",
  "/news",
  "/racecenter",
  "/photo-gallery",
  "/previous-results",
  "/points",
  "/youtube",
  "/comments",
  "/about",
  "/press",
];

const monthNumbers = {
  January: "01",
  February: "02",
  March: "03",
  April: "04",
  May: "05",
  June: "06",
  July: "07",
  August: "08",
  September: "09",
  October: "10",
  November: "11",
  December: "12",
};

function dateLabelToSlug(dateLabel) {
  const match = String(dateLabel || "").match(
    /^([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})$/
  );

  if (!match || !monthNumbers[match[1]]) return "";

  const month = monthNumbers[match[1]];
  const day = String(Number(match[2])).padStart(2, "0");
  const year = match[3];
  const date = new Date(`${year}-${month}-${day}T00:00:00Z`);

  if (
    Number.isNaN(date.getTime()) ||
    date.getUTCFullYear() !== Number(year) ||
    date.getUTCMonth() + 1 !== Number(month) ||
    date.getUTCDate() !== Number(day)
  ) {
    return "";
  }

  return `${year}-${month}-${day}`;
}

const archiveSource = fs.readFileSync(
  archiveSourcePath,
  "utf8"
);
const datePattern =
  /dateLabel:\s*["']([A-Za-z]+\s+\d{1,2},\s+\d{4})["']/g;
const dailySlugs = new Set();

for (const match of archiveSource.matchAll(datePattern)) {
  const slug = dateLabelToSlug(match[1]);

  if (slug) dailySlugs.add(slug);
}

const urls = [
  ...permanentPaths.map((pathname) => `${siteRoot}${pathname}`),
  ...Array.from(dailySlugs)
    .sort()
    .reverse()
    .map((slug) => `${siteRoot}/news/${slug}`),
];

const sitemap = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.flatMap((url) => [
    "  <url>",
    `    <loc>${url}</loc>`,
    "  </url>",
  ]),
  "</urlset>",
  "",
].join("\n");

fs.writeFileSync(sitemapPath, sitemap, "utf8");

console.log(
  `Generated sitemap with ${urls.length} URLs, including ${dailySlugs.size} daily archive pages.`
);
