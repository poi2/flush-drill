import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  summarize,
  modeBreakdown,
  MODE_BREAKDOWN_DEFS,
} from '../src/stats/index.mjs';

// timezone に依存しないように UTC で 14 日ぶんを組み立てる。
function makeDays(todayStr) {
  const [y, mo, da] = todayStr.split('-').map(Number);
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(Date.UTC(y, mo - 1, da));
    d.setUTCDate(d.getUTCDate() - i);
    const yy = d.getUTCFullYear();
    const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(d.getUTCDate()).padStart(2, '0');
    days.push({
      key: `${yy}-${mm}-${dd}`,
      month: d.getUTCMonth() + 1,
      day: d.getUTCDate(),
    });
  }
  return days;
}

const FIXED_STATS = {
  '2020-01-01': {
    add: { c: 5, t: 10, s: 30 },
    sub: { c: 3, t: 10, s: 25 },
  },
  '2020-01-05': {
    add: { c: 8, t: 10, s: 40 },
    'train-h2k': { c: 6, t: 10, s: 35 },
  },
  '2020-01-10': {
    mul: { c: 10, t: 10, s: 50 },
  },
};

test('summarize: totalCorrect / totalSec は全日・全モードを合算する (B-11)', () => {
  const days = makeDays('2020-01-14');
  const s = summarize(FIXED_STATS, '2020-01-14', days);
  assert.equal(s.totalCorrect, 5 + 3 + 8 + 6 + 10);
  assert.equal(s.totalSec, 30 + 25 + 40 + 35 + 50);
});

test('summarize: todayCorrect / todaySec は today キーのぶんだけを合算する', () => {
  const days = makeDays('2020-01-05');
  const s = summarize(FIXED_STATS, '2020-01-05', days);
  assert.equal(s.todayCorrect, 8 + 6);
  assert.equal(s.todaySec, 40 + 35);
});

test('summarize: weekCorrect は today から遡って 7 日ぶんを合算する', () => {
  const days = makeDays('2020-01-10');
  const s = summarize(FIXED_STATS, '2020-01-10', days);
  // 直近7日: 2020-01-04〜2020-01-10
  // 01-05 (add:8 + train-h2k:6) と 01-10 (mul:10) が該当。01-01 は範囲外。
  assert.equal(s.weekCorrect, 8 + 6 + 10);
});

test('summarize: 未登録モードキーの記録も sum に含まれる (B-11 の非依存性)', () => {
  const stats = {
    '2020-01-01': { 'unknown-future-mode': { c: 42, t: 10, s: 100 } },
  };
  const days = makeDays('2020-01-01');
  const s = summarize(stats, '2020-01-01', days);
  assert.equal(s.totalCorrect, 42);
  assert.equal(s.todayCorrect, 42);
});

test('summarize: daily は days の順序どおりに 14 件の count を返す', () => {
  const days = makeDays('2020-01-14');
  const s = summarize(FIXED_STATS, '2020-01-14', days);
  assert.equal(s.daily.length, 14);
  const map = new Map(s.daily.map(d => [d.key, d.count]));
  assert.equal(map.get('2020-01-05'), 8 + 6);
  assert.equal(map.get('2020-01-10'), 10);
  assert.equal(map.get('2020-01-14'), 0);
});

test('modeBreakdown: count > 0 のモードのみ返す (B-13)', () => {
  const todayData = {
    add: { c: 5, t: 10, s: 30 },
    sub: { c: 0, t: 0, s: 0 },
  };
  const defs = [
    { key: 'add', label: 'たし' },
    { key: 'sub', label: 'ひき' },
  ];
  const r = modeBreakdown(todayData, defs);
  assert.equal(r.length, 1);
  assert.equal(r[0].key, 'add');
  assert.equal(r[0].count, 5);
});

test('modeBreakdown: 出力の順序は modeDefs の並びに従う', () => {
  const todayData = {
    add: { c: 1, t: 10, s: 5 },
    sub: { c: 2, t: 10, s: 5 },
    mul: { c: 3, t: 10, s: 5 },
  };
  const defs = [
    { key: 'mul', label: 'かけ' },
    { key: 'add', label: 'たし' },
    { key: 'sub', label: 'ひき' },
  ];
  const r = modeBreakdown(todayData, defs);
  assert.deepEqual(r.map(d => d.key), ['mul', 'add', 'sub']);
});

test('modeBreakdown: todayData が undefined でも空配列を返す', () => {
  assert.deepEqual(modeBreakdown(undefined, MODE_BREAKDOWN_DEFS), []);
  assert.deepEqual(modeBreakdown(null, MODE_BREAKDOWN_DEFS), []);
});

// 電車モードの記録が「モードべつ（きょう）」棒グラフに表示される。
// Phase 0 では意図的に fail する characterization test。Phase A で pass に変わる。
test('MODE_BREAKDOWN_DEFS: train-h2k / train-k2h が含まれる (B-13, AC-1)', () => {
  const keys = MODE_BREAKDOWN_DEFS.map(d => d.key);
  assert.ok(keys.includes('train-h2k'), 'train-h2k should be in MODE_BREAKDOWN_DEFS');
  assert.ok(keys.includes('train-k2h'), 'train-k2h should be in MODE_BREAKDOWN_DEFS');
});
