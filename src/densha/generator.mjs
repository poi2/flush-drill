import { pickRandom, shuffle, sample } from '../kanji/random.mjs';
import { TRAIN_ENTRIES } from './data.mjs';

const CHOICE_COUNT = 4;

/**
 * @typedef {Object} ChoiceQuestion
 * @property {string} subtype
 * @property {string} question
 * @property {string[]} choices
 * @property {number} answerIndex
 * @property {string} description  正解時に表示する子ども向け説明文
 */

/** ひらがな ➡ かんじ */
export function generateTrainHiraToKanji(rng = Math.random) {
  const entry = pickRandom(TRAIN_ENTRIES, rng);
  const distractors = sample(
    TRAIN_ENTRIES.filter((e) => e.kanji !== entry.kanji),
    CHOICE_COUNT - 1,
    rng,
  ).map((e) => e.kanji);
  const choices = shuffle([entry.kanji, ...distractors], rng);
  return {
    subtype: 'train-h-to-k',
    question: entry.hiragana,
    choices,
    answerIndex: choices.indexOf(entry.kanji),
    description: entry.description,
  };
}

/** かんじ ➡ ひらがな */
export function generateTrainKanjiToHira(rng = Math.random) {
  const entry = pickRandom(TRAIN_ENTRIES, rng);
  const distractors = sample(
    TRAIN_ENTRIES.filter((e) => e.hiragana !== entry.hiragana),
    CHOICE_COUNT - 1,
    rng,
  ).map((e) => e.hiragana);
  const choices = shuffle([entry.hiragana, ...distractors], rng);
  return {
    subtype: 'train-k-to-h',
    question: entry.kanji,
    choices,
    answerIndex: choices.indexOf(entry.hiragana),
    description: entry.description,
  };
}
