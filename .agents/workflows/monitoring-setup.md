---
description: 監控與告警設定 — error tracking、uptime、log 分析、自訂告警
---

> 本 workflow 遵循 `engineering-agent.md` 通用守則。

Task: 設定或審查專案的監控與告警系統，確保問題能被及時發現

**與其他 workflow 的關係**：
- 監控告警觸發時 → `incident-response.md`
- 告警發現 bug → `bug-investigation.md`
- 監控指標異常 → `performance-audit.md` 深入檢測

**建議執行時機**：
- 專案首次上線前
- 新增關鍵功能後
- 事故後檢討發現監控缺口時

---

## Phase 1 — 現況盤點（auto-execute）

```bash
echo "=== 已安裝的監控相關套件 ==="
node -p "
const pkg = require('./package.json');
const deps = {...pkg.dependencies, ...pkg.devDependencies};
const monitoring = ['@sentry/nextjs', '@sentry/node', '@sentry/react', 'newrelic', 'datadog', 'winston', 'pino', 'loglevel', '@vercel/analytics', '@vercel/speed-insights', 'posthog-js'];
monitoring.forEach(f => deps[f] && console.log('✅ ' + f + ': ' + deps[f]));
const none = monitoring.every(f => !deps[f]);
if(none) console.log('⚠️ 未偵測到任何監控套件');
" 2>/dev/null

echo ""
echo "=== Error boundary ==="
grep -rn "ErrorBoundary\|error\.tsx\|global-error\.tsx" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | head -10

echo ""
echo "=== 既有的 logging ==="
grep -rn "console\.error\|console\.warn\|logger\.\|log\.\(error\|warn\|info\)" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l
echo "處 log 呼叫"
```

---

## Phase 2 — 監控層級規劃

### 監控金字塔

```
        ┌─────────┐
        │ Business │  營收、轉換率、使用者行為
        │ Metrics  │  → Analytics（PostHog / GA）
        ├─────────┤
        │  App     │  錯誤率、API 延遲、使用者體驗
        │ Layer    │  → Error Tracking（Sentry）
        ├─────────┤
        │ Infra    │  Uptime、CPU、Memory、DB
        │ Layer    │  → Uptime Monitor + Platform Metrics
        └─────────┘
```

### 各層建議工具

| 層級 | 功能 | 推薦工具 | 替代方案 |
|------|------|----------|----------|
| **Error Tracking** | 自動捕捉未處理的 exception | Sentry | LogRocket, Bugsnag |
| **Uptime Monitor** | 定期 ping 確認服務可用 | UptimeRobot / BetterStack | Pingdom, Checkly |
| **Analytics** | 使用者行為追蹤 | PostHog / Vercel Analytics | Google Analytics, Mixpanel |
| **Performance** | Core Web Vitals | Vercel Speed Insights | web-vitals + 自建 |
| **Log Management** | 集中式 log 查詢 | Vercel Logs / BetterStack | Datadog, Papertrail |

---

## Phase 3 — Error Tracking 設定（Sentry 範例）

### 3a. 檢查既有設定

```bash
echo "=== Sentry 設定檔 ==="
ls sentry.*.config.ts 2>/dev/null || ls sentry.*.config.js 2>/dev/null || echo "⚠️ 無 Sentry 設定檔"

echo ""
echo "=== Sentry DSN ==="
grep -rn "SENTRY_DSN\|NEXT_PUBLIC_SENTRY_DSN" .env* 2>/dev/null | head -3
grep -rn "SENTRY_DSN\|dsn:" sentry.* 2>/dev/null | head -3
```

### 3b. 建議設定

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  environment: process.env.NODE_ENV,
  
  // 效能監控取樣率（production 建議 0.1-0.3）
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  
  // Session Replay（可選，費用較高）
  replaysSessionSampleRate: 0.01,
  replaysOnErrorSampleRate: 1.0,
  
  // 忽略常見的非關鍵錯誤
  ignoreErrors: [
    'ResizeObserver loop',
    'Network request failed',
    'Load failed',
    'AbortError',
  ],
});
```

### 3c. 自訂 Error Boundary

```bash
echo "=== App Router error 處理 ==="
find src/app -name "error.tsx" 2>/dev/null | sort
find src/app -name "global-error.tsx" 2>/dev/null
find src/app -name "not-found.tsx" 2>/dev/null
```

確認：
- [ ] 有 `src/app/global-error.tsx`（全域錯誤處理）
- [ ] 關鍵路由有 `error.tsx`（局部錯誤處理）
- [ ] 有自訂 `not-found.tsx`
- [ ] Error boundary 會上報到 Sentry

---

## Phase 4 — 告警規則設計

### 核心告警（必須有）

| 告警 | 條件 | 嚴重度 | 通知方式 |
|------|------|--------|----------|
| **服務不可用** | Uptime check 失敗 ≥ 2 次 | 🔴 P0 | 即時通知（Slack / Email / SMS） |
| **錯誤率飆升** | 5 分鐘內 error 數 > 基準的 3 倍 | 🔴 P0 | 即時通知 |
| **API 回應時間** | P95 > 3 秒 持續 5 分鐘 | 🟡 P1 | 通知 |
| **新的未處理例外** | 首次出現的 exception 類型 | 🟡 P1 | 通知 |
| **SSL 憑證到期** | 到期前 14 天 | 🟡 P2 | Email |

### 業務告警（依需求）

| 告警 | 條件 | 說明 |
|------|------|------|
| 付款失敗率 | > 5% | 可能是 payment gateway 問題 |
| 註冊轉換率 | 低於基準 50% | 可能有 UI bug |
| API quota | 使用量 > 80% | 第三方 API 即將超限 |

---

## Phase 5 — Logging 規範

### Log Level 定義

| Level | 用途 | 範例 |
|-------|------|------|
| `error` | 需要立即關注的問題 | 未處理的 exception、資料遺失 |
| `warn` | 不正常但不影響功能 | 已棄用 API 呼叫、重試成功 |
| `info` | 重要業務事件 | 使用者登入、訂單建立、部署完成 |
| `debug` | 開發除錯用 | 變數值、流程追蹤（production 不啟用） |

### Logging Best Practices

```typescript
// ✅ 好的 log
logger.error('Payment failed', {
  userId: user.id,
  amount: order.amount,
  error: error.message,
  orderId: order.id,
});

// ❌ 壞的 log
console.log('error');
console.log(error); // 沒有 context
logger.info(JSON.stringify(hugeObject)); // 資料量太大
logger.error(`User ${user.email} payment failed`); // 洩露 PII
```

### 敏感資料規範

**不可 log 的內容**：
- 密碼、token、API key
- 信用卡號
- 個人身份證號
- 完整 email（可 log 部分如 `j***@example.com`）

---

## Phase 6 — 產出報告

```markdown
## Monitoring Setup Report

### 現狀摘要

| 層級 | 工具 | 狀態 |
|------|------|------|
| Error Tracking | Sentry / 無 | ✅ / ❌ |
| Uptime Monitor | UptimeRobot / 無 | ✅ / ❌ |
| Analytics | PostHog / GA / 無 | ✅ / ❌ |
| Performance | Vercel Speed Insights / 無 | ✅ / ❌ |
| Log Management | Vercel Logs / 無 | ✅ / ❌ |

### 告警規則

| 告警 | 已設定 | 通知管道 |
|------|--------|----------|
| 服務不可用 | ✅ / ❌ | — |
| 錯誤率飆升 | ✅ / ❌ | — |
| API 延遲 | ✅ / ❌ | — |

### 建議行動

| # | 行動 | 優先序 | 工作量 |
|---|------|--------|--------|
| 1 | 安裝 Sentry | 🔴 高 | 2hr |
| 2 | 設定 UptimeRobot | 🔴 高 | 30min |
| 3 | 加入 error.tsx | 🟡 中 | 1hr |
```

---

## 額外規則

- 監控不應影響效能 — 取樣率、批次上報、非同步處理
- 告警不可過多 — 太多告警等於沒有告警（alert fatigue）
- 監控系統本身也需要監控 — 確認告警通知管道正常
- 定期審查告警規則 — 刪除過時的、調整閾值
- 遵守隱私法規 — GDPR / CCPA 對使用者追蹤有規定
