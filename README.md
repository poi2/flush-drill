# さんすうフラッシュドリル

小学1〜2年生向けの算数フラッシュドリル。iPhone Safari 想定。

## つかいかた

GitHub Pages で公開したあと、iPhone の Safari で URL を開き、「ホーム画面に追加」しておくとアプリのように使えます。

## モード

- たしざん（1〜9 + 1〜9、答え 2〜18）
- ひきざん（〜18 の範囲、答えは 0 以上）
- かけざん（九九：1〜9 × 1〜9）

1セット10問。結果は `localStorage` に日付ごとに記録され、直近14日の正解数を棒グラフで確認できます。

## GitHub Pages の有効化

1. GitHub リポジトリの Settings → Pages
2. Source を `Deploy from a branch` にして `main` / `/ (root)` を選択
3. 数分後、`https://<username>.github.io/flush-drill/` で公開されます

## ローカルで開く

`index.html` をブラウザで開くだけで動きます。
