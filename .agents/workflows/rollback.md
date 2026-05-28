---
description: 緊急回退生產版本 — 災難恢復專用
---

你是專案的救援官。執行此 workflow 的目標是：**在發現生產環境出現嚴重問題時，以最快速度讓服務恢復至上一個穩定版本。**

**與其他 workflow 的關係**：
- `release.md` / `merge-to-main.md` / `hotfix.md` 觸發部署後出問題 → 走本 workflow
- 恢復後的 bug 修復 → 走 `feature-branch.md`，**不可直接在 main 上修**

> [!CAUTION]
> 本 workflow 為**緊急流程**，以速度優先。所有步驟設計為最短路徑恢復服務。

---

# 🅰️ 立即止血（Instant Recovery）

## Phase 0 — 選擇回退方式

根據情境選擇最快的回退方式：

### 方式 A：部署平台 Dashboard 回退（⚡ 最快，推薦）

> 適用於：部署平台支援一鍵回退（如 Vercel、Netlify、Cloudflare Pages）

1. 開啟部署平台的 **Deployments** 頁面
2. 找到「發布前」的最後一個成功 Deployment（✅ Ready / Success）
3. 選擇 **Promote to Production** / **Rollback**
4. **服務將在數秒內恢復**

> 執行完方式 A 後，**必須繼續 Phase 1-4 修正 Git 狀態**。否則下次 push 會再部署壞的版本。

### 方式 B：Git Revert（適用於無 Dashboard 回退功能的環境）

直接跳到 Phase 1 開始 Git 回退流程。

---

# 🅱️ 修正 Git 狀態

## Phase 1 — 確認回退目標（auto-execute）

```bash
echo "=== 當前 main 狀態 ==="
git checkout main
git pull origin main

echo ""
echo "=== 最近 10 個 commit ==="
git log --oneline -10

echo ""
echo "=== 最近 3 個 tag ==="
git tag --sort=-version:refname | head -3

echo ""
echo "=== 當前版本 ==="
echo "package.json : $(node -p "require('./package.json').version")"
```

向使用者確認：
- 需要 revert 幾個 commit？（通常是 1-2 個：release commit + 可能的 merge commit）
- 上一個穩定版本號是什麼？

## Phase 2 — 撤銷問題 Commit

### 單一 commit revert（最常見）
```bash
git revert HEAD --no-edit
```

### 多個 commit revert（如 merge + release commit）
```bash
# revert 最近 N 個 commit（從新到舊）
git revert HEAD~<N>..HEAD --no-edit
```

### Merge commit revert（若最後一個是 merge commit）
```bash
# -m 1 表示保留 main 的那一邊
git revert HEAD -m 1 --no-edit
```

> ⚠️ 若不確定要 revert 哪些 commit，先用 `git log --oneline -10` 確認後再執行。

## Phase 3 — Build 驗證（auto-execute）

```bash
npx tsc --noEmit && npm run build
```

> 若 build 失敗 → revert 可能不完整或有衝突。排查問題後重試，**不可在 build 壞的狀態下 push**。

## Phase 4 — 清理錯誤的 Tag

> ⚠️ 此步驟**不可 auto-execute**——刪除 remote tag 是不可逆操作。

先確認要刪除的 tag：

```bash
echo "=== 要刪除的 tag ==="
echo "最新 tag: $(git tag --sort=-version:refname | head -1)"
echo ""
echo "確認這是錯誤版本的 tag 嗎？"
```

確認後執行：

```bash
BAD_TAG="v<BAD_VERSION>"
git tag -d "$BAD_TAG"
git push origin --delete "$BAD_TAG"
```

> 若 tag 不需要刪除（例如 tag 本身沒問題，只是部署的 code 有 bug），跳過此步驟。

## Phase 5 — 推送回退並觸發重新部署

> ⚠️ 此步驟**不可 auto-execute**。

```bash
git push origin main
```

> 這會觸發 CI/CD 重新部署，以 revert 後的 code 覆蓋 production。

---

# 🔄 資料庫 Rollback（若適用）

> 若問題版本包含了 DB migration，光回退 code 不夠。

### 評估 migration 影響

```bash
echo "=== 最近的 migration 檔案 ==="
ls -lt supabase/migrations/ 2>/dev/null | head -5 || echo "無 Supabase migrations"
# 或 Prisma: npx prisma migrate status
```

**處理原則**：
- **新增欄位（additive）**：通常不需要回退 migration，新欄位存在但不被使用不會造成問題
- **刪除或重命名欄位（destructive）**：需要回退 migration，但操作風險高。**建議先評估影響再決定**，不可自動執行
- **不確定**：標記為待處理，通知使用者人工評估

---

# ✅ 驗證與事後處理

## Phase 6 — 線上驗證

1. 確認 Production URL 可正常載入
2. 確認版本號已回退到穩定版本
3. 測試之前出問題的功能是否已恢復正常

## Phase 7 — 事故記錄（Post-Mortem）

產出以下記錄：

```markdown
## Incident Report

| 項目 | 內容 |
|------|------|
| 發生時間 | YYYY-MM-DD HH:MM |
| 發現方式 | 使用者回報 / 監控告警 / 手動發現 |
| 影響範圍 | 哪些功能受影響、持續多久 |
| 根因 | 簡述問題原因 |
| 回退方式 | Dashboard rollback / Git revert |
| 恢復時間 | YYYY-MM-DD HH:MM |
| 總停機時間 | N 分鐘 |

### 後續行動
- [ ] 在新分支修復 bug（走 `feature-branch.md`）
- [ ] 修復後重新走 `release.md` 發布
- [ ] 更新測試覆蓋（避免同類問題再次發生）
- [ ] 評估是否需要加強 CI 檢查
```

> **不要直接在 main 修 bug！** 走 `feature-branch.md` 在新分支修復，完整測試後再走 `release.md`。

**[災難恢復完成 🚑]**
