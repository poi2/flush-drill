import { shuffle, sample } from '../kanji/random.mjs';

/**
 * @typedef {Object} ChoiceQuestion
 * @property {string} subtype
 * @property {string} question
 * @property {string[]} choices
 * @property {number} answerIndex
 */

const CHOICE_COUNT = 4;

function randInt(rng, min, max) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

/**
 * 10 の あわせて: `n + ? = 10`。n は 1〜9、答えは 10-n。
 * 選択肢は 1〜9 から答えとダミー 3 個。
 */
export function generateTenComp(rng = Math.random) {
  const n = randInt(rng, 1, 9);
  const answer = 10 - n;
  const pool = [];
  for (let i = 1; i <= 9; i++) if (i !== answer) pool.push(i);
  const distractors = sample(pool, CHOICE_COUNT - 1, rng);
  const choices = shuffle([answer, ...distractors], rng).map(String);
  return {
    subtype: 'ten-comp',
    question: `${n} + ？ = 10`,
    choices,
    answerIndex: choices.indexOf(String(answer)),
  };
}

/**
 * ぐうすう・きすう: 4 つの数から偶数（or 奇数）を選ばせる。
 * 正解 1 個 + ダミー 3 個（逆パリティ）の構成。
 */
export function generateParity(rng = Math.random) {
  const askEven = rng() < 0.5;
  const targetParity = askEven ? 0 : 1;
  // 1〜30 の範囲で対象パリティを 1 つ、逆パリティを 3 つ選ぶ。
  const target = [];
  const other = [];
  for (let i = 1; i <= 30; i++) (i % 2 === targetParity ? target : other).push(i);
  const correct = sample(target, 1, rng)[0];
  const distractors = sample(other, CHOICE_COUNT - 1, rng);
  const choices = shuffle([correct, ...distractors], rng).map(String);
  return {
    subtype: 'parity',
    question: askEven ? 'ぐうすうは どれ？' : 'きすうは どれ？',
    choices,
    answerIndex: choices.indexOf(String(correct)),
  };
}
