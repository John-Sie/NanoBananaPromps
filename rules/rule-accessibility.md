---
trigger: always_on
glob: "*{*.tsx,*.jsx,*.css}"
description: "Accessibility (a11y) Standards — WCAG 2.1 AA Compliance"
---

# Architecture Rule — Accessibility (a11y)

## Objective

確保所有使用者（包括視覺、聽覺、動作或認知障礙者）都能無障礙地使用產品。
本規範將 `design.md` 中 Accessibility 的一行要求擴展為完整的實作標準。

## 最低合規標準

**WCAG 2.1 Level AA** 為最低標準，適用於所有面向使用者的頁面。

## 語意化 HTML (Semantic HTML)

### 必須遵守

1. **正確使用 HTML 標籤語意**：
   - 導航 → `<nav>`
   - 主要內容 → `<main>`
   - 區塊 → `<section>` / `<article>`
   - 頁尾 → `<footer>`
   - 禁止用 `<div>` 替代所有語意標籤。

2. **標題層級 (Heading Hierarchy)**：
   - 每頁僅一個 `<h1>`。
   - 標題層級必須連續遞增（`h1 → h2 → h3`），禁止跳級（`h1 → h3`）。

3. **按鈕 vs 連結**：
   - 觸發動作 → `<button>`
   - 導航到新頁面 → `<a href="...">`
   - 禁止 `<div onClick>` 模擬按鈕行為（除非附加完整的 ARIA role + keyboard support）。

## 互動元素 (Interactive Elements)

### 鍵盤導航 (Keyboard Navigation)

1. **所有互動元素必須可透過鍵盤操作**：Tab 移動焦點、Enter/Space 觸發動作、Escape 關閉 Modal。
2. **Tab Order**：必須符合視覺上的閱讀順序，禁止混亂的 `tabindex` 值（僅允許 `0` 和 `-1`）。
3. **Focus Trap**：Modal / Dialog / Drawer 開啟時，焦點必須被限制在內部，關閉後焦點回到觸發元素。
4. **可見的 Focus Indicator**：禁止 `outline: none` 除非提供等效的替代視覺指示（如 `ring-2`）。

### ARIA 標籤 (ARIA Labels)

| 情境 | 要求 |
|---|---|
| Icon-only 按鈕 | 必須有 `aria-label`（如 `aria-label="關閉"` ） |
| 表單欄位 | 必須有關聯的 `<label>` 或 `aria-label` |
| 動態內容更新 | 使用 `aria-live="polite"` 或 `aria-live="assertive"` |
| 展開/收合區塊 | 使用 `aria-expanded` + `aria-controls` |
| Loading 狀態 | 使用 `aria-busy="true"` + status message |
| 錯誤提示 | 使用 `aria-invalid="true"` + `aria-describedby` 關聯錯誤訊息 |

### shadcn/ui 元件

- shadcn/ui 的標準元件已內建多數 ARIA 屬性，**直接使用即可，禁止覆寫已內建的 a11y 屬性**。
- 自訂元件或擴展 shadcn/ui 時，必須確保 a11y 屬性不丟失。

## 視覺標準 (Visual Standards)

### 色彩對比度

- **文字 vs 背景**：對比度至少 **4.5:1**（一般文字）或 **3:1**（大字，≥ 18pt 或 14pt bold）。
- **UI 元件**：按鈕邊框、輸入框邊框等與背景的對比度至少 **3:1**。
- **工具**：使用 Chrome DevTools 的 Contrast Checker 或 [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/) 驗證。

### 配合 design.md 的 Dark Mode 規範

- 語意化色彩（`text-primary`, `bg-background` 等）在 Light/Dark Mode 下都必須滿足對比度標準。
- 禁止寫死色碼的規範（已在 `design.md` 中強制），同時也是確保 a11y 的關鍵。

### 文字與排版

- **最小字級**：正文不低於 `16px`（`text-base`），輔助文字不低於 `12px`（`text-xs`）。
- **行高**：正文行高至少 `1.5`（`leading-normal` 或 `leading-relaxed`）。
- **禁止純色彩傳達資訊**：錯誤狀態不能只靠紅色，必須搭配 icon 或文字說明。

## 多媒體 (Media)

- **圖片**：所有 `<img>` 必須有 `alt` 屬性。裝飾性圖片使用 `alt=""`。
- **影片**：若含語音內容，建議提供字幕 (captions)。
- **動畫**：尊重 `prefers-reduced-motion` 偏好，在使用者開啟後減少或停止非必要動畫。

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 測試驗證

- **自動化**：CI 中整合 `eslint-plugin-jsx-a11y`，lint 不通過 = 阻擋 merge。
- **手動**：重大 UI 變更時，以純鍵盤操作完整走完主要流程驗證。
- **螢幕閱讀器**：建議定期用 VoiceOver (macOS) 或 NVDA (Windows) 測試關鍵頁面。
