# DocExtract Backend (Express + TypeScript + Supabase + AWS Textract)

Production-style backend for Nepal-focused OCR document extraction.

## Core Capabilities

- Upload PDF/image documents and create asynchronous OCR jobs
- Extract text/tables/forms/signatures with AWS Textract
- Parse Nepal bank-style transaction rows
- Persist raw OCR + structured data in PostgreSQL (Supabase)
- Export completed jobs to Excel (`.xlsx`) and CSV (`.csv`)
- Query history and track status in near real-time

## API Endpoints

- `GET /api/health`
- `POST /api/ocr/process`
- `GET /api/ocr/status/:id`
- `GET /api/ocr/history`
- `GET /api/ocr/download/:id?format=xlsx|csv`

Both `/api/*` and `/api/v1/*` are available.

## Run Locally

```bash
cp .env.example .env
npm install
npm run db:migrate
npm run dev
```

## Environment

See `.env.example`.

Required for real OCR:

- `DATABASE_URL`
- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

Optional but recommended:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`
- `SUPABASE_JWT_SECRET`

## Database Model

Migration: `src/db/migrations/001_init.sql`

- `app_users`
- `organizations`
- `organization_members`
- `documents`
- `processing_jobs`
- `extracted_transactions`
- `extracted_signatures`

Indexes are included for history, status, and transaction access patterns.

## Notes for Production Hardening

- Replace in-memory queue with durable Postgres queue (`pg-boss`) or SQS
- Add webhook callbacks for `job.completed` / `job.failed`
- Add rate limits and per-tenant quotas
- Add richer document-specific parsers (bank-wise templates)
