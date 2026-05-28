---
description: 無障礙性檢測 — WCAG 合規、ARIA、鍵盤導航、色彩對比
---

> 本 workflow 遵循 `engineering-agent.md` 通用守則。

Task: 檢測專案的無障礙性（Accessibility / a11y）並提出修正建議

**建議執行時機**：
- Major release 前
- UI 大改版後
- 新增表單、modal、導航等互動元件後
- 準備進入歐盟 / 美國市場（EAA 2025 / ADA Section 508）

**目標合規等級**：WCAG 2.1 Level AA（業界標準）

---

## Phase 1 — 自動化掃描

### 1a. 靜態分析（auto-execute）

```bash
echo "=== img 缺少 alt ==="
grep -rn "<img " src/ --include="*.tsx" --include="*.jsx" 2>/dev/null | grep -v "alt=" | head -10

echo ""
echo "=== 使用 next/image 但缺少 alt ==="
grep -rn "<Image " src/ --include="*.tsx" 2>/dev/null | grep -v "alt=" | head -10

echo ""
echo "=== 非語意化元素用作按鈕（div/span onClick） ==="
grep -rn "onClick" src/ --include="*.tsx" 2>/dev/null | grep -E "<div|<span" | grep -v "role=" | head -10

echo ""
echo "=== 缺少 label 的表單元素 ==="
grep -rn "<input\|<select\|<textarea" src/ --include="*.tsx" 2>/dev/null | grep -v "aria-label\|aria-labelledby\|id=.*label\|<label" | head -10

echo ""
echo "=== 使用 tabIndex > 0（破壞自然 tab 順序） ==="
grep -rn "tabIndex=['\"]?[1-9]" src/ --include="*.tsx" 2>/dev/null | head -5

echo ""
echo "=== 缺少 lang attribute ==="
grep -rn "<html" src/ --include="*.tsx" 2>/dev/null | grep -v "lang=" | head -5

echo ""
echo "=== 自動播放的媒體 ==="
grep -rn "autoPlay\|autoplay" src/ --include="*.tsx" 2>/dev/null | head -5
```

### 1b. ARIA 使用檢查（auto-execute）

```bash
echo "=== ARIA role 使用情況 ==="
grep -roh "role=\"[^\"]*\"" src/ --include="*.tsx" 2>/dev/null | sort | uniq -c | sort -rn

echo ""
echo "=== aria-hidden 使用 ==="
grep -rn "aria-hidden" src/ --include="*.tsx" 2>/dev/null | head -10

echo ""
echo "=== aria-live 區域（動態內容通知） ==="
grep -rn "aria-live" src/ --include="*.tsx" 2>/dev/null | head -5 || echo "⚠️ 無 aria-live 區域（動態更新可能不被螢幕閱讀器察覺）"
```

---

## Phase 2 — 逐類檢查

### 2a. 圖片與媒體

| 檢查項目 | 要求 |
|----------|------|
| 所有 `<img>` / `<Image>` 有 `alt` | 裝飾性圖片用 `alt=""` |
| 資訊性圖片有描述性 alt text | 不只是 "image" 或 "photo" |
| 影片有字幕 / transcript | WCAG 1.2 |
| 動畫可暫停 | `prefers-reduced-motion` |

### 2b. 表單

| 檢查項目 | 要求 |
|----------|------|
| 每個 input 有 label | `<label htmlFor>` 或 `aria-label` |
| 錯誤訊息關聯到欄位 | `aria-describedby` 或 `aria-errormessage` |
| 必填欄位有標示 | `aria-required="true"` 或視覺標記 |
| 表單可用鍵盤提交 | Enter key submit |

### 2c. 導航與焦點管理

| 檢查項目 | 要求 |
|----------|------|
| 可用 Tab 導航所有互動元素 | 合理的 tab 順序 |
| 焦點樣式可見 | 不可 `outline: none` 除非有替代樣式 |
| Skip to content 連結 | 頁面頂部有跳過導航的連結 |
| Modal 焦點鎖定（focus trap） | 開啟 modal 時 Tab 不會跑到背景 |
| 關閉 modal 後焦點回到觸發元素 | focus return |

```bash
echo "=== outline: none（可能移除焦點指示器） ==="
grep -rn "outline.*none\|outline.*0\b" src/ --include="*.css" --include="*.scss" --include="*.tsx" 2>/dev/null | grep -v "// a11y\|a11y-ok\|focus-visible" | head -10

echo ""
echo "=== Skip to content ==="
grep -rn "skip.*content\|skip.*nav\|skip.*main" src/ --include="*.tsx" 2>/dev/null | head -3 || echo "⚠️ 無 skip-to-content 連結"

echo ""
echo "=== Focus trap（modal / dialog） ==="
grep -rn "FocusTrap\|focus-trap\|createFocusTrap\|Dialog\|Modal" src/ --include="*.tsx" 2>/dev/null | head -5
```

### 2d. 色彩與對比

| 檢查項目 | 要求 |
|----------|------|
| 文字對比度 ≥ 4.5:1（一般文字） | WCAG AA |
| 大文字對比度 ≥ 3:1（18px+ / 14px bold+） | WCAG AA |
| 不僅靠顏色傳達資訊 | 加圖示 / 文字 / pattern |
| 支援 `prefers-color-scheme` | Dark mode 的對比度也要檢查 |
| 支援 `prefers-reduced-motion` | 減少動畫 |

```bash
echo "=== prefers-reduced-motion 支援 ==="
grep -rn "prefers-reduced-motion" src/ --include="*.css" --include="*.scss" --include="*.tsx" 2>/dev/null | head -5 || echo "⚠️ 未處理 prefers-reduced-motion"

echo ""
echo "=== prefers-color-scheme 支援 ==="
grep -rn "prefers-color-scheme" src/ --include="*.css" --include="*.scss" --include="*.tsx" 2>/dev/null | head -5 || echo "ℹ️ 未偵測到 prefers-color-scheme（可能用 JS 處理）"
```

### 2e. 語意化 HTML

| 檢查項目 | 要求 |
|----------|------|
| 使用語意化標籤 | `<nav>`, `<main>`, `<header>`, `<footer>`, `<article>`, `<section>` |
| Heading 層級正確 | 每頁一個 `<h1>`，不跳級 |
| 列表用 `<ul>/<ol>` | 不要用 div 模擬列表 |
| 表格有 `<th>` 和 `scope` | 資料表格需有表頭 |

```bash
echo "=== h1 使用情況 ==="
grep -rn "<h1\|<H1" src/ --include="*.tsx" 2>/dev/null | head -10

echo ""
echo "=== 語意化標籤使用 ==="
for tag in nav main header footer article section aside; do
  COUNT=$(grep -rn "<$tag" src/ --include="*.tsx" 2>/dev/null | wc -l)
  echo "$tag: $COUNT 處"
done
```

---

## Phase 3 — 產出報告

```markdown
## Accessibility Audit Report

**合規目標**：WCAG 2.1 Level AA

### 摘要

| 類別 | 狀態 | 主要發現 |
|------|------|----------|
| 圖片 alt | ✅/⚠️/❌ | N 個缺少 alt |
| 表單 label | ✅/⚠️/❌ | N 個缺少 label |
| 鍵盤導航 | ✅/⚠️/❌ | — |
| 焦點管理 | ✅/⚠️/❌ | — |
| 色彩對比 | ✅/⚠️/❌ | — |
| 語意化 HTML | ✅/⚠️/❌ | — |
| ARIA | ✅/⚠️/❌ | — |
| 動態內容 | ✅/⚠️/❌ | — |

### 問題清單

| # | 類別 | 嚴重度 | 檔案 | 問題 | WCAG 規則 | 修正建議 |
|---|------|--------|------|------|-----------|----------|
| 1 | 圖片 | 🔴 | `Hero.tsx` | img 缺少 alt | 1.1.1 | 加入描述性 alt text |
| 2 | 表單 | 🟡 | `LoginForm.tsx` | input 缺少 label | 1.3.1 | 加入 `<label>` 或 `aria-label` |
| 3 | 導航 | 🟡 | 全站 | 無 skip-to-content | 2.4.1 | 加入 skip link |

### 建議優先序

1. 🔴 **Critical**：完全阻擋特定使用者群（螢幕閱讀器無法使用）
2. 🟡 **Major**：嚴重降低體驗但有替代方式
3. 🔵 **Minor**：最佳實踐但不阻擋使用
```

---

## 額外規則

- 本 workflow 只負責**檢測與建議**，修正走 `feature-branch.md`
- 無障礙性是持續的工作，不是一次性的——建議在 `code-review.md` 中加入 a11y 檢查
- 自動化掃描只能發現約 30% 的 a11y 問題，複雜場景需要人工測試
- 測試時建議實際使用螢幕閱讀器（macOS VoiceOver: Cmd + F5）
