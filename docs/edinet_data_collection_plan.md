# EDINETデータ収集・再フォーマット計画（全社共通データ中心）

## 1. 目的
- EDINETから「全社で共通的に取得できるデータ」を基盤として網羅的に収集する。
- 可能な限り原本データを欠落なく取得し、後段分析で扱いやすい標準形式に再フォーマットする。
- 将来の指標計算・スクリーニングに耐える再現可能なデータ基盤を作る。

## 2. 対象範囲（今回）
- API: `書類一覧API`（`/api/v2/documents.json`）と`書類取得API`（`/api/v2/documents/{docID}`）
- 期間: 直近10年（EDINET API仕様上の取得可能範囲）
- マスタ: EDINETコード、ファンドコード、EDINETコード集約一覧、様式コードリスト
- 取得方針: `type=1..5` を可能な限り全取得（フラグ有り時に取得）

## 3. 「全社共通で取れるデータ」の洗い出し

### 3.1 書類一覧API（共通メタデータ）
以下はレスポンスで常に取得できる共通情報。
- `metadata.title`
- `metadata.parameter.date`
- `metadata.parameter.type`
- `metadata.resultset.count`
- `metadata.processDateTime`
- `metadata.status`
- `metadata.message`

### 3.2 書類一覧API（提出書類一覧 `results[]`）
提出書類1件ごとの主要フィールド（全項目を保持。未該当は`null`または`0`）。
- `seqNumber`
- `docID`
- `edinetCode`
- `secCode`
- `JCN`
- `filerName`
- `fundCode`
- `ordinanceCode`
- `formCode`
- `docTypeCode`
- `periodStart`
- `periodEnd`
- `submitDateTime`
- `docDescription`
- `issuerEdinetCode`
- `subjectEdinetCode`
- `subsidiaryEdinetCode`
- `currentReportReason`
- `parentDocID`
- `opeDateTime`
- `withdrawalStatus`
- `docInfoEditStatus`
- `disclosureStatus`
- `xbrlFlag`
- `pdfFlag`
- `attachDocFlag`
- `englishDocFlag`
- `csvFlag`
- `legalStatus`

### 3.3 書類取得API（実ファイル）
`docID`単位で以下を取得対象にする。
- `type=1`: 提出本文書及び監査報告書（ZIP）
- `type=2`: PDF（PDF）
- `type=3`: 代替書面・添付文書（ZIP）
- `type=4`: 英文ファイル（ZIP）
- `type=5`: CSV（ZIP, `XBRL_TO_CSV`）

### 3.4 コード/会社マスタ（共通軸）
- `EdinetcodeDlInfo.csv`  
  会社の識別・属性（EDINETコード、提出者種別、上場区分、連結有無、決算日、提出者名、業種、証券コード、法人番号など）
- `FundcodeDlInfo.csv`
- `EDINETコード集約一覧`（廃止コード→継続コード）
- `様式コードリスト`（別紙1）
- API仕様書の`府令コード`、`書類種別コード`

## 4. 今回の収集対象データ（実行定義）

### 4.1 必須収集（まず全件）
- `documents.json?type=2` の日次全件
- `results[]` 全29フィールド
- `xbrlFlag/pdfFlag/attachDocFlag/englishDocFlag/csvFlag` に応じた `type=1..5` 実ファイル
- コードマスタ4種（EDINET/Fund/集約/様式）

### 4.2 追加収集（再フォーマット前提で全量）
- `type=1` ZIP内XBRLインスタンス/監査関連/英文ファイル
- `type=5` ZIP内CSV（XBRL変換済み）
- `type=3` 添付文書（HTML/PDF等）

## 5. 保存形式（Raw/Standardized/Analyticsの3層）

### 5.1 Raw層（原本保持）
- 目的: 再処理可能性の担保（ロスレス）
- 形式:
  - APIレスポンス: `JSON`（圧縮: `gzip`）
  - 実ファイル: `ZIP/PDF`（バイナリ原本）
  - マスタCSV/XLSX: ダウンロード原本そのまま
- 推奨パス例:
  - `raw/edinet/documents/date=YYYY-MM-DD/retrieved_at=.../documents_type2.json.gz`
  - `raw/edinet/documents/{docID}/type=1/original.zip`
  - `raw/edinet/masters/{name}/snapshot_date=YYYY-MM-DD/original.*`
- 付与メタ: `sha256`, `bytes`, `downloaded_at`, `http_status`, `content_type`

### 5.2 Standardized層（正規化）
- 目的: 一貫スキーマ化と文字コード・時刻の統一
- 形式: `Parquet`（分析向け） + 必要に応じ `JSONL`
- テーブル例:
  - `filings`（`results[]`を1行1書類で保持）
  - `filing_assets`（`docID`×`type`×ファイル）
  - `filers`（EDINETコードマスタ）
  - `funds`（ファンドマスタ）
  - `edinet_code_merges`（コード集約）
  - `xbrl_facts`（XBRL/CSVから抽出したファクト）

### 5.3 Analytics層（利用系）
- 目的: 画面表示・スクリーニング高速化
- 形式: アプリDB（既存のSQLite/D1想定）
- 方針:
  - 会社ディメンション（証券コード・EDINETコード・法人番号を統合キー管理）
  - 書類ファクト（提出日、書類種別、訂正/取下、不開示状態）
  - 財務ファクト（勘定科目、値、単位、期間、連結/個別）

## 6. 再フォーマット規約
- 文字コード: Shift_JIS/CP932系CSVはUTF-8へ変換
- 日時: すべてISO 8601（JST基準）で統一し、必要ならUTC列を追加
- コード展開: `ordinanceCode/formCode/docTypeCode` は名称テーブルに外部結合
- 配列分解:
  - `subsidiaryEdinetCode`（`,`区切り）を子テーブルへ展開
  - `currentReportReason`（`,`区切り）を子テーブルへ展開
- 監査証跡: RawハッシュとStandardizedレコードを`docID`で必ず紐付け

## 7. 収集フロー
1. マスタ取得（EDINET/Fund/集約/様式）
2. 対象日で`documents.json?type=2`取得
3. `results[]`を保存・正規化
4. 各`docID`でフラグを見て`type=1..5`取得
5. ZIP展開・XBRL/CSV抽出
6. 正規化テーブル生成
7. 品質チェック後に公開テーブル更新

## 8. 運用計画

### 8.1 初回バックフィル
- 10年分を日付ループで取得
- 日付ごとに`count`件数と保存件数を突合

### 8.2 日次増分
- 毎営業日朝に前日分確定取得
- 当日分は複数回取得（`seqNumber`増分監視）
- マスタ（コードリスト）は毎日1回スナップショット

## 9. 品質管理（必須チェック）
- `metadata.resultset.count` と `results`保存行数が一致
- `docID`単位で重複排除・再取得時の差分検知
- 取得失敗（404/401/429/5xx）の再試行ログ
- ファイルハッシュによる改ざん/破損検知
- コード集約反映後の企業キー一意性検証

## 10. リスクと対策
- 書類種別ごとの欠損項目: `null`許容スキーマで吸収
- EDINETコード変更: 集約一覧を日次反映し継続コードへ正規化
- 大容量ZIP/PDF: Raw層で圧縮保管し、Standardized層は必要情報のみ抽出
- 仕様改版: 公式資料更新日を監視し、差分検出時にスキーマ更新

## 11. 成果物（今回）
- 本計画書
- 収集ジョブ実装時に必要な最小スキーマ定義（別タスク）
- APIエラー/再試行ポリシー定義（別タスク）

## 12. 参照資料（公式）
- EDINET関連資料トップ（技術資料）  
  https://disclosure2dl.edinet-fsa.go.jp/guide/static/disclosure/WZEK0110.html
- EDINET API仕様書（Version 2, 2026-01-29更新）  
  https://disclosure2dl.edinet-fsa.go.jp/guide/static/disclosure/download/ESE140206.pdf
- EDINET API仕様書 別紙1_様式コードリスト  
  https://disclosure2dl.edinet-fsa.go.jp/guide/static/disclosure/download/ESE140327.xlsx
- EDINETコード集約一覧  
  https://disclosure2dl.edinet-fsa.go.jp/guide/static/disclosure/download/ESE140190.csv
- EDINETコードリスト（固定リンク）  
  https://disclosure2dl.edinet-fsa.go.jp/searchdocument/codelist/Edinetcode.zip
- ファンドコードリスト（固定リンク）  
  https://disclosure2dl.edinet-fsa.go.jp/searchdocument/codelist/Fundcode.zip
