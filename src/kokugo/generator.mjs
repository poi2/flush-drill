import { pickRandom, shuffle, sample } from '../kanji/random.mjs';
import { KANA_PAIRS } from './kana-data.mjs';
import { ANTONYM_PAIRS } from './antonym-data.mjs';

/**
 * @typedef {Object} ChoiceQuestion
 * @property {string} subtype
 * @property {string} question
 * @property {string[]} choices
 * @property {number} answerIndex
 */

const CHOICE_COUNT = 4;

/** ひらがな → カタカナ */
export function generateHiraToKata(rng = Math.random) {
  return generateKanaProblem(0, 1, 'hira-to-kata', rng);
}

/** カタカナ → ひらがな */
export function generateKataToHira(rng = Math.random) {
  return generateKanaProblem(1, 0, 'kata-to-hira', rng);
}

function generateKanaProblem(qCol, aCol, subtype, rng) {
  const pair = pickRandom(KANA_PAIRS, rng);
  const question = pair[qCol];
  const correct = pair[aCol];
  const others = KANA_PAIRS.filter((p) => p[aCol] !== correct);
  const distractors = sample(others, CHOICE_COUNT - 1, rng).map((p) => p[aCol]);
  const choices = shuffle([correct, ...distractors], rng);
  return {
    subtype,
    question,
    choices,
    answerIndex: choices.indexOf(correct),
  };
}

/** ○○ の はんたいは？ */
export function generateAntonym(rng = Math.random) {
  const pair = pickRandom(ANTONYM_PAIRS, rng);
  // 出題側と正答側をランダムに決める（対称に扱う）
  const flip = rng() < 0.5;
  const question = flip ? pair[1] : pair[0];
  const correct = flip ? pair[0] : pair[1];

  // 他のペアからダミー語を集める。question / correct とかぶらないもの。
  const pool = [];
  for (const p of ANTONYM_PAIRS) {
    if (p === pair) continue;
    pool.push(...p);
  }
  const seen = new Set([question, correct]);
  const uniquePool = pool.filter((w) => {
    if (seen.has(w)) return false;
    seen.add(w);
    return true;
  });
  const distractors = sample(uniquePool, CHOICE_COUNT - 1, rng);
  const choices = shuffle([correct, ...distractors], rng);
  return {
    subtype: 'antonym',
    question,
    choices,
    answerIndex: choices.indexOf(correct),
  };
}
