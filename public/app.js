const state = {
  prompts: [],
  query: "",
  session: "",
  module: "",
  competence: "",
  sort: "session",
};

const elements = {
  search: document.querySelector("#search"),
  session: document.querySelector("#session-filter"),
  module: document.querySelector("#module-filter"),
  competence: document.querySelector("#competence-filter"),
  sort: document.querySelector("#sort-order"),
  reset: document.querySelector("#reset-filters"),
  emptyReset: document.querySelector("#empty-reset"),
  resultCount: document.querySelector("#result-count"),
  results: document.querySelector("#results"),
  loading: document.querySelector("#loading-state"),
  error: document.querySelector("#error-state"),
  empty: document.querySelector("#empty-state"),
  template: document.querySelector("#prompt-template"),
  toast: document.querySelector("#toast"),
  dataVersion: document.querySelector("#data-version"),
};

const normalize = (value = "") =>
  String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("fr")
    .replace(/[’']/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();

const formatSession = (value) =>
  value
    .replace(/_/g, " · ")
    .replace(/jour\s*(\d+)/i, "Jour $1")
    .replace(/sequence\s*(\d+)/i, "Séquence $1");

const naturalSort = new Intl.Collator("fr", { numeric: true, sensitivity: "base" });

function uniqueValues(field) {
  return [...new Set(state.prompts.flatMap((prompt) => prompt[field] || []).filter(Boolean))].sort(naturalSort.compare);
}

function populateSelect(select, values, firstLabel, formatter = (value) => value) {
  select.replaceChildren();
  const first = document.createElement("option");
  first.value = "";
  first.textContent = firstLabel;
  select.append(first);
  values.forEach((value) => {
    const option = document.createElement("option");
    option.value = value;
    option.textContent = formatter(value);
    select.append(option);
  });
}

function hydrateFilters() {
  populateSelect(elements.session, uniqueValues("session"), "Toutes les sessions", formatSession);
  populateSelect(elements.module, uniqueValues("module"), "Tous les modules");
  const competencies = uniqueValues("competence");
  if (competencies.length) {
    elements.competence.disabled = false;
    populateSelect(elements.competence, competencies, "Toutes les compétences");
  } else {
    elements.competence.disabled = true;
    populateSelect(elements.competence, [], "À renseigner dans Excel");
  }
}

function readUrlState() {
  const params = new URLSearchParams(location.search);
  state.query = params.get("q") || "";
  state.session = params.get("session") || "";
  state.module = params.get("module") || "";
  state.competence = params.get("competence") || "";
  state.sort = ["session", "source", "name"].includes(params.get("sort")) ? params.get("sort") : "session";
  elements.search.value = state.query;
  elements.session.value = state.session;
  elements.module.value = state.module;
  elements.competence.value = state.competence;
  elements.sort.value = state.sort;
}

function writeUrlState() {
  const params = new URLSearchParams();
  if (state.query) params.set("q", state.query);
  if (state.session) params.set("session", state.session);
  if (state.module) params.set("module", state.module);
  if (state.competence) params.set("competence", state.competence);
  if (state.sort !== "session") params.set("sort", state.sort);
  const next = params.size ? `${location.pathname}?${params}` : location.pathname;
  history.replaceState(null, "", next);
}

function getFilteredPrompts() {
  const terms = normalize(state.query).split(" ").filter(Boolean);
  const filtered = state.prompts.filter((prompt) => {
    if (state.session && !prompt.session.includes(state.session)) return false;
    if (state.module && !prompt.module.includes(state.module)) return false;
    if (state.competence && !prompt.competence.includes(state.competence)) return false;
    if (!terms.length) return true;
    return terms.every((term) => prompt.searchText.includes(term));
  });

  if (state.sort === "source") return filtered;

  return [...filtered].sort((left, right) => {
    if (state.sort === "name") return naturalSort.compare(left.name, right.name);
    const leftSession = left.session[0] || "\uffff";
    const rightSession = right.session[0] || "\uffff";
    return naturalSort.compare(leftSession, rightSession) || naturalSort.compare(left.name, right.name);
  });
}

function appendInlineMarkup(parent, text) {
  const chunks = text.split(/(\*\*[^*]+\*\*)/g).filter(Boolean);
  chunks.forEach((chunk) => {
    if (chunk.startsWith("**") && chunk.endsWith("**")) {
      const strong = document.createElement("strong");
      strong.textContent = chunk.slice(2, -2);
      parent.append(strong);
    } else {
      parent.append(document.createTextNode(chunk));
    }
  });
}

function renderPromptText(text, container) {
  const lines = String(text || "").replace(/\r\n/g, "\n").split("\n");
  let list = null;
  let listType = null;

  const closeList = () => {
    list = null;
    listType = null;
  };

  lines.forEach((rawLine) => {
    const line = rawLine.trimEnd();
    if (!line.trim()) {
      closeList();
      return;
    }

    const heading = line.match(/^(#{2,4})\s+(.+)/);
    if (heading) {
      closeList();
      const level = heading[1].length === 2 ? "h3" : "h4";
      const node = document.createElement(level);
      appendInlineMarkup(node, heading[2]);
      container.append(node);
      return;
    }

    const bullet = line.match(/^[-*]\s+(.+)/);
    const numbered = line.match(/^\d+[.)]\s+(.+)/);
    if (bullet || numbered) {
      const nextType = bullet ? "ul" : "ol";
      if (!list || listType !== nextType) {
        list = document.createElement(nextType);
        listType = nextType;
        container.append(list);
      }
      const item = document.createElement("li");
      appendInlineMarkup(item, (bullet || numbered)[1]);
      list.append(item);
      return;
    }

    closeList();
    const paragraph = document.createElement("p");
    appendInlineMarkup(paragraph, line);
    container.append(paragraph);
  });
}

function addChip(container, text, className = "") {
  if (!text) return;
  const chip = document.createElement("span");
  chip.className = `meta-chip ${className}`.trim();
  chip.textContent = text;
  container.append(chip);
}

function addContext(dl, label, value) {
  if (!value) return;
  const group = document.createElement("div");
  group.className = "context-group";
  const dt = document.createElement("dt");
  dt.textContent = label;
  const dd = document.createElement("dd");
  dd.textContent = value;
  group.append(dt, dd);
  dl.append(group);
}

async function copyText(text, button) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.append(area);
    area.select();
    document.execCommand("copy");
    area.remove();
  }

  const label = button.querySelector("span");
  const previous = label.textContent;
  label.textContent = "Copié";
  button.classList.add("is-copied");
  elements.toast.hidden = false;
  clearTimeout(copyText.timeout);
  copyText.timeout = setTimeout(() => {
    label.textContent = previous;
    button.classList.remove("is-copied");
    elements.toast.hidden = true;
  }, 2200);
}

function createPromptItem(prompt) {
  const fragment = elements.template.content.cloneNode(true);
  const article = fragment.querySelector(".prompt-item");
  const title = fragment.querySelector(".prompt-title");
  const description = fragment.querySelector(".prompt-description");
  const meta = fragment.querySelector(".prompt-meta");
  const copyButton = fragment.querySelector(".copy-button");
  const expandButton = fragment.querySelector(".expand-button");
  const content = fragment.querySelector(".prompt-content");
  const render = fragment.querySelector(".prompt-render");
  const context = fragment.querySelector(".prompt-context");

  const contentId = `prompt-${prompt.id}`;
  content.id = contentId;
  expandButton.setAttribute("aria-controls", contentId);
  copyButton.setAttribute("aria-label", `Copier le prompt : ${prompt.name}`);

  title.textContent = prompt.name;
  description.textContent = prompt.description || prompt.useCase || "Prompt prêt à utiliser dans votre outil IA.";

  prompt.session.slice(0, 2).forEach((value) => addChip(meta, formatSession(value), "is-session"));
  prompt.module.slice(0, 1).forEach((value) => addChip(meta, value, "is-module"));
  prompt.competence.slice(0, 2).forEach((value) => addChip(meta, value));
  addChip(meta, prompt.niveau);

  renderPromptText(prompt.prompt, render);
  addContext(context, "Cas d’usage", prompt.useCase);
  addContext(context, "Prérequis", prompt.prerequisites);
  addContext(context, "Sujets", prompt.subjects);

  copyButton.addEventListener("click", () => copyText(prompt.prompt, copyButton));
  expandButton.addEventListener("click", () => {
    const isOpen = expandButton.getAttribute("aria-expanded") === "true";
    expandButton.setAttribute("aria-expanded", String(!isOpen));
    expandButton.querySelector("span").textContent = isOpen ? "Voir le prompt" : "Masquer le prompt";
    content.hidden = isOpen;
    article.classList.toggle("is-open", !isOpen);
  });

  return fragment;
}

function renderResults() {
  const filtered = getFilteredPrompts();
  elements.results.replaceChildren(...filtered.map(createPromptItem));
  elements.empty.hidden = filtered.length !== 0;
  elements.results.hidden = filtered.length === 0;
  const label = filtered.length === 1 ? "prompt" : "prompts";
  elements.resultCount.innerHTML = `<strong>${filtered.length}</strong> ${label}`;
  elements.reset.hidden = !(state.query || state.session || state.module || state.competence);
  writeUrlState();
}

function resetFilters() {
  state.query = "";
  state.session = "";
  state.module = "";
  state.competence = "";
  elements.search.value = "";
  elements.session.value = "";
  elements.module.value = "";
  elements.competence.value = "";
  renderResults();
  elements.search.focus();
}

let renderFrame;
function scheduleRender() {
  cancelAnimationFrame(renderFrame);
  renderFrame = requestAnimationFrame(renderResults);
}

elements.search.addEventListener("input", (event) => {
  state.query = event.target.value;
  scheduleRender();
});

elements.session.addEventListener("change", (event) => {
  state.session = event.target.value;
  renderResults();
});

elements.module.addEventListener("change", (event) => {
  state.module = event.target.value;
  renderResults();
});

elements.competence.addEventListener("change", (event) => {
  state.competence = event.target.value;
  renderResults();
});

elements.sort.addEventListener("change", (event) => {
  state.sort = event.target.value;
  renderResults();
});

elements.reset.addEventListener("click", resetFilters);
elements.emptyReset.addEventListener("click", resetFilters);

document.addEventListener("keydown", (event) => {
  if (event.key === "/" && document.activeElement !== elements.search) {
    event.preventDefault();
    elements.search.focus();
  }
  if (event.key === "Escape" && document.activeElement === elements.search && elements.search.value) {
    state.query = "";
    elements.search.value = "";
    renderResults();
  }
  if (event.key === "Enter" && document.activeElement === elements.search) {
    const first = elements.results.querySelector(".expand-button");
    if (first) first.click();
  }
});

async function init() {
  try {
    const response = await fetch("./prompts.json", { cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    state.prompts = data.prompts.map((prompt) => ({
      ...prompt,
      session: prompt.session || [],
      module: prompt.module || [],
      competence: prompt.competence || [],
      searchText: normalize([
        prompt.name,
        prompt.prompt,
        prompt.description,
        prompt.useCase,
        prompt.subjects,
        prompt.objectives,
        prompt.niveau,
        ...(prompt.session || []),
        ...(prompt.module || []),
        ...(prompt.competence || []),
      ].filter(Boolean).join(" ")),
    }));
    hydrateFilters();
    readUrlState();
    elements.loading.hidden = true;
    const generated = data.generatedAt ? new Date(data.generatedAt) : null;
    elements.dataVersion.textContent = generated && !Number.isNaN(generated.valueOf())
      ? `Données générées le ${generated.toLocaleDateString("fr-FR")}`
      : "Source Excel";
    renderResults();
  } catch (error) {
    console.error(error);
    elements.loading.hidden = true;
    elements.error.hidden = false;
    elements.resultCount.textContent = "Bibliothèque indisponible";
  }
}

init();