---
description: 效能審計 — 檢測 bundle size、載入速度、API 效能與資料庫查詢效率
---

> 本 workflow 遵循 `engineering-agent.md` 通用守則。

Task: 系統性檢測專案效能瓶頸並提出優化建議

**與其他 workflow 的關係**：
- `security-hygiene-audit.md` — 安全與衛生審計（互補，不重疊）
- `release.md` — major release 前建議先跑本 workflow
- 發現效能問題後的修復 → `feature-branch.md`

**建議執行時機**：
- Major release 前
- 使用者回報載入緩慢時
- 新增大型功能或第三方套件後
- 定期檢測（建議每季一次）

---

# 📦 Phase 1 — Bundle Size 分析

## 1a. 整體 bundle 大小（auto-execute）

```bash
echo "=== Production Build ==="
npm run build 2>&1 | tail -40

echo ""
echo "=== .next 目錄大小 ==="
du -sh .next/ 2>/dev/null || echo "無 .next 目錄"

echo ""
echo "=== node_modules 大小 ==="
du -sh node_modules/ 2>/dev/null
```

## 1b. 分析 bundle 組成（auto-execute）

```bash
# Next.js bundle 分析
ANALYZE=true npm run build 2>&1 | tail -20 || echo "未設定 ANALYZE 環境變數"

# 替代方式：檢查最大的 chunk
echo "=== 最大的 JS chunk ==="
find .next/static -name "*.js" 2>/dev/null | xargs ls -lS 2>/dev/null | head -10

echo ""
echo "=== 總 JS 大小 ==="
find .next/static -name "*.js" 2>/dev/null | xargs du -ch 2>/dev/null | tail -1
```

## 1c. 大型依賴掃描（auto-execute）

```bash
echo "=== 依賴大小排行（估算） ==="
du -sh node_modules/*/ 2>/dev/null | sort -rh | head -20

echo ""
echo "=== 可能過大的 import ==="
grep -rn "import.*from ['\"]lodash['\"]" src/ --include="*.ts" --include="*.tsx" 2>/dev/null && echo "⚠️ 使用整包 lodash import，建議改用 lodash/specific" || echo "✅ 無整包 lodash import"
grep -rn "import.*from ['\"]moment['\"]" src/ --include="*.ts" --include="*.tsx" 2>/dev/null && echo "⚠️ 使用 moment.js，建議改用 date-fns 或 dayjs" || echo "✅ 無 moment.js"
```

**判定基準**：
- First Load JS < 100KB → ✅ 優秀
- First Load JS 100-200KB → ⚠️ 可接受
- First Load JS > 200KB → ❌ 需優化

---

# ⚡ Phase 2 — 載入效能（Core Web Vitals）

## 2a. 靜態分析（auto-execute）

```bash
echo "=== 圖片優化檢查 ==="
echo "使用 next/image 的元件："
grep -rn "from ['\"]next/image['\"]" src/ --include="*.tsx" 2>/dev/null | wc -l

echo ""
echo "使用原生 <img> 的元件（應改用 next/image）："
grep -rn "<img " src/ --include="*.tsx" 2>/dev/null | grep -v "node_modules" | wc -l

echo ""
echo "=== 未使用 dynamic import 的大型元件 ==="
echo "所有 page-level import："
grep -rn "^import" src/app/ --include="page.tsx" 2>/dev/null | head -20

echo ""
echo "=== React.lazy / dynamic 使用情況 ==="
grep -rn "dynamic(\|React\.lazy(" src/ --include="*.tsx" --include="*.ts" 2>/dev/null | wc -l
```

## 2b. Lighthouse 建議清單

手動或透過 CI 執行 Lighthouse，重點檢查：

| 指標 | 目標 | 說明 |
|------|------|------|
| LCP (Largest Contentful Paint) | < 2.5s | 最大內容繪製時間 |
| FID (First Input Delay) | < 100ms | 首次互動延遲 |
| CLS (Cumulative Layout Shift) | < 0.1 | 累積版面位移 |
| TTFB (Time to First Byte) | < 800ms | 伺服器回應時間 |

---

# 🔌 Phase 3 — API 效能

## 3a. API Route 分析（auto-execute）

```bash
echo "=== 所有 API routes ==="
find src/app/api -name "route.ts" -o -name "route.js" 2>/dev/null | sort

echo ""
echo "=== 未設定快取的 API ==="
for f in $(find src/app/api -name "route.ts" 2>/dev/null); do
  grep -qE "cache|revalidate|Cache-Control|stale-while" "$f" || echo "⚠️ 無快取設定: $f"
done

echo ""
echo "=== 同步耗時操作（可能阻塞 Event Loop） ==="
grep -rn "readFileSync\|writeFileSync\|execSync" src/ --include="*.ts" 2>/dev/null
```

## 3b. 資料庫查詢效能

```bash
echo "=== 潛在 N+1 Query（迴圈中的 DB 呼叫） ==="
grep -B5 -A2 "for\|forEach\|map" src/ --include="*.ts" 2>/dev/null | grep -A3 "prisma\.\|supabase\.\|\.from(" | head -30

echo ""
echo "=== 未使用 select 的查詢（可能回傳過多欄位） ==="
grep -rn "\.from(" src/ --include="*.ts" 2>/dev/null | grep -v "\.select(" | head -10
```

---

# 🧠 Phase 4 — 記憶體與 Runtime

```bash
echo "=== 大型靜態資料（可能佔用記憶體） ==="
find src/ -name "*.json" -size +100k 2>/dev/null
find public/ -name "*.json" -size +100k 2>/dev/null

echo ""
echo "=== 未清理的 setInterval / setTimeout ==="
grep -rn "setInterval\|setTimeout" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "clearInterval\|clearTimeout\|node_modules" | head -10

echo ""
echo "=== 未清理的 event listener ==="
grep -rn "addEventListener" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | head -10
```

---

# 📊 產出效能報告

```markdown
## Performance Audit Report

### 摘要

| 類別 | 狀態 | 主要發現 |
|------|------|----------|
| Bundle Size | ✅/⚠️/❌ | First Load JS: XXX KB |
| Core Web Vitals | ✅/⚠️/❌ | LCP: X.Xs, CLS: X.XX |
| API 效能 | ✅/⚠️/❌ | N 個 route 無快取設定 |
| DB 查詢 | ✅/⚠️/❌ | N 個潛在 N+1 query |
| Runtime | ✅/⚠️/❌ | N 個未清理的 timer |

### 優化建議（依影響排序）

| # | 類別 | 建議 | 預估影響 | 工作量 |
|---|------|------|----------|--------|
| 1 | Bundle | 改用 lodash/specific import | -30KB | 小 |
| 2 | API | 加入 Cache-Control header | 減少 50% DB 查詢 | 小 |
| 3 | Image | 改用 next/image | LCP 改善 | 中 |

### 不需處理的項目
- <已確認無影響的項目>
```

---

## 額外規則

- 本 workflow 只負責**檢測與建議**，不直接修改 code
- 效能優化的修改走 `feature-branch.md`
- 不要為了效能犧牲可讀性——除非瓶頸已被量化確認
- 過早優化是萬惡之源——優先處理使用者可感知的效能問題
