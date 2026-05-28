---
description: 新專案初始化 — 從 clone 到環境設定到 dev server 驗證
---

> 本 workflow 遵循 `engineering-agent.md` 通用守則。

Task: 初始化開發環境，確保專案可以在本地正常運行

**適用場景**：
- 首次 clone 一個新專案
- 換機器 / 重建開發環境
- 新成員加入團隊

---

## Step 1 — 環境檢查（auto-execute）

```bash
echo "=== 系統環境 ==="
echo "OS: $(uname -s) $(uname -m)"
echo "Node: $(node -v 2>/dev/null || echo '❌ 未安裝')"
echo "npm: $(npm -v 2>/dev/null || echo '❌ 未安裝')"
echo "git: $(git --version 2>/dev/null || echo '❌ 未安裝')"
echo "gh: $(gh --version 2>/dev/null | head -1 || echo '⚠️ 未安裝（可選）')"

echo ""
echo "=== 專案資訊 ==="
echo "package.json name: $(node -p "require('./package.json').name" 2>/dev/null || echo '無 package.json')"
echo "package.json version: $(node -p "require('./package.json').version" 2>/dev/null)"
echo "Node engine: $(node -p "require('./package.json').engines?.node || 'N/A'" 2>/dev/null)"
```

**必要條件**：
- Node.js（版本符合 `package.json` 的 `engines` 要求）
- npm / pnpm / yarn（依專案而定）
- Git

### Node 版本不符時

```bash
# 使用 nvm 切換
nvm install $(node -p "require('./package.json').engines?.node || 'lts/*'" 2>/dev/null)
nvm use $(node -p "require('./package.json').engines?.node || 'lts/*'" 2>/dev/null)
```

---

## Step 2 — 安裝依賴（auto-execute）

```bash
echo "=== 檢查 lock file 類型 ==="
[ -f "package-lock.json" ] && echo "使用 npm"
[ -f "pnpm-lock.yaml" ] && echo "使用 pnpm"
[ -f "yarn.lock" ] && echo "使用 yarn"
[ -f "bun.lockb" ] && echo "使用 bun"
```

依 lock file 類型執行安裝：

```bash
# npm
npm install

# pnpm
# pnpm install

# yarn
# yarn install
```

---

## Step 3 — 環境變數設定

```bash
echo "=== .env 範本 ==="
ls -la .env* 2>/dev/null

echo ""
echo "=== .env.example 內容 ==="
cat .env.example 2>/dev/null || cat .env.local.example 2>/dev/null || echo "⚠️ 無 .env 範本檔案"
```

### 設定流程

1. 複製範本：
   ```bash
   cp .env.example .env.local 2>/dev/null || cp .env.example .env 2>/dev/null
   ```

2. 填入必要的環境變數（向使用者確認每個值）：
   - 資料庫連線（Supabase URL / Prisma DATABASE_URL）
   - 第三方 API Key
   - 認證相關（NextAuth secret 等）

3. 驗證 `.env` 不會被 git 追蹤：
   ```bash
   grep -q ".env" .gitignore && echo "✅ .env 在 .gitignore 中" || echo "❌ .env 未被 gitignore！"
   ```

> 若專案無 `.env.example`，建議建立一個（列出所有需要的環境變數 key，不含實際值）。

---

## Step 4 — 資料庫設定（若適用）

### Supabase

```bash
echo "=== Supabase 設定 ==="
[ -d "supabase" ] && echo "✅ 有 Supabase 目錄" || echo "ℹ️ 無 Supabase 目錄，跳過"

# 本地 Supabase
npx supabase start 2>/dev/null || echo "⚠️ Supabase CLI 未安裝或 Docker 未啟動"
```

### Prisma

```bash
echo "=== Prisma 設定 ==="
[ -f "prisma/schema.prisma" ] && echo "✅ 有 Prisma schema" || echo "ℹ️ 無 Prisma schema，跳過"

# 生成 Prisma Client
npx prisma generate 2>/dev/null

# 套用 migration
npx prisma migrate dev 2>/dev/null
```

---

## Step 5 — Build 驗證（auto-execute）

```bash
echo "=== Type Check ==="
npx tsc --noEmit 2>&1 | tail -10

echo ""
echo "=== Build ==="
npm run build 2>&1 | tail -20
```

- ✅ Build 成功 → 繼續
- ❌ Build 失敗 → 排查問題（常見：env var 缺失、Node 版本不符、依賴未安裝）

---

## Step 6 — 啟動 Dev Server

```bash
npm run dev
```

驗證：
- [ ] Dev server 啟動成功
- [ ] 首頁可正常載入
- [ ] 無 console error
- [ ] 登入功能正常（若有）

---

## Step 7 — 產出環境摘要

```markdown
## Development Environment Summary

| 項目 | 狀態 |
|------|------|
| Node.js | vXX.X.X ✅ |
| npm | vXX.X.X ✅ |
| Dependencies | 已安裝 ✅ |
| .env | 已設定 ✅ |
| 資料庫 | 已連線 ✅ / N/A |
| Type Check | ✅ |
| Build | ✅ |
| Dev Server | ✅ |

### 已知問題 / 注意事項
- <若有任何 warning 或需要注意的事項>

### 常用指令
| 指令 | 用途 |
|------|------|
| `npm run dev` | 啟動開發伺服器 |
| `npm run build` | Production build |
| `npm run test` | 執行測試 |
| `npm run lint` | 執行 linter |
```

**[環境初始化完成 🎉]**
