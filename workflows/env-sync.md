---
description: 環境變數同步檢查 — 確保 local / preview / production 的 env var 一致
---

> 本 workflow 遵循 `engineering-agent.md` 通用守則。

Task: 檢查並同步各環境的環境變數，確保無遺漏或不一致

**與其他 workflow 的關係**：
- `release.md` — 發布前應確認 env var 已同步
- `onboarding.md` — 新環境設定時確認 env var 完整性
- `hotfix.md` / `rollback.md` — 部署失敗的常見原因之一就是 env var 缺失

**建議執行時機**：
- 新增第三方服務 / API 後
- 部署環境變更（換 DB、換 CDN）後
- 發布前的最後確認
- 部署失敗排查時

---

## Step 1 — 盤點所有環境變數來源（auto-execute）

```bash
echo "=== .env 檔案 ==="
ls -la .env* 2>/dev/null || echo "無 .env 檔案"

echo ""
echo "=== .env.example（定義的 key） ==="
cat .env.example 2>/dev/null | grep -v "^#" | grep -v "^$" | cut -d'=' -f1 | sort || echo "無 .env.example"

echo ""
echo "=== .env.local（本地設定的 key） ==="
cat .env.local 2>/dev/null | grep -v "^#" | grep -v "^$" | cut -d'=' -f1 | sort || echo "無 .env.local"

echo ""
echo "=== Code 中引用的 env var ==="
grep -roh "process\.env\.\w\+" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | sort -u
grep -roh "import\.meta\.env\.\w\+" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | sort -u
```

### Step 2 — 交叉比對（auto-execute）

```bash
echo "=== Code 引用但 .env.example 未定義的 key ==="
CODE_VARS=$(grep -roh "process\.env\.\w\+" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | sed 's/process\.env\.//' | sort -u)
EXAMPLE_VARS=$(cat .env.example 2>/dev/null | grep -v "^#" | grep -v "^$" | cut -d'=' -f1 | sort -u)

for var in $CODE_VARS; do
  echo "$EXAMPLE_VARS" | grep -q "^${var}$" || echo "⚠️ 缺少: $var"
done

echo ""
echo "=== .env.example 定義但 code 未引用的 key（可能已廢棄） ==="
for var in $EXAMPLE_VARS; do
  grep -rq "process\.env\.$var\|process\.env\[.$var" src/ --include="*.ts" --include="*.tsx" 2>/dev/null || echo "⚠️ 可能廢棄: $var"
done
```

### Step 3 — 分類環境變數

產出以下分類表：

```markdown
## Environment Variables Inventory

### 🔴 必要（缺失會導致 build 失敗或功能異常）

| Key | 用途 | local | preview | production |
|-----|------|-------|---------|------------|
| `DATABASE_URL` | 資料庫連線 | ✅ | ✅ | ❓ |
| `NEXTAUTH_SECRET` | 認證加密 | ✅ | ✅ | ❓ |

### 🟡 重要（缺失會導致部分功能不可用）

| Key | 用途 | local | preview | production |
|-----|------|-------|---------|------------|
| `OPENAI_API_KEY` | AI 功能 | ✅ | ⚠️ | ❓ |

### 🟢 可選（缺失不影響核心功能）

| Key | 用途 | local | preview | production |
|-----|------|-------|---------|------------|
| `ANALYTICS_ID` | 數據追蹤 | ❌ | ❌ | ❓ |

### 🔵 Build-time Only（`NEXT_PUBLIC_` prefix）

| Key | 用途 | 說明 |
|-----|------|------|
| `NEXT_PUBLIC_SITE_URL` | 前端 URL | build 時嵌入，運行時無法更改 |
```

> ❓ 表示需要至部署平台 Dashboard 手動確認。

### Step 4 — 遠端環境確認

```bash
echo "=== Vercel env var（需要 vercel CLI） ==="
vercel env ls 2>/dev/null || echo "⚠️ vercel CLI 未安裝或未登入"

echo ""
echo "=== GitHub Actions secrets（需要 gh CLI） ==="
gh secret list 2>/dev/null || echo "⚠️ gh CLI 未安裝或無權限"
```

> 若無 CLI 權限，請使用者手動至 Dashboard 確認：
> - Vercel → Settings → Environment Variables
> - GitHub → Settings → Secrets and variables → Actions

### Step 5 — 更新 .env.example

若發現不一致，更新 `.env.example` 確保它是 single source of truth：

```bash
# .env.example 應包含所有需要的 key（不含實際值）
# 格式：
# KEY_NAME=<description or placeholder>
# DATABASE_URL=postgresql://user:password@host:5432/dbname
# OPENAI_API_KEY=sk-...
```

### Step 6 — 產出同步報告

```markdown
## Env Sync Report

### 狀態摘要

| 項目 | 狀態 |
|------|------|
| .env.example 完整性 | ✅ / ⚠️ 缺 N 個 key |
| .env.local 設定 | ✅ / ⚠️ 缺 N 個 key |
| Preview 環境 | ✅ / ❓ 需手動確認 |
| Production 環境 | ✅ / ❓ 需手動確認 |
| 廢棄 key | N 個可移除 |

### 需要處理的項目

| # | 動作 | Key | 環境 |
|---|------|-----|------|
| 1 | 新增 | `NEW_API_KEY` | production |
| 2 | 移除 | `DEPRECATED_VAR` | .env.example |

### NEXT_PUBLIC_ 注意事項
- `NEXT_PUBLIC_*` 變數在 build time 嵌入，修改後需要 rebuild
- 確保 preview 和 production 的 `NEXT_PUBLIC_*` 值正確
```

---

## 額外規則

- **永遠不要在 .env.example 中放入真實的 secret** — 只放 key 名稱和 placeholder
- `.env.local` 和 `.env` 必須在 `.gitignore` 中
- 新增 env var 時，**同時更新 .env.example**（這是最容易被遺忘的步驟）
- `NEXT_PUBLIC_` 開頭的變數會暴露在前端 bundle 中，不可用於存放 secret
