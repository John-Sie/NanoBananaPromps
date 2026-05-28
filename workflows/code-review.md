---
description: AI 輔助 Code Review — PR 合併前的系統性品質檢查
---

> 本 workflow 遵循 `engineering-agent.md` 通用守則。

你是專案的資深 Reviewer。執行此 workflow 的目標是：**系統性地審查程式碼變更，找出潛在問題、提出改善建議，確保 code 品質達到合併標準。**

**與其他 workflow 的關係**：
- `feature-branch.md` → 開發完成後，用本 workflow review
- Review 通過後 → `merge-to-main.md`
- 發現需要重構 → `refactor.md`
- 發現需要補測試 → `testing.md`

---

## 輸入

- **Review 範圍**：PR 編號、branch 名稱、或指定的檔案
- **變更類型**：feature / fix / refactor / chore
- **重點關注**：使用者可指定特別關注的面向（效能 / 安全 / 可讀性）

---

## Step 1 — 變更概覽（auto-execute）

```bash
echo "=== 變更檔案清單 ==="
git diff main --name-only --stat

echo ""
echo "=== 變更統計 ==="
git diff main --shortstat

echo ""
echo "=== Commit 歷史 ==="
git log main..HEAD --oneline
```

---

## Step 2 — 逐層審查

按以下順序，從高到低逐層審查：

### 2a. 架構層（Architecture）

| 檢查項目 | 說明 |
|----------|------|
| 職責劃分 | 新增的 code 放在正確的模組/目錄嗎？ |
| 依賴方向 | 是否引入了不合理的跨層依賴？（UI → DB、util → component） |
| 過度工程 | 是否為簡單問題建了複雜的抽象？ |
| 重複邏輯 | 是否有類似功能已存在於 codebase 中？ |

```bash
echo "=== 新增的檔案 ==="
git diff main --name-only --diff-filter=A

echo ""
echo "=== 新增的 import（檢查依賴方向） ==="
git diff main -- '*.ts' '*.tsx' | grep "^+.*import" | grep -v "^+++" | head -20
```

### 2b. 邏輯層（Logic）

| 檢查項目 | 說明 |
|----------|------|
| Edge cases | null / undefined / 空陣列 / 空字串處理 |
| Error handling | try-catch 是否完整？error 是否被 swallow？ |
| Race conditions | 非同步操作順序正確嗎？missing `await`？ |
| Off-by-one | 迴圈邊界、slice、substring 正確嗎？ |
| 型別安全 | `as any`、`@ts-ignore`、non-null assertion（`!`）是否合理？ |

```bash
echo "=== 潛在的型別逃逸 ==="
git diff main -- '*.ts' '*.tsx' | grep "^+" | grep -E "as any|@ts-ignore|@ts-expect-error|!\." | head -10

echo ""
echo "=== 空的 catch block ==="
git diff main -- '*.ts' '*.tsx' | grep -A1 "catch" | grep -B1 "^+.*{}" | head -10

echo ""
echo "=== Missing await ==="
git diff main -- '*.ts' '*.tsx' | grep "^+" | grep -E "\.then\(|new Promise" | head -10
```

### 2c. 安全層（Security）

| 檢查項目 | 說明 |
|----------|------|
| 輸入驗證 | 使用者輸入有用 Zod / schema 驗證嗎？ |
| 認證授權 | 新 API route 有 auth check 嗎？ |
| XSS | 有 `dangerouslySetInnerHTML` 或未 sanitize 的輸出嗎？ |
| Secret 洩露 | 有硬編碼的 key / token 嗎？ |
| SQL Injection | 有直接字串拼接的 query 嗎？ |

```bash
echo "=== 安全相關變更 ==="
git diff main -- '*.ts' '*.tsx' | grep "^+" | grep -iE "dangerouslySetInnerHTML|innerHTML|eval\(|new Function|SUPABASE_SERVICE_ROLE" | head -10

echo ""
echo "=== 新增的 API route 是否有 auth ==="
for f in $(git diff main --name-only --diff-filter=A | grep "route\.ts"); do
  grep -qE "createClient|getUser|requireAdmin|auth\(\)" "$f" && echo "✅ $f" || echo "⚠️ 可能無驗證: $f"
done
```

### 2d. 效能層（Performance）

| 檢查項目 | 說明 |
|----------|------|
| N+1 Query | 迴圈中有 DB 查詢嗎？ |
| 不必要的 re-render | React component 的依賴陣列正確嗎？ |
| 大型 bundle import | 引入了整包大型函式庫嗎？ |
| Memory leak | useEffect 有 cleanup 嗎？event listener 有移除嗎？ |

```bash
echo "=== useEffect 缺少 cleanup ==="
git diff main -- '*.tsx' | grep -A10 "useEffect" | grep -B5 "^+.*return" | head -10

echo ""
echo "=== 整包 import（可能過大） ==="
git diff main -- '*.ts' '*.tsx' | grep "^+.*import" | grep -E "from ['\"]lodash['\"]|from ['\"]moment['\"]|from ['\"]rxjs['\"]" | head -5
```

### 2e. 可讀性層（Readability）

| 檢查項目 | 說明 |
|----------|------|
| 命名 | 變數/函數名稱是否自描述？ |
| 註解 | 複雜邏輯有註解嗎？註解是否過時？ |
| 函數長度 | 單一函數超過 50 行嗎？ |
| Magic numbers | 有未命名的常數嗎？ |
| 一致性 | 風格與 codebase 現有慣例一致嗎？ |

---

## Step 3 — 產出 Review 報告

```markdown
## Code Review Report

**Branch**: `<BRANCH_NAME>`
**變更類型**: feature / fix / refactor
**檔案數**: N | **行數**: +X / -Y

### 摘要

<一段話總結這次變更做了什麼、整體品質如何>

### 🔴 Must Fix（合併前必須修正）

| # | 檔案 | 行數 | 類別 | 問題 | 建議修法 |
|---|------|------|------|------|----------|
| 1 | `src/api/route.ts` | L42 | 安全 | 缺少 auth check | 加入 `requireAuth()` |

### 🟡 Should Fix（建議修正，不阻擋合併）

| # | 檔案 | 行數 | 類別 | 問題 | 建議修法 |
|---|------|------|------|------|----------|
| 1 | `src/utils/format.ts` | L15 | 可讀性 | 函數名稱不清楚 | 改為 `formatCurrency()` |

### 🟢 Nitpick（微小建議，可忽略）

| # | 檔案 | 說明 |
|---|------|------|
| 1 | `src/components/Card.tsx` | 建議抽取為獨立 component |

### ✅ 優點

- <值得肯定的設計決策或實作方式>

### Review 結論

- [ ] ✅ **Approve** — 可合併
- [ ] 🔄 **Request Changes** — 需修正後重新 review
- [ ] 💬 **Comment** — 有討論事項但不阻擋
```

---

## 額外規則

- **Review 的目的是改善品質，不是展示權威** — 語氣建設性，解釋「為什麼」而非只說「這樣不好」
- 不要對風格偏好做硬性要求 — 除非違反既有的 codebase 慣例
- 若變更量太大（> 500 行），建議使用者拆成更小的 PR
- Must Fix 只用於真正會造成 bug、安全漏洞、或資料問題的項目
- 不確定的項目標為 Should Fix 並說明理由，讓使用者決定
