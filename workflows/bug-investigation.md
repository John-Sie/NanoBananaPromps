---
description: 系統性排查 Bug — 從重現到定位到修復建議
---

> 本 workflow 遵循 `role-coder` 與 `role-auditor` 的通用守則。
>
> ⚠️ 以下指令中的 `src/` 為預設原始碼路徑。若專案使用不同結構（如 `app/`），請自行替換。

你是專案的偵探。執行此 workflow 的目標是：**系統性地重現、隔離、定位 Bug 的根因，並產出修復建議。**

**與其他 workflow 的關係**：
- 定位問題後 → `feature-branch.md` 建立修復分支
- 若為 production 緊急問題 → 先走 `rollback.md` 止血，再用本 workflow 排查
- 若為安全漏洞 → 排查後評估是否需要走 `pentest.md` 全面檢測

---

## 輸入

- **Bug 描述**：使用者回報的問題（錯誤訊息、截圖、影片）
- **重現步驟**：已知的重現路徑（若有）
- **影響範圍**：哪些功能 / 頁面 / 使用者受影響
- **環境**：production / preview / local？哪個瀏覽器 / 裝置？

---

## 執行步驟

### Step 1 — 資訊收集（auto-execute）

```bash
echo "=== 最近的相關 commit ==="
git log --oneline -20

echo ""
echo "=== 最近修改的檔案 ==="
git log --name-only --oneline -5

echo ""
echo "=== 當前分支與狀態 ==="
git branch --show-current
git status --short
```

若有錯誤訊息，搜尋 codebase：

```bash
# 替換 <ERROR_MSG> 為錯誤訊息的關鍵字
grep -rn "<ERROR_MSG>" src/ --include="*.ts" --include="*.tsx" 2>/dev/null
```

### Step 2 — 重現（Reproduce）

嘗試在本地重現問題：

1. **確認環境一致**：
   ```bash
   node -v
   npm -v
   echo "package.json version: $(node -p "require('./package.json').version")"
   ```

2. **啟動本地 dev server**：
   ```bash
   npm run dev
   ```

3. **依照回報的步驟操作**，記錄：
   - 是否能重現？
   - 重現率（100% / 偶發）？
   - 最小重現路徑（最少的步驟重現問題）

> 若無法重現：
> - 檢查是否為環境差異（env var、DB 資料、快取）
> - 檢查是否為特定使用者/帳號的資料問題
> - 檢查 production log（若有）

### Step 3 — 隔離（Isolate）

縮小問題範圍，確定是前端 / 後端 / 資料庫 / 第三方服務的問題：

#### 3a. 前端 vs 後端

```bash
# 檢查 API 回應是否正常
echo "=== 可能相關的 API routes ==="
grep -rn "<RELATED_KEYWORD>" src/app/api/ --include="*.ts" -l 2>/dev/null
```

- API 回傳正確但 UI 顯示錯誤 → **前端問題**
- API 回傳錯誤 → **後端問題**，繼續往下

#### 3b. 後端邏輯 vs 資料庫

```bash
# 檢查相關的 DB query / ORM 操作
grep -rn "prisma\.\|supabase\.\|\.from(\|\.select(" src/ --include="*.ts" -l 2>/dev/null | head -10
```

- Query 正確但回傳異常資料 → **資料問題**
- Query 邏輯有誤 → **後端邏輯問題**

#### 3c. 第三方服務

```bash
# 檢查是否涉及外部 API 呼叫
grep -rn "fetch(\|axios\.\|\.post(\|\.get(" src/ --include="*.ts" 2>/dev/null | grep -v "node_modules" | grep -v "/api/" | head -10
```

### Step 4 — 定位根因（Diagnose）

根據隔離結果，深入分析根因：

#### 常見根因 Checklist

| 類型 | 檢查項目 |
|------|----------|
| **型別錯誤** | `undefined` / `null` 存取、型別不匹配 |
| **競態條件** | 非同步操作順序錯誤、missing `await` |
| **狀態管理** | state 未正確更新、stale closure |
| **資料邊界** | 空陣列、空物件、超長字串、特殊字元 |
| **權限** | 未登入、token 過期、RLS policy 阻擋 |
| **環境差異** | env var 缺失、dev vs production 行為不同 |
| **快取** | 瀏覽器快取、CDN 快取、ISR 快取 |
| **第三方** | API rate limit、服務異常、schema 變更 |

#### Git Bisect（若知道「之前可以用」）

```bash
# 找出引入 bug 的 commit
git bisect start
git bisect bad HEAD
git bisect good <LAST_KNOWN_GOOD_COMMIT>
# 然後逐步測試，git bisect good / git bisect bad
```

### Step 5 — 產出排查報告

```markdown
## Bug Investigation Report

| 項目 | 內容 |
|------|------|
| Bug 描述 | <簡述> |
| 重現率 | 100% / 偶發 / 無法重現 |
| 最小重現路徑 | <步驟> |
| 影響範圍 | <頁面 / 功能 / 使用者群> |
| 問題層級 | 前端 / 後端 / 資料庫 / 第三方 |
| 根因 | <詳細說明> |
| 引入 commit | <commit hash>（若能確認） |

### 修復建議

| 方案 | 風險 | 工作量 | 說明 |
|------|------|--------|------|
| A（推薦） | 低 | 小 | <具體修法> |
| B | 中 | 中 | <替代方案> |

### 相關檔案

| 檔案 | 行數 | 說明 |
|------|------|------|
| `src/...` | L42 | 問題發生位置 |
| `src/...` | L15 | 需要一併修改 |

### 建議的測試案例

- [ ] <重現步驟 → 預期結果>
- [ ] <邊界條件測試>
```

---

## 額外規則

- **只負責排查，不負責修復**——修復走 `feature-branch.md` 或 `hotfix.md`
- 不可在排查過程中修改 production code（可以加 `console.log` debug，但完成後必須移除）
- 若排查過程中發現其他 bug，記錄但不偏離主線
- 無法定位根因時，誠實回報「無法確定」並列出已排除的可能性
