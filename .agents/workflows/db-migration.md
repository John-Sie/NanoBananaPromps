---
description: 資料庫 Schema 變更 — 建立、驗證、部署 migration
---

> 本 workflow 遵循 `engineering-agent.md` 通用守則。

Task: 安全地變更資料庫 Schema 並確保資料完整性

**與其他 workflow 的關係**：
- `release.md` Phase 8 引用本 workflow 來處理 migration 部署
- `rollback.md` 中的 DB rollback 指引為本 workflow 的逆向操作
- migration 本身是 code 變更的一部分，應在 `feature-branch.md` 的分支中進行

> [!CAUTION]
> **資料庫變更是不可逆的高風險操作。** 刪除欄位、重命名表格、修改型別等 destructive migration 一旦套用到 production，無法簡單回退。

---

## 變更類型與風險等級

| 類型 | 風險 | 說明 |
|------|------|------|
| 新增表格（CREATE TABLE） | 🟢 低 | 不影響現有資料 |
| 新增欄位（ADD COLUMN） | 🟢 低 | 需注意 NOT NULL 欄位的預設值 |
| 新增 index | 🟡 中 | 大表建 index 可能暫時鎖表 |
| 修改欄位型別（ALTER COLUMN） | 🟠 高 | 可能丟失資料精度 |
| 重命名欄位/表格（RENAME） | 🟠 高 | 所有引用該名稱的 code 都會壞掉 |
| 刪除欄位/表格（DROP） | 🔴 極高 | **不可逆，資料永久遺失** |
| 修改 RLS Policy | 🟠 高 | 可能意外開放或封鎖存取 |

---

## 執行步驟

### Step 1 — 現況確認（auto-execute）

```bash
echo "=== 現有 migration 檔案 ==="
ls -lt supabase/migrations/ 2>/dev/null | head -10 || echo "無 Supabase migrations 目錄"
ls -lt prisma/migrations/ 2>/dev/null | head -10 || echo "無 Prisma migrations 目錄"

echo ""
echo "=== 當前 schema ==="
cat prisma/schema.prisma 2>/dev/null | head -50 || echo "無 Prisma schema"
```

### Step 2 — 產出 Migration 計畫

**必須在執行前**產出以下計畫，等待使用者確認：

```markdown
## Migration Plan

| # | 操作 | 表格/欄位 | 風險 | SQL |
|---|------|-----------|------|-----|
| 1 | ADD COLUMN | `users.avatar_url` | 🟢 低 | `ALTER TABLE users ADD COLUMN avatar_url TEXT;` |
| 2 | ADD INDEX | `posts.created_at` | 🟡 中 | `CREATE INDEX idx_posts_created ON posts(created_at);` |
| 3 | DROP COLUMN | `users.legacy_field` | 🔴 極高 | `ALTER TABLE users DROP COLUMN legacy_field;` |

### 受影響的 Code

| 檔案 | 說明 |
|------|------|
| `src/lib/db/users.ts` | 需新增 `avatar_url` 欄位的讀寫 |
| `src/types/user.ts` | TypeScript 型別需更新 |

### 回退計畫

- 操作 1：`ALTER TABLE users DROP COLUMN avatar_url;`
- 操作 2：`DROP INDEX idx_posts_created;`
- 操作 3：**不可回退**（需事先備份）
```

> 若包含任何 🔴 極高風險操作，必須額外確認：
> - 該欄位/表格是否還有 code 在引用？
> - 是否已備份資料？
> - 是否可以改用「soft delete」（加 deprecated flag）替代直接刪除？

### Step 3 — 建立 Migration 檔案

#### Supabase

```bash
# 建立新的 migration 檔案
npx supabase migration new <MIGRATION_NAME>

# 編輯生成的 SQL 檔案
# supabase/migrations/<TIMESTAMP>_<MIGRATION_NAME>.sql
```

#### Prisma

```bash
# 修改 prisma/schema.prisma 後
npx prisma migrate dev --name <MIGRATION_NAME>
```

### Step 4 — 本地驗證（auto-execute）

```bash
echo "=== Type check（確認 code 與 schema 一致） ==="
npx tsc --noEmit

echo ""
echo "=== Build ==="
npm run build

echo ""
echo "=== 生成的 migration 內容 ==="
# Supabase
ls -t supabase/migrations/ 2>/dev/null | head -1 | xargs -I{} cat "supabase/migrations/{}" 2>/dev/null

# Prisma
ls -t prisma/migrations/ 2>/dev/null | head -1 | xargs -I{} find "prisma/migrations/{}" -name "migration.sql" -exec cat {} \; 2>/dev/null
```

### Step 5 — 在 Preview / Staging 環境測試

> ⚠️ **不可直接在 production 測試 migration。**

#### Supabase（本地或 staging）

```bash
# 本地 Supabase
npx supabase db reset  # 重建本地 DB 並套用所有 migration

# 或連接 staging
npx supabase db push --linked  # 前提：已 link 到 staging project
```

#### Prisma（staging）

```bash
npx prisma migrate deploy  # 前提：DATABASE_URL 指向 staging
```

驗證：
- [ ] Migration 成功套用
- [ ] 現有資料未受損
- [ ] 新增的欄位/表格可正常讀寫
- [ ] 相關 API 正常運作

### Step 6 — 部署到 Production

> ⚠️ 此步驟**不可 auto-execute**。必須在 Step 5 驗證通過後才執行。

#### Supabase

```bash
# 確認要套用的 migration
npx supabase migration list --linked

# 套用到 production
npx supabase db push --linked
```

#### Prisma

```bash
# 確認 DATABASE_URL 指向 production
npx prisma migrate deploy
```

### Step 7 — 產出 Migration 報告

```markdown
## Migration Report

| 項目 | 內容 |
|------|------|
| Migration 名稱 | `<TIMESTAMP>_<NAME>` |
| 操作數量 | N 個 |
| 風險等級 | 最高為 🟢/🟡/🟠/🔴 |
| Staging 驗證 | ✅ 通過 |
| Production 部署 | ✅ 成功 |

### 變更摘要
| 操作 | 表格/欄位 | 狀態 |
|------|-----------|------|
| ADD COLUMN | `users.avatar_url` | ✅ |

### 回退 SQL（緊急時使用）
```sql
-- 操作 1 回退
ALTER TABLE users DROP COLUMN avatar_url;
```
```

---

## Destructive Migration 的安全做法

若必須刪除欄位/表格，建議分多次 release 執行：

| Release | 操作 | 說明 |
|---------|------|------|
| Release N | 停止寫入 | Code 不再寫入該欄位，但仍可讀取 |
| Release N+1 | 停止讀取 | Code 完全不引用該欄位 |
| Release N+2 | 刪除欄位 | 確認無引用後安全刪除 |

> 這種「expand and contract」模式確保任何一步出問題都可以安全回退。

---

## 額外規則

- **不可在 production 上直接寫 SQL** — 所有變更必須透過 migration 檔案
- 每個 migration 應該是**原子性的**（一個 migration 做一件事）
- Destructive migration 必須有回退 SQL 或備份計畫
- Migration 檔案一旦 push 到 main，**不可修改**（只能建立新的 migration 來修正）
- 大表（>100 萬行）的 schema 變更需評估鎖表風險和執行時間
