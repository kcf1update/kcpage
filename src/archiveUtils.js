const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function buildArchiveGroups(groups) {
  const articlesByDate = new Map();

  groups.forEach((group) => {
    const articles = Array.isArray(group?.articles)
      ? group.articles
      : [];

    articles.forEach((article) => {
      const dateLabel =
        article?.dateLabel ||
        group?.dateLabel ||
        "Past F1 News";

      if (!articlesByDate.has(dateLabel)) {
        articlesByDate.set(dateLabel, []);
      }

      articlesByDate.get(dateLabel).push(article);
    });
  });

  return Array.from(articlesByDate, ([dateLabel, articles]) => ({
    dateLabel,
    articles,
  })).sort((a, b) => {
    const aTime = Date.parse(a.dateLabel);
    const bTime = Date.parse(b.dateLabel);

    if (Number.isNaN(aTime) && Number.isNaN(bTime)) return 0;
    if (Number.isNaN(aTime)) return 1;
    if (Number.isNaN(bTime)) return -1;

    return bTime - aTime;
  });
}

export function dateLabelToSlug(dateLabel) {
  const match = String(dateLabel || "").match(
    /^([A-Za-z]+)\s+(\d{1,2}),\s+(\d{4})$/
  );

  if (!match) return "";

  const [, monthName, dayText, yearText] = match;
  const monthIndex = MONTH_NAMES.indexOf(monthName);
  const day = Number(dayText);
  const year = Number(yearText);

  if (monthIndex < 0 || !isValidDate(year, monthIndex, day)) {
    return "";
  }

  return [
    String(year).padStart(4, "0"),
    String(monthIndex + 1).padStart(2, "0"),
    String(day).padStart(2, "0"),
  ].join("-");
}

export function slugToDateLabel(slug) {
  const match = String(slug || "").match(
    /^(\d{4})-(\d{2})-(\d{2})$/
  );

  if (!match) return "";

  const year = Number(match[1]);
  const monthIndex = Number(match[2]) - 1;
  const day = Number(match[3]);

  if (
    monthIndex < 0 ||
    monthIndex > 11 ||
    !isValidDate(year, monthIndex, day)
  ) {
    return "";
  }

  return `${MONTH_NAMES[monthIndex]} ${day}, ${year}`;
}

export function findArchiveGroupBySlug(groups, slug) {
  const dateLabel = slugToDateLabel(slug);

  if (!dateLabel) return null;

  return (
    buildArchiveGroups(groups).find(
      (group) => group.dateLabel === dateLabel
    ) || null
  );
}

function isValidDate(year, monthIndex, day) {
  const date = new Date(Date.UTC(year, monthIndex, day));

  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === monthIndex &&
    date.getUTCDate() === day
  );
}
