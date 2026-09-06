// 100 ます計算の attempt 履歴の永続化と集計。DOM を触らない純関数群。
// localStorage キーは `flushdrill_stats_v1` とは独立。
//
// 保存形式:
//   { add: Attempt[], sub: Attempt[], mul: Attempt[] }
// Attempt = { date: 'YYYY-MM-DD', sec: number, mistakes: number, at: number }
//   - date: 完了日 (集計用)
//   - sec:  最初の 1 問表示〜100 問目正答までの秒数 (小数 1 桁で丸め)
//   - mistakes: 誤答クリック数 (途中脱落は保存されないので、常に完走時の数)
//   - at:  完了時刻 (epoch ms)。同日中の attempt 並び順にも使う。

export const OPS = /** @type {const} */ (['add', 'sub', 'mul']);
export const STORAGE_KEY = 'flushdrill_100masu_v1';

/**
 * @typedef {Object} Masu100Attempt
 * @property {string} date  'YYYY-MM-DD'
 * @property {number} sec
 * @property {number} mistakes
 * @property {number} at
 */

function emptyStore() {
  return { add: [], sub: [], mul: [] };
}

/**
 * 生の store を正規化。壊れたキーを補完し、想定外のキーを無視する。
 * @returns {{add: Masu100Attempt[], sub: Masu100Attempt[], mul: Masu100Attempt[]}}
 */
export function normalize(raw) {
  const out = emptyStore();
  if (!raw || typeof raw !== 'object') return out;
  for (const op of OPS) {
    const list = Array.isArray(raw[op]) ? raw[op] : [];
    out[op] = list
      .filter(a => a && typeof a.sec === 'number' && Number.isFinite(a.sec))
      .map(a => ({
        date: String(a.date || ''),
        sec: Number(a.sec),
        mistakes: Number.isFinite(a.mistakes) ? Number(a.mistakes) : 0,
        at: Number.isFinite(a.at) ? Number(a.at) : 0,
      }));
  }
  return out;
}

/**
 * attempts に 1 件追加した新しい store を返す (元の store は変更しない)。
 * 完了時刻順を維持したいので、末尾に push する運用を前提にする。
 * @param {ReturnType<typeof normalize>} store
 * @param {'add'|'sub'|'mul'} op
 * @param {Masu100Attempt} attempt
 * @returns {ReturnType<typeof normalize>}
 */
export function appendAttempt(store, op, attempt) {
  if (!OPS.includes(op)) throw new Error(`unknown op: ${op}`);
  const next = normalize(store);
  next[op] = [...next[op], attempt];
  return next;
}

/**
 * 演算ごとの直近 N 件を昇順 (古い→新しい) で返す。
 * @param {ReturnType<typeof normalize>} store
 * @param {number} limit
 */
export function recentByOp(store, limit) {
  const s = normalize(store);
  const out = {};
  for (const op of OPS) {
    const all = s[op];
    out[op] = all.slice(Math.max(0, all.length - limit));
  }
  return out;
}

/**
 * 各演算の best (最速) タイムを返す。attempt なしのキーは null。
 * @param {ReturnType<typeof normalize>} store
 * @returns {{add:number|null, sub:number|null, mul:number|null}}
 */
export function bestTimes(store) {
  const s = normalize(store);
  const out = {};
  for (const op of OPS) {
    if (!s[op].length) { out[op] = null; continue; }
    out[op] = s[op].reduce((min, a) => a.sec < min ? a.sec : min, Infinity);
  }
  return out;
}
