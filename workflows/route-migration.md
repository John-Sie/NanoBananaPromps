---
description: 遷移舊路由到新結構並確保無斷鏈、無 SEO regression
---

> 本 workflow 遵循 `engineering-agent.md` 通用守則。

Task: 遷移舊路由到新結構並確保無斷鏈

Source of Truth: production routing behavior

Scope: app router + `next.config` / middleware

**與其他 workflow 的關係**：
- 遷移完成後 → `dead-code-removal.md` 清理舊路由檔案
- 路由結構調整屬於重構，需遵循 `refactor.md` 的「不改變外部行為」原則（除了 URL 路徑本身）

---

## 輸入

- **舊路由清單**：要遷移的路由路徑
- **新路由結構**：目標路徑
- **遷移原因**：目錄重組 / i18n 調整 / 框架升級 / URL 規範化

---

## 執行步驟

### Step 1 — 盤點舊路由（auto-execute）

```bash
echo "=== 所有頁面路由 ==="
find src/app -name "page.tsx" -o -name "page.ts" -o -name "page.jsx" 2>/dev/null | sort

echo ""
echo "=== 所有 API 路由 ==="
find src/app/api -name "route.ts" -o -name "route.js" 2>/dev/null | sort

echo ""
echo "=== 現有 redirects（next.config） ==="
grep -A 20 "redirects" next.config.* 2>/dev/null || echo "無 redirects 設定"

echo ""
echo "=== Middleware 路由處理 ==="
cat middleware.ts 2>/dev/null | head -40 || echo "無 middleware"
```

### Step 2 — 產出遷移計畫

**必須在遷移前**產出以下 mapping 表，等待使用者確認：

```markdown
## Route Migration Plan

### 頁面路由

| # | 舊路徑 | 新路徑 | Redirect | 備註 |
|---|--------|--------|----------|------|
| 1 | `/dashboard` | `/app/dashboard` | 301 | — |
| 2 | `/settings/profile` | `/app/settings/profile` | 301 | params 不變 |
| 3 | `/blog/[slug]` | `/articles/[slug]` | 301 | 動態路由 |

### API 路由

| # | 舊路徑 | 新路徑 | 備註 |
|---|--------|--------|------|
| 1 | `/api/v1/users` | `/api/v2/users` | response schema 不變 |

### Parity Check（功能對等確認）

每條路由需確認以下項目：
- [ ] path + params 對應正確
- [ ] metadata / SEO tags（title, description, og:image）
- [ ] error handling（error.tsx / not-found.tsx）
- [ ] loading state（loading.tsx）
- [ ] layout 繼承關係
- [ ] i18n 路由（`/[locale]/...`）正確處理
```

### Step 3 — 建立 Redirect

優先順序：
1. **`next.config` redirects**（靜態路由，最簡單）
2. **middleware**（動態路由或需要邏輯判斷）

```javascript
// next.config.js / next.config.ts 範例
async redirects() {
  return [
    {
      source: '/old-path',
      destination: '/new-path',
      permanent: true, // 301
    },
    {
      source: '/old-path/:slug',
      destination: '/new-path/:slug',
      permanent: true,
    },
  ];
}
```

> ⚠️ **必須使用 301（permanent）**，不可用 302。301 告訴搜尋引擎永久轉移 SEO 權重。

### Step 4 — 更新所有舊路由引用（auto-execute）

```bash
# 替換 <OLD_PATH> 為舊路由路徑

echo "=== <Link> 和 href 引用 ==="
grep -rn "href=['\"].*<OLD_PATH>" src/ --include="*.tsx" --include="*.ts" --include="*.jsx" 2>/dev/null

echo ""
echo "=== router.push / router.replace ==="
grep -rn "router\.\(push\|replace\)(.*<OLD_PATH>" src/ --include="*.tsx" --include="*.ts" 2>/dev/null

echo ""
echo "=== fetch / API 呼叫 ==="
grep -rn "fetch(.*<OLD_PATH>\|axios.*<OLD_PATH>" src/ --include="*.tsx" --include="*.ts" 2>/dev/null

echo ""
echo "=== redirect() 呼叫 ==="
grep -rn "redirect(.*<OLD_PATH>" src/ --include="*.tsx" --include="*.ts" 2>/dev/null

echo ""
echo "=== 測試檔案中的引用 ==="
grep -rn "<OLD_PATH>" src/ --include="*.test.*" --include="*.spec.*" 2>/dev/null
```

逐一將找到的引用更新為新路徑。

### Step 5 — 更新 SEO 相關檔案

```bash
echo "=== sitemap ==="
find src/ -name "sitemap*" 2>/dev/null
cat src/app/sitemap.ts 2>/dev/null | head -30 || echo "無 sitemap"

echo ""
echo "=== robots.txt ==="
cat src/app/robots.ts 2>/dev/null || cat public/robots.txt 2>/dev/null || echo "無 robots.txt"
```

- **sitemap**：更新為新路徑（或確認為動態生成）
- **robots.txt**：確認無舊路徑的 Allow/Disallow 規則
- **canonical URL**：確認 metadata 中的 canonical 指向新路徑

### Step 6 — 驗證（auto-execute）

```bash
npx tsc --noEmit && npm run build
```

### Step 7 — 產出遷移報告

```markdown
## Route Migration Report

### Redirect 設定
| 舊路徑 | 新路徑 | 方式 | 類型 |
|--------|--------|------|------|
| `/old` | `/new` | next.config | 301 |

### 更新的引用
| 檔案 | 行數 | 變更 |
|------|------|------|
| `src/components/Nav.tsx` | L12 | href 更新 |

### SEO 確認
- [ ] sitemap 已更新
- [ ] canonical URL 正確
- [ ] robots.txt 無衝突

### 待清理（→ `dead-code-removal.md`）
- `src/app/old-path/page.tsx`
- `src/app/old-path/layout.tsx`
```

---

## 額外規則

- 未建立 redirect 前，**不可刪除舊路由**
- 不可產生 SEO regression — 舊 URL 必須 301 導向新 URL
- redirect 設定後需驗證（手動測試或 curl 確認 301 回應）
- 舊路由檔案的刪除走 `dead-code-removal.md`，不在本 workflow 中執行
