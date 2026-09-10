// たすひく ミックス (3項計算) の出題ジェネレータ。
// 各コースに応じた (a, b, c, s1, s2) の valid 組み合わせを PRNG でシャッフルし、
// 先頭 questionsPerSet 問を返す。a, b, c は 1..5、答えは常に 0 以上に絞る。
//
// - pp (たすたす): a + b + c
// - pm (たすひく): a + b - c もしくは a - b + c を混ぜる
// - mm (ひくひく): a - b - c

import { sample } from '../kanji/random.mjs';

const PLUS = '＋';
const MINUS = '－';
const A_MAX = 5;
const B_MAX = 5;
const C_MAX = 5;

export const COURSES = /** @type {const} */ (['pp', 'pm', 'mm']);
export const MIX3_DEFAULT_SET_SIZE = 10;

/**
 * @typedef {Object} Mix3Question
 * @property {'keypad'} kind
 * @property {number} a
 * @property {number} b
 * @property {number} c
 * @property {[string, string]} symbols
 * @property {number} ans
 * @property {string} expr
 */

function evalOps(a, b, c, s1, s2) {
  const step1 = s1 === PLUS ? a + b : a - b;
  return s2 === PLUS ? step1 + c : step1 - c;
}

function makeQuestion(a, b, c, s1, s2) {
  const ans = evalOps(a, b, c, s1, s2);
  return {
    kind: 'keypad',
    a, b, c,
    symbols: [s1, s2],
    ans,
    expr: `${a} ${s1} ${b} ${s2} ${c} =`,
  };
}

// 各コースの (a, b, c, s1, s2) 候補を列挙する。答え 0 以上のもののみ返す。
function candidatesFor(course) {
  const out = [];
  for (let a = 1; a <= A_MAX; a++) {
    for (let b = 1; b <= B_MAX; b++) {
      for (let c = 1; c <= C_MAX; c++) {
        if (course === 'pp') {
          out.push([a, b, c, PLUS, PLUS]);
        } else if (course === 'mm') {
          if (a - b - c >= 0) out.push([a, b, c, MINUS, MINUS]);
        } else if (course === 'pm') {
          if (a + b - c >= 0) out.push([a, b, c, PLUS, MINUS]);
          if (a - b + c >= 0) out.push([a, b, c, MINUS, PLUS]);
        } else {
          throw new Error(`unknown course: ${course}`);
        }
      }
    }
  }
  return out;
}

/**
 * 指定コースの問題セットを返す。
 * @param {'pp'|'pm'|'mm'} course
 * @param {() => number} [rng]
 * @param {number} [size]
 * @returns {Mix3Question[]}
 */
export function generateMix3Set(course, rng = Math.random, size = MIX3_DEFAULT_SET_SIZE) {
  if (!COURSES.includes(course)) throw new Error(`unknown course: ${course}`);
  const cands = candidatesFor(course);
  // 候補数が size より少ないときは重複を許して補充する。現状 pp=125 / pm=... / mm=20 で
  // いずれも 10 は満たすが、将来 size を増やしたり範囲を狭めたりしたときの安全網。
  if (cands.length >= size) {
    return sample(cands, size, rng).map(([a, b, c, s1, s2]) => makeQuestion(a, b, c, s1, s2));
  }
  const out = [];
  while (out.length < size) {
    for (const [a, b, c, s1, s2] of sample(cands, cands.length, rng)) {
      out.push(makeQuestion(a, b, c, s1, s2));
      if (out.length >= size) break;
    }
  }
  return out;
}
