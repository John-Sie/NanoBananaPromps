---
trigger: model_decision
trigger_description: "Trigger when the user asks to install new packages, upgrade dependencies, resolve version conflicts, or audit npm packages."
glob: "*{package.json,package-lock.json,pnpm-lock.yaml,yarn.lock}"
description: "Dependency Management & Package Audit Rules"
---

# Architecture Rule — Dependency Management

## Objective

控管第三方套件的引入品質與安全性，避免 bundle 膨脹、供應鏈攻擊與維護地獄。
本規範將 `role-coder` 中「不得擅自引入新依賴」的禁令細化為可操作的評估流程。

## 新套件引入評估 Checklist

在提議或執行 `npm install <package>` 之前，必須逐項確認：

| 評估維度 | 檢查項目 | 不合格門檻 |
|---|---|---|
| **維護狀態** | 最後一次 publish 時間 | > 12 個月無更新（除非已穩定的底層庫） |
| **社群健康度** | GitHub stars、weekly downloads | 極低使用量 + 無活躍 maintainer |
| **Bundle Size** | 透過 [bundlephobia](https://bundlephobia.com) 檢查 | 前端依賴 gzip > 50KB 需額外論證 |
| **安全性** | `npm audit` 無 high/critical 漏洞 | 有未修復的 high/critical CVE |
| **License** | 相容於專案的授權模式 | GPL（若專案非 GPL）、SSPL、未標示授權 |
| **Tree-shaking** | 是否支援 ESM | 僅提供 CJS 的大型套件需謹慎 |
| **替代方案** | 是否能用既有套件或原生 API 實現 | 功能重疊度 > 80% 的多餘套件 |

### 輸出格式

Agent 建議引入新套件時，必須簡要附上評估摘要：

```
📦 建議引入: zod@3.22
- Bundle: 13KB gzip
- License: MIT
- Weekly DL: 8M+
- 理由: 取代手動 validation，與 TypeScript 型別同源
- 替代方案: yup（較大、TypeScript 支援較差）、手寫（維護成本高）
```

## Lockfile 管理

- **Lockfile 必須 commit**：`package-lock.json`、`pnpm-lock.yaml` 或 `yarn.lock` 必須進版控。
- **禁止手動編輯 lockfile**：所有 lockfile 變更只能透過 package manager 指令產生。
- **CI 中使用 `ci` 安裝指令**：`npm ci`（而非 `npm install`），確保依賴與 lockfile 完全一致。

## 定期維護

- **安全審計**：定期執行 `npm audit`，high/critical 漏洞必須在 Sprint 內處理。
- **依賴升級**：Major 版本升級需在獨立 branch 上操作，附帶完整測試驗證。
- **清理未使用依賴**：每季度檢查 `package.json`，移除未被 import 的套件（可使用 `depcheck`）。

## 禁止清單 (Banned Patterns)

- **禁止安裝 deprecated 套件**：npm 標記 deprecated 的套件不得引入。
- **禁止引入功能重疊套件**：如已使用 `date-fns`，不得再引入 `moment`。
- **禁止 postinstall 任意腳本**：引入含有 `postinstall` script 的套件前，需審查該腳本內容。
- **禁止 `*` 版本範圍**：`package.json` 中的版本號禁止使用 `*` 或 `latest`，必須指定具體 semver 範圍。
