import { pickRandom, shuffle } from './random.mjs';
import { primaryReading } from './parse.mjs';

/**
 * @typedef {import('./parse.mjs').KanjiEntry} KanjiEntry
 * @typedef {import('./parse.mjs').Dictionary} Dictionary
 */

/**
 * @typedef {Object} ChoiceProblem
 * @property {"choice"} type
 * @property {"kanji-to-reading" | "reading-to-kanji"} subtype
 * @property {string} question
 * @property {string[]} choices
 * @property {number} answerIndex
 * @property {string} kanji  target kanji character (for display / stats)
 */

/**
 * @typedef {Object} SentenceProblem
 * @property {"sentence"} type
 * @property {"sentence-reading"} subtype
 * @property {string} sentence
 * @property {string} target
 * @property {string[]} choices
 * @property {number} answerIndex
 * @property {string} kanji
 */

const CHOICE_COUNT = 4;

/**
 * Collect n distinct distractor readings from an entry's `similar` characters.
 * Falls back to random dictionary entries if similar cannot supply enough.
 * Only primary readings are used, matching the 10-級 constraint.
 */
function distractorReadings(entry, dictionary, n, rng) {
  const correct = primaryReading(entry);
  const seen = new Set(correct ? [correct.value] : []);
  const result = [];

  const similarEntries = entry.similar
    .map((c) => dictionary.byChar.get(c))
    .filter(Boolean);
  for (const s of shuffle(similarEntries, rng)) {
    if (result.length >= n) break;
    const r = primaryReading(s);
    if (!r || seen.has(r.value)) continue;
    seen.add(r.value);
    result.push(r.value);
  }

  if (result.length < n) {
    const fallback = dictionary.entries.filter((e) => e.kanji !== entry.kanji);
    for (const s of shuffle(fallback, rng)) {
      if (result.length >= n) break;
      const r = primaryReading(s);
      if (!r || seen.has(r.value)) continue;
      seen.add(r.value);
      result.push(r.value);
    }
  }

  return result;
}

/** Collect n distinct distractor kanji characters. */
function distractorKanji(entry, dictionary, n, rng) {
  const seen = new Set([entry.kanji]);
  const result = [];

  for (const c of shuffle(entry.similar, rng)) {
    if (result.length >= n) break;
    if (seen.has(c)) continue;
    seen.add(c);
    result.push(c);
  }

  if (result.length < n) {
    const fallback = dictionary.entries.filter((e) => !seen.has(e.kanji));
    for (const s of shuffle(fallback, rng)) {
      if (result.length >= n) break;
      seen.add(s.kanji);
      result.push(s.kanji);
    }
  }

  return result;
}

/** 漢字→読み */
export function generateKanjiToReading(entry, dictionary, rng = Math.random) {
  const correct = primaryReading(entry);
  if (!correct) throw new Error(`no primary reading for ${entry.kanji}`);
  const distractors = distractorReadings(entry, dictionary, CHOICE_COUNT - 1, rng);
  const choices = shuffle([correct.value, ...distractors], rng);
  return {
    type: 'choice',
    subtype: 'kanji-to-reading',
    question: entry.kanji,
    choices,
    answerIndex: choices.indexOf(correct.value),
    kanji: entry.kanji,
  };
}

/** 読み→漢字 */
export function generateReadingToKanji(entry, dictionary, rng = Math.random) {
  const correct = primaryReading(entry);
  if (!correct) throw new Error(`no primary reading for ${entry.kanji}`);
  const distractors = distractorKanji(entry, dictionary, CHOICE_COUNT - 1, rng);
  const choices = shuffle([entry.kanji, ...distractors], rng);
  return {
    type: 'choice',
    subtype: 'reading-to-kanji',
    question: correct.value,
    choices,
    answerIndex: choices.indexOf(entry.kanji),
    kanji: entry.kanji,
  };
}

/** 文中の漢字の読み */
export function generateSentenceReading(entry, dictionary, rng = Math.random) {
  if (entry.examples.length === 0) throw new Error(`no examples for ${entry.kanji}`);
  const example = pickRandom(entry.examples, rng);
  const targetEntry = dictionary.byChar.get(example.target) ?? entry;
  const correct = primaryReading(targetEntry);
  if (!correct) throw new Error(`no primary reading for ${example.target}`);
  const distractors = distractorReadings(targetEntry, dictionary, CHOICE_COUNT - 1, rng);
  const choices = shuffle([correct.value, ...distractors], rng);
  return {
    type: 'sentence',
    subtype: 'sentence-reading',
    sentence: example.text,
    target: example.target,
    choices,
    answerIndex: choices.indexOf(correct.value),
    kanji: entry.kanji,
  };
}

const KIND_TO_GENERATOR = {
  'kanji-to-reading': generateKanjiToReading,
  'reading-to-kanji': generateReadingToKanji,
  'sentence-reading': generateSentenceReading,
};

/**
 * Generate a problem of the given kind for a randomly chosen entry.
 * @param {"kanji-to-reading" | "reading-to-kanji" | "sentence-reading"} kind
 * @param {Dictionary} dictionary
 * @param {() => number} [rng]
 */
export function generateRandom(kind, dictionary, rng = Math.random) {
  const gen = KIND_TO_GENERATOR[kind];
  if (!gen) throw new Error(`unknown kind: ${kind}`);
  const entry = pickRandom(dictionary.entries, rng);
  return gen(entry, dictionary, rng);
}

export const KANJI_MODES = /** @type {const} */ ([
  'kanji-to-reading',
  'reading-to-kanji',
  'sentence-reading',
]);
