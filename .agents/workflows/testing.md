---
description: 撰寫與補齊測試 — unit test、integration test、測試策略
---

> 本 workflow 遵循 `engineering-agent.md` 通用守則。

Task: 為指定的模組或功能撰寫測試，確保行為正確且可回歸驗證

**與其他 workflow 的關係**：
- `refactor.md` — 重構前應有測試保護，重構後測試必須全過
- `code-review.md` — review 中可能發現測試覆蓋不足，觸發本 workflow
- `release.md` Phase 4 — 跑 `npm test` 驗證

---

## 輸入

- **測試目標**：要測試的模組、函數、元件、或 API route
- **測試類型**：unit / integration / e2e（預設 unit）
- **優先級**：補齊既有缺口 / 為新功能寫測試 / 增加 edge case 覆蓋

---

## Step 1 — 現狀評估（auto-execute）

```bash
echo "=== 測試框架 ==="
node -p "
const pkg = require('./package.json');
const deps = {...pkg.dependencies, ...pkg.devDependencies};
const frameworks = ['jest', 'vitest', '@testing-library/react', '@testing-library/jest-dom', 'playwright', 'cypress'];
frameworks.forEach(f => deps[f] && console.log('✅ ' + f + ': ' + deps[f]));
"

echo ""
echo "=== 現有測試檔案 ==="
find src/ -name "*.test.*" -o -name "*.spec.*" 2>/dev/null | wc -l
echo "個測試檔案"

echo ""
echo "=== 測試覆蓋分布 ==="
find src/ -name "*.test.*" -o -name "*.spec.*" 2>/dev/null | sed 's|/[^/]*$||' | sort | uniq -c | sort -rn | head -10

echo ""
echo "=== 無測試的目錄 ==="
for dir in $(find src/ -type d -maxdepth 2 2>/dev/null); do
  SRC_COUNT=$(find "$dir" -maxdepth 1 -name "*.ts" -o -name "*.tsx" 2>/dev/null | grep -v ".test\.\|.spec\." | wc -l)
  TEST_COUNT=$(find "$dir" -maxdepth 1 -name "*.test.*" -o -name "*.spec.*" 2>/dev/null | wc -l)
  [ "$SRC_COUNT" -gt 0 ] && [ "$TEST_COUNT" -eq 0 ] && echo "⚠️ $dir ($SRC_COUNT 個源檔案，0 個測試)"
done 2>/dev/null
```

---

## Step 2 — 決定測試策略

### 測試類型選擇指南

| 類型 | 適用對象 | 工具 | 速度 |
|------|----------|------|------|
| **Unit Test** | 純函數、utils、hooks、service logic | Jest / Vitest | ⚡ 快 |
| **Component Test** | React 元件的渲染與互動 | Testing Library | ⚡ 快 |
| **Integration Test** | API route、DB 操作、多模組協作 | Jest + supertest / Vitest | 🔶 中 |
| **E2E Test** | 使用者完整流程 | Playwright / Cypress | 🐢 慢 |

### 優先序（什麼最值得測試）

```
1. 💰 金流 / 計費邏輯 — 錯了會賠錢
2. 🔐 認證 / 授權邏輯 — 錯了會洩露資料
3. 📊 資料轉換 / 計算 — 純函數，最容易測也最該測
4. 🔀 狀態機 / 流程控制 — 分支多，容易漏
5. 🧩 共用元件 / hooks — 影響範圍大
6. 🌐 API routes — 驗證 request/response contract
```

---

## Step 3 — 撰寫測試

### 3a. Unit Test 模板

```typescript
import { describe, it, expect } from 'vitest'; // 或 jest
import { targetFunction } from '../targetModule';

describe('targetFunction', () => {
  // Happy path
  it('should return expected result for valid input', () => {
    expect(targetFunction(validInput)).toBe(expectedOutput);
  });

  // Edge cases
  it('should handle empty input', () => {
    expect(targetFunction('')).toBe(defaultValue);
  });

  it('should handle null/undefined', () => {
    expect(targetFunction(null)).toBe(defaultValue);
  });

  // Error cases
  it('should throw on invalid input', () => {
    expect(() => targetFunction(invalidInput)).toThrow('Expected error message');
  });

  // Boundary values
  it('should handle boundary values', () => {
    expect(targetFunction(0)).toBe(boundaryResult);
    expect(targetFunction(Number.MAX_SAFE_INTEGER)).toBe(maxResult);
    expect(targetFunction(-1)).toBe(negativeResult);
  });
});
```

### 3b. React Component Test 模板

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TargetComponent } from '../TargetComponent';

describe('TargetComponent', () => {
  it('should render correctly', () => {
    render(<TargetComponent prop="value" />);
    expect(screen.getByText('Expected text')).toBeInTheDocument();
  });

  it('should handle user interaction', async () => {
    const onAction = vi.fn();
    render(<TargetComponent onAction={onAction} />);
    
    fireEvent.click(screen.getByRole('button', { name: 'Action' }));
    expect(onAction).toHaveBeenCalledWith(expectedArgs);
  });

  it('should show loading state', () => {
    render(<TargetComponent isLoading />);
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('should show error state', () => {
    render(<TargetComponent error="Something went wrong" />);
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();
  });
});
```

### 3c. API Route Test 模板

```typescript
import { describe, it, expect } from 'vitest';
import { GET, POST } from '../route';
import { NextRequest } from 'next/server';

describe('API /api/target', () => {
  it('GET should return data', async () => {
    const req = new NextRequest('http://localhost/api/target');
    const res = await GET(req);
    const data = await res.json();

    expect(res.status).toBe(200);
    expect(data).toHaveProperty('expectedField');
  });

  it('POST should validate input', async () => {
    const req = new NextRequest('http://localhost/api/target', {
      method: 'POST',
      body: JSON.stringify({ invalid: 'data' }),
    });
    const res = await POST(req);

    expect(res.status).toBe(400);
  });

  it('should require authentication', async () => {
    // 不帶 auth header
    const req = new NextRequest('http://localhost/api/target');
    const res = await GET(req);

    expect(res.status).toBe(401);
  });
});
```

---

## Step 4 — 測試品質檢查

### 每個測試案例的 Checklist

- [ ] 測試名稱是自描述的（讀名稱就知道在測什麼）
- [ ] 每個 test 只驗證一件事（single assertion principle）
- [ ] 有 happy path + edge case + error case
- [ ] 不依賴測試執行順序
- [ ] 不依賴外部服務（mock 外部依賴）
- [ ] 沒有 flaky 的時間依賴（`setTimeout`、`Date.now`）

### 常見 Anti-patterns

| Anti-pattern | 問題 | 修正 |
|-------------|------|------|
| 測試實作而非行為 | 重構就壞 | 只驗證 input → output |
| 過度 mock | 什麼都沒真正測到 | 只 mock 外部邊界 |
| 無 assertion 的 test | 永遠通過 | 每個 test 至少一個 `expect` |
| snapshot 濫用 | 不知道在測什麼 | 只對穩定的輸出用 snapshot |
| `test.skip` 堆積 | 被跳過 = 沒測試 | 修或刪，不要留 skip |

---

## Step 5 — 驗證（auto-execute）

```bash
echo "=== 執行測試 ==="
npm test 2>&1

echo ""
echo "=== 測試覆蓋率（若有設定） ==="
npm test -- --coverage 2>&1 | tail -20 || echo "未設定 coverage reporter"
```

---

## Step 6 — 產出測試報告

```markdown
## Testing Report

| 項目 | 內容 |
|------|------|
| 測試目標 | <模組 / 功能> |
| 新增測試數 | N 個 test case |
| 測試類型 | unit / component / integration |
| 全部通過 | ✅ / ❌ |

### 新增的測試檔案

| 檔案 | Test Cases | 覆蓋 |
|------|-----------|------|
| `src/utils/__tests__/format.test.ts` | 8 | happy path + edge case + error |

### 覆蓋分析

| 類別 | 已覆蓋 | 建議補齊 |
|------|--------|----------|
| 純函數 | ✅ | — |
| API routes | ⚠️ 部分 | auth check、error response |
| React components | ❌ | 互動行為、loading/error state |
```

---

## 額外規則

- 測試檔案放在 `__tests__/` 目錄或與源檔案同級（依專案慣例）
- 測試檔案命名：`<source>.test.ts` 或 `<source>.spec.ts`
- 不要為了覆蓋率寫無意義的測試 — 每個 test 都應該保護一個真實的行為
- Mock 外部依賴（DB、API、第三方服務），不 mock 被測試的模組本身
- 測試應該可以獨立執行，不依賴其他測試的副作用
