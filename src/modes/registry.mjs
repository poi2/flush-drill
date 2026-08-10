// モードレジストリ = 出題モードの単一 source-of-truth。
// メニューボタン / dispatcher / restart / stats / questionsPerSet は
// すべてこのファイルを参照する。モードを追加するときはここに 1 行足せば
// 各導線が自動で動く（画面色を付けたい場合は追加で CSS に 1 行）。

import { generateHiraToKata, generateKataToHira, generateAntonym } from '../kokugo/generator.mjs';
import { generateTenComp, generateParity } from '../sansu/generator.mjs';
import { generateJaToEn, generateEnToJa } from '../eigo/generator.mjs';
import { generateSeason, generateGroup } from '../seikatsu/generator.mjs';
import { generateTrainHiraToKanji, generateTrainKanjiToHira } from '../densha/generator.mjs';

// メニュー上部の見出し。CATEGORIES の順序で描画される。
export const CATEGORIES = [
  { key: 'arith',    heading: 'さんすう' },
  { key: 'kokugo',   heading: 'こくご' },
  { key: 'eigo',     heading: 'えいご' },
  { key: 'seikatsu', heading: 'りか・せいかつ・しゃかい' },
  { key: 'densha',   heading: 'でんしゃ' },
];

// モード kind の意味:
// - 'keypad': 数値入力 (add/sub/mul)。KeypadPresenter で扱う。
// - 'kanji' : かんじサブメニューの親。実 state.mode は subModes[].key。
// - 'clock' : とけい。SVG 時計盤 + 4 択。
// - 'choice': 汎用 4 択。generator を直接持つ。
// Phase D で kanji/clock/choice の Presenter を統合予定。
//
// subMenu: 'mul' | 'kanji' | undefined
//   'mul'  → mulMenu 画面を挟んで keypad Presenter に入る
//   'kanji'→ kanjiMenu 画面を挟んで kanji Presenter に入る
//
// questionsPerSet: 1 セットの出題数。未指定なら 10。
//   反射的に反復する量が少なすぎるモード (add / sub) だけ増やす。
export const MODES = [
  // さんすう
  { key: 'add',      category: 'arith', label: 'たしざん',        shortLabel: 'たし', emoji: '➕',  kind: 'keypad', symbol: '＋', questionsPerSet: 20 },
  { key: 'sub',      category: 'arith', label: 'ひきざん',        shortLabel: 'ひき', emoji: '➖',  kind: 'keypad', symbol: '－', questionsPerSet: 20 },
  { key: 'mul',      category: 'arith', label: 'かけざん',        shortLabel: 'かけ', emoji: '✖️', kind: 'keypad', symbol: '×',  subMenu: 'mul' },
  { key: 'ten-comp', category: 'arith', label: '10 の あわせて', shortLabel: '10あ', emoji: '🔟', kind: 'choice', generator: generateTenComp },
  { key: 'parity',   category: 'arith', label: 'ぐうすう・きすう', shortLabel: '偶奇', emoji: '⚖️', kind: 'choice', generator: generateParity },

  // こくご
  {
    key: 'kanji', category: 'kokugo', label: 'かんじ', emoji: '漢', kind: 'kanji', subMenu: 'kanji',
    subModes: [
      { key: 'k2r',   label: 'かんじ ➡ よみ',      shortLabel: '漢→読' },
      { key: 'r2k',   label: 'よみ ➡ かんじ',      shortLabel: '読→漢' },
      { key: 'ksent', label: 'ぶんの なかの よみ', shortLabel: '文中'   },
    ],
  },
  { key: 'hira-to-kata', category: 'kokugo', label: 'ひらがな ➡ カタカナ', shortLabel: 'あ→ア', emoji: 'ア', kind: 'choice', generator: generateHiraToKata },
  { key: 'kata-to-hira', category: 'kokugo', label: 'カタカナ ➡ ひらがな', shortLabel: 'ア→あ', emoji: 'あ', kind: 'choice', generator: generateKataToHira },
  { key: 'antonym',      category: 'kokugo', label: 'はんたい ことば',    shortLabel: '反対',  emoji: '⇔', kind: 'choice', generator: generateAntonym },

  // えいご
  { key: 'ja-to-en', category: 'eigo', label: 'にほんご ➡ えいご', shortLabel: '日→英', emoji: 'A',  kind: 'choice', generator: generateJaToEn },
  { key: 'en-to-ja', category: 'eigo', label: 'えいご ➡ にほんご', shortLabel: '英→日', emoji: '🔠', kind: 'choice', generator: generateEnToJa },

  // りか・せいかつ・しゃかい
  { key: 'clock',  category: 'seikatsu', label: 'とけい',           shortLabel: 'とけい', emoji: '🕐', kind: 'clock' },
  { key: 'season', category: 'seikatsu', label: 'きせつの ことば', shortLabel: '季節',   emoji: '🌸', kind: 'choice', generator: generateSeason },
  { key: 'group',  category: 'seikatsu', label: 'なかまわけ',       shortLabel: '仲間',   emoji: '🍎', kind: 'choice', generator: generateGroup },

  // でんしゃ
  { key: 'train-h2k', category: 'densha', label: 'ひらがな ➡ かんじ (でんしゃ)', shortLabel: '駅→漢', emoji: '🚃', kind: 'choice', generator: generateTrainHiraToKanji },
  { key: 'train-k2h', category: 'densha', label: 'かんじ ➡ ひらがな (でんしゃ)', shortLabel: '漢→駅', emoji: '🚄', kind: 'choice', generator: generateTrainKanjiToHira },
];

// state.mode（= localStorage キー）→ 表示情報の Map。
// kanji のような subModes を持つエントリは各 sub を平坦化して収める。
// parent は Presenter 判定 (kind の継承) と restart 分岐で使う。
export const STATE_MODES = new Map();
for (const m of MODES) {
  if (m.subModes) {
    for (const sm of m.subModes) {
      STATE_MODES.set(sm.key, { key: sm.key, label: sm.label, shortLabel: sm.shortLabel, parent: m });
    }
  } else {
    STATE_MODES.set(m.key, { key: m.key, label: m.label, shortLabel: m.shortLabel, parent: null });
  }
}

// state.mode の kind を返す。subMode は親から継承。
export function kindOfStateMode(stateMode) {
  const sm = STATE_MODES.get(stateMode);
  if (!sm) return null;
  return sm.parent ? sm.parent.kind : MODES.find(x => x.key === stateMode)?.kind ?? null;
}

// モードべつ棒グラフのラベル定義。レジストリから派生 = 追加漏れが構造的に起きない。
export const MODE_BREAKDOWN_DEFS = Array.from(
  STATE_MODES.values(),
  m => ({ key: m.key, label: m.shortLabel }),
);
