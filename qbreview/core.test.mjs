import test from "node:test";
import assert from "node:assert/strict";
import { AUTHORS, CLUE_CARDS, SUBCATEGORY } from "./data.js";
import {
  DAY,
  freshState,
  validateState,
  gradeRecord,
  pickCard,
  matches,
  identifyAuthor,
  normalizeTossup,
} from "./core.js";

test("every clue has a unique ID, valid subject, and an answer", () => {
  assert.equal(
    new Set(CLUE_CARDS.map((card) => card.id)).size,
    CLUE_CARDS.length,
  );
  for (const card of CLUE_CARDS) {
    assert.ok(card.question && card.answer);
    assert.ok(["literature", "math"].includes(card.subject));
    if (card.subject === "literature")
      assert.ok(AUTHORS.some((author) => author.id === card.authorId));
  }
});

test("misses return in ten minutes and consecutive recalls expand the interval", () => {
  const now = 100000000;
  const missed = gradeRecord(undefined, false, now);
  assert.equal(missed.due, now + 600000);
  assert.equal(missed.lapses, 1);
  const first = gradeRecord(missed, true, now);
  const second = gradeRecord(first, true, now);
  const third = gradeRecord(second, true, now);
  assert.equal(first.due, now + DAY);
  assert.equal(second.interval, 3);
  assert.ok(third.interval > second.interval);
  const lapse = gradeRecord(third, false, now);
  assert.equal(lapse.streak, 0);
  assert.equal(lapse.attempts, 5);
  assert.equal(lapse.correct, 3);
  assert.equal(gradeRecord(lapse, true, now).interval, 1);
});

test("general, AmLit, BritLit, national, and individual-author filters stay separate", () => {
  const settings = { ...freshState().settings, source: "clues" };
  const lit = CLUE_CARDS.filter((card) => matches(card, settings));
  assert.ok(lit.length > 100);
  for (const group of [
    "American Literature",
    "British Literature",
    "European Literature",
    "World Literature",
    "Classical Literature",
  ]) {
    const cards = CLUE_CARDS.filter((card) =>
      matches(card, { ...settings, group }),
    );
    assert.ok(cards.length > 0, group);
    assert.ok(cards.every((card) => SUBCATEGORY[card.nation] === group));
  }
  assert.ok(
    CLUE_CARDS.filter((card) =>
      matches(card, { ...settings, nation: "Russian" }),
    ).every((card) => card.nation === "Russian"),
  );
  assert.ok(
    CLUE_CARDS.filter((card) =>
      matches(card, { ...settings, author: "tolstoy" }),
    ).every((card) => card.authorId === "tolstoy"),
  );
  assert.ok(
    CLUE_CARDS.filter((card) =>
      matches(card, { ...settings, subject: "math", mathTopic: "calculus" }),
    ).every((card) => card.topicId === "calculus"),
  );
});

test("smart review prioritizes due cards and keeps future cards scheduled", () => {
  const state = freshState();
  state.settings.source = "clues";
  state.settings.author = "tolstoy";
  const cards = CLUE_CARDS.filter((card) => card.authorId === "tolstoy");
  const now = Date.now();
  state.records[cards[0].id] = {
    ...gradeRecord(undefined, false, now),
    due: now - 1,
  };
  assert.equal(pickCard(cards, state, { now }).id, cards[0].id);
  state.records[cards[0].id].due = now + DAY;
  assert.notEqual(pickCard(cards, state, { now }).id, cards[0].id);
  for (const card of cards)
    state.records[card.id] = gradeRecord(undefined, true, now);
  assert.equal(pickCard(cards, state, { now }), null);
  state.settings.queue = "random";
  assert.ok(pickCard(cards, state, { now }));
  state.settings.queue = "due";
  assert.equal(pickCard(cards, state, { now }), null);
});

test("answer ownership outweighs incidental author mentions and ambiguity stays unassigned", () => {
  assert.equal(
    identifyAuthor("This work refers to Tolstoy.", "The Metamorphosis").id,
    "kafka",
  );
  assert.equal(
    identifyAuthor("A question about writers.", "Leo Nikolayevich Tolstoy").id,
    "tolstoy",
  );
  assert.equal(
    identifyAuthor("Tolstoy and Dostoevsky are compared.", "An unknown work"),
    null,
  );
  assert.equal(
    identifyAuthor("A novel by García Márquez.", "Unknown title").id,
    "marquez",
  );
});

test("math tossups exclude other sciences; API schemas retain attribution", () => {
  const sample = {
    _id: "abc",
    question: "Question",
    answer: "Answer",
    category: "Science",
    subcategory: "Other Science",
    alternate_subcategory: "Math",
    set: { name: "Test Set" },
    packet: { name: "A" },
    difficulty: 6,
  };
  const card = normalizeTossup(sample, (value) => value);
  assert.equal(card.subject, "math");
  assert.equal(card.set, "Test Set");
  assert.equal(
    normalizeTossup(
      { ...sample, alternate_subcategory: "Astronomy" },
      (value) => value,
    ),
    null,
  );
  assert.equal(
    normalizeTossup({}, (value) => value),
    null,
  );
});

test("backup validation preserves progress but discards invalid fields and unsafe keys", () => {
  const state = freshState();
  const card = CLUE_CARDS[0];
  state.records[card.id] = gradeRecord(undefined, true);
  state.notes.tolstoy = "Remember Levin";
  state.settings.group = "American Literature";
  const roundtrip = validateState(JSON.parse(JSON.stringify(state)));
  assert.deepEqual(roundtrip.records, state.records);
  assert.equal(roundtrip.notes.tolstoy, "Remember Levin");
  assert.equal(roundtrip.settings.group, "American Literature");
  assert.throws(() => validateState({ version: 99 }));
  const bad = JSON.parse(
    '{"version":1,"records":{"__proto__":{"attempts":1}},"notes":{"__proto__":"bad"},"settings":{"speed":9999,"source":"evil"}}',
  );
  assert.equal(Object.keys(validateState(bad).records).length, 0);
  assert.equal(Object.keys(validateState(bad).notes).length, 0);
  assert.equal(validateState(bad).settings.speed, 500);
  assert.equal(validateState(bad).settings.source, "tossups");
});
