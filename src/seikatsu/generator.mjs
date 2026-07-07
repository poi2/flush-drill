import { pickRandom, shuffle, sample } from '../kanji/random.mjs';
import {
  SEASON_WORDS,
  SEASONS,
  GROUP_CATEGORIES,
} from './data.mjs';

const CHOICE_COUNT = 4;

/**
 * @typedef {Object} ChoiceQuestion
 * @property {string} subtype
 * @property {string} question
 * @property {string[]} choices
 * @property {number} answerIndex
 */

/** ○○ は どの きせつ？ */
export function generateSeason(rng = Math.random) {
  const target = pickRandom(SEASON_WORDS, rng);
  // 選択肢は 4 季すべて。安定した並びで固定してもよいが flush drill として位置記憶を防ぐためシャッフル。
  const choices = shuffle([...SEASONS], rng);
  return {
    subtype: 'season',
    question: `「${target.word}」は どの きせつ？`,
    choices,
    answerIndex: choices.indexOf(target.season),
  };
}

/** つぎの なかで ○○は どれ？ */
export function generateGroup(rng = Math.random) {
  const keys = Object.keys(GROUP_CATEGORIES);
  const targetKey = pickRandom(keys, rng);
  const correct = pickRandom(GROUP_CATEGORIES[targetKey], rng);
  // ダミーは他カテゴリからランダムに 3 個
  const otherPool = [];
  for (const k of keys) {
    if (k === targetKey) continue;
    otherPool.push(...GROUP_CATEGORIES[k]);
  }
  const distractors = sample(otherPool, CHOICE_COUNT - 1, rng);
  const choices = shuffle([correct, ...distractors], rng);
  return {
    subtype: 'group',
    question: `つぎの なかで「${targetKey}」は どれ？`,
    choices,
    answerIndex: choices.indexOf(correct),
  };
}
