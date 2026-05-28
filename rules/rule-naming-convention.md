---
trigger: always_on
glob: "*{*.ts,*.tsx,*.js,*.jsx,*.sql,*.css,*.json}"
description: "Global Naming Convention & Project Structure Rules"
---

# Architecture Rule — Naming Convention

## Objective

統一整站的命名慣例與目錄結構，消除團隊協作中的命名歧義。
本規範為所有 Role（Coder / Architect / Auditor）共同遵守的基礎約定。

## 檔案與目錄命名 (File & Directory Naming)

| 類型 | 規則 | 範例 |
|---|---|---|
| React Components | `PascalCase` | `UserProfileCard.tsx` |
| Pages / Layouts (App Router) | `lowercase` (Next.js 約定) | `page.tsx`, `layout.tsx`, `loading.tsx` |
| Hooks | `camelCase`，以 `use` 開頭 | `useAuth.ts`, `useDebounce.ts` |
| Utilities / Services | `kebab-case` | `date-utils.ts`, `payment-service.ts` |
| Constants / Config | `kebab-case` | `site-config.ts`, `api-endpoints.ts` |
| Type Definition Files | `kebab-case`，以 `.types.ts` 或 `.d.ts` 結尾 | `user.types.ts`, `api.d.ts` |
| Test Files | 與原檔同名 + `.test.ts` 或 `.spec.ts` | `date-utils.test.ts` |
| SQL Migration | Supabase CLI 自動生成格式 | `20240101120000_add_users_table.sql` |

## 目錄結構約定 (Directory Structure)

```
src/ 或 app/
├── app/              # Next.js App Router (pages, layouts, API routes)
├── components/       # 共用 UI 元件（按功能或 domain 分子目錄）
│   ├── ui/           # shadcn/ui 基礎元件
│   └── [domain]/     # 業務元件（如 event/, user/）
├── lib/              # 純邏輯、工具函式、第三方 SDK wrapper
├── services/         # 資料存取層（DB query、外部 API 封裝）
├── actions/          # Server Actions
├── hooks/            # 自定義 React Hooks
├── types/            # 全域 TypeScript 型別定義
├── constants/        # 全域常數與列舉
└── config/           # 環境設定、feature flags
```

## 變數與函式命名 (Variables & Functions)

| 類型 | 規則 | 範例 |
|---|---|---|
| 變數 / 函式 | `camelCase` | `getUserById`, `isLoading` |
| 常數（不可變） | `UPPER_SNAKE_CASE` | `MAX_RETRY_COUNT`, `DEFAULT_PAGE_SIZE` |
| TypeScript Type / Interface | `PascalCase`，不加 `I` 前綴 | `User`, `EventDetail`（非 ~~IUser~~） |
| Enum | `PascalCase`（名稱）+ `PascalCase`（成員） | `enum Role { Admin, Editor, Viewer }` |
| Boolean 變數 | 以 `is` / `has` / `should` / `can` 開頭 | `isActive`, `hasPermission` |
| Event Handler | 以 `handle` 開頭 | `handleSubmit`, `handleClick` |
| Callback Prop | 以 `on` 開頭 | `onSuccess`, `onChange` |

## 資料庫欄位命名 (Database Column Naming)

- **一律 `snake_case`**：`created_at`, `user_id`, `app_version`。
- **外鍵命名**：`{referenced_table_singular}_id`，例如 `event_id`, `user_id`。
- **布林欄位**：以 `is_` 開頭，例如 `is_active`, `is_deleted`。
- **時間欄位**：以 `_at` 結尾，例如 `executed_at`, `updated_at`。
- **與 Drizzle ORM 對照**：TypeScript model 中使用 `camelCase`，透過 Drizzle 的 column mapping 對應 DB 的 `snake_case`。

## 環境變數命名 (Environment Variables)

- **`NEXT_PUBLIC_*`**：僅限前端可存取的非敏感值（如 Supabase URL、GA Tracking ID）。
- **無 `NEXT_PUBLIC_` 前綴**：所有 API Key、Secret、DB Connection String 等機密值，嚴禁出現在前端 bundle 中。
- **命名規則**：`UPPER_SNAKE_CASE`，以服務名為 prefix，例如 `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`。
