---
trigger: model_decision
trigger_description: "Trigger when the user asks to commit, create branches, prepare PRs, write changelogs, or manage version control."
glob: "*{*.md,.gitignore,CHANGELOG.md}"
description: "Git Workflow & Version Control Rules"
---

# Architecture Rule — Git Workflow

## Objective

建立一致的版控工作流程，確保 commit history 可追溯、PR 品質可審查、release 流程可自動化。

## Commit 規範 (Conventional Commits)

所有 commit message 必須遵循 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### 允許的 Type

| Type | 用途 | 範例 |
|---|---|---|
| `feat` | 新功能 | `feat(auth): add OAuth login with Google` |
| `fix` | 修復 Bug | `fix(checkout): resolve race condition on payment` |
| `refactor` | 重構（不改行為） | `refactor(api): extract validation to middleware` |
| `chore` | 建置/工具/依賴 | `chore(deps): upgrade next to 15.1` |
| `docs` | 文件更新 | `docs(readme): add deployment guide` |
| `style` | 格式調整（非 CSS） | `style: apply prettier formatting` |
| `test` | 測試相關 | `test(user-service): add edge case coverage` |
| `perf` | 效能優化 | `perf(query): add index on events.status` |
| `ci` | CI/CD 設定 | `ci: add preview deploy workflow` |

### 書寫規則

- **Subject**：英文、小寫開頭、不加句號、祈使語氣（`add` 而非 `added`）、50 字以內。
- **Body**（選填）：說明 Why，而非 What（What 看 diff 就知道）。
- **Breaking Change**：在 footer 加 `BREAKING CHANGE:` 或在 type 後加 `!`，例如 `feat(api)!: change response envelope format`。
- **Scope**：對應功能模組或目錄名，例如 `auth`, `checkout`, `db`, `ui`。

## Branch 規範 (Branch Naming)

```
<type>/<short-description>
```

| Type | 用途 | 範例 |
|---|---|---|
| `feat/` | 新功能開發 | `feat/user-profile-page` |
| `fix/` | Bug 修復 | `fix/login-redirect-loop` |
| `hotfix/` | Production 緊急修復 | `hotfix/payment-timeout` |
| `chore/` | 維護性工作 | `chore/upgrade-dependencies` |
| `refactor/` | 重構 | `refactor/extract-auth-service` |

- Branch 名稱一律 `kebab-case`，全英文小寫。
- 禁止直接 push 到 `main` 或 `production` 分支。

## Pull Request 規範 (PR Requirements)

每個 PR 必須包含：

1. **Title**：遵循 Conventional Commits 格式。
2. **Description**：
   - **What**：本次變更的功能或修復內容。
   - **Why**：為什麼需要這個改動（連結 Issue / PRD）。
   - **How**：關鍵實作手法或架構決策。
3. **Screenshots / Recordings**：若涉及 UI 變更，必須附上前後對比截圖。
4. **Testing**：說明已執行的測試類型與結果。
5. **Checklist**：
   - [ ] `npx tsc --noEmit` 通過
   - [ ] `npm run lint` 通過
   - [ ] `npm run test` 通過（若有）
   - [ ] 已更新相關文件（若適用）

## 保護分支 (Protected Branches)

- `main`：代表最新穩定版本，僅接受 PR merge，禁止 force push。
- `production`（若存在）：代表線上版本，僅從 `main` 合併，需額外 approval。
