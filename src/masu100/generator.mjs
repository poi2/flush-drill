// 100 ます計算の出題ジェネレータ。1..10 と 11..20 の全組み合わせを
// PRNG でシャッフルして返す。Presenter は結果を先頭から順に出題する。
//
// 出題数は演算に関係なく 100 問固定 (100 ます計算の定義そのもの)。
// - add: 1..10 + 1..10  (答え 2..20)
// - sub: 11..20 - 1..10 (答え 1..19、常に非負)
// - mul: 1..10 × 1..10  (答え 1..100)

import { shuffle } from '../kanji/random.mjs';

/**
 * @typedef {Object} Masu100Question
 * @property {'keypad'} kind
 * @property {number} a
 * @property {number} b
 * @property {number} ans
 * @property {string} symbol
 */

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
 * @returns {Masu100Question[]}  length 100
 */
export function generate100masuSet(op, rng = Math.random) {
  if (!SYMBOLS[op]) throw new Error(`unknown op: ${op}`);
  return shuffle(pairsFor(op), rng).map(([a, b]) => makeQuestion(op, a, b));
}
