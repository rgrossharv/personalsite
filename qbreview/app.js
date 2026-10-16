import {
  AUTHORS,
  CLUE_CARDS,
  NATIONS,
  MATH_TOPICS,
  DIFFICULTIES,
  SUBCATEGORY,
} from "./data.js";
import {
  STORAGE_KEY,
  DAY,
  freshState,
  validateState,
  escapeHTML as esc,
  normalize,
  normalizeTossup,
  matches,
  gradeRecord,
  pickCard,
  aggregate,
} from "./core.js";

const $ = (id) => document.getElementById(id);
const all = (selector) => [...document.querySelectorAll(selector)];
let state = freshState();
let storageProblem = "";
try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) state = validateState(JSON.parse(saved));
} catch (_) {
  storageProblem =
    "Saved data could not be read. Export a backup before closing this page.";
}

let view = "practice",
  current = null,
  revealed = false,
  busy = false,
  transition = false;
let loadId = 0,
  apiController = null,
  readerTimer = null,
  wordPosition = 0,
  readerStarted = false;
let remoteCards = [],
  skipped = new Set(),
  undo = null,
  session = [],
  librarySubject = "literature",
  progressSubject = "literature";
let importCandidate = null,
  toastTimer = null,
  pendingSettings = null;
const isMobile = () => matchMedia("(max-width: 760px)").matches;
const option = (value, label) =>
  `<option value="${esc(value)}">${esc(label)}</option>`;
const icon = (name) => `<svg aria-hidden="true"><use href="#i-${name}"/></svg>`;
const accuracy = (stats) =>
  stats.accuracy === null ? "Unpracticed" : `${stats.accuracy}% recall`;
const allCards = () => [
  ...CLUE_CARDS,
  ...new Map(
    [...remoteCards, ...Object.values(state.savedCards)].map((card) => [
      card.id,
      card,
    ]),
  ).values(),
];

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    storageProblem = "";
  } catch (_) {
    storageProblem = "Progress is in memory only. Export a backup to keep it.";
  }
  $("storage-status").innerHTML =
    `<span class="status-dot"></span>${esc(storageProblem || "Progress saved on this device")}`;
}
function toast(message) {
  clearTimeout(toastTimer);
  $("toast").textContent = message;
  $("toast").hidden = false;
  toastTimer = setTimeout(() => ($("toast").hidden = true), 4000);
}
function notice(message = "") {
  $("practice-notice").innerHTML = message;
  $("practice-notice").hidden = !message;
}
function plainText(html) {
  const template = document.createElement("template");
  template.innerHTML = html;
  return template.content.textContent || "";
}
function availableAuthors() {
  return AUTHORS.filter(
    (author) =>
      (!state.settings.group ||
        SUBCATEGORY[author.nation] === state.settings.group) &&
      (!state.settings.nation || author.nation === state.settings.nation),
  );
}

function renderSettings() {
  const s = state.settings;
  for (const key of ["subject", "source"])
    all(`[data-${key}]`).forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset[key] === s[key]),
      ),
    );
  $("group-select").value = s.group;
  $("nation-select").innerHTML =
    option("", "All literatures") +
    NATIONS.filter((nation) => !s.group || SUBCATEGORY[nation] === s.group)
      .map((nation) => option(nation, nation))
      .join("");
  $("nation-select").value = s.nation;
  $("author-select").innerHTML =
    option("", "All authors") +
    availableAuthors()
      .map((author) => option(author.id, author.name))
      .join("");
  $("author-select").value = s.author;
  $("literature-filters").hidden = s.subject !== "literature";
  $("math-filters").hidden = s.subject !== "math";
  $("math-select").value = s.mathTopic;
  $("math-note").hidden = s.source !== "tossups";
  $("difficulty-field").hidden = s.source === "clues";
  $("speed-field").hidden = s.source === "clues";
  $("difficulty-select").value = s.difficulty;
  $("queue-select").value = s.queue;
  $("speed-range").value = s.speed;
  $("speed-value").textContent = `${s.speed} wpm`;
  $("queue-note").textContent = {
    smart: "Due cards first, then new material. More time on weaker authors.",
    random:
      "All matching cards, including future reviews. Great for an unrestricted session.",
    due: "Only previously missed or learned cards whose next review is due.",
  }[s.queue];
  const author =
    s.subject === "literature"
      ? AUTHORS.find((item) => item.id === s.author)
      : null;
  const focus =
    s.subject === "math"
      ? MATH_TOPICS.find((item) => item.id === s.mathTopic)?.name ||
        "All mathematics"
      : author?.name || s.nation || s.group || "General literature";
  $("deck-label").textContent =
    `${s.subject === "math" ? "MATHEMATICS" : "LITERATURE"} · ${focus.toUpperCase()}`;
  $("source-status").textContent =
    s.source === "clues"
      ? "Built-in deck · works offline"
      : "Questions from QB Reader";
  $("focus-title").textContent = author
    ? `A closer look at ${author.name.split(" ").at(-1)}.`
    : s.subject === "math"
      ? "Make the connections."
      : "Follow your curiosity.";
  $("focus-copy").textContent = author
    ? `Connect ${author.works.map((work) => work.title).join(" and ")} with the characters, settings, and clues that identify them.`
    : s.subject === "math"
      ? "Recognize the names, then explain the ideas. Explore concepts by topic in the library."
      : "Pick a literature or an author to connect the works, characters, and clues.";
  $("focus-button").innerHTML = author
    ? `Open author notes <span>↗</span>`
    : "Explore the library <span>↗</span>";
}

function changeSettings(update) {
  if (transition) {
    pendingSettings = { ...pendingSettings, ...update };
    return;
  }
  Object.assign(state.settings, update);
  const s = state.settings;
  if (update.group !== undefined) {
    if (update.nation === undefined) s.nation = "";
    if (update.author === undefined) s.author = "";
  }
  if (update.nation !== undefined && update.author === undefined) s.author = "";
  skipped = new Set();
  undo = null;
  save();
  renderSettings();
  renderMetrics();
  loadNext();
}

function setView(next) {
  view = next;
  for (const name of ["practice", "library", "progress"])
    $(`${name}-view`).hidden = name !== next;
  all("[data-view]").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === next);
    if (button.dataset.view === next)
      button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  });
  if (next !== "practice") stopReader();
  if (next === "library") renderLibrary();
  if (next === "progress") renderProgress();
  closeFilters();
  window.scrollTo({ top: 0, behavior: "instant" });
}

function renderMetrics() {
  const today = new Date().toLocaleDateString("en-CA");
  const count = state.history.filter(
    (event) => new Date(event.time).toLocaleDateString("en-CA") === today,
  ).length;
  $("today-count").textContent = count;
  $("goal-fill").style.width = `${Math.min(100, count * 5)}%`;
  $("goal-copy").textContent =
    count >= 20
      ? "Daily goal reached. Every extra clue is a bonus."
      : `${20 - count} more to your daily 20. One clue at a time.`;
  $("session-accuracy").textContent = session.length
    ? `${Math.round((session.filter((event) => event.known).length / session.length) * 100)}%`
    : "—";
  $("due-count").textContent = Object.values(state.records).filter(
    (record) => record.due <= Date.now(),
  ).length;
  $("session-counter").textContent = `${session.length} reviewed`;
  $("undo-button").disabled = !undo || transition;
  $("gesture-hint").textContent = isMobile()
    ? revealed
      ? "Swipe left to revisit · right if you knew it"
      : "Reveal first, then swipe to rate"
    : "Space to reveal · ← still learning · → knew it";
  if (storageProblem) $("storage-status").textContent = storageProblem;
}

const topicQueries = {
  calculus: "derivative|integral|calculus|Taylor|differential|Leibniz|Newton",
  algebra:
    "algebra|group|prime|Galois|Fermat|modulo|modular|ring|field|Diophantine",
  linear: "matrix|matrices|eigen|vector|linear|determinant|rank|nullity",
  geometry: "geometr|topolog|triangle|polygon|polyhedr|surface|manifold|Möbius",
  probability:
    "probabil|statistic|distribution|Bayes|random|variance|Bernoulli|Poisson",
  discrete:
    "graph|combinator|pigeonhole|discrete|countab|inclusion.exclusion|Hamiltonian|Eulerian",
};

async function fetchTossups() {
  const s = { ...state.settings };
  const params = new URLSearchParams();
  params.set(
    "categories",
    s.subject === "literature" ? "Literature" : "Science",
  );
  if (DIFFICULTIES[s.difficulty].values)
    params.set("difficulties", DIFFICULTIES[s.difficulty].values);
  let query = "";
  if (s.subject === "math") {
    params.set("subcategories", "Other Science");
    params.set("alternateSubcategories", "Math");
    if (s.mathTopic) query = topicQueries[s.mathTopic];
  } else {
    if (s.group || s.nation)
      params.set("subcategories", s.group || SUBCATEGORY[s.nation]);
    const authors = s.author
      ? AUTHORS.filter((author) => author.id === s.author)
      : s.nation
        ? AUTHORS.filter((author) => author.nation === s.nation)
        : [];
    if (authors.length)
      query = authors
        .flatMap((author) => author.aliases)
        .map((alias) => alias.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join("|");
  }
  let endpoint = "random-tossup";
  if (query) {
    endpoint = "query";
    params.set("q", query);
    params.set("regex", "true");
    params.set("searchType", "all");
    params.set("questionType", "tossup");
    params.set("randomize", "true");
    params.set("maxReturnLength", "40");
  } else {
    params.set("number", "16");
    params.set("standardOnly", "true");
  }
  const controller = new AbortController();
  apiController = controller;
  const timeout = setTimeout(() => controller.abort(), 14000);
  let response;
  try {
    response = await fetch(
      `https://www.qbreader.org/api/${endpoint}?${params}`,
      { signal: controller.signal },
    );
    if (!response.ok)
      throw new Error(
        response.status === 429
          ? "QB Reader is busy. Please try again in a moment."
          : "QB Reader could not return questions.",
      );
    const json = await response.json();
    const raw =
      endpoint === "query" ? json.tossups?.questionArray : json.tossups;
    if (!Array.isArray(raw))
      throw new Error("QB Reader returned an unexpected response.");
    return raw
      .map((item) => normalizeTossup(item, plainText))
      .filter(Boolean)
      .map((card) => {
        // Restore manual author tags when this question is fetched again.
        const saved = state.savedCards[card.id];
        if (saved?.authorId) {
          card.authorId = saved.authorId;
          card.nation = saved.nation;
        }
        if (s.subject === "math" && s.mathTopic) card.topicId = s.mathTopic;
        return card;
      })
      .filter((card) => matches(card, s));
  } catch (error) {
    if (error.name === "AbortError")
      throw new Error(
        "The connection to QB Reader timed out. Try again, or use the offline clue deck.",
      );
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function setLoading() {
  busy = true;
  current = null;
  revealed = false;
  $("card-body").innerHTML =
    '<div class="loading-state"><span class="loading-mark">q</span><p>Finding your next question…</p></div>';
  $("card-type").textContent =
    state.settings.source === "clues" ? "CLUE CARD" : "TOSSUP";
  $("card-source").textContent = "";
  $("reader-controls").hidden = true;
  $("answer-actions").hidden = false;
  $("rating-actions").hidden = true;
  $("reveal-button").disabled = true;
  $("skip-button").disabled = true;
}

async function loadNext() {
  const token = ++loadId;
  const previousCardId = current?.id;
  apiController?.abort();
  stopReader();
  readerStarted = false;
  wordPosition = 0;
  notice();
  setLoading();
  renderMetrics();
  let cards = allCards();
  let card = pickCard(cards, state, { exclude: skipped });
  if (!card && state.settings.queue === "random") {
    const eligible = cards.filter((item) => matches(item, state.settings));
    if (eligible.length) {
      skipped.clear();
      if (eligible.length > 1 && previousCardId) skipped.add(previousCardId);
      card = pickCard(cards, state, { exclude: skipped });
    }
  }
  if (
    !card &&
    state.settings.source === "tossups" &&
    state.settings.queue !== "due"
  ) {
    try {
      const fetched = await fetchTossups();
      if (token !== loadId) return;
      remoteCards = [
        ...new Map(
          [...remoteCards, ...fetched].map((item) => [item.id, item]),
        ).values(),
      ].slice(-200);
      cards = allCards();
      card = pickCard(cards, state, { exclude: skipped });
      if (!card && !fetched.length)
        notice(
          "No questions matched this combination. Try a broader focus or another difficulty. National-literature tossups are narrowed using authors in the built-in catalog.",
        );
    } catch (error) {
      if (token !== loadId) return;
      $("source-status").textContent = "QB Reader unavailable";
      notice(
        `${esc(error.message)} <button type="button" data-action="retry">Retry</button> · <button type="button" data-action="offline">Use clue cards</button>`,
      );
    }
  }
  if (token !== loadId) return;
  busy = false;
  if (card) {
    current = card;
    renderCard();
  } else renderEmpty();
}

function renderEmpty() {
  const s = state.settings;
  const eligible = allCards().filter((card) => matches(card, s));
  const scheduled = eligible
    .map((card) => state.records[card.id]?.due)
    .filter((value) => value > Date.now());
  const next = scheduled.length ? Math.min(...scheduled) : null;
  const nextCopy = next
    ? ` Your next matching review is due ${formatDue(next)}.`
    : "";
  const title = s.queue === "due" ? "All caught up." : "A good place to pause.";
  const copy =
    s.queue === "due"
      ? `No matching reviews are due right now.${nextCopy} Try smart review for new material.`
      : `There are no unseen cards ready in this focus.${nextCopy} Random practice lets you keep going.`;
  $("card-body").innerHTML =
    `<div class="empty-state"><h2>${title}</h2><p>${esc(copy)}</p>${s.queue !== "random" ? '<button type="button" class="primary-button" data-action="random">Practice at random</button>' : ""}<button type="button" class="quiet-button" data-action="broaden">Broaden focus</button>${s.queue === "due" ? '<button type="button" class="quiet-button" data-action="smart">Find new material</button>' : '<button type="button" class="quiet-button" data-action="retry">Try again</button>'}</div>`;
  $("answer-actions").hidden = true;
  $("rating-actions").hidden = true;
  $("reader-controls").hidden = true;
  $("card-source").textContent = "";
  $("skip-button").disabled = true;
}

function formatDue(time) {
  const delta = time - Date.now();
  if (delta <= 0) return "now";
  if (delta < 3600000)
    return `in ${Math.max(1, Math.round(delta / 60000))} minutes`;
  if (delta < DAY) return `in ${Math.round(delta / 3600000)} hours`;
  return `in ${Math.round(delta / DAY)} days`;
}

function formattedQuestion() {
  if (!current) return "";
  if (!readerStarted)
    return esc(current.question).replace(
      /\(\*\)/g,
      '<span class="power-mark">(★)</span>',
    );
  const words = current.question.split(/\s+/);
  return words
    .map((word, index) =>
      index < wordPosition
        ? esc(word)
        : '<span class="unread" aria-hidden="true">&nbsp;·&nbsp;</span>',
    )
    .join(" ");
}

function renderCard() {
  if (!current) return;
  $("study-card").classList.remove("depart-left", "depart-right");
  $("card-index").textContent = String(session.length + 1).padStart(2, "0");
  const remote = current.id.startsWith("qb:");
  $("card-type").textContent = remote
    ? `TOSSUP${current.difficulty ? ` · LEVEL ${current.difficulty}` : ""}`
    : `${current.subject === "math" ? "MATH" : current.topic.toUpperCase()} · CLUE CARD`;
  $("card-body").innerHTML =
    `<div class="question-text ${remote ? "" : "clue-question"}" id="question-text">${formattedQuestion()}</div>${revealed ? answerHTML() : ""}`;
  $("card-source").innerHTML = remote
    ? `<span>${esc(current.set)}${current.packet ? ` · Packet ${esc(current.packet)}` : ""}${current.number ? ` · Q${esc(current.number)}` : ""}</span><a class="source-link" href="https://www.qbreader.org/db/tossup?id=${encodeURIComponent(current.qbId)}" target="_blank" rel="noopener noreferrer">QB Reader ↗</a>`
    : "<span>QB Review originals · Recognition practice</span>";
  $("reader-controls").hidden = !remote || revealed;
  $("read-all-button").hidden = !readerStarted;
  $("read-button").textContent = readerTimer
    ? "Ⅱ Pause"
    : readerStarted
      ? "▶ Continue reading"
      : "▶ Read gradually";
  $("reading-position").textContent = readerStarted
    ? `${Math.round((wordPosition / current.question.split(/\s+/).length) * 100)}% read`
    : "";
  $("answer-actions").hidden = revealed;
  $("rating-actions").hidden = !revealed;
  $("reveal-button").disabled = false;
  $("skip-button").disabled = false;
  const next = gradeRecord(state.records[current.id], true);
  $("known-interval").textContent = `Review ${formatDue(next.due)}`;
  if (next.interval === 1) $("known-interval").textContent = "Review tomorrow";
  renderMetrics();
}

function answerHTML() {
  const author = AUTHORS.find((item) => item.id === current.authorId);
  const tracking =
    current.subject === "literature"
      ? `<div class="answer-meta">Track under ${author ? `<button type="button" class="author-link" data-author-detail="${author.id}">${esc(author.name)}</button> · ${esc(author.nation)}` : "an author (optional)"}${current.id.startsWith("qb:") ? `<select id="card-author-select" aria-label="Assign this question to an author">${option("", "No author assigned")}${AUTHORS.map((item) => option(item.id, item.name)).join("")}</select>` : ""}</div>`
      : "";
  // The optional tag selector is set after insertion rather than interpolating HTML from the API.
  queueMicrotask(() => {
    if ($("card-author-select"))
      $("card-author-select").value = current?.authorId || "";
  });
  return `<div class="answer-block"><p class="answer-label">THE ANSWER</p><p class="answer-title">${esc(current.answer)}</p>${current.explanation ? `<p class="answer-explanation">${esc(current.explanation)}</p>` : ""}${tracking}</div>`;
}

function reveal() {
  if (!current || revealed || busy || transition) return;
  stopReader();
  revealed = true;
  // Freeze the reader before revealing the answer and remaining question text.
  if (readerStarted && wordPosition < current.question.split(/\s+/).length) {
    const words = current.question.split(/\s+/);
    current.buzzPosition = wordPosition / words.length;
  }
  readerStarted = false;
  renderCard();
  if (isMobile())
    setTimeout(
      () =>
        document.querySelector(".answer-block")?.scrollIntoView({
          behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "instant"
            : "smooth",
          block: "nearest",
        }),
      50,
    );
}

function stopReader() {
  clearInterval(readerTimer);
  readerTimer = null;
}
function startReader() {
  if (!current || revealed || busy) return;
  if (readerTimer) {
    stopReader();
    renderCard();
    return;
  }
  if (!readerStarted) {
    readerStarted = true;
    wordPosition = 0;
  }
  const total = current.question.split(/\s+/).length;
  if (wordPosition >= total) wordPosition = 0;
  readerTimer = setInterval(() => {
    if (!current || revealed || view !== "practice") {
      stopReader();
      return;
    }
    wordPosition = Math.min(total, wordPosition + 1);
    $("question-text").innerHTML = formattedQuestion();
    $("reading-position").textContent =
      `${Math.round((wordPosition / total) * 100)}% read`;
    if (wordPosition >= total) {
      stopReader();
      $("read-button").textContent = "▶ Read again";
    }
  }, 60000 / state.settings.speed);
  renderCard();
}

async function grade(known) {
  if (!current || !revealed || busy || transition) return;
  transition = true;
  const card = { ...current };
  delete card.buzzPosition;
  undo = {
    card,
    previous: state.records[card.id] ? { ...state.records[card.id] } : null,
    historyLength: state.history.length,
  };
  const record = gradeRecord(state.records[card.id], known);
  state.records[card.id] = record;
  if (card.id.startsWith("qb:")) state.savedCards[card.id] = card;
  const event = { id: card.id, known, time: record.last };
  state.history.push(event);
  session.push(event);
  if (state.history.length > 3000) {
    undo.removedEvent = state.history.shift();
    undo.historyLength--;
  }
  skipped.add(card.id);
  save();
  renderMetrics();
  $("study-card").classList.add(known ? "depart-right" : "depart-left");
  await new Promise((resolve) =>
    setTimeout(
      resolve,
      matchMedia("(prefers-reduced-motion: reduce)").matches ? 0 : 180,
    ),
  );
  transition = false;
  $("study-card").classList.remove("depart-left", "depart-right");
  if (pendingSettings) {
    const update = pendingSettings;
    pendingSettings = null;
    changeSettings(update);
  } else await loadNext();
  if (isMobile())
    $("practice-view").scrollIntoView({ behavior: "instant", block: "start" });
}

function undoGrade() {
  if (!undo || transition) return;
  ++loadId;
  apiController?.abort();
  stopReader();
  const previous = undo;
  undo = null;
  if (previous.previous) state.records[previous.card.id] = previous.previous;
  else delete state.records[previous.card.id];
  state.history.length = previous.historyLength;
  if (previous.removedEvent) state.history.unshift(previous.removedEvent);
  session.pop();
  skipped.delete(previous.card.id);
  current = previous.card;
  revealed = true;
  busy = false;
  readerStarted = false;
  save();
  notice();
  renderCard();
  toast("Last review undone.");
}

function practiceFocus({
  author = "",
  nation = "",
  topic = "",
  subject = "literature",
  source = "clues",
  group = "",
} = {}) {
  setView("practice");
  changeSettings({
    subject,
    source,
    author,
    nation,
    group,
    mathTopic: topic,
    queue: "smart",
  });
}

function renderLibrary() {
  all("[data-library-subject]").forEach((button) =>
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.librarySubject === librarySubject),
    ),
  );
  $("library-nation").hidden = librarySubject !== "literature";
  $("library-search").placeholder =
    librarySubject === "literature"
      ? "Find an author, work, or literature…"
      : "Find a concept or topic…";
  const term = normalize($("library-search").value);
  const cards = allCards();
  if (librarySubject === "literature") {
    const nation = $("library-nation").value;
    const authors = AUTHORS.filter(
      (author) =>
        (!nation || author.nation === nation) &&
        normalize(
          `${author.name} ${author.nation} ${author.works.map((work) => work.title).join(" ")}`,
        ).includes(term),
    );
    $("library-overview").innerHTML =
      `<div class="library-summary"><span><strong>${authors.length}</strong> authors · ${NATIONS.length} literatures in the catalog</span>${nation ? `<button type="button" class="nation-chip" data-practice-nation="${esc(nation)}">Practice ${esc(nation)} literature ↗</button>` : ["American", "British", "Russian", "Japanese"].map((name) => `<button type="button" class="nation-chip" data-library-nation="${name}">${name}</button>`).join("")}</div>`;
    $("library-grid").innerHTML =
      authors
        .map((author) => {
          const stats = aggregate(
            cards.filter((card) => card.authorId === author.id),
            state.records,
          );
          return `<article class="author-tile"><div class="tile-topline"><span>${esc(author.nation.toUpperCase())} LITERATURE</span><span class="tile-status">${esc(accuracy(stats))}</span></div><h2><button type="button" data-author-detail="${author.id}">${esc(author.name)}</button></h2><p class="tile-works">${author.works.map((work) => esc(work.title)).join("<br>")}</p><div class="tile-footer"><span>${stats.seen} cards reviewed</span><button type="button" data-practice-author="${author.id}">Study author ↗</button></div></article>`;
        })
        .join("") ||
      '<div class="empty-state"><h2>No matches yet.</h2><p>Try another name, work, or literature.</p></div>';
  } else {
    const topics = MATH_TOPICS.filter((topic) =>
      normalize(`${topic.name} ${topic.entries.flat().join(" ")}`).includes(
        term,
      ),
    );
    $("library-overview").innerHTML =
      `<div class="library-summary"><span><strong>${MATH_TOPICS.reduce((sum, topic) => sum + topic.entries.length, 0)}</strong> concept cards · ${MATH_TOPICS.length} topics</span></div>`;
    $("library-grid").innerHTML =
      topics
        .map((topic) => {
          const stats = aggregate(
            cards.filter((card) => card.topicId === topic.id),
            state.records,
          );
          return `<article class="author-tile"><div class="tile-topline"><span>MATHEMATICS</span><span class="tile-status">${esc(accuracy(stats))}</span></div><h2><button type="button" data-topic-detail="${topic.id}">${esc(topic.name)}</button></h2><p class="tile-works">${topic.entries
            .slice(0, 3)
            .map(([name]) => esc(name))
            .join(
              "<br>",
            )}</p><div class="tile-footer"><span>${stats.seen} cards reviewed</span><button type="button" data-practice-topic="${topic.id}">Study topic ↗</button></div></article>`;
        })
        .join("") ||
      '<p class="filter-note">No matching topics. Try another concept.</p>';
  }
}

function openDetail(id, math = false) {
  const item = (math ? MATH_TOPICS : AUTHORS).find(
    (candidate) => candidate.id === id,
  );
  if (!item) return;
  const stats = aggregate(
    allCards().filter((card) =>
      math ? card.topicId === id : card.authorId === id,
    ),
    state.records,
  );
  const works = math
    ? item.entries.map(([title, clue]) => ({ title, clue }))
    : item.works;
  const noteId = math ? `math:${id}` : id;
  $("author-detail").innerHTML =
    `<div class="dialog-topline"><p class="eyebrow">${math ? "MATHEMATICS" : `${esc(item.nation.toUpperCase())} LITERATURE`}</p><button type="button" class="icon-button" data-action="close-detail" aria-label="Close notes">${icon("close")}</button></div><h2>${esc(item.name)}</h2><p class="dialog-summary">${esc(accuracy(stats))} · ${stats.seen} cards seen · ${stats.mastered} mastered</p>${works.map((work) => `<div class="work-note"><h3>${esc(work.title)}</h3><p>${esc(work.clue)}</p></div>`).join("")}<label class="notes-label" for="author-notes">Your connections & notes</label><textarea id="author-notes" class="notes-area" data-note-id="${noteId}" placeholder="Clues you missed, a character to remember, a connection…">${esc(state.notes[noteId] || "")}</textarea><p class="notes-tip">Saved automatically in this browser and included in backups.</p><div class="dialog-actions"><button type="button" class="primary-button" ${math ? `data-practice-topic="${id}"` : `data-practice-author="${id}"`}>Practice clue cards ${icon("arrow")}</button><button type="button" class="quiet-button" ${math ? `data-tossup-topic="${id}"` : `data-tossup-author="${id}"`}>Practice tournament tossups</button></div>`;
  if (!$("author-dialog").open) $("author-dialog").showModal();
}

function entityStats() {
  const cards = allCards();
  return [
    ...AUTHORS.map((author) => ({
      ...author,
      kind: "author",
      stats: aggregate(
        cards.filter((card) => card.authorId === author.id),
        state.records,
      ),
    })),
    ...MATH_TOPICS.map((topic) => ({
      ...topic,
      kind: "topic",
      stats: aggregate(
        cards.filter((card) => card.topicId === topic.id),
        state.records,
      ),
    })),
  ];
}

function renderProgress() {
  const cards = allCards();
  const records = Object.values(state.records);
  const totalAttempts = records.reduce(
    (sum, record) => sum + record.attempts,
    0,
  );
  const totalCorrect = records.reduce((sum, record) => sum + record.correct, 0);
  const mastered = records.filter((record) => record.streak >= 3).length;
  const due = records.filter((record) => record.due <= Date.now()).length;
  $("progress-stats").innerHTML = [
    [totalAttempts, "Total reviews"],
    [
      totalAttempts
        ? `${Math.round((totalCorrect / totalAttempts) * 100)}%`
        : "—",
      "Recall accuracy",
    ],
    [mastered, "Cards mastered"],
    [due, "Cards due now"],
  ]
    .map(
      ([value, label]) =>
        `<div class="stat-box"><strong>${value}</strong><span>${label}</span></div>`,
    )
    .join("");
  const nations = NATIONS.map((nation) => ({
    nation,
    stats: aggregate(
      cards.filter((card) => card.nation === nation),
      state.records,
    ),
  }))
    .filter((item) => item.stats.attempts)
    .sort((a, b) => b.stats.attempts - a.stats.attempts);
  $("nation-progress").innerHTML = nations.length
    ? nations
        .map(
          ({ nation, stats }) =>
            `<div class="progress-row"><div><button type="button" data-practice-nation="${esc(nation)}">${esc(nation)}</button><span>${stats.accuracy}% · ${stats.attempts} reviews</span></div><div class="progress-track"><span style="width:${stats.accuracy}%"></span></div></div>`,
        )
        .join("")
    : '<p class="filter-note">Your literature map starts with the first review. Authors are grouped by the catalog’s study tradition; some wrote across languages and countries.</p>';
  const entities = entityStats();
  const weakest = entities
    .filter((item) => item.stats.attempts)
    .sort(
      (a, b) =>
        a.stats.accuracy - b.stats.accuracy || b.stats.due - a.stats.due,
    )
    .slice(0, 5);
  $("weak-progress").innerHTML = weakest.length
    ? weakest
        .map(
          (item) =>
            `<div class="weak-row"><div><strong>${esc(item.name)}</strong><small>${item.stats.accuracy}% recall · ${item.stats.due} due · ${item.stats.attempts} reviews</small></div><button type="button" data-practice-${item.kind}="${item.id}">Practice ↗</button></div>`,
        )
        .join("")
    : '<p class="filter-note">After a few reviews, your weaker authors and math topics will appear here. Smart review will give them more attention.</p>';
  const rows = entities
    .filter(
      (item) =>
        item.kind === (progressSubject === "math" ? "topic" : "author") &&
        item.stats.attempts,
    )
    .sort((a, b) => b.stats.attempts - a.stats.attempts);
  $("progress-table").innerHTML = rows.length
    ? rows
        .map(
          (item) =>
            `<tr><td>${esc(item.name)}<span>${esc(item.nation || "Mathematics")}</span></td><td>${item.stats.attempts}</td><td>${item.stats.accuracy}%</td><td>${item.stats.mastered}</td><td><button type="button" data-practice-${item.kind}="${item.id}">Practice ↗</button></td></tr>`,
        )
        .join("")
    : '<tr><td colspan="5">No reviews in this subject yet. Your first card is a good start.</td></tr>';
  all("[data-progress-subject]").forEach((button) =>
    button.setAttribute(
      "aria-pressed",
      String(button.dataset.progressSubject === progressSubject),
    ),
  );
}

function reviewDue() {
  const dueCard = allCards()
    .filter((card) => state.records[card.id]?.due <= Date.now())
    .sort((a, b) => state.records[a.id].due - state.records[b.id].due)[0];
  if (!dueCard) {
    toast("No cards are due yet. Keep exploring new material.");
    return;
  }
  setView("practice");
  changeSettings({
    subject: dueCard.subject,
    source: dueCard.id.startsWith("qb:") ? "tossups" : "clues",
    group: "",
    nation: "",
    author: "",
    mathTopic: "",
    difficulty: "all",
    queue: "due",
  });
}

function exportBackup() {
  const data = JSON.stringify(
    { ...state, exportedAt: new Date().toISOString() },
    null,
    2,
  );
  const url = URL.createObjectURL(
    new Blob([data], { type: "application/json" }),
  );
  const link = document.createElement("a");
  link.href = url;
  link.download = `qbreview-${new Date().toISOString().slice(0, 10)}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  toast(
    "Backup exported. Import it on your other device to transfer progress.",
  );
}

async function readImport(file) {
  if (!file) return;
  try {
    if (file.size > 20 * 1024 * 1024)
      throw new Error(
        "This file is too large. Choose a QB Review JSON backup under 20 MB.",
      );
    importCandidate = validateState(JSON.parse(await file.text()));
    const reviews = Object.values(importCandidate.records).reduce(
      (sum, record) => sum + record.attempts,
      0,
    );
    $("import-description").textContent =
      `This backup contains ${Object.keys(importCandidate.records).length} studied cards and ${reviews} reviews.`;
    $("import-dialog").showModal();
  } catch (error) {
    toast(
      error instanceof SyntaxError
        ? "This file is not valid JSON. Choose a QB Review backup."
        : error.message,
    );
  }
  $("import-file").value = "";
}

function applyImport(replace) {
  if (!importCandidate) return;
  if (replace) state = importCandidate;
  else {
    const incoming = importCandidate;
    const eventKey = (event) => `${event.id}|${event.time}|${event.known}`;
    const oldKeys = new Set(state.history.map(eventKey));
    const overlaps = {};
    for (const event of incoming.history)
      if (oldKeys.has(eventKey(event))) {
        overlaps[event.id] ||= { total: 0, correct: 0 };
        overlaps[event.id].total++;
        overlaps[event.id].correct += Number(event.known);
      }
    for (const [id, record] of Object.entries(incoming.records)) {
      const previous = state.records[id];
      if (!previous) {
        state.records[id] = record;
        continue;
      }
      if (JSON.stringify(previous) === JSON.stringify(record)) continue;
      const shared = overlaps[id] || { total: 0, correct: 0 };
      const latest = record.last > previous.last ? record : previous;
      state.records[id] = {
        ...latest,
        attempts: previous.attempts + record.attempts - shared.total,
        correct: previous.correct + record.correct - shared.correct,
        lapses:
          previous.lapses + record.lapses - (shared.total - shared.correct),
      };
    }
    state.history = [
      ...new Map(
        [...state.history, ...incoming.history].map((event) => [
          eventKey(event),
          event,
        ]),
      ).values(),
    ]
      .sort((a, b) => a.time - b.time)
      .slice(-3000);
    state.savedCards = { ...incoming.savedCards, ...state.savedCards };
    for (const [id, note] of Object.entries(incoming.notes)) {
      if (!state.notes[id]) state.notes[id] = note;
      else if (note && !state.notes[id].includes(note))
        state.notes[id] += `\n\n${note}`;
    }
  }
  importCandidate = null;
  $("import-dialog").close();
  skipped = new Set();
  undo = null;
  session = [];
  save();
  renderSettings();
  renderMetrics();
  renderProgress();
  loadNext();
  toast("Progress imported and saved in this browser.");
}

function closeFilters() {
  $("filters").classList.remove("open");
  $("filter-button").setAttribute("aria-expanded", "false");
}

// Pointer gestures preserve vertical scrolling. A rating requires an explicit
// horizontal drag, and only works after the answer is revealed.
let drag = null;
$("study-card").addEventListener("pointerdown", (event) => {
  if (
    !revealed ||
    !current ||
    transition ||
    event.button !== 0 ||
    event.target.closest("button,a,select,textarea,input")
  )
    return;
  drag = {
    x: event.clientX,
    y: event.clientY,
    dx: 0,
    horizontal: false,
    id: event.pointerId,
  };
});
$("study-card").addEventListener("pointermove", (event) => {
  if (!drag || drag.id !== event.pointerId) return;
  const dx = event.clientX - drag.x,
    dy = event.clientY - drag.y;
  if (!drag.horizontal && Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) {
    drag = null;
    return;
  }
  if (Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy) * 1.3)
    drag.horizontal = true;
  if (!drag.horizontal) return;
  drag.dx = dx;
  $("study-card").classList.add("dragging");
  $("study-card").style.transform =
    `translateX(${dx * 0.65}px) rotate(${dx / 35}deg)`;
  document.querySelector(".stamp-known").style.opacity =
    dx > 0 ? Math.min(1, dx / 100) : 0;
  document.querySelector(".stamp-again").style.opacity =
    dx < 0 ? Math.min(1, -dx / 100) : 0;
  try {
    $("study-card").setPointerCapture(event.pointerId);
  } catch (_) {}
});
function endDrag(event) {
  if (!drag || (event && drag.id !== event.pointerId)) return;
  const completed = drag;
  drag = null;
  $("study-card").classList.remove("dragging");
  $("study-card").style.transform = "";
  all(".swipe-stamp").forEach((stamp) => (stamp.style.opacity = "0"));
  if (
    event?.type !== "pointercancel" &&
    completed.horizontal &&
    Math.abs(completed.dx) > Math.min(85, $("study-card").clientWidth * 0.23)
  )
    grade(completed.dx > 0);
}
$("study-card").addEventListener("pointerup", endDrag);
$("study-card").addEventListener("pointercancel", endDrag);

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeFilters();
    return;
  }
  if (
    view !== "practice" ||
    $("author-dialog").open ||
    $("import-dialog").open ||
    event.target.closest("input,select,textarea,a") ||
    event.altKey ||
    event.metaKey ||
    event.ctrlKey ||
    event.repeat
  )
    return;
  if (event.code === "Space" && !event.target.closest("button")) {
    event.preventDefault();
    reveal();
  }
  if (revealed && ["ArrowLeft", "ArrowRight"].includes(event.key)) {
    event.preventDefault();
    grade(event.key === "ArrowRight");
  }
});

document.addEventListener("click", (event) => {
  const button = event.target.closest("button");
  if (!button) return;
  const d = button.dataset;
  if (d.view) setView(d.view);
  if (d.subject) changeSettings({ subject: d.subject });
  if (d.source) changeSettings({ source: d.source });
  if (d.librarySubject) {
    librarySubject = d.librarySubject;
    $("library-search").value = "";
    renderLibrary();
  }
  if (d.progressSubject) {
    progressSubject = d.progressSubject;
    renderProgress();
  }
  if (d.libraryNation) {
    $("library-nation").value = d.libraryNation;
    renderLibrary();
  }
  if (d.authorDetail) openDetail(d.authorDetail);
  if (d.topicDetail) openDetail(d.topicDetail, true);
  for (const [key, args] of Object.entries({
    practiceAuthor: { author: d.practiceAuthor },
    tossupAuthor: { author: d.tossupAuthor, source: "tossups" },
    practiceNation: { nation: d.practiceNation },
    practiceTopic: { subject: "math", topic: d.practiceTopic },
    tossupTopic: { subject: "math", topic: d.tossupTopic, source: "tossups" },
  })) {
    if (d[key]) {
      $("author-dialog").close();
      practiceFocus(args);
    }
  }
  if (d.action === "close-detail") $("author-dialog").close();
  if (d.action === "retry") loadNext();
  if (d.action === "offline") changeSettings({ source: "clues" });
  if (d.action === "random") {
    skipped.clear();
    changeSettings({ queue: "random" });
  }
  if (d.action === "smart") changeSettings({ queue: "smart" });
  if (d.action === "broaden")
    changeSettings({
      group: "",
      nation: "",
      author: "",
      mathTopic: "",
      difficulty: "all",
      queue: "smart",
    });
});

for (const [id, setting] of Object.entries({
  "group-select": "group",
  "nation-select": "nation",
  "author-select": "author",
  "math-select": "mathTopic",
  "difficulty-select": "difficulty",
  "queue-select": "queue",
}))
  $(id).addEventListener("change", (event) =>
    changeSettings({ [setting]: event.target.value }),
  );
$("speed-range").addEventListener("input", (event) => {
  state.settings.speed = Number(event.target.value);
  $("speed-value").textContent = `${state.settings.speed} wpm`;
  if (readerTimer) {
    stopReader();
    startReader();
  }
  save();
});
$("reveal-button").addEventListener("click", reveal);
$("again-button").addEventListener("click", () => grade(false));
$("known-button").addEventListener("click", () => grade(true));
$("undo-button").addEventListener("click", undoGrade);
$("skip-button").addEventListener("click", () => {
  if (current && !transition) {
    skipped.add(current.id);
    loadNext();
  }
});
$("read-button").addEventListener("click", startReader);
$("read-all-button").addEventListener("click", () => {
  stopReader();
  readerStarted = false;
  renderCard();
});
$("filter-button").setAttribute("aria-controls", "filters");
$("filter-button").setAttribute("aria-expanded", "false");
$("filter-button").addEventListener("click", () => {
  $("filters").classList.add("open");
  $("filter-button").setAttribute("aria-expanded", "true");
  $("close-filters").focus();
});
$("close-filters").addEventListener("click", () => {
  closeFilters();
  $("filter-button").focus();
});
document.addEventListener("pointerdown", (event) => {
  if (
    isMobile() &&
    $("filters").classList.contains("open") &&
    !event.target.closest("#filters,#filter-button")
  )
    closeFilters();
});
$("focus-button").addEventListener("click", () => {
  if (state.settings.subject === "literature" && state.settings.author)
    openDetail(state.settings.author);
  else if (state.settings.subject === "math" && state.settings.mathTopic)
    openDetail(state.settings.mathTopic, true);
  else {
    librarySubject = state.settings.subject;
    setView("library");
  }
});
$("library-search").addEventListener("input", renderLibrary);
$("library-nation").addEventListener("change", renderLibrary);
$("review-due-button").addEventListener("click", reviewDue);
$("export-button").addEventListener("click", exportBackup);
$("import-button").addEventListener("click", () => $("import-file").click());
$("import-file").addEventListener("change", (event) =>
  readImport(event.target.files[0]),
);
$("cancel-import").addEventListener("click", () => {
  $("import-dialog").close();
  importCandidate = null;
});
$("replace-import").addEventListener("click", () => applyImport(true));
$("merge-import").addEventListener("click", () => applyImport(false));
$("theme-button").addEventListener("click", () => {
  const theme =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem("theme", theme);
  } catch (_) {}
});
document.addEventListener("change", (event) => {
  if (
    event.target.id !== "card-author-select" ||
    !current ||
    !current.id.startsWith("qb:")
  )
    return;
  const author = AUTHORS.find((item) => item.id === event.target.value);
  current.authorId = author?.id || "";
  current.nation = author?.nation || "";
  state.savedCards[current.id] = { ...current };
  save();
  renderCard();
});
document.addEventListener("input", (event) => {
  if (event.target.id === "author-notes") {
    state.notes[event.target.dataset.noteId] = event.target.value;
    save();
  }
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopReader();
    if (current && !revealed) renderCard();
  } else renderMetrics();
});
window.addEventListener("storage", (event) => {
  if (event.key !== STORAGE_KEY || !event.newValue) return;
  try {
    state = validateState(JSON.parse(event.newValue));
    undo = null;
    renderSettings();
    renderMetrics();
    if (view === "progress") renderProgress();
    if (view === "library") renderLibrary();
    toast("Progress updated from another tab.");
  } catch (_) {}
});
window.addEventListener("resize", renderMetrics);
setInterval(() => {
  skipped = new Set(
    [...skipped].filter(
      (id) => !state.records[id] || state.records[id].due > Date.now(),
    ),
  );
  renderMetrics();
}, 30000);

$("math-select").innerHTML =
  option("", "All mathematics") +
  MATH_TOPICS.map((topic) => option(topic.id, topic.name)).join("");
$("difficulty-select").innerHTML = Object.entries(DIFFICULTIES)
  .map(([id, difficulty]) => option(id, difficulty.name))
  .join("");
$("library-nation").innerHTML =
  option("", "All literatures") +
  NATIONS.map((nation) => option(nation, nation)).join("");
if (storageProblem) toast(storageProblem);
renderSettings();
renderMetrics();
loadNext();
