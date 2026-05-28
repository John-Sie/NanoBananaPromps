---
description: 移除死碼與廢棄檔案 — 遷移完成後、大型重構後、定期維護時執行
---

> 本 workflow 遵循 `engineering-agent.md` 通用守則。

Task: 識別並安全移除不再被使用的程式碼與檔案

Source of Truth: production behavior（現有功能不可受影響）

**與其他 workflow 的關係**：
- `refactor.md` — 負責結構重組；本 workflow 負責移除廢棄物。**不可同時執行**，避免風險疊加
- 通常在遷移或重構**完成後**執行本 workflow

---

## 輸入

執行前需明確以下資訊（由使用者提供或從 context 推斷）：

- **目標範圍**：要檢查的目錄或檔案清單（例：`src/legacy/`、`src/components/OldDashboard/`）
- **觸發原因**：遷移完成 / 重構完成 / 定期清理
- 若使用者未指定目標，先掃描並建議候選範圍，**不可自行決定刪除**

---

## 執行步驟

### Step 1 — 識別候選檔案（auto-execute）

```bash
echo "=== 目標範圍內的檔案 ==="
# 替換 <TARGET_DIR> 為實際目標目錄
find <TARGET_DIR> -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) | sort

echo ""
echo "=== 統計 ==="
find <TARGET_DIR> -type f \( -name "*.ts" -o -name "*.tsx" -o -name "*.js" -o -name "*.jsx" \) | wc -l
```

### Step 2 — 逐檔檢查引用

對每個候選檔案，檢查以下所有引用途徑：

```bash
# 直接 import / require
grep -rn "from ['\"].*<FILENAME>" src/ --include="*.ts" --include="*.tsx" --include="*.js" 2>/dev/null
grep -rn "require(.*<FILENAME>)" src/ --include="*.ts" --include="*.tsx" --include="*.js" 2>/dev/null

# Dynamic import
grep -rn "import(.*<FILENAME>)" src/ --include="*.ts" --include="*.tsx" --include="*.js" 2>/dev/null

# Re-export（barrel files）
grep -rn "export.*from ['\"].*<FILENAME>" src/ --include="*.ts" --include="*.tsx" --include="*.js" 2>/dev/null

# 路由引用、config 引用
grep -rn "<FILENAME_STEM>" src/ --include="*.ts" --include="*.tsx" --include="*.json" --include="*.js" 2>/dev/null
```

### Step 3 — 功能覆蓋確認

對有被新版本取代的檔案，確認以下項目已完全由新版本覆蓋：

- 功能邏輯
- routing / params
- error / loading 狀態
- 所有引用（import / link / API call）
- CSS / style 依賴
- 測試檔案（對應的 `.test.ts` / `.spec.ts` 也需處理）

### Step 4 — 產出刪除計畫

**必須在刪除前**產出以下報告，等待使用者確認：

```markdown
## Dead Code Removal Plan

| # | 檔案 | 引用數 | 狀態 | 理由 |
|---|------|--------|------|------|
| 1 | `src/legacy/OldDashboard.tsx` | 0 | ✅ safe-to-delete | 已由 `src/components/Dashboard.tsx` 完全取代 |
| 2 | `src/utils/deprecated-helper.ts` | 0 | ✅ safe-to-delete | 所有呼叫點已遷移至 `src/utils/helper.ts` |
| 3 | `src/hooks/useOldAuth.ts` | 2 | ❌ 仍有引用 | `ProfilePage.tsx:12`, `Settings.tsx:45` 仍在使用 |
| 4 | `src/types/legacy.d.ts` | 0 | ⚠️ 需確認 | 無直接 import，但可能被 TypeScript 隱式引用 |

**預計刪除 N 個檔案，保留 M 個（仍有引用或需確認）**
```

### Step 5 — 執行刪除

僅刪除狀態為 ✅ 的檔案。⚠️ 和 ❌ 的項目不處理。

### Step 6 — 驗證（auto-execute）

```bash
npx tsc --noEmit && npm run build
```

若 build 失敗 → 立即還原刪除的檔案，排查問題。

### Step 7 — 清理殘留

刪除檔案後，檢查是否留下空目錄或孤立的 barrel file：

```bash
# 空目錄
find src/ -type d -empty 2>/dev/null

# 只剩 re-export 的 index.ts（可能已無意義）
find src/ -name "index.ts" -size -50c 2>/dev/null
```

---

## 額外規則

- 未確認引用前，**不可刪除檔案**
- 不可同時做重構與清理（避免風險疊加）
- 對應的測試檔案須一併處理（刪除或更新）
- 若刪除導致 build 失敗，**立即還原**，不可嘗試修復以通過 build
