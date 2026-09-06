// 100 ます計算タイム推移の折れ線モデル。SVG 描画は index.html 側だが、
// 座標計算とスケーリングは純関数として本モジュールに閉じ込める。
//
// 3 演算 (add/sub/mul) のシリーズを、attempt 番号 (1..N) を X 軸、
// 秒を Y 軸として同一プロット上に描く。上限は各系列で独立ではなく
// 「表示範囲全体の最大 attempt 数 / 最大秒数」に揃えて比較できるようにする。

import { OPS } from './storage.mjs';

const DEFAULT_WIDTH = 320;
const DEFAULT_HEIGHT = 160;
const PAD_LEFT = 34;
const PAD_RIGHT = 8;
const PAD_TOP = 8;
const PAD_BOTTOM = 22;

const COLORS = {
  add: '#1e88e5',
  sub: '#fb8c00',
  mul: '#43a047',
};

const LABELS = {
  add: 'たし',
  sub: 'ひき',
  mul: 'かけ',
};

/**
 * @typedef {Object} Series
 * @property {'add'|'sub'|'mul'} op
 * @property {string} color
 * @property {string} label
 * @property {Array<{x:number, y:number, sec:number, attempt:number}>} points
 */

/**
 * @typedef {Object} LineChartModel
 * @property {number} width
 * @property {number} height
 * @property {{left:number, right:number, top:number, bottom:number}} pad
 * @property {number} xMax  最大 attempt 数 (>= 1)
 * @property {number} yMax  Y 軸最大値 (秒)
 * @property {Array<{value:number, y:number, label:string}>} yTicks
 * @property {Series[]} series  attempt が 1 件以上ある op のみ
 * @property {boolean} empty  全 op で attempt 0 なら true
 */

/**
 * 上端 Y 値を「切りの良い数字」に丸める。60 秒未満なら 10 秒刻み、
 * それ以降は 30 秒刻みで切り上げる。表示上の見やすさ優先。
 */
function niceCeil(v) {
  if (v <= 0) return 30;
  if (v <= 30) return Math.ceil(v / 10) * 10;
  if (v <= 300) return Math.ceil(v / 30) * 30;
  return Math.ceil(v / 60) * 60;
}

function formatSec(sec) {
  const s = Math.max(0, Math.round(sec));
  if (s < 60) return `${s}秒`;
  const m = Math.floor(s / 60);
  const rem = s % 60;
  return rem === 0 ? `${m}分` : `${m}:${String(rem).padStart(2, '0')}`;
}

/**
 * @param {{add: Array<{sec:number}>, sub: Array<{sec:number}>, mul: Array<{sec:number}>}} attemptsByOp
 * @param {{width?:number, height?:number}} [opts]
 * @returns {LineChartModel}
 */
export function buildLineChartModel(attemptsByOp, opts = {}) {
  const width = opts.width ?? DEFAULT_WIDTH;
  const height = opts.height ?? DEFAULT_HEIGHT;
  const pad = { left: PAD_LEFT, right: PAD_RIGHT, top: PAD_TOP, bottom: PAD_BOTTOM };

  const active = OPS
    .map(op => ({ op, list: (attemptsByOp?.[op] ?? []).filter(a => Number.isFinite(a?.sec)) }))
    .filter(({ list }) => list.length > 0);

  if (active.length === 0) {
    return { width, height, pad, xMax: 1, yMax: 30, yTicks: [], series: [], empty: true };
  }

  const xMax = Math.max(1, ...active.map(({ list }) => list.length));
  const maxSec = Math.max(1, ...active.flatMap(({ list }) => list.map(a => a.sec)));
  const yMax = niceCeil(maxSec);

  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  // attempt 1 件だけの op はプロット幅を等分するとつぶれるので、
  // 1 件のときは中央、2 件以上のときは左端〜右端に等間隔で置く。
  function xOf(attempt, seriesLen) {
    if (xMax === 1) return pad.left + plotW / 2;
    return pad.left + ((attempt - 1) / (xMax - 1)) * plotW;
  }
  function yOf(sec) {
    return pad.top + (1 - sec / yMax) * plotH;
  }

  const series = active.map(({ op, list }) => ({
    op,
    color: COLORS[op],
    label: LABELS[op],
    points: list.map((a, i) => ({
      attempt: i + 1,
      sec: a.sec,
      x: xOf(i + 1, list.length),
      y: yOf(a.sec),
    })),
  }));

  // Y 軸の目盛は 0 と yMax の 2 本を最低限、余裕があれば中間 1〜2 本。
  const tickValues = [0];
  if (yMax >= 60) {
    tickValues.push(Math.round(yMax / 3), Math.round((yMax / 3) * 2));
  } else {
    tickValues.push(Math.round(yMax / 2));
  }
  tickValues.push(yMax);
  const yTicks = tickValues.map(v => ({ value: v, y: yOf(v), label: formatSec(v) }));

  return { width, height, pad, xMax, yMax, yTicks, series, empty: false };
}

export const CHART_COLORS = COLORS;
export const CHART_LABELS = LABELS;
