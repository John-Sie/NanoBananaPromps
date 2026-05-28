---
trigger: model_decision
trigger_description: "Trigger when the user asks to write tests, set up testing infrastructure, define test coverage, or review test strategies."
glob: "*{*.test.ts,*.test.tsx,*.spec.ts,*.spec.tsx,jest.config.*,vitest.config.*,playwright.config.*}"
description: "Testing Strategy & Coverage Standards"
---

# Architecture Rule — Testing Strategy

## Objective

定義測試金字塔與覆蓋標準，確保每次功能交付都有可重現的品質驗證。
本規範與 `role-coder` 的驗證流程互補，提供「該測什麼」與「怎麼測」的指引。

## 測試金字塔 (Testing Pyramid)

```
        ┌──────────┐
        │   E2E    │  少量：關鍵用戶旅程
        ├──────────┤
        │Integration│  適量：API + DB 整合
        ├──────────┤
        │   Unit   │  大量：純邏輯、工具函式
        └──────────┘
```

| 層級 | 目標 | 工具建議 | 數量比例 |
|---|---|---|---|
| Unit | 純函式、工具方法、資料轉換 | Vitest / Jest | 70% |
| Integration | Server Actions、Route Handlers、Service + DB | Vitest + test DB | 20% |
| E2E | 完整用戶流程（登入→操作→驗證結果） | Playwright | 10% |

## 覆蓋標準 (Coverage Requirements)

### 新功能 (New Feature)

每個新功能的 PR 必須附帶：

1. **至少 1 個 Happy Path 測試**：正常流程跑通。
2. **至少 1 個 Error Path 測試**：驗證錯誤處理行為（如 validation error、unauthorized）。
3. **邊界條件**（視複雜度）：空陣列、null、超大數值、特殊字元等。

### Bug Fix

每個 Bug Fix 的 PR 必須附帶：

1. **Regression Test**：先寫出能重現 Bug 的測試（預期 fail），再修復並確認 pass。

### 不強制測試的項目

- 純 UI 排版（CSS 調整、元件 styling）
- 一次性的 migration script
- `.env.example` 等設定檔更新

## Mock 規範 (Mocking Strategy)

| 依賴類型 | Mock 策略 |
|---|---|
| 外部 API（Stripe、OpenAI） | 一律 mock，禁止測試中打真實外部 API |
| Supabase / DB | Integration test 使用 test 專用的 DB instance 或 in-memory mock |
| 時間 (`Date.now`) | 使用 `vi.useFakeTimers()` 或 `jest.useFakeTimers()` |
| 環境變數 | 測試用 `.env.test` 或在 setup 中 mock `process.env` |
| 第三方 SDK | 在 `__mocks__/` 中建立 manual mock |

### Mock 鐵律

- **禁止 mock 被測對象本身**：如果你 mock 掉了要測試的函式，你等於什麼都沒測。
- **Mock 應反映真實契約**：mock 的回傳值型別必須與真實 API 一致（使用 Zod schema 或 TypeScript type 約束）。

## 測試檔案位置與命名

配合 `rule-naming-convention` 的規定：

- **Co-locate 原則**：測試檔案放在與原始碼同目錄的 `__tests__/` 子目錄中，或直接同層命名。
- **命名**：`{original-filename}.test.ts` 或 `{original-filename}.spec.ts`。
- **Test Utilities**：共用的 test helper、factory、fixture 放在 `tests/` 頂層目錄。

```
src/
├── services/
│   ├── payment-service.ts
│   └── __tests__/
│       └── payment-service.test.ts
└── lib/
    ├── date-utils.ts
    └── date-utils.test.ts          # 簡單 util 可直接同層
```

## CI 整合規則

- **測試不通過 = 阻擋 Merge**：CI pipeline 中 `npm run test` 失敗時，PR 不得合併。
- **測試超時**：單一測試 case 上限 10 秒（unit）/ 30 秒（integration）/ 60 秒（E2E）。
- **Flaky Test 處理**：連續失敗超過 2 次的測試必須標記 `.skip` 並開 issue 追蹤，禁止放著不管。
