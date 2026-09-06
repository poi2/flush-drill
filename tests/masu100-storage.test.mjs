import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  normalize,
  appendAttempt,
  recentByOp,
  bestTimes,
  OPS,
  STORAGE_KEY,
} from '../src/masu100/storage.mjs';

test('STORAGE_KEY / OPS がエクスポートされている', () => {
  assert.equal(STORAGE_KEY, 'flushdrill_100masu_v1');
  assert.deepEqual([...OPS], ['add', 'sub', 'mul']);
});

test('normalize: null / undefined / 非オブジェクトは 3 空配列', () => {
  for (const v of [null, undefined, 'x', 5, []]) {
    const n = normalize(v);
    assert.deepEqual(n, { add: [], sub: [], mul: [] });
  }
});

test('normalize: 数値でない sec は除外、mistakes 欠損は 0', () => {
  const n = normalize({
    add: [{ date: '2026-01-01', sec: 88.5 }, { date: 'x', sec: 'nope' }],
    sub: [{ date: '2026-01-02', sec: 120, mistakes: 2, at: 100 }],
    mul: 'nope',
  });
  assert.equal(n.add.length, 1);
  assert.equal(n.add[0].sec, 88.5);
  assert.equal(n.add[0].mistakes, 0);
  assert.equal(n.sub[0].mistakes, 2);
  assert.equal(n.sub[0].at, 100);
  assert.deepEqual(n.mul, []);
});

test('appendAttempt: 元 store は変更されず、指定 op に末尾追加', () => {
  const s0 = normalize({});
  const s1 = appendAttempt(s0, 'add', { date: '2026-01-01', sec: 55.2, mistakes: 1, at: 100 });
  const s2 = appendAttempt(s1, 'add', { date: '2026-01-02', sec: 48.0, mistakes: 0, at: 200 });
  assert.equal(s0.add.length, 0);
  assert.equal(s1.add.length, 1);
  assert.equal(s2.add.length, 2);
  assert.equal(s2.add[1].sec, 48.0);
});

test('appendAttempt: 未知 op は throw', () => {
  const s0 = normalize({});
  assert.throws(() => appendAttempt(s0, 'div', { date: 'x', sec: 1 }), /unknown op/);
});

test('recentByOp: op ごとに末尾 N 件（古い順）', () => {
  let s = normalize({});
  for (let i = 1; i <= 5; i++) {
    s = appendAttempt(s, 'mul', { date: `2026-01-0${i}`, sec: i * 10, mistakes: 0, at: i });
  }
  const r = recentByOp(s, 3);
  assert.equal(r.mul.length, 3);
  assert.deepEqual(r.mul.map(a => a.sec), [30, 40, 50]);
  assert.deepEqual(r.add, []);
});

test('bestTimes: 各 op 最速、空は null', () => {
  let s = normalize({});
  s = appendAttempt(s, 'add', { date: 'd', sec: 80, mistakes: 0, at: 1 });
  s = appendAttempt(s, 'add', { date: 'd', sec: 62.5, mistakes: 0, at: 2 });
  s = appendAttempt(s, 'add', { date: 'd', sec: 74, mistakes: 0, at: 3 });
  s = appendAttempt(s, 'sub', { date: 'd', sec: 100, mistakes: 0, at: 4 });
  const b = bestTimes(s);
  assert.equal(b.add, 62.5);
  assert.equal(b.sub, 100);
  assert.equal(b.mul, null);
});
