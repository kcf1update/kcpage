import {
  ARTICLE_FIELDS,
  FOREIGN_LANGUAGE_SLOTS,
  createEmptyArticles,
  parseExportedArray,
  prepareFiles,
  validateArticles,
} from "./core.mjs";

const DRAFT_KEY = "kc-daily-news-editor-v2-offline-draft";
const state = {
  articles: createEmptyArticles(),
  currentArticles: [],
  archiveGroups: [],
  archiveSource: "",
  selected: 0,
  prepared: null,
};

const elements = {
  form: document.querySelector("#article-form"),
  slotList: document.querySelector("#slot-list"),
  storyHeading: document.querySelector("#story-heading"),
  languageBadge: document.querySelector("#language-badge"),
  progressText: document.querySelector("#progress-text"),
  progressBar: document.querySelector("#progress-bar"),
  validationList: document.querySelector("#validation-list"),
  checkCount: document.querySelector("#check-count"),
  notice: document.querySelector("#notice"),
  newsStatus: document.querySelector("#news-file-status"),
  archiveStatus: document.querySelector("#archive-file-status"),
  downloadActions: document.querySelector("#download-actions"),
  previewSource: document.querySelector("#preview-source"),
  previewTitle: document.querySelector("#preview-title"),
  previewSummary: document.querySelector("#preview-summary"),
  previewQuickShift: document.querySelector("#preview-quickshift"),
};

function articleReady(article) {
  return ["sourceLabel", "title", "summary", "url", "imagePath", "photoCredit", "dateLabel"]
    .every((field) => String(article[field] || "").trim());
}

function showNotice(message, error = false) {
  elements.notice.hidden = !message;
  elements.notice.textContent = message;
  elements.notice.classList.toggle("error", error);
}

function saveDraft() {
  localStorage.setItem(DRAFT_KEY, JSON.stringify({ articles: state.articles, savedAt: new Date().toISOString() }));
}

function invalidatePreparedFiles() {
  state.prepared = null;
  elements.downloadActions.hidden = true;
}

function renderSlots() {
  elements.slotList.replaceChildren();
  state.articles.forEach((article, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `slot-button${index === state.selected ? " active" : ""}`;
    button.setAttribute("aria-label", `Edit story ${index + 1}`);

    const number = document.createElement("span");
    number.className = "slot-number";
    number.textContent = String(index + 1).padStart(2, "0");
    const name = document.createElement("span");
    name.className = "slot-name";
    name.textContent = article.sourceLabel || "Not started";
    const status = document.createElement("span");
    status.className = `slot-state${articleReady(article) ? " ready" : ""}`;
    status.textContent = articleReady(article) ? "Ready" : "—";
    button.append(number, name, status);
    button.addEventListener("click", () => selectStory(index));
    elements.slotList.append(button);
  });

  const ready = state.articles.filter(articleReady).length;
  elements.progressText.textContent = `${ready} of 10 ready`;
  elements.progressBar.style.width = `${ready * 10}%`;
}

function renderForm() {
  const article = state.articles[state.selected];
  elements.storyHeading.textContent = `Story ${state.selected + 1}`;
  const foreign = FOREIGN_LANGUAGE_SLOTS.has(state.selected + 1);
  elements.languageBadge.hidden = !foreign;
  document.querySelectorAll(".language-help").forEach((item) => { item.hidden = !foreign; });
  for (const field of ARTICLE_FIELDS) {
    const input = elements.form.elements.namedItem(field);
    if (input) input.value = article[field] || "";
  }
  document.querySelector("#previous-story").disabled = state.selected === 0;
  document.querySelector("#next-story").disabled = state.selected === 9;
  renderPreview();
}

function renderPreview() {
  const article = state.articles[state.selected];
  elements.previewSource.textContent = article.sourceLabel || "Source";
  elements.previewTitle.textContent = article.title || "Headline preview";
  elements.previewSummary.textContent = article.summary || "The story summary will appear here.";
  elements.previewQuickShift.textContent = article.kcsQuickShift || "KC’s view will appear here.";
}

function renderValidation() {
  const validation = validateArticles(state.articles);
  elements.validationList.replaceChildren();
  const messages = [
    ...validation.errors.map((text) => ({ text, className: "error-item" })),
    ...validation.warnings.map((text) => ({ text, className: "warning-item" })),
  ];
  if (!messages.length) messages.push({ text: "All article checks passed.", className: "success-item" });
  messages.slice(0, 12).forEach(({ text, className }) => {
    const item = document.createElement("li");
    item.className = className;
    item.textContent = text;
    elements.validationList.append(item);
  });
  if (messages.length > 12) {
    const item = document.createElement("li");
    item.textContent = `${messages.length - 12} more items need attention.`;
    elements.validationList.append(item);
  }
  elements.checkCount.textContent = validation.ok ? "Checks passed" : `${validation.errors.length} to fix`;
}

function renderAll() {
  renderSlots();
  renderForm();
  renderValidation();
}

function selectStory(index) {
  state.selected = Math.max(0, Math.min(9, index));
  renderAll();
}

async function readFile(file, exportName) {
  if (!file) return null;
  const source = await file.text();
  return { source, value: parseExportedArray(source, exportName) };
}

document.querySelector("#news-file").addEventListener("change", async (event) => {
  try {
    const result = await readFile(event.target.files[0], "newsSlots");
    if (!result || result.value.length !== 10) throw new Error("newsSlots.js must contain exactly 10 stories.");
    state.currentArticles = result.value;
    state.articles = result.value.map((article, index) => ({ ...article, slotId: String(index + 1) }));
    state.selected = 0;
    event.target.closest(".file-button").classList.add("loaded");
    elements.newsStatus.textContent = "Loaded safely";
    invalidatePreparedFiles();
    saveDraft();
    showNotice("Today’s 10 stories were loaded. This offline editor cannot alter the website.");
    renderAll();
  } catch (error) {
    showNotice(error.message, true);
    event.target.value = "";
  }
});

document.querySelector("#archive-file").addEventListener("change", async (event) => {
  try {
    const result = await readFile(event.target.files[0], "newsArchive");
    state.archiveSource = result.source;
    state.archiveGroups = result.value;
    event.target.closest(".file-button").classList.add("loaded");
    elements.archiveStatus.textContent = `${result.value.length} archive groups loaded`;
    invalidatePreparedFiles();
    showNotice("The archive was loaded without changing or rewriting older entries.");
    renderValidation();
  } catch (error) {
    showNotice(error.message, true);
    event.target.value = "";
  }
});

elements.form.addEventListener("input", (event) => {
  if (!event.target.name) return;
  state.articles[state.selected] = {
    ...state.articles[state.selected],
    [event.target.name]: event.target.value,
  };
  invalidatePreparedFiles();
  saveDraft();
  renderSlots();
  renderPreview();
  renderValidation();
});

document.querySelector("#copy-date").addEventListener("click", () => {
  const date = state.articles[state.selected].dateLabel.trim();
  if (!date) return showNotice("Enter a date first.", true);
  state.articles = state.articles.map((article) => ({ ...article, dateLabel: date }));
  invalidatePreparedFiles();
  saveDraft();
  showNotice(`“${date}” was copied to all 10 stories.`);
  renderAll();
});

document.querySelector("#previous-story").addEventListener("click", () => selectStory(state.selected - 1));
document.querySelector("#next-story").addEventListener("click", () => selectStory(state.selected + 1));

document.querySelector("#prepare-files").addEventListener("click", () => {
  try {
    if (state.currentArticles.length !== 10) throw new Error("Import newsSlots.js before preparing files.");
    const prepared = prepareFiles({
      currentArticles: state.currentArticles,
      nextArticles: state.articles,
      archiveSource: state.archiveSource,
      archiveGroups: state.archiveGroups,
    });
    state.prepared = prepared;
    elements.downloadActions.hidden = false;
    showNotice(prepared.archivedPreviousDay
      ? "Files prepared. The previous day was added once at the top of the archive copy. Review both downloads before using them."
      : "Files prepared. No new archive group was needed. Review the downloads before using them.");
  } catch (error) {
    showNotice(error.message, true);
    renderValidation();
  }
});

function download(filename, content) {
  const blob = new Blob([content], { type: "text/javascript;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

document.querySelector("#download-news").addEventListener("click", () => {
  if (state.prepared) download("newsSlots.js", state.prepared.newsSource);
});
document.querySelector("#download-archive").addEventListener("click", () => {
  if (state.prepared?.archiveSource) download("newsArchive.js", state.prepared.archiveSource);
});

try {
  const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
  if (Array.isArray(draft?.articles) && draft.articles.length === 10) {
    state.articles = draft.articles;
    showNotice("An unfinished browser draft was restored. Import the current website files before preparing downloads.");
  }
} catch {
  localStorage.removeItem(DRAFT_KEY);
}

renderAll();
