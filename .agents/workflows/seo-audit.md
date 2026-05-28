---
description: SEO 檢測 — meta tags、structured data、sitemap、Core Web Vitals
---

> 本 workflow 遵循 `engineering-agent.md` 通用守則。

Task: 檢測專案的 SEO 實作完整性並提出優化建議

**建議執行時機**：
- 新頁面上線前
- URL 結構變更後（配合 `route-migration.md`）
- Major release 前
- SEO 排名下降時

---

## Phase 1 — 技術 SEO 掃描

### 1a. Meta Tags 檢查（auto-execute）

```bash
echo "=== 頁面檔案 ==="
find src/app -name "page.tsx" -o -name "page.ts" 2>/dev/null | sort

echo ""
echo "=== metadata / generateMetadata 使用情況 ==="
for f in $(find src/app -name "page.tsx" 2>/dev/null); do
  HAS_META=$(grep -c "metadata\|generateMetadata" "$f" 2>/dev/null)
  if [ "$HAS_META" -eq 0 ]; then
    echo "⚠️ 無 metadata: $f"
  else
    echo "✅ $f"
  fi
done

echo ""
echo "=== layout.tsx 中的全域 metadata ==="
grep -A10 "metadata" src/app/layout.tsx 2>/dev/null | head -15
```

### 1b. 必要 Meta Tags Checklist

| Tag | 用途 | 必要性 |
|-----|------|--------|
| `title` | 頁面標題（50-60 字元） | 🔴 必要 |
| `description` | 頁面描述（150-160 字元） | 🔴 必要 |
| `og:title` | 社群分享標題 | 🟡 重要 |
| `og:description` | 社群分享描述 | 🟡 重要 |
| `og:image` | 社群分享圖片（1200x630px） | 🟡 重要 |
| `og:url` | 頁面 URL | 🟡 重要 |
| `twitter:card` | Twitter 卡片類型 | 🟡 重要 |
| `canonical` | 標準 URL（避免重複內容） | 🔴 必要 |
| `robots` | 索引控制 | 依需求 |

### 1c. 結構化資料（Structured Data）

```bash
echo "=== JSON-LD 使用情況 ==="
grep -rn "application/ld+json\|JsonLd\|jsonLd\|structured.*data" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | head -10

echo ""
echo "=== Schema.org 類型 ==="
grep -roh "\"@type\":\s*\"[^\"]*\"" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | sort -u
```

常見的 structured data 類型：

| 頁面類型 | Schema.org Type | 說明 |
|----------|----------------|------|
| 首頁 | `Organization` / `WebSite` | 公司/網站資訊 |
| 文章 | `Article` / `BlogPosting` | 發佈日期、作者 |
| 產品 | `Product` | 價格、評分 |
| FAQ | `FAQPage` | 問答結構 |
| 麵包屑 | `BreadcrumbList` | 導航結構 |

---

## Phase 2 — URL 與連結結構

### 2a. URL 結構檢查（auto-execute）

```bash
echo "=== 所有頁面 URL（基於檔案結構） ==="
find src/app -name "page.tsx" 2>/dev/null | sed 's|src/app||;s|/page.tsx||;s|/\[|\/:| g;s|\]||g' | sort

echo ""
echo "=== 動態路由 ==="
find src/app -name "page.tsx" -path "*\[*" 2>/dev/null | sort

echo ""
echo "=== Sitemap ==="
cat src/app/sitemap.ts 2>/dev/null | head -30 || echo "⚠️ 無 sitemap.ts"

echo ""
echo "=== robots.txt ==="
cat src/app/robots.ts 2>/dev/null || cat public/robots.txt 2>/dev/null || echo "⚠️ 無 robots.txt"
```

### 2b. URL 規範

| 規則 | 說明 |
|------|------|
| 使用 kebab-case | `/about-us`，不是 `/aboutUs` |
| 全小寫 | `/blog/my-post`，不是 `/Blog/My-Post` |
| 無 trailing slash | `/about`，不是 `/about/`（除非有充分理由） |
| 語意化 | `/pricing`，不是 `/page-3` |
| 短而有意義 | 避免超過 3 層的巢狀 |

### 2c. 連結檢查（auto-execute）

```bash
echo "=== 內部連結（檢查是否有硬編碼 domain） ==="
grep -rn "href=['\"]https\?://" src/ --include="*.tsx" 2>/dev/null | grep -v "node_modules\|github\|google\|twitter\|facebook" | head -10

echo ""
echo "=== nofollow 連結 ==="
grep -rn "nofollow" src/ --include="*.tsx" 2>/dev/null | head -5

echo ""
echo "=== 404 頁面 ==="
ls src/app/not-found.tsx 2>/dev/null && echo "✅ 有 not-found.tsx" || echo "⚠️ 無自訂 404 頁面"
```

---

## Phase 3 — 渲染與效能

### 3a. 渲染策略檢查（auto-execute）

```bash
echo "=== 'use client' 頁面（CSR，對 SEO 不友善） ==="
for f in $(find src/app -name "page.tsx" 2>/dev/null); do
  grep -q "use client" "$f" && echo "⚠️ CSR: $f"
done

echo ""
echo "=== 動態渲染設定 ==="
grep -rn "dynamic.*=\|revalidate\|generateStaticParams\|force-static\|force-dynamic" src/app/ --include="*.tsx" --include="*.ts" 2>/dev/null | head -10

echo ""
echo "=== next/image 使用（自動最佳化圖片） ==="
echo "使用 next/image: $(grep -rn "from ['\"]next/image" src/ --include="*.tsx" 2>/dev/null | wc -l) 處"
echo "使用原生 <img>: $(grep -rn "<img " src/ --include="*.tsx" 2>/dev/null | wc -l) 處"
```

### 3b. SEO 關鍵效能指標

| 指標 | 目標 | 影響 |
|------|------|------|
| TTFB | < 800ms | 搜尋引擎爬蟲耐心有限 |
| LCP | < 2.5s | Core Web Vitals 排名因子 |
| CLS | < 0.1 | Core Web Vitals 排名因子 |
| FID/INP | < 200ms | Core Web Vitals 排名因子 |

---

## Phase 4 — 內容 SEO 檢查

```bash
echo "=== Heading 結構 ==="
for f in $(find src/app -name "page.tsx" 2>/dev/null | head -5); do
  echo "--- $f ---"
  grep -n "<h[1-6]\|<H[1-6]" "$f" 2>/dev/null | head -5
done

echo ""
echo "=== 多個 h1 的頁面 ==="
for f in $(find src/app -name "page.tsx" 2>/dev/null); do
  COUNT=$(grep -c "<h1\|<H1" "$f" 2>/dev/null)
  [ "$COUNT" -gt 1 ] && echo "⚠️ $f: $COUNT 個 h1"
done
```

---

## 產出報告

```markdown
## SEO Audit Report

### 摘要

| 類別 | 狀態 | 主要發現 |
|------|------|----------|
| Meta Tags | ✅/⚠️/❌ | N 個頁面缺少 metadata |
| Structured Data | ✅/⚠️/❌ | — |
| URL 結構 | ✅/⚠️/❌ | — |
| Sitemap | ✅/❌ | 存在 / 缺失 |
| robots.txt | ✅/❌ | 存在 / 缺失 |
| 渲染策略 | ✅/⚠️ | N 個頁面使用 CSR |
| Core Web Vitals | ✅/⚠️/❌ | — |
| Heading 結構 | ✅/⚠️ | — |

### 問題清單（依影響排序）

| # | 類別 | 嚴重度 | 頁面/檔案 | 問題 | 修正建議 |
|---|------|--------|-----------|------|----------|
| 1 | Meta | 🔴 | `/pricing` | 缺少 title & description | 加入 metadata export |
| 2 | Sitemap | 🔴 | 全站 | 無 sitemap | 建立 `src/app/sitemap.ts` |
| 3 | Render | 🟡 | `/dashboard` | 使用 CSR | 評估是否可改 SSR |

### Quick Wins（低成本高回報）
1. ...
2. ...
```

---

## 額外規則

- SEO 優化不應犧牲使用者體驗 — 不要為了 SEO 塞入不自然的關鍵字
- 每個頁面的 title 和 description 都應該是**唯一的**
- 不要 block 搜尋引擎爬取 CSS/JS — 現代搜尋引擎需要渲染頁面
- `canonical` URL 必須指向 HTTPS 版本
- 國際化網站需要 `hreflang` 標籤（配合 `i18n-audit.md`）
