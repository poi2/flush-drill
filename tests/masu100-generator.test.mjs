import { test } from 'node:test';
import assert from 'node:assert/strict';

import { makeRng } from '../src/kanji/random.mjs';
import { generate100masuSet } from '../src/masu100/generator.mjs';

function assertPairsExhaustive(set, expectedPairs) {
  const seen = new Set(set.map(q => `${q.a},${q.b}`));
  assert.equal(seen.size, expectedPairs.length, `unique pairs = ${seen.size}, expected ${expectedPairs.length}`);
  for (const [a, b] of expectedPairs) {
    assert.ok(seen.has(`${a},${b}`), `missing pair ${a},${b}`);
  }
}

test('generate100masuSet(add): 1..10 x 1..10 の全 100 組を含み、答え a+b', () => {
  const set = generate100masuSet('add', makeRng(1));
  assert.equal(set.length, 100);
  const expected = [];
  for (let a = 1; a <= 10; a++) for (let b = 1; b <= 10; b++) expected.push([a, b]);
  assertPairsExhaustive(set, expected);
  for (const q of set) {
    assert.equal(q.kind, 'keypad');
    assert.equal(q.symbol, '＋');
    assert.equal(q.ans, q.a + q.b);
  }
});

test('generate100masuSet(sub): 11..20 - 1..10 の全 100 組、答えは常に非負', () => {
  const set = generate100masuSet('sub', makeRng(2));
  assert.equal(set.length, 100);
  const expected = [];
  for (let a = 11; a <= 20; a++) for (let b = 1; b <= 10; b++) expected.push([a, b]);
  assertPairsExhaustive(set, expected);
  for (const q of set) {
    assert.equal(q.symbol, '－');
    assert.equal(q.ans, q.a - q.b);
    assert.ok(q.ans >= 1, `ans should be >= 1: ${q.a}-${q.b}=${q.ans}`);
  }
});

test('generate100masuSet(mul): 1..10 x 1..10 の全 100 組、答え a*b', () => {
  const set = generate100masuSet('mul', makeRng(3));
  assert.equal(set.length, 100);
  for (const q of set) {
    assert.equal(q.symbol, '×');
    assert.equal(q.ans, q.a * q.b);
    assert.ok(q.a >= 1 && q.a <= 10 && q.b >= 1 && q.b <= 10);
  }
});

test('generate100masuSet: 同じ seed なら同じ順序（決定的）', () => {
  const a = generate100masuSet('mul', makeRng(42));
  const b = generate100masuSet('mul', makeRng(42));
  assert.deepEqual(a, b);
});

test('generate100masuSet: 別 seed なら順序が変わる', () => {
  const a = generate100masuSet('add', makeRng(1));
  const b = generate100masuSet('add', makeRng(2));
  // 稀に先頭が一致する可能性はあるが、100 要素すべて一致することはほぼない。
  const sameOrder = a.every((q, i) => q.a === b[i].a && q.b === b[i].b);
  assert.equal(sameOrder, false);
});

test('generate100masuSet: 未知の op は throw', () => {
  assert.throws(() => generate100masuSet('div', makeRng(1)), /unknown op/);
});
