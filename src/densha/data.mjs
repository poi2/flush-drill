// でんしゃドリル (駅名・路線名の 4 択) 用マスタデータ。
// 説明文は Wikipedia を参照して子ども向けに書き下したもの。実行時に外部 fetch はしない。

/**
 * @typedef {Object} TrainEntry
 * @property {string} kanji         漢字表記 (例: '品川' '東海道新幹線')
 * @property {string} hiragana      ひらがな表記 (例: 'しながわ' 'とうかいどうしんかんせん')
 * @property {'station'|'line'} kind
 * @property {string[]} lines       所属路線 ID の配列 (station は 1〜複数、line は自身 1 個)
 * @property {string} description   子ども向け 1〜3 文の説明 (60〜200 文字目安)
 */

/** 路線 ID の一覧。station エントリの `lines` と、line エントリの `lines`（自身 1 個）で使う。 */
export const LINES = Object.freeze({
  keikyu: 'keikyu',
  yokohama: 'yokohama',
  negishi: 'negishi',
  keihinTohoku: 'keihin-tohoku',
  yokosuka: 'yokosuka',
  tokaido: 'tokaido',
  shinkansenTokaido: 'shinkansen-tokaido',
  shinkansenTohoku: 'shinkansen-tohoku',
  shinkansenSanyo: 'shinkansen-sanyo',
  shinkansenHokuriku: 'shinkansen-hokuriku',
  shinkansenKyushu: 'shinkansen-kyushu',
  shinkansenHokkaido: 'shinkansen-hokkaido',
  shinkansenJoetsu: 'shinkansen-joetsu',
  shinkansenNishikyushu: 'shinkansen-nishikyushu',
});

/** @type {TrainEntry[]} */
export const TRAIN_ENTRIES = [];
