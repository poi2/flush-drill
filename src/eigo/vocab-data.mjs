/**
 * 1〜2 年生向けの英単語 vocab。カテゴリ別に持ち、
 * ダミーは同カテゴリから優先して取ることで「消去法」ではなく
 * 語彙判断が必要になるようにする。
 *
 * ひらがな側は同音異義（はな＝鼻/花、あめ＝雨/飴 など）を避けるため、
 * 各語がリスト全体で一意になるよう選定してある。
 *
 * @typedef {Object} VocabEntry
 * @property {string} ja
 * @property {string} en
 * @property {string} cat  カテゴリキー（ダミー選択肢の絞り込みに使う）
 */

/** @type {VocabEntry[]} */
export const VOCAB = [
  // animals
  { ja: 'いぬ', en: 'dog', cat: 'animal' },
  { ja: 'ねこ', en: 'cat', cat: 'animal' },
  { ja: 'とり', en: 'bird', cat: 'animal' },
  { ja: 'さかな', en: 'fish', cat: 'animal' },
  { ja: 'うし', en: 'cow', cat: 'animal' },
  { ja: 'ぶた', en: 'pig', cat: 'animal' },
  { ja: 'うま', en: 'horse', cat: 'animal' },
  { ja: 'ひつじ', en: 'sheep', cat: 'animal' },
  { ja: 'さる', en: 'monkey', cat: 'animal' },
  { ja: 'ぞう', en: 'elephant', cat: 'animal' },
  { ja: 'ライオン', en: 'lion', cat: 'animal' },
  { ja: 'とら', en: 'tiger', cat: 'animal' },
  { ja: 'くま', en: 'bear', cat: 'animal' },
  { ja: 'うさぎ', en: 'rabbit', cat: 'animal' },
  { ja: 'ねずみ', en: 'mouse', cat: 'animal' },

  // colors
  { ja: 'あか', en: 'red', cat: 'color' },
  { ja: 'あお', en: 'blue', cat: 'color' },
  { ja: 'きいろ', en: 'yellow', cat: 'color' },
  { ja: 'みどり', en: 'green', cat: 'color' },
  { ja: 'しろ', en: 'white', cat: 'color' },
  { ja: 'くろ', en: 'black', cat: 'color' },
  { ja: 'ピンク', en: 'pink', cat: 'color' },
  { ja: 'むらさき', en: 'purple', cat: 'color' },
  { ja: 'ちゃいろ', en: 'brown', cat: 'color' },

  // numbers (ja はひらがな表記で表音固定)
  { ja: 'いち', en: 'one', cat: 'number' },
  { ja: 'に', en: 'two', cat: 'number' },
  { ja: 'さん', en: 'three', cat: 'number' },
  { ja: 'よん', en: 'four', cat: 'number' },
  { ja: 'ご', en: 'five', cat: 'number' },
  { ja: 'ろく', en: 'six', cat: 'number' },
  { ja: 'なな', en: 'seven', cat: 'number' },
  { ja: 'はち', en: 'eight', cat: 'number' },
  { ja: 'きゅう', en: 'nine', cat: 'number' },
  { ja: 'じゅう', en: 'ten', cat: 'number' },

  // fruits
  { ja: 'りんご', en: 'apple', cat: 'fruit' },
  { ja: 'バナナ', en: 'banana', cat: 'fruit' },
  { ja: 'ぶどう', en: 'grape', cat: 'fruit' },
  { ja: 'レモン', en: 'lemon', cat: 'fruit' },
  { ja: 'もも', en: 'peach', cat: 'fruit' },
  { ja: 'いちご', en: 'strawberry', cat: 'fruit' },
  { ja: 'メロン', en: 'melon', cat: 'fruit' },

  // food
  { ja: 'パン', en: 'bread', cat: 'food' },
  { ja: 'ごはん', en: 'rice', cat: 'food' },
  { ja: 'たまご', en: 'egg', cat: 'food' },
  { ja: 'ぎゅうにゅう', en: 'milk', cat: 'food' },
  { ja: 'みず', en: 'water', cat: 'food' },
  { ja: 'おちゃ', en: 'tea', cat: 'food' },
  { ja: 'ジュース', en: 'juice', cat: 'food' },
  { ja: 'ケーキ', en: 'cake', cat: 'food' },

  // body
  { ja: 'あたま', en: 'head', cat: 'body' },
  { ja: 'め', en: 'eye', cat: 'body' },
  { ja: 'みみ', en: 'ear', cat: 'body' },
  { ja: 'はな', en: 'nose', cat: 'body' },
  { ja: 'くち', en: 'mouth', cat: 'body' },
  { ja: 'て', en: 'hand', cat: 'body' },
  { ja: 'あし', en: 'foot', cat: 'body' },

  // daily
  { ja: 'ほん', en: 'book', cat: 'daily' },
  { ja: 'えんぴつ', en: 'pencil', cat: 'daily' },
  { ja: 'かばん', en: 'bag', cat: 'daily' },
  { ja: 'いす', en: 'chair', cat: 'daily' },
  { ja: 'つくえ', en: 'desk', cat: 'daily' },
  { ja: 'コップ', en: 'cup', cat: 'daily' },
  { ja: 'ボール', en: 'ball', cat: 'daily' },

  // nature
  { ja: 'たいよう', en: 'sun', cat: 'nature' },
  { ja: 'つき', en: 'moon', cat: 'nature' },
  { ja: 'ほし', en: 'star', cat: 'nature' },
  { ja: 'そら', en: 'sky', cat: 'nature' },
  { ja: 'ゆき', en: 'snow', cat: 'nature' },
  { ja: 'やま', en: 'mountain', cat: 'nature' },
  { ja: 'かわ', en: 'river', cat: 'nature' },
  { ja: 'うみ', en: 'sea', cat: 'nature' },

  // vehicles
  { ja: 'くるま', en: 'car', cat: 'vehicle' },
  { ja: 'バス', en: 'bus', cat: 'vehicle' },
  { ja: 'でんしゃ', en: 'train', cat: 'vehicle' },
  { ja: 'ひこうき', en: 'plane', cat: 'vehicle' },
  { ja: 'ふね', en: 'ship', cat: 'vehicle' },
  { ja: 'じてんしゃ', en: 'bike', cat: 'vehicle' },
];
