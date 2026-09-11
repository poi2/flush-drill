// 25 ます計算の出題ジェネレータ。100 ます相当のペア集合から毎回 25 問を
// PRNG で抽出して返す。Presenter は結果を先頭から順に出題する。
//
// 出題数は演算に関係なく 25 問固定 (1 セットあたりの目安時間を短く保つ)。
// - add: 1..10 + 1..10  (答え 2..20 の 100 組から 25 問)
// - sub: 11..20 - 1..10 (答え 1..19、常に非負、100 組から 25 問)
// - mul: 1..10 × 1..10  (答え 1..100、100 組から 25 問)

import { sample } from '../kanji/random.mjs';

/**
 * @typedef {Object} Masu25Question
 * @property {'keypad'} kind
 * @property {number} a
 * @property {number} b
 * @property {number} ans
 * @property {string} symbol
 */

export const MASU25_SET_SIZE = 25;

const SYMBOLS = { add: '＋', sub: '－', mul: '×' };

function pairsFor(op) {
  const pairs = [];
  if (op === 'sub') {
    for (let a = 11; a <= 20; a++) {
      for (let b = 1; b <= 10; b++) pairs.push([a, b]);
    }
  } else {
    for (let a = 1; a <= 10; a++) {
      for (let b = 1; b <= 10; b++) pairs.push([a, b]);
    }
  }
  return pairs;
}

function makeQuestion(op, a, b) {
  let ans;
  if (op === 'add') ans = a + b;
  else if (op === 'sub') ans = a - b;
  else if (op === 'mul') ans = a * b;
  else throw new Error(`unknown op: ${op}`);
  return { kind: 'keypad', a, b, ans, symbol: SYMBOLS[op] };
}

/**
 * @param {'add'|'sub'|'mul'} op
 * @param {() => number} [rng]
 * @returns {Masu25Question[]}  length 25
 */
export function generateMasu25Set(op, rng = Math.random) {
  if (!SYMBOLS[op]) throw new Error(`unknown op: ${op}`);
  return sample(pairsFor(op), MASU25_SET_SIZE, rng).map(([a, b]) => makeQuestion(op, a, b));
}
