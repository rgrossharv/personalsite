import {
  AUTHORS,
  CLUE_CARDS,
  DIFFICULTIES,
  MATH_TOPICS,
  SUBCATEGORY,
} from "./data.js";

export const STORAGE_KEY = "qbreview:v1";
export const DAY = 86400000;
export const DEFAULT_SETTINGS = {
  subject: "literature",
  source: "tossups",
  group: "",
  nation: "",
  author: "",
  mathTopic: "",
  difficulty: "all",
  queue: "smart",
  speed: 240,
};
export const freshState = () => ({
  version: 1,
  settings: { ...DEFAULT_SETTINGS },
  records: {},
  history: [],
  savedCards: {},
  notes: {},
});
export const normalize = (text) =>
  String(text || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
export const escapeHTML = (text) =>
  String(text ?? "").replace(
    /[&<>"']/g,
    (character) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        character
      ],
  );

export function primaryAnswer(answer) {
  return String(answer)
    .split(/\s*[\[\(]/)[0]
    .replace(/^ANSWER:\s*/i, "")
    .trim();
}

function contains(text, value) {
  return ` ${normalize(text)} `.includes(` ${normalize(value)} `);
}

export function identifyAuthor(question, answer) {
  // Answerlines are stronger evidence than incidental names in a question.
  const direct = AUTHORS.filter((author) =>
    author.aliases.some((alias) => contains(primaryAnswer(answer), alias)),
  );
  if (direct.length === 1) return direct[0];
  const workOwners = AUTHORS.filter((author) =>
    author.works.some((work) => contains(primaryAnswer(answer), work.title)),
  );
  if (workOwners.length === 1) return workOwners[0];
  const mentions = AUTHORS.filter((author) =>
    author.aliases.some((alias) => contains(question, alias)),
  );
  return mentions.length === 1 ? mentions[0] : null;
}

export function normalizeTossup(raw, plainText) {
  if (
    !raw ||
    typeof raw._id !== "string" ||
    typeof raw.question !== "string" ||
    typeof raw.answer !== "string"
  )
    return null;
  const question = raw.question_sanitized || plainText(raw.question);
  const answer = raw.answer_sanitized || plainText(raw.answer);
  const subject = raw.category === "Literature" ? "literature" : "math";
  if (
    subject === "math" &&
    raw.alternate_subcategory !== "Math" &&
    raw.subcategory !== "Math"
  )
    return null;
  const author =
    subject === "literature" ? identifyAuthor(question, answer) : null;
  return {
    id: `qb:${raw._id}`,
    qbId: raw._id,
    subject,
    authorId: author?.id || "",
    nation: author?.nation || "",
    topic: raw.subcategory || "Tossup",
    question,
    answer,
    explanation: "",
    difficulty: raw.difficulty,
    set: raw.set?.name || "QB Reader",
    packet: raw.packet?.name || "",
    number: raw.number || "",
    source: "QB Reader",
    subcategory: raw.subcategory || "",
  };
}

export function matches(card, settings) {
  if (card.subject !== settings.subject) return false;
  if (settings.source === "clues" && !card.id.startsWith("clue:")) return false;
  if (settings.source === "tossups" && !card.id.startsWith("qb:")) return false;
  if (settings.subject === "literature") {
    if (
      settings.group &&
      (card.subcategory || SUBCATEGORY[card.nation]) !== settings.group
    )
      return false;
    if (settings.author && card.authorId !== settings.author) return false;
    if (settings.nation && card.nation !== settings.nation) return false;
  } else if (
    settings.mathTopic &&
    (card.topicId
      ? card.topicId !== settings.mathTopic
      : !mathTopicMatches(card, settings.mathTopic))
  )
    return false;
  const values = DIFFICULTIES[settings.difficulty]?.values;
  if (
    card.id.startsWith("qb:") &&
    values &&
    !values.split(",").includes(String(card.difficulty))
  )
    return false;
  return true;
}

export function mathTopicMatches(card, id) {
  const topic = MATH_TOPICS.find((item) => item.id === id);
  if (!topic) return false;
  const keywords = {
    calculus:
      "derivative|integral|calculus|taylor|limit|differential|leibniz|newton",
    algebra:
      "algebra|group|prime|galois|fermat|modulo|modular|ring|field|number theor|diophantine",
    linear: "matrix|matrices|eigen|vector|linear|determinant|rank|nullity",
    geometry:
      "geometr|topolog|triangle|polygon|polyhedr|surface|manifold|euler characteristic|mobius",
    probability:
      "probabil|statistic|distribution|bayes|random|variance|bernoulli|poisson",
    discrete:
      "graph|combinator|pigeonhole|discrete|countab|inclusion.exclusion|hamiltonian|eulerian",
  };
  return new RegExp(keywords[id], "i").test(
    normalize(`${card.question} ${card.answer}`),
  );
}

export function gradeRecord(previous, known, now = Date.now()) {
  const old = previous || {
    attempts: 0,
    correct: 0,
    streak: 0,
    interval: 0,
    lapses: 0,
  };
  const streak = known ? old.streak + 1 : 0;
  const interval = known
    ? streak === 1
      ? 1
      : streak === 2
        ? 3
        : Math.min(120, Math.max(1, old.interval) * 2.2)
    : 10 / 1440;
  return {
    attempts: old.attempts + 1,
    correct: old.correct + Number(known),
    streak,
    interval,
    lapses: old.lapses + Number(!known),
    last: now,
    due: now + interval * DAY,
  };
}

export function pickCard(
  cards,
  state,
  { exclude = new Set(), now = Date.now(), random = Math.random } = {},
) {
  let pool = cards.filter(
    (card) => matches(card, state.settings) && !exclude.has(card.id),
  );
  if (state.settings.queue === "due")
    pool = pool.filter((card) => state.records[card.id]?.due <= now);
  if (!pool.length) return null;
  if (state.settings.queue === "random")
    return pool[Math.floor(random() * pool.length)];
  const due = pool
    .filter((card) => state.records[card.id]?.due <= now)
    .sort((a, b) => state.records[a.id].due - state.records[b.id].due);
  if (due.length) return due[0];
  const newCards = pool.filter((card) => !state.records[card.id]);
  if (!newCards.length) return null; // Future reviews stay scheduled, even after a reload.
  const cardIndex = new Map(
    [...CLUE_CARDS, ...Object.values(state.savedCards)].map((card) => [
      card.id,
      card,
    ]),
  );
  const groups = new Map();
  for (const [id, record] of Object.entries(state.records)) {
    const card = cardIndex.get(id);
    const key = card?.authorId || (card?.topicId ? `math:${card.topicId}` : "");
    if (!key) continue;
    const group = groups.get(key) || { attempts: 0, correct: 0 };
    group.attempts += record.attempts;
    group.correct += record.correct;
    groups.set(key, group);
  }
  const weighted = newCards.map((card) => {
    const { attempts, correct } = groups.get(
      card.authorId || `math:${card.topicId}`,
    ) || { attempts: 0, correct: 0 };
    return { card, weight: attempts ? 1 + 3 * (1 - correct / attempts) : 1.5 };
  });
  let target = random() * weighted.reduce((sum, item) => sum + item.weight, 0);
  return (
    weighted.find((item) => (target -= item.weight) <= 0) || weighted.at(-1)
  ).card;
}

export function aggregate(cards, records) {
  const result = {
    total: cards.length,
    seen: 0,
    attempts: 0,
    correct: 0,
    mastered: 0,
    due: 0,
  };
  for (const card of cards) {
    const record = records[card.id];
    if (!record) continue;
    result.seen++;
    result.attempts += record.attempts;
    result.correct += record.correct;
    if (record.streak >= 3) result.mastered++;
    if (record.due <= Date.now()) result.due++;
  }
  result.accuracy = result.attempts
    ? Math.round((100 * result.correct) / result.attempts)
    : null;
  return result;
}

const cleanText = (value, limit = 30000) =>
  typeof value === "string" ? value.slice(0, limit) : "";
const finite = (value) =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;
const safeKey = (key) =>
  typeof key === "string" &&
  /^[a-zA-Z0-9:_-]{1,160}$/.test(key) &&
  !["__proto__", "constructor", "prototype"].includes(key);

export function validateState(input) {
  if (
    !input ||
    input.version !== 1 ||
    !input.records ||
    typeof input.records !== "object" ||
    Array.isArray(input.records)
  )
    throw new Error("Choose a QB Review backup file (version 1).");
  const result = freshState();
  const settings = input.settings || {};
  for (const [key, values] of Object.entries({
    subject: ["literature", "math"],
    source: ["clues", "tossups"],
    queue: ["smart", "random", "due"],
    difficulty: Object.keys(DIFFICULTIES),
  })) {
    if (values.includes(settings[key])) result.settings[key] = settings[key];
  }
  if (AUTHORS.some((author) => author.nation === settings.nation))
    result.settings.nation = settings.nation;
  if (
    [...Object.values(SUBCATEGORY), "Other Literature"].includes(settings.group)
  )
    result.settings.group = settings.group;
  if (
    AUTHORS.some(
      (author) =>
        author.id === settings.author &&
        (!result.settings.nation || author.nation === result.settings.nation),
    )
  )
    result.settings.author = settings.author;
  if (MATH_TOPICS.some((topic) => topic.id === settings.mathTopic))
    result.settings.mathTopic = settings.mathTopic;
  if (finite(settings.speed))
    result.settings.speed = Math.max(120, Math.min(500, settings.speed));
  for (const [id, record] of Object.entries(input.records).slice(0, 20000)) {
    if (
      !safeKey(id) ||
      !record ||
      ![
        "attempts",
        "correct",
        "streak",
        "interval",
        "lapses",
        "last",
        "due",
      ].every((key) => finite(record[key]))
    )
      continue;
    if (
      !Number.isInteger(record.attempts) ||
      record.correct > record.attempts ||
      record.streak > record.attempts
    )
      continue;
    result.records[id] = {
      ...Object.fromEntries(
        [
          "attempts",
          "correct",
          "streak",
          "interval",
          "lapses",
          "last",
          "due",
        ].map((key) => [key, record[key]]),
      ),
    };
  }
  for (const [id, card] of Object.entries(input.savedCards || {}).slice(
    0,
    20000,
  )) {
    if (
      !id.startsWith("qb:") ||
      !safeKey(id) ||
      card?.id !== id ||
      !["math", "literature"].includes(card.subject) ||
      !card.question ||
      !card.answer
    )
      continue;
    result.savedCards[id] = { id, subject: card.subject };
    for (const key of [
      "qbId",
      "question",
      "answer",
      "explanation",
      "authorId",
      "nation",
      "topic",
      "topicId",
      "set",
      "packet",
      "source",
      "subcategory",
    ])
      result.savedCards[id][key] = cleanText(card[key]);
    if (finite(card.difficulty))
      result.savedCards[id].difficulty = card.difficulty;
    if (finite(card.number)) result.savedCards[id].number = card.number;
  }
  if (Array.isArray(input.history))
    result.history = input.history
      .filter(
        (event) =>
          event &&
          safeKey(event.id || "") &&
          typeof event.known === "boolean" &&
          finite(event.time),
      )
      .slice(-3000)
      .map((event) => ({ id: event.id, known: event.known, time: event.time }));
  for (const [id, note] of Object.entries(input.notes || {}))
    if (safeKey(id)) result.notes[id] = cleanText(note, 10000);
  return result;
}
