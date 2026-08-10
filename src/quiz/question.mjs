// Question 型定義。全 generator が返す出題オブジェクトの共通契約を
// JSDoc typedef で明示する。Presenter はこの型で分岐する。
//
// 既存 generator の返却プロパティは維持したまま、
// `kind: 'choice' | 'keypad'` を新規プロパティとして追加する。
// kanji generator の内部分類 `type: 'choice' | 'sentence'` とは別物
// （kanji.type は subtype と対で内部レンダラを選ぶ意味を持つ）。

/**
 * @typedef {Object} ChoiceQuestion
 *   4 択形式の出題。ChoicePresenter が扱う。
 * @property {'choice'} kind
 * @property {string}   subtype    generator 側の判別（'ten-comp' 'season' 'kanji-to-reading' 等）
 * @property {string}   [question] プロンプトに表示する文字列。dedupe の一意キーにも使う。
 *                                   kanji-sent サブタイプでは sentence/target を代わりに使うため省略される。
 * @property {string[]} choices    ボタンに表示するラベル 4 個
 * @property {number}   answerIndex 正解の choices インデックス (0..3)
 * @property {'choice'|'sentence'} [type]  kanji generator 固有の内部タグ。Presenter は使わず
 *                                   generator 側の分岐 (sentence-reading と k2r/r2k を分ける) と
 *                                   既存テストとの後方互換のためだけに残っている。上の `kind` とは別物。
 * @property {string}   [description]  正解時に補足表示する説明（電車の駅説明など）
 * @property {string}   [sentence] kanji-sent 出題の文章
 * @property {string}   [target]   kanji-sent 出題の対象語（sentence 中でハイライトする）
 * @property {string}   [kanji]    kanji 出題のもとエントリ（デバッグ / 統計用）
 * @property {number}   [h]        clock 出題の時
 * @property {number}   [m]        clock 出題の分
 * @property {Array<{h:number,m:number}>} [options]  clock 出題の choice ごとの h/m 詳細
 */

/**
 * @typedef {Object} KeypadQuestion
 *   数値キーパッド入力形式の出題。KeypadPresenter が扱う。
 * @property {'keypad'} kind
 * @property {number}   a          左オペランド
 * @property {number}   b          右オペランド
 * @property {number}   ans        正解の数値
 * @property {string}   symbol     演算子表記（'＋' '－' '×'）
 */

/**
 * @typedef {ChoiceQuestion | KeypadQuestion} Question
 */

// no runtime exports; typedef only
export const KIND_CHOICE = /** @type {const} */ ('choice');
export const KIND_KEYPAD = /** @type {const} */ ('keypad');
