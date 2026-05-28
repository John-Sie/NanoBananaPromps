---
trigger: always_on
glob: "*{*.ts,*.tsx,*.js,*.jsx}"
description: "Logging, Observability & Structured Log Standards"
---

# Architecture Rule — Logging & Observability

## Objective

定義結構化日誌的格式與等級規範，確保 Production 環境的問題可快速定位與根因分析。
本規範將 `role-devops` 的「結構化日誌」要求具體化，並與 `rule-data-traceability` 的 metadata 規範整合。

## 日誌格式 (Structured Log Schema)

所有 server-side log 必須輸出結構化 JSON，包含以下欄位：

```ts
{
  level: "debug" | "info" | "warn" | "error" | "fatal",
  message: string,
  timestamp: string,         // ISO 8601 UTC
  appVersion: string,        // 繼承自 rule-data-traceability
  traceId?: string,          // Request 追蹤 ID（如有整合 OpenTelemetry）
  userId?: string,           // 當前操作者（脫敏後）
  action: string,            // 操作名稱，如 "user.login", "payment.charge"
  context?: Record<string, unknown>,  // 額外上下文（如 orderId, eventId）
  error?: {
    name: string,
    message: string,
    stack?: string            // 僅 development 環境
  }
}
```

## 日誌等級使用規範 (Log Levels)

| Level | 用途 | 範例 |
|---|---|---|
| `debug` | 開發階段的細節追蹤，**Production 預設關閉** | 函式進入/離開、中間變數值 |
| `info` | 正常業務事件的記錄 | 用戶登入成功、訂單建立、Email 發送完成 |
| `warn` | 非預期但系統仍可運作的情況 | API 回應緩慢（> 3s）、retry 觸發、deprecated 功能被呼叫 |
| `error` | 需要人工關注的失敗 | 外部 API 呼叫失敗、DB query 錯誤、認證失敗 |
| `fatal` | 系統無法繼續運作 | DB 連線完全中斷、必要環境變數缺失 |

## 禁止事項

### Production 環境

1. **禁止 `console.log`**：所有輸出必須透過統一的 logger utility（如 `lib/logger.ts`）。
2. **禁止輸出敏感資料**：
   - API Key / Token：最多印出前 4 碼 + `****`
   - 密碼 / Secret：完全禁止
   - 個人識別資訊 (PII)：Email → `j***@example.com`、手機 → `0912***789`
3. **禁止空 catch**：`catch (e) {}` 等於吞掉錯誤，與 `rule-error-handling` 的規範重複強調。

### 所有環境

- **禁止在迴圈中大量 log**：若需在迴圈中記錄，使用 batch 摘要（如 `Processed 150/200 items`），而非逐筆輸出。
- **禁止 log 整個 request/response body**：大型 payload 會撐爆日誌儲存，僅記錄關鍵欄位。

## Logger 實作建議

```ts
// lib/logger.ts — 統一 log 入口
import { APP_VERSION } from '@/constants/app'

type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal'

interface LogPayload {
  message: string
  action: string
  userId?: string
  context?: Record<string, unknown>
  error?: Error
}

function log(level: LogLevel, payload: LogPayload) {
  const entry = {
    level,
    message: payload.message,
    timestamp: new Date().toISOString(),
    appVersion: APP_VERSION,
    action: payload.action,
    userId: payload.userId,
    context: payload.context,
    ...(payload.error && {
      error: {
        name: payload.error.name,
        message: payload.error.message,
        stack: process.env.NODE_ENV === 'development' ? payload.error.stack : undefined,
      },
    }),
  }

  // 可替換為 Sentry, Axiom, Datadog 等
  if (level === 'error' || level === 'fatal') {
    console.error(JSON.stringify(entry))
  } else {
    console.log(JSON.stringify(entry))
  }
}

export const logger = {
  debug: (p: LogPayload) => log('debug', p),
  info:  (p: LogPayload) => log('info', p),
  warn:  (p: LogPayload) => log('warn', p),
  error: (p: LogPayload) => log('error', p),
  fatal: (p: LogPayload) => log('fatal', p),
}
```

## 監控整合指引

- **Error Tracking**：建議整合 Sentry 或類似服務，`error` / `fatal` 級別自動上報。
- **Performance Monitoring**：追蹤 API latency、DB query duration，設定 > 3s 的 warn 閾值。
- **Alert 規則**：`fatal` 級別 → 即時通知（Slack / PagerDuty）；`error` 連續 > 10 次/分鐘 → 告警。
