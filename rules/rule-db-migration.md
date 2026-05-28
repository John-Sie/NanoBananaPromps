---
trigger: model_decision
trigger_description: "Trigger ANY TIME the user asks to modify database schema, add columns, create tables, write SQL migrations, or change Supabase RLS policies."
glob: "*{*.sql,supabase/migrations/*,schema.ts,*.prisma}"
description: "Supabase Migration & DDL Strict Rules"
---

# Architecture Rule — Supabase Migration Controls

## Objective

嚴格管控所有資料庫的結構變更（Schema Changes / DDL），防止本地開發環境與 Supabase 雲端產生 Migration History Drift。

## MCP 工具使用禁令 (Critical Guardrail)

**⚠️ 嚴禁用 MCP tool (`apply_migration` 或任何直接執行 SQL 的工具) 來執行 DDL。**
這包含但不限於：`CREATE TABLE`, `ALTER TABLE`, `DROP COLUMN`, `CREATE POLICY`。

## 標準操作流程 (SOP)

所有 Supabase schema 變更與 RLS 設定，**必須**強制輸出成文本，並要求透過本地 CLI 執行：

1. 提示並生成建立 migration 的指令：
   `npx supabase migration new <migration_name>`
2. 將生成的 SQL 語法寫入該本地檔案中。
3. 提示執行推播的指令：
   `npx supabase db push --linked`

## 例外狀況 (Exceptions)

只有在以下情況，允許使用 MCP tool 直接對資料庫下達 SQL 指令：

1. 純讀取查詢 (`SELECT`)，用於驗證資料狀態。
2. 緊急的資料內容修正 (`UPDATE` / `DELETE` 且不涉及結構更動)。
