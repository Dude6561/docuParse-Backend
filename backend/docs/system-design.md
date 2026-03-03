# DocExtract System Design (Nepal MVP, 6 Months)

## Objectives

- 97%+ extraction quality on Nepal English-first bank documents
- <10 seconds median processing for single-page docs
- End-to-end flow: upload -> process -> review -> export (Excel/CSV)
- Production-grade observability and data model from day one
- Excludes payment integration in this phase

## Recommended Architecture

1. `frontend` (Next.js): upload UX, dashboard, result review, exports
2. `backend` (Express + TS): API, job orchestration, parsers, exporters
3. `PostgreSQL` (Supabase): metadata + extracted structured records
4. `AWS Textract`: OCR for tables/forms/signatures
5. `Supabase Storage` (optional): durable input document storage

## Processing Pipeline

1. Client uploads file with `documentType`
2. API validates mime/size and creates `documents` + `processing_jobs`
3. Queue worker moves job status `pending -> processing`
4. Textract returns OCR blocks
5. Parser transforms blocks into normalized transaction rows + summary
6. Store `raw_text`, `summary`, `metrics`, `transactions`, `signatures`
7. Mark job `completed` and allow Excel/CSV downloads

## Database Rationale

- Keep `processing_jobs.summary` as JSONB for versioned schema flexibility
- Keep `extracted_transactions` as relational rows for analytics/filtering
- Store raw payload (`textract_payload`) for re-parser iterations
- Include organization multi-tenant primitives from MVP phase

## Security Model

- TLS in transit
- Signed JWT verification (Supabase JWT secret)
- Optional `x-user-id` for local/dev compatibility
- Future: strict tenant filtering + RLS + key rotation policy

## KPI Instrumentation (Month 1-2)

- `processing_latency_ms` (upload to completion)
- `ocr_confidence_score` (average by doc type)
- `parse_success_rate`
- `manual_correction_rate` (future UI)
- `export_download_rate`

## Month-by-Month (No Payments)

### Month 1

- Ship upload, async jobs, Textract integration, dashboard, exports
- Validate with 10-20 Nepal real-world files

### Month 2

- Expand parser coverage and confidence QA on 100+ documents
- Add QA tagging and edge-case capture workflow

### Month 3-4

- Add bank-specific parser profiles
- Add receipt/invoice line-item extraction templates
- Add webhooks and API keys

### Month 5-6

- Add quality feedback loop and active-learning parser revisions
- Add enterprise controls (audit trails, policy-driven retention)

## Scaling Plan

- Replace in-process queue with durable queue
- Parallelize Textract jobs and parser workers
- Add read replicas and partitioning for large transaction volumes
