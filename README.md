# フラッシュドリル

小学生向けのフラッシュドリル。iPhone Safari 想定。現在は算数（1〜2年生）と、漢字（漢検 10 級）に対応。他ジャンルも順次追加予定。

## つかいかた

GitHub Pages で公開したあと、iPhone の Safari で URL を開き、「ホーム画面に追加」しておくとアプリのように使えます。

## いまつかえる もんだい

### さんすう

- たしざん（1〜9 + 1〜9、答え 2〜18）
- ひきざん（〜18 の範囲、答えは 0 以上）
- かけざん（1〜9 の段 順序出題／ランダム1: 1〜5／ランダム2: 段しぼり／ランダム3: 1〜9）

### こくご（漢検 10 級）

- かんじ ➡ よみ（漢字を見て読みを 4 択）
- よみ ➡ かんじ（読みを見て漢字を 4 択）
- ぶんの なかの よみ（例文中の漢字の読みを 4 択）

漢字は書く練習ではなく、認識を高速化する目的でテンポよく反復できるようにしています。データは `kanji.jsonl`（1 文字 1 レコード）から生成しており、誤答は各エントリの `similar` から作られます。

1セット10問。結果は `localStorage` に日付ごとに記録され、直近14日の正解数を棒グラフで確認できます。

## GitHub Pages の有効化

1. GitHub リポジトリの Settings → Pages
2. Source を `Deploy from a branch` にして `main` / `/ (root)` を選択
3. 数分後、`https://<username>.github.io/flush-drill/` で公開されます

## ローカルで開く

漢字モードは ES モジュールと `kanji.jsonl` の fetch を使うため、静的サーバー経由で開いてください。

```
python3 -m http.server 8000
# → http://localhost:8000/
```

`file://` から直接開くと漢字モードのロードに失敗します（算数モードは動きます）。

## ディレクトリ構成

```
index.html               # UI・イベント配線
kanji.jsonl              # 漢検 10 級の 80 文字辞書
src/kanji/
  parse.mjs              # JSONL → Dictionary
  random.mjs             # 決定的 RNG・shuffle
  generator.mjs          # 3 種の ProblemGenerator（純粋関数）
tests/
  kanji-generator.test.mjs
```

## テスト

漢字 Generator のユニットテストは Node の組み込みテストランナーで動きます。

```
node --test tests/
```
