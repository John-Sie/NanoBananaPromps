---
description: API 端點設計規範 — RESTful 設計、Schema 定義、error handling 標準化
---

> 本 workflow 遵循 `engineering-agent.md` 通用守則。

Task: 設計新的 API 端點，確保符合專案的 API 設計規範

**與其他 workflow 的關係**：
- API 完成後 → `api-docs-audit.md` 確認文件同步
- API 涉及 DB 變更 → `db-migration.md`
- API 涉及認證 → `pentest.md` 驗證安全性

---

## Step 1 — 需求釐清

設計 API 前，先確認以下項目：

| 項目 | 問題 |
|------|------|
| 消費者 | 誰會呼叫這個 API？（前端 / 第三方 / webhook） |
| 資料來源 | 資料從哪來？（DB / 外部 API / 計算） |
| 認證需求 | 公開 / 需登入 / 需特定角色？ |
| 預期流量 | 高頻（需快取）/ 低頻？ |
| 即時性 | 即時回應 / 可接受非同步處理？ |

---

## Step 2 — 端點設計

### RESTful 命名規範

| 操作 | Method | 路徑範例 | 說明 |
|------|--------|----------|------|
| 列表 | `GET` | `/api/users` | 取得集合 |
| 單筆 | `GET` | `/api/users/[id]` | 取得單一資源 |
| 建立 | `POST` | `/api/users` | 建立新資源 |
| 完整更新 | `PUT` | `/api/users/[id]` | 替換整個資源 |
| 部分更新 | `PATCH` | `/api/users/[id]` | 更新部分欄位 |
| 刪除 | `DELETE` | `/api/users/[id]` | 刪除資源 |

### 命名原則

- 路徑用 **kebab-case**（`/api/user-profiles`，不是 `/api/userProfiles`）
- 資源名稱用**複數**（`/api/users`，不是 `/api/user`）
- 動作用 HTTP method 表達，不放在路徑裡（`POST /api/users`，不是 `/api/create-user`）
- 巢狀資源最多兩層（`/api/workspaces/[id]/members`，不要再往下）
- Query 參數用 **camelCase**（`?pageSize=10&sortBy=createdAt`）

### 非 CRUD 操作

若操作不適合 RESTful 模型：

```
POST /api/users/[id]/actions/deactivate
POST /api/reports/[id]/actions/export
POST /api/workspaces/[id]/actions/invite
```

---

## Step 3 — Schema 定義

### Request Schema（使用 Zod）

```typescript
import { z } from 'zod';

// POST /api/users
export const createUserSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  role: z.enum(['member', 'admin']).default('member'),
});

// GET /api/users (query params)
export const listUsersSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['createdAt', 'name', 'email']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
  search: z.string().optional(),
});

// 型別導出
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type ListUsersQuery = z.infer<typeof listUsersSchema>;
```

### Response Schema

```typescript
// 成功回應
interface SuccessResponse<T> {
  data: T;
  meta?: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

// 錯誤回應（統一格式）
interface ErrorResponse {
  error: {
    code: string;          // 機器可讀（如 'VALIDATION_ERROR'）
    message: string;       // 人類可讀
    details?: unknown;     // 額外資訊（如 Zod 驗證錯誤）
  };
}
```

---

## Step 4 — Status Code 規範

| Code | 用途 | 範例 |
|------|------|------|
| `200` | 成功（有回傳資料） | GET / PATCH |
| `201` | 成功建立 | POST |
| `204` | 成功（無回傳資料） | DELETE |
| `400` | 請求格式錯誤 | Zod 驗證失敗 |
| `401` | 未認證 | 未登入 / token 過期 |
| `403` | 未授權 | 權限不足 |
| `404` | 資源不存在 | ID 不存在 |
| `409` | 衝突 | 重複建立 / 競態條件 |
| `422` | 語意錯誤 | 格式正確但邏輯不合理 |
| `429` | 請求過多 | Rate limit |
| `500` | 伺服器錯誤 | 未預期的例外 |

---

## Step 5 — 實作模板

### Next.js App Router API Route

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createUserSchema } from './schema';

export async function POST(request: NextRequest) {
  try {
    // 1. 認證
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    // 2. 輸入驗證
    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_ERROR', message: 'Invalid input', details: parsed.error.flatten() } },
        { status: 400 }
      );
    }

    // 3. 業務邏輯
    const result = await createUser(parsed.data);

    // 4. 回應
    return NextResponse.json({ data: result }, { status: 201 });

  } catch (error) {
    console.error('POST /api/users error:', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' } },
      { status: 500 }
    );
  }
}
```

---

## Step 6 — API 設計 Checklist

```markdown
## API Design Checklist

### 設計
- [ ] 路徑命名符合 RESTful 規範
- [ ] HTTP method 選擇正確
- [ ] Request schema 用 Zod 定義
- [ ] Response schema 統一格式
- [ ] Status code 使用正確
- [ ] 分頁參數標準化（page / pageSize / total）

### 安全
- [ ] 認證檢查（除非為公開 API）
- [ ] 授權檢查（資源擁有權 / 角色）
- [ ] 輸入驗證（Zod safeParse）
- [ ] Rate limiting（公開端點必須有）

### 效能
- [ ] 是否需要快取？（Cache-Control / revalidate）
- [ ] 是否需要分頁？（列表 API 必須有）
- [ ] 是否為耗時操作？（考慮非同步處理）

### 文件
- [ ] 更新 `docs/` 中的 API 文件
- [ ] 或確認 `api-docs-audit.md` 會在 release 前執行
```

---

## Step 7 — 產出設計文件

```markdown
## API Design: <Endpoint Name>

### 端點

| Method | Path | 認證 | 說明 |
|--------|------|------|------|
| `POST` | `/api/users` | ✅ 需登入 | 建立新使用者 |

### Request

**Headers**:
- `Authorization: Bearer <token>`
- `Content-Type: application/json`

**Body**:
```json
{
  "name": "string (required, 1-100 chars)",
  "email": "string (required, valid email)",
  "role": "member | admin (default: member)"
}
```

### Response

**201 Created**:
```json
{
  "data": {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "role": "string",
    "createdAt": "ISO 8601"
  }
}
```

**400 Bad Request**:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input",
    "details": { ... }
  }
}
```
```

---

## 額外規則

- 所有 API 變更必須向下相容，除非是 major version bump
- 棄用 API 需先加 `Deprecation` header 和文件標記，至少保留一個版本
- 不要在 response 中洩露內部實作細節（如 DB schema、stack trace）
- Error message 面向開發者，不面向終端使用者
