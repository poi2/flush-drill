import { test } from 'node:test';
import assert from 'node:assert/strict';

import { buildLineChartModel, CHART_COLORS } from '../src/masu25/lineChart.mjs';

test('全 op で attempt 0 なら empty: true, series 空', () => {
  const m = buildLineChartModel({ add: [], sub: [], mul: [] });
  assert.equal(m.empty, true);
  assert.deepEqual(m.series, []);
});

test('1 op のみ attempt あり: series はその 1 本のみ', () => {
  const m = buildLineChartModel({
    add: [{ sec: 80 }, { sec: 60 }, { sec: 50 }],
    sub: [], mul: [],
  });
  assert.equal(m.empty, false);
  assert.equal(m.series.length, 1);
  assert.equal(m.series[0].op, 'add');
  assert.equal(m.series[0].color, CHART_COLORS.add);
  assert.equal(m.series[0].points.length, 3);
});

test('X 座標: 全 op の attempt 数が 1 なら中央', () => {
  const m = buildLineChartModel({
    add: [{ sec: 30 }],
    sub: [{ sec: 30 }],
    mul: [],
  });
  const plotMidX = m.pad.left + (m.width - m.pad.left - m.pad.right) / 2;
  assert.equal(m.xMax, 1);
  for (const s of m.series) {
    assert.equal(s.points[0].x, plotMidX);
  }
});

test('X 座標: 複数点は左端〜右端に等間隔、少数側は左詰め', () => {
  const m = buildLineChartModel({
    add: [{ sec: 30 }],
    sub: [{ sec: 30 }, { sec: 30 }, { sec: 30 }, { sec: 30 }],
    mul: [],
  });
  const add = m.series.find(s => s.op === 'add');
  const sub = m.series.find(s => s.op === 'sub');
  assert.equal(m.xMax, 4);
  // add は attempt 1 のみ = 左端
  assert.equal(add.points[0].x, m.pad.left);
  // sub は attempt 1..4 で左端〜右端
  assert.equal(sub.points[0].x, m.pad.left);
  assert.equal(sub.points[3].x, m.width - m.pad.right);
});

test('Y 軸: yMax は maxSec 以上、niceCeil で切り上げ', () => {
  const m1 = buildLineChartModel({ add: [{ sec: 55 }], sub: [], mul: [] });
  assert.ok(m1.yMax >= 55);
  const m2 = buildLineChartModel({ add: [{ sec: 200 }], sub: [], mul: [] });
  assert.ok(m2.yMax >= 200);
});

test('Y 軸: 上ほど y が小さい (SVG 座標)', () => {
  const m = buildLineChartModel({
    add: [{ sec: 20 }, { sec: 80 }],
    sub: [], mul: [],
  });
  const [p0, p1] = m.series[0].points;
  assert.ok(p0.y > p1.y, `slower sec should render lower on screen (larger y): p0.y=${p0.y}, p1.y=${p1.y}`);
});

test('yTicks: 0 と yMax を含み昇順 (値順)', () => {
  const m = buildLineChartModel({ add: [{ sec: 120 }], sub: [], mul: [] });
  const values = m.yTicks.map(t => t.value);
  assert.equal(values[0], 0);
  assert.equal(values[values.length - 1], m.yMax);
  for (let i = 1; i < values.length; i++) {
    assert.ok(values[i] >= values[i - 1]);
  }
});
