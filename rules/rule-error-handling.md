---
trigger: always_on
glob: "*{*.ts,*.tsx,*.js,*.jsx}"
description: "Global Error Handling & Response Standards"
---

# Architecture Rule — Error Handling

## Objective

統一全站的錯誤處理策略，確保前後端錯誤格式一致、使用者回饋清晰、開發者除錯高效。
本規範與 `role-auditor` 中「錯誤捕獲」條款互補，提供正面的實作標準。

## 後端錯誤回傳格式 (API Error Response Schema)

所有 Server Actions 與 Route Handlers 的錯誤回傳，必須遵循統一的 envelope 格式：

```ts
// ✅ 標準錯誤回傳
{
  success: false,
  error: {
    code: "VALIDATION_ERROR" | "UNAUTHORIZED" | "FORBIDDEN" | "NOT_FOUND" | "CONFLICT" | "RATE_LIMITED" | "INTERNAL_ERROR",
    message: string,       // 使用者可讀的訊息（可國際化）
    details?: unknown       // 僅限開發環境回傳詳細錯誤堆疊
  }
}

// ✅ 標準成功回傳
{
  success: true,
  data: T,
  meta?: { ... }           // 依循 rule-data-traceability
}
```

### Zod Validation Error 標準化

Zod parse 失敗時，`details` 必須格式化為 field-level errors，禁止直接丟出原始 ZodError：

```ts
// ✅ 正確
details: {
  fieldErrors: { email: ["Invalid email format"], name: ["Required"] }
}

// ❌ 禁止
details: zodError.issues  // 原始結構，前端難以消費
```

## 前端錯誤邊界策略 (Error Boundary)

- **全域 Error Boundary**：`app/error.tsx` 捕獲未預期的 Runtime Error，顯示友善的 fallback UI 並觸發錯誤上報。
- **頁面級 Error Boundary**：關鍵頁面（如結帳、個人設定）應有獨立的 `error.tsx`，提供上下文相關的錯誤恢復建議。
- **元件級 Fallback**：非同步載入的元件使用 `Suspense` + fallback，避免整頁白屏。

## 錯誤處理鐵律

1. **禁止靜默吞噬**：`catch (e) {}` 或 `catch (e) { console.log(e) }` 皆不合格。必須至少有結構化 log + 向上拋出或回傳 error response。
2. **分層處理**：
   - **API 邊界層**：統一 catch → 格式化 → 回傳標準 error envelope。
   - **Service 層**：拋出具語意的 custom error class（如 `NotFoundError`, `ConflictError`）。
   - **UI 層**：消費 error envelope → Toast / Inline Error / Error Page。
3. **非同步操作必須有 Fallback**：所有 `fetch`、DB query、外部 API 呼叫必須有 try-catch 且定義失敗時的 UI 狀態。
4. **禁止在 Production 暴露內部細節**：錯誤堆疊 (stack trace)、SQL 語句、內部路徑等僅限 `NODE_ENV === 'development'` 回傳。
