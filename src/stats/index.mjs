// 統計画面の集計ロジック。DOM を触らない純関数群。
// index.html の renderStats から呼ばれる。テスト対象。

/**
 * stats を受け取り、きょう / 7日 / ごうけい の合算値と直近14日の日別カウントを返す。
 *
 * @param {Object<string, Object<string, {c:number, t:number, s:number}>>} stats
 *   localStorage flushdrill_stats_v1 の内容: { [YYYY-MM-DD]: { [mode]: { c, t, s } } }
 * @param {string} todayKey 「きょう」を判定するための日付キー
 * @param {Array<{key:string, month:number, day:number}>} days
 *   直近14日ぶんの日付リスト（呼び出し側で構築する。timezone 依存を切り離すため）
 * @returns {{
 *   todayCorrect:number, weekCorrect:number, totalCorrect:number,
 *   todaySec:number,     weekSec:number,     totalSec:number,
 *   daily: Array<{key:string, month:number, day:number, count:number}>,
 * }}
 */
export function summarize(stats, todayKey, days) {
  const sumDay = (v) => Object.values(v || {}).reduce((s, m) => s + (m?.c || 0), 0);
  const sumDaySec = (v) => Object.values(v || {}).reduce((s, m) => s + (m?.s || 0), 0);
  let todayCorrect = 0, weekCorrect = 0, totalCorrect = 0;
  let todaySec = 0, weekSec = 0, totalSec = 0;
  Object.entries(stats).forEach(([k, v]) => {
    const c = sumDay(v);
    const s = sumDaySec(v);
    totalCorrect += c;
    totalSec += s;
    if (k === todayKey) { todayCorrect = c; todaySec = s; }
  });
  days.slice(-7).forEach(d => {
    weekCorrect += sumDay(stats[d.key]);
    weekSec += sumDaySec(stats[d.key]);
  });
  const daily = days.map(d => ({ ...d, count: sumDay(stats[d.key]) }));
  return { todayCorrect, weekCorrect, totalCorrect, todaySec, weekSec, totalSec, daily };
}

/**
 * 「モードべつ（きょう）」棒グラフのデータ。modeDefs の順序で回し、
 * count > 0 のものだけ返す（既存挙動を維持）。
 *
 * @param {Object<string, {c:number, t:number, s:number}>|null|undefined} todayData
 *   stats[today] に相当。未定義キーは 0 として扱う。
 * @param {Array<{key:string, label:string}>} modeDefs
 * @returns {Array<{key:string, label:string, count:number}>}
 */
export function modeBreakdown(todayData, modeDefs) {
  return modeDefs
    .map(d => ({ key: d.key, label: d.label, count: todayData?.[d.key]?.c || 0 }))
    .filter(d => d.count > 0);
}

// モード別グラフのラベル定義。Phase B のレジストリ導入で
// レジストリから派生させるようになるまでの過渡的な単一 source-of-truth。
// ここに集約したことで、モード追加時に触る場所が 1 箇所に減っている。
export const MODE_BREAKDOWN_DEFS = [
  { key: 'add', label: 'たし' },
  { key: 'sub', label: 'ひき' },
  { key: 'mul', label: 'かけ' },
  { key: 'ten-comp', label: '10あ' },
  { key: 'parity', label: '偶奇' },
  { key: 'k2r', label: '漢→読' },
  { key: 'r2k', label: '読→漢' },
  { key: 'ksent', label: '文中' },
  { key: 'hira-to-kata', label: 'あ→ア' },
  { key: 'kata-to-hira', label: 'ア→あ' },
  { key: 'antonym', label: '反対' },
  { key: 'ja-to-en', label: '日→英' },
  { key: 'en-to-ja', label: '英→日' },
  { key: 'clock', label: 'とけい' },
  { key: 'season', label: '季節' },
  { key: 'group', label: '仲間' },
  { key: 'train-h2k', label: '駅→漢' },
  { key: 'train-k2h', label: '漢→駅' },
];
