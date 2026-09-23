import {
  ARTICLE_FIELDS,
  FOREIGN_LANGUAGE_SLOTS,
  createEmptyArticles,
  imagePreviewUrl,
  parseExportedArray,
  prepareFiles,
  validateArticles,
} from "./core.mjs";

const DRAFT_KEY = "kc-daily-news-editor-v2-offline-draft";
const DRAFT_HISTORY_KEY = "kc-daily-news-editor-v2-offline-draft-history";
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
  quickShiftCount: document.querySelector("#quickshift-count"),
  previewImage: document.querySelector("#preview-image"),
  previewImageStatus: document.querySelector("#preview-image-status"),
  draftStatus: document.querySelector("#draft-status"),
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

function meaningfulDraft(articles) {
  return articles.some((article) => ARTICLE_FIELDS.some((field) => String(article[field] || "").trim()));
}

function draftSnapshot(reason = "autosave") {
  return { articles: state.articles, savedAt: new Date().toISOString(), reason };
}

function saveDraft(reason = "autosave") {
  const draft = draftSnapshot(reason);
  localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  elements.draftStatus.textContent = `Draft saved ${new Date(draft.savedAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}`;
}

function preserveDraft(reason) {
  if (!meaningfulDraft(state.articles)) return;
  let history = [];
  try { history = JSON.parse(localStorage.getItem(DRAFT_HISTORY_KEY) || "[]"); } catch { history = []; }
  history.unshift(draftSnapshot(reason));
  localStorage.setItem(DRAFT_HISTORY_KEY, JSON.stringify(history.slice(0, 10)));
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
  const quickShift = String(article.kcsQuickShift || "").trim();
  const wordCount = quickShift ? quickShift.split(/\s+/).length : 0;
  elements.quickShiftCount.textContent = `${wordCount} ${wordCount === 1 ? "word" : "words"} · ${quickShift.length} ${quickShift.length === 1 ? "character" : "characters"}`;
  elements.previewImage.hidden = true;
  elements.previewImage.removeAttribute("src");
  if (!article.imagePath.trim()) {
    elements.previewImageStatus.hidden = false;
    elements.previewImageStatus.textContent = "Enter a local image path to preview it.";
  } else {
    try {
      elements.previewImageStatus.hidden = false;
      elements.previewImageStatus.textContent = "Checking image path…";
      elements.previewImage.src = imagePreviewUrl(article.imagePath, window.location.href);
    } catch (error) {
      elements.previewImageStatus.textContent = error.message;
    }
  }
}

elements.previewImage.addEventListener("load", () => {
  elements.previewImage.hidden = false;
  elements.previewImageStatus.hidden = true;
});

elements.previewImage.addEventListener("error", () => {
  elements.previewImage.hidden = true;
  elements.previewImageStatus.hidden = false;
  elements.previewImageStatus.textContent = "Image not found. Check the folders, spelling, capitalization, and filename.";
});

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
    const imported = JSON.stringify(result.value.map((article, index) => ({ ...article, slotId: String(index + 1) })));
    const existing = JSON.stringify(state.articles);
    if (meaningfulDraft(state.articles) && imported !== existing && !window.confirm("Importing this file will replace the draft currently shown. A recovery copy will be kept. Continue?")) {
      event.target.value = "";
      return;
    }
    preserveDraft("before newsSlots import");
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
    preserveDraft("before preparing files");
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

document.querySelector("#download-draft").addEventListener("click", () => {
  const snapshot = draftSnapshot("manual backup");
  download(`kc-news-draft-${snapshot.savedAt.slice(0, 10)}.json`, `${JSON.stringify(snapshot, null, 2)}\n`);
  showNotice("A separate draft backup was downloaded. It does not change the website.");
});

document.querySelector("#restore-draft").addEventListener("click", () => {
  let history = [];
  try { history = JSON.parse(localStorage.getItem(DRAFT_HISTORY_KEY) || "[]"); } catch { history = []; }
  const recovery = history[0];
  if (!Array.isArray(recovery?.articles) || recovery.articles.length !== 10) {
    showNotice("There is no earlier recovery copy in this browser yet.", true);
    return;
  }
  if (!window.confirm(`Restore the recovery copy saved ${new Date(recovery.savedAt).toLocaleString()}? The current draft will also be kept.`)) return;
  preserveDraft("before restoring recovery copy");
  history = JSON.parse(localStorage.getItem(DRAFT_HISTORY_KEY) || "[]");
  const restored = history.splice(1, 1)[0] || recovery;
  state.articles = restored.articles;
  localStorage.setItem(DRAFT_HISTORY_KEY, JSON.stringify(history.slice(0, 10)));
  state.selected = 0;
  invalidatePreparedFiles();
  saveDraft("restored recovery copy");
  showNotice("The previous recovery copy was restored. Nothing on the website was changed.");
  renderAll();
});

try {
  const draft = JSON.parse(localStorage.getItem(DRAFT_KEY) || "null");
  if (Array.isArray(draft?.articles) && draft.articles.length === 10) {
    state.articles = draft.articles;
    elements.draftStatus.textContent = `Draft restored from ${new Date(draft.savedAt).toLocaleString()}`;
    showNotice("An unfinished browser draft was restored. Import the current website files before preparing downloads.");
  }
} catch {
  localStorage.removeItem(DRAFT_KEY);
}

renderAll();
