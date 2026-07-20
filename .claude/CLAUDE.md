# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fast Logbook は Chrome 拡張機能（Manifest V3）。ポップアップとキーボードショートカットで作業時間を打刻し、テキスト/HTML/Markdown 形式でログをダウンロードできる。ビルドツールやフレームワークは使わず、ブラウザが直接読み込む素の ES Modules で構成されている。

## Commands

パッケージマネージャの設定（`package.json`）は存在しない。開発は素の HTML/CSS/JS ファイルを直接編集する。

### Lint

```bash
npx eslint js/* js/lib/*
```

CI（`.github/workflows/eslint.yml`）は push 時に `js/**` の変更ファイルのみを対象に ESLint を実行する。ルールは `.eslintrc.json` で定義（セミコロン必須、JSON/JSONC/JSON5 は `jsonc-eslint-parser` を使用）。

### 拡張機能の動作確認

自動テストは存在しない。変更後は Chrome の `chrome://extensions/` でデベロッパーモードを有効にし、このディレクトリを「パッケージ化されていない拡張機能を読み込む」で読み込んで手動確認する（README.md の Install 手順を参照）。

## Architecture

### ディレクトリ構成

- `manifest.json` — MV3 マニフェスト。`background.js` を module 型 service worker として登録、`storage`/`downloads` 権限を要求
- `js/background.js` — service worker。`chrome.commands.onCommand`（`log_download`, `open_options`）をハンドル
- `js/popup.js` — ポップアップ画面のロジック（打刻・ログ編集・ダウンロード起動）
- `js/options.js` — オプション画面のロジック（ショートカットタグ・丸め単位の設定）
- `js/lib/utils.js` — 共通ユーティリティ（`$` セレクタ、日時フォーマット、ログの整形）と `chrome.storage.sync` のキー定数（`LOG_DATA_KEY`, `ROUNDING_UNIT_MINUTE_KEY`）
- `js/lib/logger.js` — `console.*` の出力可否を制御する `Logger` クラス。`Log`（有効）/`enabled`/`diabled`（無効）をエクスポート
- `js/lib/i18n.js` — `data-i18n` 属性を持つ DOM ノードを `chrome.i18n.getMessage` で翻訳
- `js/lib/download.js` — ログのパース・集計・HTML/Markdown 変換・ダウンロード処理
- `html/popup.html`, `html/options.html` — 各画面。Bootstrap（`js/lib/bootstrap.bundle.min.js`, `css/bootstrap.min.css`）を使用
- `_locales/{ja,en}/messages.json` — i18n メッセージ。`default_locale` は `ja`

### データフロー

1. **打刻**: ポップアップで 1〜9 キー押下 → プリセットタグ（`shortcut_N`、`chrome.storage.sync` に保存済みならそちらを優先、無ければ i18n デフォルト）に `appendTime()` で日時を付与 → textarea に追記 → `chrome.storage.sync` に保存
2. **同期**: `chrome.storage.onChanged` リスナーでポップアップとオプション間の変更をリアルタイム反映
3. **ダウンロード**: `downloadLog()` がストレージからログ全文を取得 → `parse()` でカテゴリ別に集計 → `toHtml()`/`toMarkdown()` で整形し 1 ファイルにまとめて `chrome.downloads.download` で保存

### ログのデータ形式

1 行 = `"YYYY-MM-DD HH:MM" + カテゴリ [";" 詳細]`。

- `;` の前がカテゴリ（集計単位）、後ろが詳細（同一カテゴリ内で重複除去して結合）
- カテゴリ先頭が `^` の行は実働時間（`work_time_actual`）の集計から除外されるが、総計（`work_time_total`）には含まれる
- 各行の作業時間は「次の行の時刻 − この行の時刻」で算出し、`getRoundingUnit()` で選択した分単位（1/5/10/15/30/60）に丸める

### 設定の永続化

すべて `chrome.storage.sync` を使用。キーはプリセットタグ（`shortcut_1`〜`shortcut_9` に対応する `dataset.i18n` 値）、丸め単位（`ROUNDING_UNIT_MINUTE_KEY`）、ログ本体（`LOG_DATA_KEY`）。
