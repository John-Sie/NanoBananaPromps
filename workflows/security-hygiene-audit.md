---
description: 安全審計與程式碼衛生檢查 — major release 前、加新 dependency 後、安全敏感變更時執行
---

你是專案的安全審計官。此 workflow 專注於 `/release` 未涵蓋的安全與程式碼衛生檢查。

**定位**：這不是每次發布都要跑的流程。在以下情境使用：
- Major release 前
- 新增或升級 dependency 後
- 涉及認證、支付、API key 等安全敏感變更
- 定期審計（建議每月一次）

**與其他 workflow 的關係**：
- `api-docs-audit.md` — API 文件一致性，與本 workflow 無重疊
- 跑完本 workflow 後直接接 `/release` 🚀

---

# 🔒 Security Phases

---

## Phase 1 — Secret Scan（auto-execute）

```bash
echo "=== 掃描已知金鑰格式 ==="
grep -rn "sk_live\|sk_test\|PRIVATE_KEY\|password\s*=\|Bearer\s" src/ --include="*.ts" --include="*.tsx" --include="*.js" 2>/dev/null

echo ""
echo "=== 掃描已知 API Key prefix ==="
grep -rn "AIzaSy\|ghp_\|gho_\|xoxb-\|xoxp-\|sk-proj-\|sk-ant-\|sb_publishable_\|sbp_\|glpat-\|AKIA[A-Z0-9]" . --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=.next 2>/dev/null

echo ""
echo "=== 掃描高熵度疑似密鑰字串（32+ 字元、混合大小寫數字） ==="
grep -rPn "['\"][A-Za-z0-9+/=_-]{32,}['\"]" src/ --include="*.ts" --include="*.tsx" --include="*.js" 2>/dev/null | grep -v "node_modules" | head -20

echo ""
echo "=== 掃描 .env 檔案是否被追蹤 ==="
git ls-files | grep -i "\.env" 2>/dev/null && echo "❌ 有 .env 檔案被 git 追蹤！" || echo "✅ 無 .env 被追蹤"
```

**判定**：
- ✅ 無結果 → 安全
- ❌ 有任何金鑰出現在原始碼中 → **必須立即移除並 rotate 該金鑰**

> ⚠️ **維護提示**：已知 API Key prefix 清單需定期更新。新增第三方服務時，將其 key prefix 加入上方 grep pattern。

---

## Phase 2 — Gitignore 完整性（auto-execute）

**通用必備**（所有專案都應有）：

```bash
echo "=== 通用必備 ==="
UNIVERSAL=(".env*" "node_modules/" "coverage/" "*.local" ".DS_Store")
for pattern in "${UNIVERSAL[@]}"; do
  grep -q "$pattern" .gitignore && echo "✅ $pattern" || echo "❌ 缺少 $pattern"
done
```

**框架特定**（依專案技術棧選擇）：

```bash
echo ""
echo "=== Next.js / Vercel ==="
FRAMEWORK=(".next/" ".vercel/" "out/")
for pattern in "${FRAMEWORK[@]}"; do
  grep -q "$pattern" .gitignore && echo "✅ $pattern" || echo "⚠️ 缺少 $pattern（若使用該框架）"
done
```

> 若專案不使用 Next.js / Vercel，框架特定項目顯示 ⚠️ 可忽略。

---

## Phase 3 — Dependency Vulnerability Audit（auto-execute）

```bash
echo "=== npm audit（完整輸出） ==="
npm audit --audit-level=high 2>&1
echo ""
echo "=== 摘要 ==="
npm audit --audit-level=high 2>&1 | grep -E "found|severity" | tail -5
```

- ✅ 無 high/critical → 安全
- ⚠️ 有 high → 評估是否影響 production，能修則修
- ❌ 有 critical → **必須修復**

---

## Phase 4 — Outdated Dependencies（auto-execute）

```bash
echo "=== 過期 dependencies ==="
npm outdated 2>&1 || true
echo ""
echo "=== major version 落後的套件 ==="
npm outdated 2>&1 | awk 'NR>1 { split($2,c,"."); split($4,l,"."); if(c[1]!=l[1]) print "⚠️ " $1 ": " $2 " → " $4 " (major bump)" }' || true
```

**處理方式**：
- Major version 落後 → 評估 breaking changes，記入升級計畫或 `dependency-upgrade.md`
- Minor/patch 落後 → 建議順手更新
- 不阻擋本次 release，但應記錄

---

# 🧹 Code Hygiene Phases

---

## Phase 5 — console.log 清理（auto-execute）

```bash
echo "=== 疑似調試用 console.log ==="
grep -rn "console\.log" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "// keep" | grep -v "node_modules"
echo ""
echo "=== 統計 ==="
COUNT=$(grep -rn "console\.log" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | grep -v "// keep" | grep -v "node_modules" | wc -l)
echo "共 $COUNT 處（不含標記 // keep 的）"
```

- 移除所有調試用 `console.log`
- 需保留的加上 `// keep` 註解

---

## Phase 6 — TODO/FIXME 掃描（auto-execute）

```bash
echo "=== TODO/FIXME/HACK/XXX ==="
grep -rn "TODO\|FIXME\|HACK\|XXX" src/ --include="*.ts" --include="*.tsx" 2>/dev/null
echo ""
COUNT=$(grep -rn "TODO\|FIXME\|HACK\|XXX" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l)
echo "共 $COUNT 處"
```

**處理方式**（擇一）：
- 本版會修 → 現在修
- 下版再處理 → 記到 `BACKLOG_V_NEXT.md`
- 已知且刻意保留 → 加 `// known` 註解

---

## Phase 7 — 功能隔離檢查（Scope Freeze）

> 僅在 major release 或有半成品功能時需要。

檢查是否有未完成的功能暴露在 production：

```bash
echo "=== Feature flags / WIP guards ==="
grep -rn "TODO.*implement\|NOT_IMPLEMENTED\|coming.soon\|isEnabled.*false" src/ --include="*.ts" --include="*.tsx" 2>/dev/null
echo ""
echo "=== 501 Not Implemented routes ==="
grep -rn "501\|Not Implemented" src/app/api/ --include="*.ts" 2>/dev/null
```

針對半成品功能，確認已用以下任一方式隔離：
- UI 入口隱藏（`hidden` / conditional render）
- API route 回傳 `501 Not Implemented`
- Feature flag 設為 `false`

---

# ✅ 完成條件

- [ ] Secret scan 無洩露
- [ ] .gitignore 完整
- [ ] `npm audit` 無 critical
- [ ] 無嚴重過期 dependency（或已記錄升級計畫）
- [ ] 調試用 `console.log` 已清除
- [ ] TODO/FIXME 已處理或記入 backlog
- [ ] 半成品功能已隔離（如適用）

---

## 📊 審計摘要模板

跑完所有 Phase 後，產出以下摘要：

```markdown
## Security & Hygiene Audit Summary

| Phase | 狀態 | 發現 | 處理 |
|-------|------|------|------|
| 1. Secret Scan | ✅/❌ | — | — |
| 2. Gitignore | ✅/⚠️ | — | — |
| 3. Vulnerability Audit | ✅/⚠️/❌ | N 個 high, M 個 critical | 已修 / 待修 |
| 4. Outdated Deps | ✅/⚠️ | N 個 major 落後 | 已記錄升級計畫 |
| 5. console.log | ✅/⚠️ | N 處 | 已清除 / N 處保留 |
| 6. TODO/FIXME | ✅/⚠️ | N 處 | 已處理 / 記入 backlog |
| 7. Scope Freeze | ✅/N/A | — | — |

**結論**：✅ 可進入 release / ❌ 需先修復以下項目：...
```

**全部通過 → 執行 `/release` 🚀**
