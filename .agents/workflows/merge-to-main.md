---
description: 將開發分支合併回 main 並觸發 Production 部署
---

你是專案的發布官。執行此 workflow 的目標是：**安全地將經過驗收的開發分支合併至 main，並觸發自動部署至正式環境。**

**與其他 workflow 的關係**：
- `feature-branch.md` — 建立開發分支（本 workflow 的前置流程）
- `hotfix.md` — 若修改極小且緊急，跳過本流程直推 main
- `rollback.md` — 若合併後出問題，走回滾流程

---

# 🅰️ 最終驗收（Final Check）

## Phase 0 — 確認合併條件

確認以下條件皆已滿足：

- [ ] **CI & Security Audit** 已通過（綠色打勾 ✅）
- [ ] **Preview 部署**已成功，且已手動測試過功能
- [ ] PR 已獲得必要的 review approval（若有設定）

回報：
- 要合併的分支名稱
- 對應的 PR 編號（若有）

**Gate 條件**：
- ✅ 以上全部通過 → 繼續
- ❌ 任何一項未通過 → **中止，先解決未通過的項目**

---

# 🅱️ 合併流程（Merge Process）

## Phase 1 — 切換並同步主線（auto-execute）

```bash
git checkout main
git pull origin main
```

## Phase 2 — 同步開發分支（auto-execute）

確保開發分支已包含 main 的最新變更，減少 merge conflict 風險：

```bash
git checkout <BRANCH_NAME>
git merge main --no-edit
```

### 若出現 Merge Conflict

1. **列出衝突檔案**：
   ```bash
   git diff --name-only --diff-filter=U
   ```
2. **逐一解決衝突**（保留正確邏輯，不可隨意取一邊）
3. **解決後驗證**：
   ```bash
   npx tsc --noEmit && npm run build
   ```
4. **提交 conflict resolution**：
   ```bash
   git add -A && git commit -m "chore: resolve merge conflicts with main"
   ```

> 若衝突過於複雜，中止合併並通知使用者評估：
> ```bash
> git merge --abort
> ```

## Phase 3 — Merge 後 Build 驗證（auto-execute）

切回 main 執行合併，並在 push 前驗證：

```bash
git checkout main
git merge <BRANCH_NAME> --no-ff -m "merge: <BRANCH_NAME> → main"
```

```bash
npx tsc --noEmit && npm run build
```

> 若 build 失敗 → **不可 push**。還原合併後排查問題：
> ```bash
> git reset --hard HEAD~1
> ```

## Phase 4 — 推送觸發正式部署

> ⚠️ 此步驟**不可 auto-execute**，必須讓使用者最終確認。

```bash
echo "=== 即將推送以下 commits 到 main ==="
git log origin/main..HEAD --oneline

echo ""
echo "=== 確認後執行 push ==="
```

```bash
git push origin main
```

---

# ✅ 清理與驗收

## Phase 5 — 正式環境驗證

1. 前往 GitHub **Actions** 確認部署 workflow 已觸發並成功
2. 部署成功後，開啟 Production URL 進行最終確認
3. 重點驗證本次合併的功能是否正常運作

## Phase 6 — 清理分支

確認 PR 狀態後再刪除：

```bash
echo "=== 確認 branch 已完全合併 ==="
git branch --merged main | grep "<BRANCH_NAME>" && echo "✅ 已合併" || echo "❌ 尚未合併，請勿刪除"
```

> ⚠️ 僅在確認已合併後執行刪除：

```bash
# 刪除本地分支
git branch -d <BRANCH_NAME>

# 刪除遠端分支
git push origin --delete <BRANCH_NAME>
```

**[合併發布完成 🎉]**
