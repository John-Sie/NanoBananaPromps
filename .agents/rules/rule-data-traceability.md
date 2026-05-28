---
trigger: always_on
glob: "{*.sql,*schema*.ts,*api*.ts,*service*.ts}"
description: "Global Data Traceability and Metadata Injection Rules"
---

# Architecture Rule — Data Traceability

## Objective

所有核心分析結果、業務報告與歷史紀錄（Record / Log），無論是 DB 寫入、API 回傳或文件匯出，都必須強制實作後設資料（Metadata）追溯。

## 實作鐵律 (Mandatory Meta Fields)

你（Coder）在撰寫與資料庫結構或 API Response 相關的程式碼時，必須包含以下欄位：

- `appVersion`: 當前系統版本
- `executedAt` / `createdAt`: ISO 8601 UTC 格式
- `[Domain]Id`: 核心對象識別碼
- `[Domain]Version`: 業務邏輯或演算法版本

## 執行邊界

- DB Schema 必須包含上述欄位且 `NOT NULL`。
- API Response 必須將這些資訊統一包裝在 `meta` 物件中回傳。

## Exemptions (豁免條件)

以下類型的資料表可免除 `appVersion` / `[Domain]Version` 欄位要求（但仍需保留 `createdAt`）：

| 類型 | 說明 | 需保留的欄位 |
|------|------|-------------|
| **靜態設定表 (Config)** | 系統參數、Feature Flag 等 | `createdAt`, `updatedAt` |
| **關聯表 (Junction Table)** | 多對多關聯（如 `user_roles`） | `createdAt` |
| **快取 / Session 表** | 暫存資料、短期 token | `createdAt`, `expiresAt` |
| **第三方 Sync 表** | 鏡像外部資料（如 Stripe webhook log） | `createdAt`, `syncedAt` |

> 若不確定某張表是否可豁免，**預設遵循完整規範**。豁免需在 Schema 定義中以註解標註理由。

## Related Rules

- `rule-api-design` — API Response 的 `meta` 物件格式
- `rule-db-migration` — Schema 變更流程
- `role-architect` — 資料模型設計時強制遵循
- `role-coder` — 實作時強制遵循
