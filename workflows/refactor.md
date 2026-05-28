---
description: 在不改變功能的前提下重構程式碼結構
---

> 本 workflow 遵循 `engineering-agent.md` 通用守則。

Task: 在不改變功能的前提下重構程式碼結構

Source of Truth: existing code behavior（重構前後行為必須完全一致）

**與其他 workflow 的關係**：
- `dead-code-removal.md` — 負責刪除廢棄程式碼。**不可同時執行**重構與清理，避免風險疊加
- 重構完成後可接 `dead-code-removal.md` 清理殘留

---

## 常見重構類型與風險

| 類型 | 風險 | 注意事項 |
|------|------|----------|
| Rename（變數 / 函數 / 檔案） | 低 | 確保所有引用同步更新，含 dynamic import 和字串引用 |
| Extract function / component | 低 | 保持原有 function signature 和 props interface |
| Move file / 調整目錄結構 | 中 | 更新所有 import path，注意 barrel file 和 alias |
| Simplify conditional / 消除重複 | 中 | 確認所有 branch 行為一致，特別注意 edge case |
| Extract shared module | 中~高 | 跨模組依賴變更，需評估影響範圍 |
| 修改 state management / data flow | 高 | 容易引入副作用，需完整測試 |

---

## 執行步驟

### Step 1 — 影響範圍評估（auto-execute）

```bash
echo "=== 目標範圍內的檔案 ==="
# 替換 <TARGET> 為目標目錄或檔案
find <TARGET> -type f \( -name "*.ts" -o -name "*.tsx" \) | wc -l

echo ""
echo "=== 被其他模組引用的次數 ==="
# 替換 <MODULE_NAME> 為目標模組名
grep -rn "from ['\"].*<MODULE_NAME>" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l

echo ""
echo "=== 現有測試覆蓋 ==="
find <TARGET> -name "*.test.ts" -o -name "*.spec.ts" -o -name "*.test.tsx" 2>/dev/null
```

向使用者回報：
- 影響檔案數
- 外部引用數
- 是否有測試覆蓋

### Step 2 — 提出重構計畫

產出以下格式的計畫，**等待使用者確認後再執行**：

```markdown
## Refactor Plan

**目標**：<要解決的結構問題>
**類型**：<上表中的重構類型>
**風險等級**：低 / 中 / 高

### 變更清單

| # | 檔案 | 操作 | 說明 |
|---|------|------|------|
| 1 | `src/utils/auth.ts` | extract function | 將 token 驗證邏輯抽取為 `validateToken()` |
| 2 | `src/hooks/useAuth.ts` | update import | 改為引用新的 `validateToken()` |
| ... | | | |

### 不會改變的部分
- API contract（request / response schema）
- 元件 props interface
- 外部可觀察行為（UI 渲染結果、side effects）
```

### Step 3 — 執行最小範圍修改

- 每個邏輯變更一個 commit，保持 git diff 可讀
- 遵循以下順序：先 rename/move → 再 extract → 最後 simplify
- 每步完成後跑一次 type check 確認沒有 break

### Step 4 — 驗證（auto-execute）

```bash
# Type check
npx tsc --noEmit

# Lint
npm run lint

# Test（最重要——重構承諾不改行為，test 必須全過）
npm test 2>&1 || echo "⚠️ 測試失敗，重構可能改變了行為"

# Build
npm run build
```

> 若任何一項失敗 → 還原該步驟的變更，排查問題後重試。

### Step 5 — 產出重構摘要

```markdown
## Refactor Summary

| 項目 | 內容 |
|------|------|
| 重構類型 | <TYPE> |
| 變更檔案數 | N |
| 新增 / 刪除行數 | +X / -Y |
| tsc | ✅ / ❌ |
| lint | ✅ / ❌ |
| test | ✅ / ❌ |
| build | ✅ / ❌ |

### 主要變更
- ...

### 未變更（確認）
- API contract：✅ 未變
- Props interface：✅ 未變
- 外部行為：✅ 未變
```

---

## 額外規則

- 不改變任何外部行為（API / UI / side effects）
- 保持 function signature 不變（除非必要且已在 plan 中說明）
- 避免跨模組大規模調整——若影響超過 10 個檔案，拆成多次小重構
- 不可同時引入新 feature
- 不可改 API contract
- 不可同時做 dead code removal（走 `dead-code-removal.md`）
