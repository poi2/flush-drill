import { test } from 'node:test';
import assert from 'node:assert/strict';

import { makeRng } from '../src/kanji/random.mjs';
import { generateMix3Set, COURSES, MIX3_DEFAULT_SET_SIZE } from '../src/mix3/generator.mjs';

const PLUS = '＋';
const MINUS = '－';

function evalQ(q) {
  const [s1, s2] = q.symbols;
  const step1 = s1 === PLUS ? q.a + q.b : q.a - q.b;
  return s2 === PLUS ? step1 + q.c : step1 - q.c;
}

for (const course of COURSES) {
  test(`generateMix3Set(${course}): デフォルトで ${MIX3_DEFAULT_SET_SIZE} 問返す`, () => {
    const set = generateMix3Set(course, makeRng(1));
    assert.equal(set.length, MIX3_DEFAULT_SET_SIZE);
    for (const q of set) {
      assert.equal(q.kind, 'keypad');
      assert.ok(q.a >= 1 && q.a <= 5, `a in 1..5: ${q.a}`);
      assert.ok(q.b >= 1 && q.b <= 5, `b in 1..5: ${q.b}`);
      assert.ok(q.c >= 1 && q.c <= 5, `c in 1..5: ${q.c}`);
      assert.equal(q.ans, evalQ(q), `ans matches ops`);
      assert.ok(q.ans >= 0, `ans >= 0: ${q.expr} = ${q.ans}`);
      assert.equal(typeof q.expr, 'string');
    }
  });
}

test('generateMix3Set(pp): 常に ＋ ＋', () => {
  const set = generateMix3Set('pp', makeRng(1));
  for (const q of set) {
    assert.deepEqual(q.symbols, [PLUS, PLUS]);
    assert.equal(q.ans, q.a + q.b + q.c);
  }
});

test('generateMix3Set(mm): 常に － －、答えは 0 以上', () => {
  const set = generateMix3Set('mm', makeRng(2));
  for (const q of set) {
    assert.deepEqual(q.symbols, [MINUS, MINUS]);
    assert.equal(q.ans, q.a - q.b - q.c);
    assert.ok(q.ans >= 0);
  }
});

test('generateMix3Set(pm): ＋－ か －＋ のいずれか、答えは 0 以上', () => {
  const set = generateMix3Set('pm', makeRng(3));
  for (const q of set) {
    const [s1, s2] = q.symbols;
    const pmOk = s1 === PLUS && s2 === MINUS;
    const mpOk = s1 === MINUS && s2 === PLUS;
    assert.ok(pmOk || mpOk, `unexpected symbols: ${s1} ${s2}`);
    assert.ok(q.ans >= 0);
  }
});

test('generateMix3Set: 同じ seed なら同じ順序 (決定的)', () => {
  const a = generateMix3Set('pm', makeRng(42));
  const b = generateMix3Set('pm', makeRng(42));
  assert.deepEqual(a, b);
});

test('generateMix3Set: 未知の course は throw', () => {
  assert.throws(() => generateMix3Set('xx', makeRng(1)), /unknown course/);
});

test('generateMix3Set: size を明示して 20 問取れる', () => {
  const set = generateMix3Set('pp', makeRng(5), 20);
  assert.equal(set.length, 20);
});

test('generateMix3Set(mm): 候補が少なくても size 分返す (重複あり)', () => {
  // mm は 1..5 で a>=b+c を満たす組み合わせが有限 (20 通り)。size=50 でも返せる。
  const set = generateMix3Set('mm', makeRng(6), 50);
  assert.equal(set.length, 50);
  for (const q of set) {
    assert.equal(q.ans, q.a - q.b - q.c);
    assert.ok(q.ans >= 0);
  }
});

test('generateMix3Set: expr フォーマットが `a s1 b s2 c =`', () => {
  const set = generateMix3Set('pp', makeRng(7));
  for (const q of set) {
    assert.equal(q.expr, `${q.a} ${q.symbols[0]} ${q.b} ${q.symbols[1]} ${q.c} =`);
  }
});
