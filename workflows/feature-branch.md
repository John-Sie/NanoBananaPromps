---
description: 建立開發分支、提交變更、建立 PR 並觸發 Preview 部署
---

你是專案的架構官。執行此 workflow 的目標是：**標準化「開發 → 測試 → 驗收」流程，確保新代碼在進入 main 之前已在 Preview 環境通過驗證。**

**與其他 workflow 的關係**：
- 本 workflow 是開發流程的起點
- 開發完成後 → `merge-to-main.md`
- 若修改極小且緊急 → 跳過本流程，走 `hotfix.md`

---

## Branch 命名規範

| 類型 | 格式 | 範例 |
|------|------|------|
| 新功能 | `feature/<描述>` | `feature/dashboard-ui` |
| Bug 修復 | `fix/<描述>` | `fix/login-redirect-loop` |
| 重構 | `refactor/<描述>` | `refactor/auth-module` |
| 雜項 | `chore/<描述>` | `chore/update-readme` |

---

# 🅰️ 準備階段

## Phase 0 — 檢查當前狀態（auto-execute）

```bash
echo "=== Git 狀態 ==="
git status --short

echo ""
echo "=== 當前分支 ==="
git branch --show-current
```

### 若有未提交的變更

**選項 A**：帶入新分支（變更與本次開發相關）
```bash
# 直接繼續，變更會帶到新分支
```

**選項 B**：暫存後再開分支（變更與本次開發無關）
```bash
git stash -m "WIP: stash before creating new branch"
# 完成後可用 git stash pop 還原
```

> 必須向使用者確認選擇哪個選項，不可自行決定。

回報：
- 目前是否有未提交的變更？處理方式？
- 請使用者提供新分支名稱（須符合上述命名規範）

---

# 🅱️ 核心流程

## Phase 1 — 同步主線並建立分支（auto-execute）

```bash
git checkout main
git pull origin main
git checkout -b <BRANCH_NAME>
```

## Phase 2 — 本地驗證（auto-execute）

在 commit 前先確認程式碼可以正常編譯：

```bash
npx tsc --noEmit && npm run build
```

> 若 build 失敗 → 修復問題後再繼續。不要把 broken code 推上去浪費 CI 資源。

## Phase 3 — 提交開發內容

```bash
# 檢查將要提交的檔案
git status --short
git diff --stat

# 提交（優先使用指定檔案，避免帶入不相關變更）
git add <SPECIFIC_FILES>
git commit -m "<TYPE>(<SCOPE>): <DESCRIPTION>"
```

**Commit message 規範**：
- `feat(dashboard): add revenue chart component`
- `fix(auth): resolve redirect loop on expired session`
- `refactor(api): extract shared validation logic`

> 若檔案較多且全部相關，可使用 `git add -A`，但需先向使用者確認 `git status` 的內容。

## Phase 4 — 推送並建立 PR

> ⚠️ 此步驟**不可 auto-execute**，必須讓使用者確認 PR title 和內容。

```bash
git push origin <BRANCH_NAME>
```

```bash
gh pr create \
  --title "<PR_TITLE>" \
  --body "## 變更摘要

<SUMMARY>

## 測試方式

- [ ] 本地 build 通過
- [ ] Preview URL 功能驗證

---
🚀 Triggered Preview deployment via GitHub Actions." \
  --base main \
  --head <BRANCH_NAME>
```

---

# ✅ 驗收階段

## Phase 5 — 追蹤 Preview 部署

1. 前往 GitHub Repo 的 **Actions** 分頁
2. 點擊正在運行的部署 workflow
3. 成功後，回到 PR 頁面查看 Preview URL
4. 在 Preview 環境驗證功能

**[Feature Branch 已就緒 🎉]**

接下來：
- 驗收通過 → 走 `merge-to-main.md`
- 需要繼續開發 → 在同一分支繼續 commit + push
- 發現需要大改 → 評估是否需要開新分支
