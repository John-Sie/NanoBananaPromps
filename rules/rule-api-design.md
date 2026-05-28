---
trigger: model_decision
trigger_description: "Trigger when designing API endpoints, defining response formats, implementing pagination, or setting up Server Actions / Route Handlers."
glob: "*{route.ts,action*.ts,*api*.ts,*service*.ts}"
description: "API Design & Contract Standards"
---

# Architecture Rule — API Design

## Objective

統一全站 API 的設計慣例與回傳契約，確保前後端對接零摩擦、第三方整合有據可循。
本規範與 `role-architect` 的 Server Actions vs Route Handlers 決策互補，聚焦於「介面契約」層面。

## 統一回傳格式 (Response Envelope)

所有 API（Route Handlers 與 Server Actions 回傳值）必須遵循統一的 envelope 結構：

```ts
// 成功
{
  success: true,
  data: T,
  meta?: {
    appVersion: string,
    executedAt: string,       // ISO 8601 UTC
    pagination?: PaginationMeta
  }
}

// 失敗（參照 rule-error-handling）
{
  success: false,
  error: {
    code: string,
    message: string,
    details?: unknown
  }
}
```

- `meta` 欄位必須遵循 `rule-data-traceability` 規範。
- `error` 格式必須遵循 `rule-error-handling` 規範。

## 分頁標準 (Pagination)

### Cursor-based（預設推薦）

適用於 Feed 流、無限捲動、即時資料等場景：

```ts
{
  items: T[],
  nextCursor: string | null,   // null 表示已到末頁
  hasMore: boolean
}
```

### Offset-based（管理後台可用）

適用於需要頁碼跳轉的管理介面：

```ts
{
  items: T[],
  totalCount: number,
  page: number,
  pageSize: number,
  totalPages: number
}
```

### 通用參數命名

- 每頁筆數：`pageSize`（預設 20，上限 100）
- Cursor：`cursor`
- 頁碼：`page`（1-indexed）

## Input Validation 鐵律

1. **API 邊界層強制驗證**：所有 Route Handler 與 Server Action 的輸入，必須在函式進入點使用 Zod schema 驗證。禁止信任前端傳入的資料。
2. **Schema 與 TypeScript 同源**：使用 `z.infer<typeof schema>` 產生型別，禁止手動同步 Type 與 Schema。
3. **驗證失敗即回傳**：不進入商業邏輯，直接回傳標準 error envelope（code: `VALIDATION_ERROR`）。

## Server Actions vs Route Handlers 決策矩陣

配合 `role-architect` 的原則，進一步明確選擇標準：

| 場景 | 選擇 | 理由 |
|---|---|---|
| 表單提交（新增/編輯） | Server Action | 自動表單整合、revalidation |
| 資料刪除 + 確認流程 | Server Action | 搭配 `useTransition` 的 optimistic UI |
| Webhook 接收 | Route Handler | 外部系統呼叫，需自訂 HTTP method/headers |
| 檔案上傳 | Route Handler | 需處理 multipart/form-data |
| 第三方 OAuth Callback | Route Handler | 需自訂 redirect 邏輯 |
| 前端 SWR/React Query 資料抓取 | Route Handler (GET) | Client Component 主動 fetch |
| 頁面初始資料載入 | 直接 Server Component async | 無需 API，直呼 service layer |

## HTTP Status Code 規範

Route Handler 必須回傳語意正確的 HTTP Status Code：

| Code | 用途 |
|---|---|
| `200` | 成功回傳資料 |
| `201` | 成功建立資源 |
| `204` | 成功但無回傳內容（如刪除） |
| `400` | 請求格式錯誤 / 驗證失敗 |
| `401` | 未認證（需登入） |
| `403` | 已認證但無權限 |
| `404` | 資源不存在 |
| `409` | 資源衝突（如重複建立） |
| `429` | 請求過於頻繁 |
| `500` | 伺服器內部錯誤 |
| `501` | 功能尚未實作（WIP API） |

## API Versioning 策略

- **預設不版本化**：內部 API（前端自用）不需版本號。
- **外部 API**：若提供第三方使用，採用 URL path versioning：`/api/v1/...`。
- **Breaking Change**：遵循 `rule-git-workflow` 的 `BREAKING CHANGE` commit convention，並在 Changelog 中明確記載。
