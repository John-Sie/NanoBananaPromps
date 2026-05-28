---
trigger: always_on
glob: "*{.env*,.gitignore,next.config.*,*.ts,*.tsx}"
description: "Environment Variables & Secrets Management Rules"
---

# Architecture Rule — Environment Variables & Secrets

## Objective

防止機密資訊洩漏，確保環境變數在各環境（Local / Preview / Production）間的一致性與安全性。
本規範與 `role-auditor` 中「相依性與金鑰」審查條款互補，提供正面管理標準。

## .env 檔案管理

### 檔案層級

| 檔案 | 用途 | 是否 commit |
|---|---|---|
| `.env.example` | 範本，列出所有必要的 key（值留空或填 placeholder） | ✅ 必須 commit |
| `.env.local` | 本地開發用的實際值 | ❌ 禁止 commit |
| `.env.development` | 開發環境共用預設值（非機密） | ✅ 可 commit |
| `.env.production` | Production 專用預設值（非機密） | ⚠️ 視情況，機密值放 Vercel Dashboard |

### 同步鐵律

- **新增環境變數時**：必須同步更新 `.env.example`，加上用途註解。
- **移除環境變數時**：必須同步從 `.env.example` 移除，並在 PR 中標註。
- **Vercel 環境變數**：Production / Preview / Development 三個環境的變數必須分別確認設定。

## 機密值防護規則

### 嚴禁事項

1. **禁止 Hardcode**：任何 API Key、Secret、Connection String、Token 禁止直接寫在程式碼中。
2. **禁止前端暴露**：不帶 `NEXT_PUBLIC_` 前綴的環境變數，不得在 Client Component 中引用。
3. **禁止 Log 輸出**：禁止在任何 log level 中印出完整的 API Key 或 Token（可印出前 4 碼 + mask）。
4. **禁止 commit**：`.gitignore` 必須包含以下條目，Agent 修改 `.gitignore` 時不得移除：
   ```
   .env*.local
   .env.production
   ```

### `NEXT_PUBLIC_*` 使用限制

僅允許存放以下類型的值：

- Supabase Project URL（非 Service Role Key）
- Analytics Tracking ID（如 GA、Posthog）
- 公開的 API Endpoint URL
- Feature Flag 的公開識別碼

**禁止放入**：任何可用於認證、授權、資料存取的密鑰。

## 環境切分驗證 (Environment Isolation)

配合 `role-devops` 的「環境隔離」原則：

- **Local**：使用 `.env.local`，指向 local 或 dev 環境的 Supabase 專案。
- **Preview (Staging)**：Vercel Preview Deployment 使用獨立的 Preview 環境變數。
- **Production**：僅限 Vercel Dashboard 設定，禁止透過檔案部署。

## Secret Rotation 指引

- 當 Secret 可能已洩漏（如誤 commit）時，必須立即：
  1. 在服務供應商端 Revoke 舊 Key。
  2. 生成新 Key 並更新至 Vercel Dashboard / `.env.local`。
  3. 重新部署所有相關環境。
  4. 檢查 Git history，必要時使用 `git filter-branch` 或 BFG 清除歷史紀錄。
