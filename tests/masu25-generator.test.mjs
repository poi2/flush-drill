import { test } from 'node:test';
import assert from 'node:assert/strict';

import { makeRng } from '../src/kanji/random.mjs';
import { generateMasu25Set, MASU25_SET_SIZE } from '../src/masu25/generator.mjs';

test('generateMasu25Set(add): 25 問、各 1..10+1..10、答え a+b', () => {
  const set = generateMasu25Set('add', makeRng(1));
  assert.equal(set.length, MASU25_SET_SIZE);
  const seen = new Set();
  for (const q of set) {
    assert.equal(q.kind, 'keypad');
    assert.equal(q.symbol, '＋');
    assert.equal(q.ans, q.a + q.b);
    assert.ok(q.a >= 1 && q.a <= 10 && q.b >= 1 && q.b <= 10);
    seen.add(`${q.a},${q.b}`);
  }
  // 25 問なら 100 通りの pairs から重複なしで抽出できる
  assert.equal(seen.size, 25);
});

test('generateMasu25Set(sub): 25 問、11..20-1..10、答え 1 以上', () => {
  const set = generateMasu25Set('sub', makeRng(2));
  assert.equal(set.length, MASU25_SET_SIZE);
  for (const q of set) {
    assert.equal(q.symbol, '－');
    assert.equal(q.ans, q.a - q.b);
    assert.ok(q.a >= 11 && q.a <= 20 && q.b >= 1 && q.b <= 10);
    assert.ok(q.ans >= 1);
  }
});

test('generateMasu25Set(mul): 25 問、1..10 x 1..10、答え a*b', () => {
  const set = generateMasu25Set('mul', makeRng(3));
  assert.equal(set.length, MASU25_SET_SIZE);
  for (const q of set) {
    assert.equal(q.symbol, '×');
    assert.equal(q.ans, q.a * q.b);
    assert.ok(q.a >= 1 && q.a <= 10 && q.b >= 1 && q.b <= 10);
  }
});

test('generateMasu25Set: 同じ seed なら同じ順序 (決定的)', () => {
  const a = generateMasu25Set('mul', makeRng(42));
  const b = generateMasu25Set('mul', makeRng(42));
  assert.deepEqual(a, b);
});

test('generateMasu25Set: 別 seed なら順序が変わる', () => {
  const a = generateMasu25Set('add', makeRng(1));
  const b = generateMasu25Set('add', makeRng(2));
  const sameOrder = a.every((q, i) => q.a === b[i].a && q.b === b[i].b);
  assert.equal(sameOrder, false);
});

test('generateMasu25Set: 未知の op は throw', () => {
  assert.throws(() => generateMasu25Set('div', makeRng(1)), /unknown op/);
});
