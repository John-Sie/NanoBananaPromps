---
description: 僅同步更新版本號與 CHANGELOG — 不觸發部署
---

> 本 workflow 遵循 `engineering-agent.md` 通用守則。

Task: 同步更新所有版本號並準備 CHANGELOG，但**不觸發部署**

**與 `release.md` 的關係**：
- `release.md` 包含完整的發布流程（版本更新 + 驗證 + 部署 + 線上驗收 + GitHub Release）
- 本 workflow 僅執行版本號同步，適用於以下場景：
  - 預先準備版本號，稍後再走 `release.md`（可從 Phase 4 開始）
  - 多人協作時，由一人先 bump version，另一人負責 release
- **若要直接發布，請走 `release.md`，不需要先跑本 workflow**

---

## Phase 0 — 目前版本狀態（auto-execute）

```bash
echo "=== 目前版本 ==="
echo "package.json : $(node -p "require('./package.json').version")"
echo "latest tag   : $(git tag --sort=-version:refname | head -1)"

# 專案特定（若存在）
[ -f "extension/manifest.json" ] && echo "extension    : $(node -p "require('./extension/manifest.json').version")" || true
[ -f ".github/.release-please-manifest.json" ] && echo "manifest     : $(node -p "require('./.github/.release-please-manifest.json')['.']")" || true
```

回報：
- 目前版本是多少？
- 新版本號是多少？（Major / Minor / Patch）

---

## Phase 1 — 更新版本號

同步更新以下位置（不存在的跳過）：

1. **`package.json`** → `version` 欄位（必要）
2. **`extension/manifest.json`** → `version` 欄位（若有）
3. **`.github/.release-please-manifest.json`** → 對應欄位（若有）
4. **UI 版本顯示** → 確認為動態讀取（若為靜態寫死則修正）

---

## Phase 2 — 更新 CHANGELOG.md

在 `CHANGELOG.md` 頂部（`# Changelog` 之後）插入：

```markdown
## [<NEW_VERSION>](https://github.com/<OWNER>/<REPO>/compare/v<PREV>...v<NEW_VERSION>) (YYYY-MM-DD)

### ✨ Features
* **scope:** 說明新功能

### 🐛 Bug Fixes
* **scope:** 說明修復內容

### 🔧 Improvements
* **scope:** 說明改善項目
```

> 僅列出有內容的分類。日期為當天。

---

## Phase 3 — Build 驗證（auto-execute）

> 即使不部署，也要確認版本變更沒有破壞 build。

```bash
npx tsc --noEmit && npm run build
```

---

## Phase 4 — 提交版本變更

```bash
git add package.json CHANGELOG.md
# 若有其他版本檔案也一併加入

git commit -m "chore(release): bump to v<NEW_VERSION>"
```

> ⚠️ 此步驟**不打 tag、不 push**。Tag 和 push 由 `release.md` Phase 6 執行。

---

## 驗證（auto-execute）

```bash
echo "=== 版本同步確認 ==="
PKG=$(node -p "require('./package.json').version")
echo "package.json : $PKG"
echo ""
echo "=== 待 push 的 commit ==="
git log origin/main..HEAD --oneline
echo ""
echo "⏭️ 下一步：執行 release.md（可從 Phase 4 開始）"
```

**[Version Bump 完成 ✅]**

> 接下來走 `release.md` 完成：驗證 → Tag → Push → 部署 → 線上驗收 → GitHub Release
