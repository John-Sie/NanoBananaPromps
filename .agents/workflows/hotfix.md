---
description: 緊急修正或文案調整 — 直接推送 main 並觸發 Production 部署
---

你是專案的急診室醫師。執行此 workflow 的目標是：**在確認修改極小且安全的前提下，繞過 PR 審核流程，直接將變更推送到生產環境以達成「秒級修復」。**

> [!CAUTION]
> **環境變數與資料污染警示：**
> 直接推送至 `main` 會讀取 Production 環境變數。如果您的修改涉及資料庫寫入且未經測試，可能會直接污染正式數據。若有疑慮，請改用 `feature-branch.md`。

**與其他 workflow 的關係**：
- 若修改範圍超出「極小修正」→ 改走 `feature-branch.md`
- 若需要 Preview URL 驗收 → 改走 `feature-branch.md`
- hotfix 上線後若出問題 → 走 `rollback.md`

---

# 🅰️ 風險評估（Risk Gate）

## Phase 0 — 修改規模確認

本次修改必須符合**至少一項**：
- [ ] 僅修改文案（Text change）
- [ ] 修改 README / Docs
- [ ] 緊急修復一個已知的 500 Error（影響範圍明確）
- [ ] 修正 CSS / 排版問題（無邏輯變動）

**Gate 條件**：
- ✅ 符合上述任一項 + 變更檔案 ≤ 3 個 → 繼續
- ❌ 不符合任何一項，或變更範圍過大 → **中止本 workflow，改走 `feature-branch.md`**

確認：「本次修改不需要在 Preview URL 驗收嗎？」

---

# 🅱️ 快速發布流程（Fast-track）

## Phase 1 — 同步主線（auto-execute）

```bash
git checkout main
git pull origin main
```

## Phase 2 — 檢查變更範圍（auto-execute）

```bash
echo "=== 變更檔案清單 ==="
git status --short

echo ""
echo "=== 變更統計 ==="
git diff --stat

echo ""
echo "=== 變更檔案數 ==="
CHANGED=$(git status --short | wc -l | tr -d ' ')
echo "共 $CHANGED 個檔案變更"
if [ "$CHANGED" -gt 3 ]; then
  echo "⚠️ 變更超過 3 個檔案，請確認是否適合 hotfix"
fi
```

> 在繼續前，**必須**向使用者展示變更內容並取得確認。

## Phase 3 — Build 驗證（auto-execute）

```bash
npx tsc --noEmit && npm run build
```

> 若 build 失敗 → **不可 push**。修復問題後重新驗證。

## Phase 4 — 提交變更

> ⚠️ 此步驟**不可 auto-execute**，必須讓使用者確認 commit 內容。

```bash
# 只加入指定檔案，不用 git add -A
git add <SPECIFIC_FILES>
git commit -m "fix(hotfix): <SHORT_DESCRIPTION> (Direct to Main)"
```

**注意**：使用 `git add <SPECIFIC_FILES>` 而非 `git add -A`，確保只提交本次修正相關的檔案。

## Phase 5 — 推送觸發正式部署

> ⚠️ 此步驟**不可 auto-execute**，必須讓使用者最終確認。

```bash
git push origin main
```

---

# ✅ 驗收與監控

## Phase 6 — 正式環境驗證

1. 前往 GitHub **Actions** 或部署平台查看部署進度
2. 部署成功後，立即開啟 Production URL 確認修復生效
3. 觀察 5 分鐘，確認無新錯誤產生

**[Hotfix 已上線 🚑]**

---

# 🔙 回滾指引

若 hotfix 上線後反而造成問題：

### 方案 A：快速 revert（推薦）
```bash
git revert HEAD --no-edit
git push origin main
```

### 方案 B：回到上一個已知穩定 commit
```bash
# 找到上一個穩定 commit
git log --oneline -5

# 強制回退（危險操作，需使用者確認）
git reset --hard <STABLE_COMMIT_HASH>
git push origin main --force-with-lease
```

> 回滾後立即通知團隊，並將問題轉入 `feature-branch.md` 流程正式修復。
