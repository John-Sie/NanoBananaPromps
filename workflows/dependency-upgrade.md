---
description: 升級指定 dependency 並確保系統穩定
---

> 本 workflow 遵循 `engineering-agent.md` 通用守則。

Task: 升級指定 dependency 並確保系統穩定

Source of Truth: code + official package behavior

Scope: `package.json` / lock files / related code

**與其他 workflow 的關係**：
- `security-hygiene-audit.md` Phase 4 可能發現需要升級的 dependency，觸發本 workflow
- 升級完成後建議跑 `security-hygiene-audit.md` 確認無新漏洞引入

---

## 輸入

- **套件名稱**：必須明確指定（不接受「升級所有 dependency」）
- **目標版本**：指定版本號，或 `latest`（agent 須解析為確切版本號後再執行）
- **升級原因**：安全漏洞修復 / 功能需求 / 定期維護

---

## 執行步驟

### Step 1 — 版本調查（auto-execute）

```bash
echo "=== 目前安裝版本 ==="
npm ls <PACKAGE> 2>/dev/null | head -5

echo ""
echo "=== 目標版本資訊 ==="
npm show <PACKAGE> version dist-tags time --json 2>/dev/null | head -30

echo ""
echo "=== peer dependencies ==="
npm show <PACKAGE>@<TARGET_VERSION> peerDependencies --json 2>/dev/null
```

### Step 2 — 閱讀 Breaking Changes

依以下優先順序查找 release notes：

1. GitHub Releases 頁面：`https://github.com/<OWNER>/<REPO>/releases`
2. `CHANGELOG.md`（repo 根目錄）
3. 官方 migration guide（常見於 major bump）
4. `npm show <PACKAGE> repository.url` → 從 repo 找 changelog

**產出 Breaking Changes 摘要**（即使是 minor/patch 也要檢查，某些套件不遵守 semver）。

### Step 3 — 建立 Branch

```bash
git checkout -b chore/<PACKAGE>-upgrade-v<TARGET_VERSION>
```

### Step 4 — 執行升級

**單一套件**：
```bash
npm install <PACKAGE>@<TARGET_VERSION>
```

**若有 peer dependency 衝突**：
```bash
# 先查看衝突詳情
npm install <PACKAGE>@<TARGET_VERSION> 2>&1

# 常見處理方式（擇一）：
# 1. 一併升級衝突的 peer dependency
# 2. 若 peer dep 是寬鬆範圍警告，評估是否可忽略
# 3. 若衝突無法解決 → 記錄原因，中止升級
```

### Step 5 — Lock File 差異檢查（auto-execute）

```bash
echo "=== package-lock.json 變更統計 ==="
git diff --stat package-lock.json

echo ""
echo "=== 受影響的 transitive dependencies 數量 ==="
git diff package-lock.json | grep -c '"version"' || echo "0"
```

> 若 transitive dependency 變更超過 50 個，標記為高風險升級，需額外注意。

### Step 6 — 程式碼適配

根據 Step 2 的 breaking changes 摘要：
- 修正所有受影響的 import / API 呼叫
- **僅修正與此升級直接相關的問題**
- 不做額外重構

### Step 7 — 全套驗證（auto-execute）

```bash
npm install && npx tsc --noEmit && npm run lint && npm run build
```

### Step 8 — 產出升級報告

```markdown
## Dependency Upgrade Report

| 項目 | 內容 |
|------|------|
| 套件 | `<PACKAGE>` |
| 版本變更 | `<CURRENT>` → `<TARGET>` |
| 升級類型 | major / minor / patch |
| Breaking Changes | 有 / 無（摘要如下） |
| Peer Dep 衝突 | 有 / 無（處理方式如下） |
| Transitive Deps 變更 | N 個 |
| Build 狀態 | ✅ 通過 / ❌ 失敗 |
| 結論 | ✅ 安全 merge / ⚠️ 建議觀察 / ❌ 不建議 merge |

### Breaking Changes 摘要
- ...

### 需要注意的行為變更
- ...
```

---

## 回滾指引

若驗證失敗且無法在合理時間內修復：

```bash
# 還原 package.json 和 lock file
git checkout -- package.json package-lock.json

# 重新安裝
npm install

# 驗證還原成功
npx tsc --noEmit && npm run build
```

產出失敗報告，記錄：
- 失敗原因
- 錯誤訊息
- 建議的替代方案（降級到中間版本 / 等待上游修復 / fork）

---

## 額外規則

- 不可 silent upgrade — 必須明確版本號，不可用 `^` 或 `~` 模糊指定
- 不可忽略 major breaking change
- 若風險高 → 不 merge，輸出評估報告供人工決策
- 一次只升級一個 major dependency — 避免交叉影響難以排查
