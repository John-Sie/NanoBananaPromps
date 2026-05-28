---
description: 專案一鍵發布流程 — 版本更新、程式碼檢查、Git tag、CI/CD 部署、線上驗收、GitHub Release
---

你是專案的版本管理員兼部署確認官。執行此 workflow 的目標是：**從當前 repo 狀態出發，完成版本號更新、程式碼檢查、Git tag、觸發 CI/CD 部署、線上驗收、到 GitHub Release 建立的完整發布流程。**

**執行準則：每個階段完成後停下來回報結果，等待確認後再繼續。**

**與其他 workflow 的關係**：
- 發布前建議先跑 `security-hygiene-audit.md`
- 若需要簡化的 Vercel 直接部署 → `release-vercel.md`
- 若上線後出問題 → `rollback.md`

---

# 🅰️ 準備階段（Prepare）

---

## 📋 Phase 0 — 現況快照與環境確認

先掌握目前整個 repo 的狀態，再決定從哪一步開始。

### 0a. Repo 狀態（auto-execute）

```bash
echo "=== 未提交的檔案 ==="
git status --short
echo ""
echo "=== 未 push 的 commit ==="
git log origin/main..HEAD --oneline
echo ""
echo "=== 目前版本資訊 ==="
echo "package.json : $(node -p "require('./package.json').version")"
echo "latest tag   : $(git tag --sort=-version:refname | head -1)"
echo ""
echo "=== 最近 5 個 commit ==="
git log --oneline -5
```

### 0b. CI/CD 環境確認（auto-execute）

> 提前確認，避免 push 後才發現 secrets 缺失。

```bash
echo "=== 檢查 gh CLI ==="
gh --version 2>/dev/null || echo "⚠️ gh CLI 未安裝，Phase 11 需手動建立 Release"

echo ""
echo "=== 檢查 GitHub Actions secrets（需有 repo admin 權限） ==="
gh secret list 2>/dev/null | head -10 || echo "⚠️ 無法列出 secrets，請手動至 GitHub Settings 確認"
```

> 確認 CI/CD 所需的 secrets 已配置（如 `VERCEL_TOKEN`、`ORG_ID`、`PROJECT_ID` 等，依專案而定）。

回報：
- 有哪些未提交的檔案？
- 有哪些 commit 尚未 push？
- 版本號是否一致（package.json / latest tag）？
- CI/CD secrets 是否就緒？

**[Phase 0 完成 → 回報狀態，等待確認後決定新版本號]**

---

## 📋 Phase 1 — 提交所有未提交的修改

如果有未提交的檔案（`git status --short` 有輸出），先處理：

```bash
# 檢查要提交的檔案
git status --short
git diff --stat

# 只加入相關檔案（不用 git add -A，避免帶入不相關變更）
git add <SPECIFIC_FILES>
git commit -m "<TYPE>(<SCOPE>): <DESCRIPTION>"
```

> commit message 格式：
> - `feat(scope): ...` — 新功能
> - `fix(scope): ...` — 修復 bug
> - `chore(scope): ...` — 設定、工具類修改
> - `refactor(scope): ...` — 重構（不改功能）

確認提交成功（auto-execute）：

```bash
git status --short
git log --oneline -3
```

**[Phase 1 完成 → 確認 working tree 乾淨]**

---

## 📋 Phase 2 — 決定新版本號

### 版本號規則（Semantic Versioning）

| 類型 | 遞增位置 | 範例 | 使用情境 |
|------|---------|------|---------|
| **patch** | `x.x.+1` | `3.3.0` → `3.3.1` | Bug fix、文件更新、設定修正、小功能補齊 |
| **minor** | `x.+1.0` | `3.3.1` → `3.4.0` | 新增較大功能、UI 重構、多頁面整合 |
| **major** | `+1.0.0` | `3.x.x` → `4.0.0` | 破壞性變更、架構大改 |

### 查看自上版以來的變更（auto-execute）

```bash
LAST_TAG=$(git tag --sort=-version:refname | head -1)
echo "自 $LAST_TAG 以來的 commit："
git log --oneline --no-merges ${LAST_TAG}..HEAD
```

> ⚠️ 若 latest tag 與 package.json 版本不符，代表上一版未正確完成 tag，需先確認情況再決定新版本號。

**[Phase 2 完成 → 確認新版本號，例如 v3.3.2]**

---

## 📋 Phase 3 — 更新版本號（全站同步）

以新版本號 `<NEW_VERSION>` 為基準，同步更新以下所有位置：

### 必要更新

#### 1. `package.json`
```json
"version": "<NEW_VERSION>"
```

### 專案特定更新（依實際情況，可能不存在）

> 以下為常見的額外版本同步位置，依專案實際結構調整。不存在的檔案直接跳過。

#### 2. 瀏覽器擴充套件 manifest（若有 `extension/manifest.json`）
```json
"version": "<NEW_VERSION>"
```

#### 3. Release manifest（若有 `.github/.release-please-manifest.json`）
```json
{ ".": "<NEW_VERSION>" }
```

#### 4. UI 版本顯示
確認 Footer 或其他 UI 元素是否動態讀取 `package.json` 的 version。若為靜態寫死，改為動態讀取。

#### 5. 首頁 Freshness Signal（若有 `<time>` 標籤）

```bash
# 更新首頁日期（依實際檔案路徑調整）
node -e "
const fs = require('fs');
const pagePath = 'src/app/page.tsx'; // 調整為實際路徑
if (fs.existsSync(pagePath)) {
  let txt = fs.readFileSync(pagePath, 'utf8');
  const date = new Date().toISOString().split('T')[0];
  txt = txt.replace(/<time dateTime=\"[0-9-]+\"/g, \`<time dateTime=\"\${date}\"\`);
  txt = txt.replace(/>[0-9]{4}-[0-9]{2}-[0-9]{2}<\/time>/g, \`>\${date}</time>\`);
  fs.writeFileSync(pagePath, txt);
  console.log('✅ 首頁日期已更新');
} else {
  console.log('ℹ️ 無首頁日期標籤，跳過');
}
"
```

### 驗證同步狀態（auto-execute）

```bash
echo "=== 版本同步檢查 ==="
PKG=$(node -p "require('./package.json').version")
echo "package.json : $PKG"

# 檢查 extension manifest（若存在）
[ -f "extension/manifest.json" ] && echo "extension    : $(node -p "require('./extension/manifest.json').version")" || echo "extension    : N/A"

# 檢查 release manifest（若存在）
[ -f ".github/.release-please-manifest.json" ] && echo "manifest     : $(node -p "require('./.github/.release-please-manifest.json')['.']")" || echo "manifest     : N/A"
```

**[Phase 3 完成 → 確認版本號已同步]**

---

## 📋 Phase 4 — Test, Lint & Build 驗證

> 此步驟確保程式碼品質與 CI 建置不會失敗。依序執行。

### 4a. Unit Test（auto-execute）

```bash
npm run test 2>&1 || echo "⚠️ test script 不存在或執行失敗"
```

- ✅ 全部通過 → 繼續
- ❌ 有 fail → **必須修復，不可跳過**
- ⚠️ 無 test script → 記錄，建議下版補上

### 4b. Lint（auto-execute）

```bash
npm run lint 2>&1 | tail -30
```

### 4c. Type Check（auto-execute）

```bash
npx tsc --noEmit 2>&1 | tail -30
```

### 4d. Production Build（auto-execute）

```bash
npm run build 2>&1
```

- ✅ 無 **error**（warning 可接受）→ 繼續
- ❌ 有 error → **必須修復，不可跳過**

> 若 build 失敗，顯示完整錯誤輸出以便排查。

**[Phase 4 完成 → 回報 test/lint/tsc/build 結果]**

---

## 📋 Phase 5 — 更新 CHANGELOG.md

### 取得自上版以來的 commit（auto-execute）

```bash
LAST_TAG=$(git tag --sort=-version:refname | head -1)
git log --oneline --no-merges ${LAST_TAG}..HEAD
```

### 格式（在檔案頂部 `# Changelog` 之後插入）

```markdown
## [<NEW_VERSION>](https://github.com/<OWNER>/<REPO>/compare/v<PREV_VERSION>...v<NEW_VERSION>) (YYYY-MM-DD)

### ✨ Features
* **scope:** 說明新功能

### 🐛 Bug Fixes
* **scope:** 說明修復內容

### 🔧 Improvements
* **scope:** 說明改善項目

---
```

> 日期根據當前實際日期填寫（格式：`YYYY-MM-DD`）。僅列出有內容的分類，空分類不要列出。

**[Phase 5 完成 → 展示 Changelog 草稿，等待確認]**

---

## 📋 Phase 6 — Release Commit + Tag + Push

所有內容確認後，依序執行：

### Step A：Commit 版本相關檔案

```bash
# 只加入版本相關檔案
git add package.json CHANGELOG.md
# 若有其他版本檔案也一併加入（如 extension/manifest.json）

git commit -m "chore(main): release <NEW_VERSION>"
```

### Step B：打 Tag

```bash
VERSION=$(node -p "require('./package.json').version")
git tag -a "v$VERSION" -m "Release v$VERSION"
```

### Step C：Push main + tags

> ⚠️ 此步驟**不可 auto-execute**——push tags 是不可逆操作，會觸發 CI/CD 部署。

```bash
git push origin main --tags
```

### 最終驗證（auto-execute）

```bash
echo "=== Release 驗證 ==="
git log --oneline -4
echo ""
git tag --sort=-version:refname | head -3
echo ""
git status --short
echo ""
PKG=$(node -p "require('./package.json').version")
TAG=$(git tag --sort=-version:refname | head -1)
echo "package.json : $PKG"
echo "latest tag   : $TAG"
[ "v$PKG" = "$TAG" ] && echo "✅ package ↔ tag 同步" || echo "❌ 不同步"
[ -z "$(git status --porcelain)" ] && echo "✅ working tree 乾淨" || echo "❌ 有未提交的變更"
```

**[Phase 6 完成 → CI/CD 已被觸發，自動進入部署觀察階段]**

---

# 🅱️ 部署階段（Deploy & Verify）

---

## 📋 Phase 7 — 確認 CI/CD 部署狀態

```bash
gh run list --limit 5 || echo "請手動至 GitHub Actions Dashboard 確認"
```

手動確認路徑：至 GitHub repository 點擊 **Actions** 分頁 → 查看部署 workflow 的最新狀態。

- ✅ Success → 繼續
- ❌ In Progress / Failed → 等待執行或排查 build log

---

## 📋 Phase 8 — 資料庫 Migration（若適用）

> 若專案使用 Supabase / Prisma / 其他 migration 工具，檢查是否有待套用的 migration。

```bash
# Supabase 範例
ls -lt supabase/migrations/ 2>/dev/null | head -10 || echo "無 Supabase migrations 目錄"

# Prisma 範例
# npx prisma migrate status
```

- **有新 migration** → 套用至 production（依工具執行對應指令）
- **無新 migration** → 跳過

---

## 📋 Phase 9 — 線上驗收清單

請確認以下核心流程（逐一回報結果）：

| 項目 | 驗收方式 |
|------|---------|
| 版本號 | Footer 或 UI 應顯示當前版本 |
| 首頁載入 | 頁面正常渲染，無 500 / blank page |
| 登入流程 | 用測試帳號完整登入（若有） |
| 核心功能 | 測試一項核心服務確認無錯誤 |

> 本清單為通用核心項目。每次發布如有新功能，請在當次手動補充驗收項目。

- ✅ 全部通過 → 繼續 Phase 10
- ❌ 任何核心功能失敗 → **停止發布，評估是否需要 hotfix 或 rollback**

### Rollback 指引（緊急）

若部署成功但線上驗收失敗：

```bash
# 方法 1：透過部署平台 Dashboard rollback（推薦）
# Vercel: Deployments → 找上一個穩定版 → "Promote to Production"

# 方法 2：Git revert
git revert HEAD --no-edit
git push origin main
```

Rollback 後需追蹤修復 issue，並在修復後重新走完整 release 流程。

---

## 📋 Phase 10 — 建立 GitHub Release

先確認該版本 Release 是否已存在（auto-execute）：

```bash
VERSION=$(node -p "require('./package.json').version")
echo "目標版本：v$VERSION"
gh release view "v$VERSION" 2>/dev/null && echo "⚠️  Release v$VERSION 已存在，跳過建立" || echo "✅ Release 不存在，準備建立"
```

若 Release 不存在：

```bash
VERSION=$(node -p "require('./package.json').version")
NOTES=$(awk "/^## \[$VERSION\]/{found=1; next} found && /^## \[/{exit} found{print}" CHANGELOG.md)
gh release create "v$VERSION" \
  --title "v$VERSION" \
  --notes "$NOTES" \
  --latest
```

> 若無 `gh` CLI，手動至 GitHub → Releases → Draft a new release：
> 1. Tag：`v<VERSION>`（選「Create new tag on publish」）
> 2. Title：`v<VERSION>`
> 3. 內文：貼上 CHANGELOG.md 對應版本區塊
> 4. 勾選「Set as the latest release」

---

# ✅ 完成條件

## 準備階段
- [ ] `git status` 乾淨（無未提交的變更）
- [ ] `npm run test` → 全部通過（或確認無 test script）
- [ ] `npm run lint` → 無 error
- [ ] `npx tsc --noEmit` → 無 error
- [ ] `npm run build` → 無 error
- [ ] `package.json` version = latest tag
- [ ] `CHANGELOG.md` 已在頂部新增本版內容
- [ ] `git push origin main --tags` 已完成

## 部署階段
- [ ] CI/CD secrets 確認存在
- [ ] CI/CD 部署顯示 Success
- [ ] 資料庫 migration 已套用（或確認無新 migration）
- [ ] 線上版本號正確
- [ ] 核心功能驗收通過
- [ ] GitHub Release 已建立並標記 Latest

**發布完成 🎉**

---

# 🔁 常見問題排查

| 狀況 | 解法 |
|------|------|
| tag 與 package.json 不一致 | 重新打 tag：`git tag -d vX.Y.Z && git push origin :refs/tags/vX.Y.Z`，再重新打 |
| 有未 push 的 commit | `git push origin main` |
| CI/CD 失敗 | 至 Actions 頁面確認錯誤紀錄（常見：Secrets 未設定、build error） |
| 部署平台缺少 env var | 至平台 Dashboard → Settings → Environment Variables 補齊後重跑 |
| 線上驗收失敗 | 使用 Rollback 指引回退，修復後重新走完整流程 |
| `gh` CLI 未安裝 | `brew install gh && gh auth login` |
