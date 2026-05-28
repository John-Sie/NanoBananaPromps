---
description: 國際化完整性檢查 — 翻譯覆蓋、hardcoded 字串、locale 格式
---

> 本 workflow 遵循 `engineering-agent.md` 通用守則。

Task: 檢查多語系（i18n）實作的完整性，確保所有語言的翻譯覆蓋一致

**建議執行時機**：
- 新增功能後（可能引入未翻譯的字串）
- 新增語系後
- Release 前

---

## Step 1 — 現況掃描（auto-execute）

```bash
echo "=== i18n 框架 ==="
node -p "
const pkg = require('./package.json');
const deps = {...pkg.dependencies, ...pkg.devDependencies};
const i18n = ['next-intl', 'next-i18next', 'react-intl', 'react-i18next', 'i18next', 'lingui'];
i18n.forEach(f => deps[f] && console.log('✅ ' + f + ': ' + deps[f]));
" 2>/dev/null

echo ""
echo "=== 翻譯檔案 ==="
find . -path "*/messages/*.json" -o -path "*/locales/*.json" -o -path "*/i18n/*.json" -o -path "*/translations/*.json" 2>/dev/null | grep -v node_modules | sort

echo ""
echo "=== 支援的語系 ==="
ls messages/ 2>/dev/null || ls locales/ 2>/dev/null || ls src/i18n/ 2>/dev/null || echo "⚠️ 無法自動偵測翻譯目錄"
```

---

## Step 2 — 翻譯 Key 完整性檢查

### 2a. 比對各語系的 key 覆蓋（auto-execute）

```bash
echo "=== 各語系翻譯 key 數量 ==="
for f in messages/*.json 2>/dev/null; do
  LANG=$(basename "$f" .json)
  COUNT=$(node -p "Object.keys(JSON.parse(require('fs').readFileSync('$f','utf8'))).length" 2>/dev/null)
  echo "$LANG: $COUNT keys"
done

echo ""
echo "=== 缺漏的 key（以第一個語系為基準） ==="
BASE=$(ls messages/*.json 2>/dev/null | head -1)
if [ -n "$BASE" ]; then
  BASE_LANG=$(basename "$BASE" .json)
  for f in messages/*.json 2>/dev/null; do
    [ "$f" = "$BASE" ] && continue
    LANG=$(basename "$f" .json)
    node -e "
      const base = JSON.parse(require('fs').readFileSync('$BASE','utf8'));
      const target = JSON.parse(require('fs').readFileSync('$f','utf8'));
      const flatten = (obj, prefix='') => Object.entries(obj).reduce((acc,[k,v]) => {
        const key = prefix ? prefix+'.'+k : k;
        return typeof v === 'object' && v !== null ? {...acc, ...flatten(v, key)} : {...acc, [key]: v};
      }, {});
      const baseKeys = Object.keys(flatten(base));
      const targetKeys = new Set(Object.keys(flatten(target)));
      const missing = baseKeys.filter(k => !targetKeys.has(k));
      if(missing.length) {
        console.log('⚠️ $LANG 缺少 ' + missing.length + ' 個 key:');
        missing.slice(0,10).forEach(k => console.log('  - ' + k));
        if(missing.length > 10) console.log('  ... 還有 ' + (missing.length-10) + ' 個');
      } else {
        console.log('✅ $LANG: 完整');
      }
    " 2>/dev/null
  done
fi
```

### 2b. 未使用的翻譯 key

```bash
echo "=== 可能未使用的翻譯 key ==="
BASE=$(ls messages/*.json 2>/dev/null | head -1)
if [ -n "$BASE" ]; then
  node -e "
    const base = JSON.parse(require('fs').readFileSync('$BASE','utf8'));
    const flatten = (obj, prefix='') => Object.entries(obj).reduce((acc,[k,v]) => {
      const key = prefix ? prefix+'.'+k : k;
      return typeof v === 'object' && v !== null ? {...acc, ...flatten(v, key)} : {...acc, [key]: v};
    }, {});
    const keys = Object.keys(flatten(base));
    keys.slice(0, 5).forEach(k => console.log('  檢查: ' + k));
    console.log('  ... 共 ' + keys.length + ' 個 key（需逐一 grep 確認使用狀況）');
  " 2>/dev/null
fi
```

---

## Step 3 — Hardcoded 字串掃描（auto-execute）

```bash
echo "=== JSX 中的硬編碼中文字串 ==="
grep -rn ">[^<{]*[\x{4e00}-\x{9fff}][^<]*<" src/ --include="*.tsx" 2>/dev/null | grep -v "node_modules\|.test." | head -15

echo ""
echo "=== JSX 中的硬編碼英文字串（可能漏翻） ==="
grep -rPn ">\s*[A-Z][a-z]+(\s[a-z]+){2,}\s*<" src/ --include="*.tsx" 2>/dev/null | grep -v "node_modules\|.test.\|className" | head -15

echo ""
echo "=== placeholder / title / aria-label 中的硬編碼字串 ==="
grep -rn "placeholder=\"[A-Za-z]\|title=\"[A-Za-z]\|aria-label=\"[A-Za-z]" src/ --include="*.tsx" 2>/dev/null | grep -v "node_modules" | head -10
```

---

## Step 4 — Locale 格式檢查

| 項目 | 檢查 |
|------|------|
| 日期格式 | 是否使用 `Intl.DateTimeFormat` 或 i18n 函式庫？ |
| 數字格式 | 千分位符號（`,` vs `.`）、小數點 |
| 貨幣 | 是否使用 `Intl.NumberFormat` 配合 currency? |
| 複數形式 | 是否處理了 plural rules？（英文 1 item / 2 items） |
| RTL 支援 | 若支援阿拉伯文/希伯來文，CSS 是否處理了 RTL？ |

```bash
echo "=== 日期格式化方式 ==="
grep -rn "toLocaleDateString\|DateTimeFormat\|format.*date\|dayjs\|moment" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | head -10

echo ""
echo "=== 數字/貨幣格式化 ==="
grep -rn "toLocaleString\|NumberFormat\|formatCurrency\|formatNumber" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | head -10

echo ""
echo "=== 硬編碼的日期格式 ==="
grep -rn "YYYY-MM-DD\|MM/DD/YYYY\|DD/MM" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | head -5
```

---

## Step 5 — 產出報告

```markdown
## i18n Audit Report

### 支援語系

| 語系 | Key 數量 | 覆蓋率 | 狀態 |
|------|----------|--------|------|
| en | 150 | 100% (基準) | ✅ |
| zh-TW | 148 | 98.7% | ⚠️ 缺 2 key |
| ja | 140 | 93.3% | ❌ 缺 10 key |

### 缺漏清單

| # | Key | 缺少語系 | 建議翻譯 |
|---|-----|----------|----------|
| 1 | `dashboard.title` | ja | ダッシュボード |
| 2 | `settings.save` | zh-TW, ja | 儲存 / 保存 |

### Hardcoded 字串

| # | 檔案 | 行數 | 字串 | 建議 |
|---|------|------|------|------|
| 1 | `Nav.tsx` | L12 | "Settings" | 改用 `t('nav.settings')` |

### Locale 格式

| 項目 | 狀態 |
|------|------|
| 日期 | ✅ 使用 Intl / ⚠️ 有硬編碼格式 |
| 數字 | ✅ / ⚠️ |
| 貨幣 | ✅ / ⚠️ |
| 複數 | ✅ / ⚠️ |
```

---

## 額外規則

- 翻譯 key 的命名使用 dot notation 分層（`page.section.element`）
- 不要在翻譯字串中拼接（`"Hello " + name`），使用模板參數（`t('greeting', { name })`）
- 翻譯檔案不要用 git merge 自動合併 — JSON key 順序變動容易造成假衝突
- 新增 UI 文字時，**同時新增翻譯 key**，不要「之後再翻」
