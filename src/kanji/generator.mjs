import { pickRandom, shuffle } from './random.mjs';
import { primaryReading } from './parse.mjs';

/**
 * @typedef {import('./parse.mjs').KanjiEntry} KanjiEntry
 * @typedef {import('./parse.mjs').Reading} Reading
 * @typedef {import('./parse.mjs').Dictionary} Dictionary
 */

/**
 * @typedef {Object} ChoiceProblem
 * @property {"choice"} type
 * @property {"kanji-to-reading" | "reading-to-kanji"} subtype
 * @property {string} question
 * @property {string[]} choices
 * @property {number} answerIndex
 * @property {string} kanji
 */

/**
 * @typedef {Object} SentenceProblem
 * @property {"sentence"} type
 * @property {"sentence-reading"} subtype
 * @property {string} sentence
 * @property {string} target    displayed word (kanji + okurigana when the sentence contains that form)
 * @property {string[]} choices
 * @property {number} answerIndex
 * @property {string} kanji
 */

const CHOICE_COUNT = 4;

/** Full reading form (stem + okurigana). */
function readingForm(r) {
  return r.value + (r.okurigana ?? '');
}

/** Kanji form (kanji + okurigana). */
function kanjiForm(kanji, r) {
  return kanji + (r.okurigana ?? '');
}

/**
 * Pick a distractor reading from a similar entry, shaped to match `correct`'s
 * okurigana. If the similar entry has a reading with the same okurigana we use
 * it directly (so numbers with 「〜つ」 counters yield parallel distractors:
 * いつつ/やっつ/ここのつ against むっつ). Otherwise fall back to its primary +
 * correct's okurigana (「正しい」 → 「はやしい / たしい / ...」).
 */
function pickDistractorReading(similarEntry, correct) {
  const okuri = correct.okurigana ?? '';
  if (okuri) {
    const match = similarEntry.readings.find(
      (r) => r.primary === false && (r.okurigana ?? '') === okuri,
    );
    if (match) return readingForm(match);
  }
  const primary = primaryReading(similarEntry);
  return primary ? primary.value + okuri : null;
}

function distractorReadingForms(entry, dictionary, correct, n, rng) {
  const correctForm = readingForm(correct);
  const seen = new Set([correctForm]);
  const result = [];

  const similarEntries = entry.similar
    .map((c) => dictionary.byChar.get(c))
    .filter(Boolean);
  for (const s of shuffle(similarEntries, rng)) {
    if (result.length >= n) break;
    const form = pickDistractorReading(s, correct);
    if (!form || seen.has(form)) continue;
    seen.add(form);
    result.push(form);
  }

  if (result.length < n) {
    const fallback = dictionary.entries.filter((e) => e.kanji !== entry.kanji);
    for (const s of shuffle(fallback, rng)) {
      if (result.length >= n) break;
      const form = pickDistractorReading(s, correct);
      if (!form || seen.has(form)) continue;
      seen.add(form);
      result.push(form);
    }
  }

  return result;
}

/** Collect n distinct distractor kanji forms (similar + same okurigana). */
function distractorKanjiForms(entry, dictionary, correct, n, rng) {
  const okuri = correct.okurigana ?? '';
  const correctForm = kanjiForm(entry.kanji, correct);
  const seen = new Set([correctForm]);
  const result = [];

  for (const c of shuffle(entry.similar, rng)) {
    if (result.length >= n) break;
    const form = c + okuri;
    if (seen.has(form)) continue;
    seen.add(form);
    result.push(form);
  }

  if (result.length < n) {
    const fallback = dictionary.entries.filter((e) => e.kanji !== entry.kanji);
    for (const s of shuffle(fallback, rng)) {
      if (result.length >= n) break;
      const form = s.kanji + okuri;
      if (seen.has(form)) continue;
      seen.add(form);
      result.push(form);
    }
  }

  return result;
}

/** 漢字→読み */
export function generateKanjiToReading(entry, dictionary, rng = Math.random) {
  const correct = primaryReading(entry);
  if (!correct) throw new Error(`no primary reading for ${entry.kanji}`);
  const correctForm = readingForm(correct);
  const distractors = distractorReadingForms(entry, dictionary, correct, CHOICE_COUNT - 1, rng);
  const choices = shuffle([correctForm, ...distractors], rng);
  return {
    type: 'choice',
    subtype: 'kanji-to-reading',
    question: kanjiForm(entry.kanji, correct),
    choices,
    answerIndex: choices.indexOf(correctForm),
    kanji: entry.kanji,
  };
}

/** 読み→漢字 */
export function generateReadingToKanji(entry, dictionary, rng = Math.random) {
  const correct = primaryReading(entry);
  if (!correct) throw new Error(`no primary reading for ${entry.kanji}`);
  const correctForm = kanjiForm(entry.kanji, correct);
  const distractors = distractorKanjiForms(entry, dictionary, correct, CHOICE_COUNT - 1, rng);
  const choices = shuffle([correctForm, ...distractors], rng);
  return {
    type: 'choice',
    subtype: 'reading-to-kanji',
    question: readingForm(correct),
    choices,
    answerIndex: choices.indexOf(correctForm),
    kanji: entry.kanji,
  };
}

/**
 * 文中の漢字の読み
 *
 * The reading used for the correct answer comes from example.reading if the
 * example specifies one (e.g. 六の「六つ ある。」 uses むっ+つ = むっつ even
 * though the entry's primary is ろく). Otherwise it falls back to the target
 * entry's primary reading. When the reading has okurigana AND the sentence
 * contains that word form, the whole word is highlighted and asked about.
 */
export function generateSentenceReading(entry, dictionary, rng = Math.random) {
  if (entry.examples.length === 0) throw new Error(`no examples for ${entry.kanji}`);
  const example = pickRandom(entry.examples, rng);
  const targetEntry = dictionary.byChar.get(example.target) ?? entry;
  const baseReading = example.reading ?? primaryReading(targetEntry);
  if (!baseReading) throw new Error(`no reading for ${example.target}`);

  const wordForm = example.target + (baseReading.okurigana ?? '');
  const useWordForm = !!baseReading.okurigana && example.text.includes(wordForm);
  const readingForDrill = useWordForm ? baseReading : { ...baseReading, okurigana: undefined };

  const correctText = readingForm(readingForDrill);
  const distractors = distractorReadingForms(targetEntry, dictionary, readingForDrill, CHOICE_COUNT - 1, rng);
  const choices = shuffle([correctText, ...distractors], rng);

  return {
    type: 'sentence',
    subtype: 'sentence-reading',
    sentence: example.text,
    target: useWordForm ? wordForm : example.target,
    choices,
    answerIndex: choices.indexOf(correctText),
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
