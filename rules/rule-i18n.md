---
trigger: model_decision
trigger_description: "Trigger when handling multi-language content, date/time formatting, number formatting, or timezone conversions."
glob: "*{*.ts,*.tsx,*.json}"
description: "Internationalization (i18n) & Locale Standards"
---

# Architecture Rule — Internationalization (i18n)

## Objective

建立國際化技術規範，即使目前僅支援單一語系，也預先避免 hardcode 文字與格式化陷阱，降低未來多語擴展的成本。

## 文字內容規範 (Text Content)

### 前端顯示文字

- **禁止在 JSX/TSX 中 hardcode 使用者可見的中文或英文字串**（按鈕標籤、提示訊息、表單 label 等）。
- **必須透過 i18n 系統取得**：使用 `next-intl`、`react-i18next` 或自建的 locale 檔案。
- **翻譯 key 命名**：使用 `namespace.context.label` 的層級結構，例如：
  ```
  auth.login.submitButton     → "登入"
  dashboard.stats.totalUsers  → "總用戶數"
  common.actions.cancel       → "取消"
  ```

### 例外（不需 i18n 的項目）

- 品牌名稱、產品名稱（如 Logo 文字）
- 技術性 log 訊息（僅後端/開發者可見）
- `console.log` / `console.error` 的除錯訊息
- 程式碼中的 enum label（若僅後端消費）

## 日期與時間 (Date & Time)

### 儲存規範

- **資料庫一律存 UTC**：所有 `_at` 欄位（`created_at`, `executed_at` 等）必須存為 UTC timestamp。
- **格式**：ISO 8601（`2024-01-15T08:30:00.000Z`），與 `rule-data-traceability` 的 `executedAt` 規範一致。

### 顯示規範

- **前端顯示時轉換為使用者的 local timezone**。
- **格式化工具**：統一使用 `Intl.DateTimeFormat` 或 `date-fns`（配合 locale），禁止手動拼接日期字串。
- **禁止**：`new Date().toLocaleDateString()` 不帶 locale 參數（行為因瀏覽器而異）。

```ts
// ✅ 正確
const formatted = new Intl.DateTimeFormat('zh-TW', {
  year: 'numeric', month: '2-digit', day: '2-digit',
  hour: '2-digit', minute: '2-digit',
  timeZone: userTimezone
}).format(date)

// ❌ 禁止
const formatted = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`
```

## 數字與貨幣 (Numbers & Currency)

- **數字格式化**：使用 `Intl.NumberFormat` 處理千分位、小數位等。
- **貨幣顯示**：必須明確指定 currency code，禁止假設「$」就是 USD 或 TWD。

```ts
// ✅ 正確
new Intl.NumberFormat('zh-TW', {
  style: 'currency',
  currency: 'TWD',
  minimumFractionDigits: 0
}).format(amount)  // → "NT$1,500"

// ❌ 禁止
`$${amount}`
```

## 文字方向與排版 (Text Direction)

- 預設支援 LTR（Left-to-Right）。
- 若未來需支援 RTL 語系（如阿拉伯語），UI 元件應使用 CSS logical properties（`margin-inline-start` 而非 `margin-left`）。

## Locale 檔案結構

```
src/
├── locales/
│   ├── zh-TW/
│   │   ├── common.json
│   │   ├── auth.json
│   │   └── dashboard.json
│   └── en/
│       ├── common.json
│       ├── auth.json
│       └── dashboard.json
```

- 每個 namespace 對應一個 JSON 檔案，避免單一巨型翻譯檔。
- Key 的結構必須在所有語系檔案中保持一致。
