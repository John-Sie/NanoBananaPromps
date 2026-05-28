---
description: 比對 API 實作與文件，產出差異報告並在高置信度下修正文件
---

> 本 workflow 遵循 `engineering-agent.md` 通用守則。

Task: 審計 API 實作與文件的一致性

Scope: `src/app/api/` + `docs/`

**與 `audit.md` 的關係**：`audit.md` 負責安全與程式碼衛生；本 workflow 專注於 API 實作與文件之間的 drift detection，兩者互不重疊。

---

## 前提假設

- API routes 遵循 Next.js App Router 慣例（`route.ts` / `route.js`）
- `docs/` 中的 API 文件格式為下列之一（依專案而定）：
  - OpenAPI / Swagger spec（`.yaml` / `.json`）
  - Markdown 文件（每個 endpoint 或功能一份）
- 若實際結構不符上述假設，先回報再繼續

---

## 比對項目

- endpoint path
- HTTP method
- params / query / body schema
- response schema
- status codes
- error response 格式

---

## 執行步驟

### Step 1 — 掃描所有 API routes（auto-execute）

```bash
find src/app/api \( -name "route.ts" -o -name "route.js" \) | sort
```

### Step 2 — 逐一比對 docs

對每個 route，找到 `docs/` 中對應的文件，逐項比對上述項目。

### Step 3 — 產出 Discrepancy Report

以下列表格格式輸出：

```markdown
## API Docs Discrepancy Report

| # | Endpoint | 項目 | 分類 | 說明 |
|---|----------|------|------|------|
| 1 | `POST /api/users` | response schema | docs 過期 | code 回傳 `{ id, name, email }`，docs 缺少 `email` |
| 2 | `GET /api/orders/:id` | status codes | code 偏離 spec | docs 定義 404，code 回傳 400 |
| 3 | `PATCH /api/settings` | body schema | 無法判定 | code 使用 Zod schema 但 docs 無對應描述 |
```

**分類定義**：
- **docs 過期** — code 已更新，docs 未跟上
- **code 偏離 spec** — docs 說這樣，code 做那樣
- **無法判定** — 資訊不足，需人工確認

### Step 4 — 修正文件（僅高置信度）

- 僅修正分類為「docs 過期」且有明確 code 依據的項目
- 「code 偏離 spec」和「無法判定」不自動修正

### Step 5 — 標記待處理項目

無法自動修正的項目，在對應的 docs 或 code 中標記：

```
<!-- TODO:API-AUDIT — [簡述差異] -->
```

### Step 6 — 驗證（auto-execute）

```bash
npx tsc --noEmit
```

---

## 額外規則

- 不可憑空補齊 schema — 必須有 code 依據
- 不可修改 API 行為 — 除非任務明確要求
- 若 `docs/` 中找不到對應文件，將該 endpoint 列入報告並標記為「文件缺失」
