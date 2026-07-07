import { pickRandom, shuffle, sample } from '../kanji/random.mjs';
import { VOCAB } from './vocab-data.mjs';

const CHOICE_COUNT = 4;

/**
 * @typedef {Object} ChoiceQuestion
 * @property {string} subtype
 * @property {string} question
 * @property {string[]} choices
 * @property {number} answerIndex
 */

/**
 * ダミー候補を集める。同カテゴリを優先し、足りなければ全体から補う。
 * key: 選択肢に使うプロパティ名 ('en' | 'ja')
 */
function collectDistractors(entry, key, n, rng) {
  const seen = new Set([entry[key]]);
  const result = [];
  const sameCat = VOCAB.filter((v) => v.cat === entry.cat && v[key] !== entry[key]);
  for (const v of shuffle(sameCat, rng)) {
    if (result.length >= n) break;
    if (seen.has(v[key])) continue;
    seen.add(v[key]);
    result.push(v[key]);
  }
  if (result.length < n) {
    const other = VOCAB.filter((v) => !seen.has(v[key]));
    for (const v of shuffle(other, rng)) {
      if (result.length >= n) break;
      seen.add(v[key]);
      result.push(v[key]);
    }
  }
  return result;
}

/** にほんご → えいご */
export function generateJaToEn(rng = Math.random) {
  const entry = pickRandom(VOCAB, rng);
  const distractors = collectDistractors(entry, 'en', CHOICE_COUNT - 1, rng);
  const choices = shuffle([entry.en, ...distractors], rng);
  return {
    subtype: 'ja-to-en',
    question: entry.ja,
    choices,
    answerIndex: choices.indexOf(entry.en),
  };
}

/** えいご → にほんご */
export function generateEnToJa(rng = Math.random) {
  const entry = pickRandom(VOCAB, rng);
  const distractors = collectDistractors(entry, 'ja', CHOICE_COUNT - 1, rng);
  const choices = shuffle([entry.ja, ...distractors], rng);
  return {
    subtype: 'en-to-ja',
    question: entry.en,
    choices,
    answerIndex: choices.indexOf(entry.ja),
  };
}
