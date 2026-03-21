# MVP-OCR Codebase Study Guide

Last updated: 2026-03-21
Scope: Full backend + frontend walkthrough for current MVP implementation.

## 1) What This Project Does

This project is an OCR-based document processing platform focused on financial documents.

Core user flow:

1. Upload one or more documents.
2. Backend creates async processing jobs.
3. OCR extraction runs using AWS Textract.
4. Parser converts OCR output into normalized transaction rows.
5. Validation and review signals are produced (confidence, duplicates, balance checks).
6. User reviews and edits rows in side-by-side UI.
7. User exports results to Excel/CSV.

## 2) High-Level Architecture

### Backend stack

- Node.js + Express + TypeScript
- PostgreSQL via Prisma
- Multer for multipart uploads
- AWS Textract for OCR
- ExcelJS for XLSX export
- In-memory async queue for job processing

### Frontend stack

- Next.js App Router + TypeScript
- NextAuth for auth session
- Axios for API client
- Review/edit UX in results page

### Storage model

- Files are always persisted locally under backend `.uploads`
- Optional Supabase Storage upload is attempted
- Database stores document metadata and processing artifacts

## 3) Backend Folder Walkthrough

### App bootstrap and middleware

- [backend/src/server.ts](backend/src/server.ts)
  - Process startup and DB connectivity check.
  - Fails fast if `DATABASE_URL` is placeholder/unreachable.
  - Starts HTTP server and handles SIGINT/SIGTERM clean shutdown.

- [backend/src/app.ts](backend/src/app.ts)
  - Express app wiring.
  - Security and transport middleware:
    - `helmet`
    - `cors` with `FRONTEND_URL`
    - `compression`
    - JSON/urlencoded body parsing
    - pino request logger
  - Registers routes under `/api` and `/api/v1`.
  - Applies global error handler.

### Configuration and utilities

- [backend/src/config/env.ts](backend/src/config/env.ts)
  - Strongly validates environment variables using Zod.
  - Defines upload limits, MIME allow list, OCR region, etc.

- [backend/src/config/logger.ts](backend/src/config/logger.ts)
  - Pino logger setup used across services and middleware.

### Routing layer

- [backend/src/routes/index.ts](backend/src/routes/index.ts)
  - Mounts health and OCR routers.
  - Important note: OCR router is currently mounted on `/ocrr` (double `r`).
    - If frontend uses `/ocr`, requests will fail unless this is corrected.

- [backend/src/routes/health.route.ts](backend/src/routes/health.route.ts)
  - Simple health endpoint with timestamp.

- [backend/src/routes/ocr.route.ts](backend/src/routes/ocr.route.ts)
  - Main API surface:
    - `POST /process` single file upload
    - `POST /process-batch` multi-file upload (up to 25 files)
    - `GET /status/:id` job details
    - `GET /history` job list
    - `GET /download/:id` CSV/XLSX export
    - `PUT /review/:id` save row edits
    - `GET /document/:id` inline original file preview

### Middleware

- [backend/src/middleware/upload.ts](backend/src/middleware/upload.ts)
  - Multer in-memory uploads.
  - File size and MIME validation.

- [backend/src/middleware/auth.ts](backend/src/middleware/auth.ts)
  - Optional auth mode.
  - Supports bearer token verification (Supabase JWT secret).
  - Fallback dev header `x-user-id` support.

- [backend/src/middleware/error-handler.ts](backend/src/middleware/error-handler.ts)
  - Handles Zod validation errors.
  - Handles custom `AppError`.
  - Returns structured 500 response for unknown errors.

### Services

- [backend/src/services/document.service.ts](backend/src/services/document.service.ts)
  - Core orchestration service.
  - Responsibilities:
    1. Create document and processing job records.
    2. Run OCR + parsing pipeline.
    3. Store extracted transactions/signatures.
    4. Build job response payload for frontend.
    5. Compute duplicate flags and review counts.
    6. Maintain audit log entries from metrics edits.
    7. Accept review edits and recompute summary.
    8. Return history list with dashboard metrics.

- [backend/src/services/parser.service.ts](backend/src/services/parser.service.ts)
  - Converts OCR blocks into transaction rows.
  - Current parser strategy:
    - LINE-block scanning
    - date regex matching
    - amount extraction
    - inferred debit/credit/balance structure
  - Bank profile support:
    - generic
    - nabil
    - nic_asia
    - global_ime
  - Summary enrichment:
    - totals
    - parser profile
    - confidence-based scan quality
    - opening/closing validation
    - duplicate/low-confidence counts
    - continuity and invalid date metrics

- [backend/src/services/textract.service.ts](backend/src/services/textract.service.ts)
  - Calls AWS Textract `AnalyzeDocument` with TABLES/FORMS/SIGNATURES/LAYOUT.
  - Builds raw text and aggregate confidence score.

- [backend/src/services/export.service.ts](backend/src/services/export.service.ts)
  - CSV export for transactions.
  - XLSX export with sheets:
    - `Transactions`
    - `Summary`
    - `Raw OCR Text`

- [backend/src/services/storage.service.ts](backend/src/services/storage.service.ts)
  - Writes uploads locally for guaranteed preview support.
  - Optionally uploads to Supabase Storage.
  - Returns `local://...` storage path format.

### Queue

- [backend/src/jobs/in-memory-queue.ts](backend/src/jobs/in-memory-queue.ts)
  - In-memory work queue for async processing.
  - Features:
    - bounded concurrency (3 workers)
    - retry with backoff (max 2 retries)

## 4) Database Model Study Notes

Source of truth:

- [backend/prisma/schema.prisma](backend/prisma/schema.prisma)

Main tables:

1. `documents`
   - uploaded metadata: type, file name, mime, size, storage path.
2. `processing_jobs`
   - async state machine: pending/processing/completed/failed.
   - stores `rawText`, `summary`, `metrics`, `textractPayload`.
3. `extracted_transactions`
   - row-level normalized transaction data.
4. `extracted_signatures`
   - detected signature metadata.
5. `app_users`, `organizations`, `organization_members`
   - present for future multi-tenant expansion.

Key point:

- Job detail payload combines relational transactions with JSON summary/metrics.

## 5) End-to-End Backend Flow

### A) Upload to async processing

1. Client uploads multipart file.
2. Route validates request and document type.
3. Service writes document metadata + creates processing job.
4. Queue schedules background processing.
5. API returns `202` with `jobId`.

### B) Processing pipeline

1. Job status moves to `processing`.
2. Textract extracts OCR blocks and confidence.
3. Parser derives transaction rows and summary metrics.
4. Existing extracted rows/signatures are cleared and replaced.
5. Job is marked `completed` with summary + payload.
6. On error:
   - status becomes `failed`
   - `failureReason` tag is saved in `metrics`

### C) Review/edit pipeline

1. Frontend sends edited rows by `rowIndex`.
2. Service validates row membership in target job.
3. Rows are updated transactionally.
4. Summary is recomputed.
5. Edit event appended into audit metrics log.

## 6) Frontend Folder Walkthrough

### App shell and auth

- [frontend/src/app/layout.tsx](frontend/src/app/layout.tsx)
  - Global layout with Navbar/Footer/Providers.

- [frontend/src/components/Providers.tsx](frontend/src/components/Providers.tsx)
  - Wraps app with `SessionProvider`.

- [frontend/src/auth.ts](frontend/src/auth.ts)
  - NextAuth configuration (GitHub provider).
  - Authorization callback for protected paths.

- [frontend/src/middleware.ts](frontend/src/middleware.ts)
  - Protects `/dashboard`, `/upload`, `/results`.

### Navigation and static pages

- [frontend/src/components/Navbar.tsx](frontend/src/components/Navbar.tsx)
- [frontend/src/components/Footer.tsx](frontend/src/components/Footer.tsx)
- [frontend/src/app/page.tsx](frontend/src/app/page.tsx)
  - Marketing/landing page.

### API client

- [frontend/src/lib/api.ts](frontend/src/lib/api.ts)
  - Axios base client.
  - Methods:
    - `uploadDocument`
    - `uploadDocumentsBatch`
    - `getJobStatus`
    - `getHistory`
    - `updateReviewedRows`
    - URL helpers for download/preview

### Functional pages

- [frontend/src/app/upload/page.tsx](frontend/src/app/upload/page.tsx)
  - Supports single and batch file selection.
  - Client-side MIME/size checks.
  - Sends to backend process routes.

- [frontend/src/app/results/page.tsx](frontend/src/app/results/page.tsx)
  - Polls job status while processing.
  - Shows extracted summary metrics.
  - Side-by-side review:
    - left: original document iframe
    - right: editable transaction table
  - Save corrections via `PUT /review/:id`.
  - Download CSV/XLSX.
  - Displays audit log.

- [frontend/src/app/dashboard/page.tsx](frontend/src/app/dashboard/page.tsx)
  - History list and filters.
  - KPI cards including confidence and review signals.
  - Shows failure reason tag on failed jobs.

## 7) API Contract Summary (Current)

Because of the current route mount, effective paths are:

- `/api/ocrr/...`
- `/api/v1/ocrr/...`

If you mount as `/ocr`, they become `/api/ocr/...`.

Key request examples:

1. Single upload
   - field: `document`
   - body: `documentType`

2. Batch upload
   - field: `documents[]`
   - body: `documentType`

3. Review update
   - body:
     - `rows[]`
     - each row has `rowIndex` and optional updated fields

4. Download
   - query param `format=csv|xlsx`

## 8) How Key Quality Signals Are Computed

1. Low confidence
   - Row flagged if OCR confidence < 80.

2. Duplicate count
   - Same key signature across rows:
     - date + normalized description + debit + credit + balance

3. Balance check
   - Recomputes expected closing balance using totals.
   - Passes when difference is below tolerance.

4. Continuity issues
   - Compares row-to-row balance progression.

5. Failure reason tagging
   - Derived from error message classes (OCR/provider/timeout/parse/etc).

## 9) Known Important Notes

1. Route mount mismatch risk
   - OCR router currently mounted at `/ocrr` in [backend/src/routes/index.ts](backend/src/routes/index.ts).
   - Frontend API client is usually configured for `/ocr`.
   - Verify and keep these aligned.

2. Queue durability
   - Current queue is in-memory.
   - Process restart loses queued tasks.
   - Good for MVP, not production scale.

3. Local preview dependency
   - Document preview endpoint currently supports local-storage path strategy.

4. Date parsing limitations
   - Regex-based extraction can miss unusual statement formats.

## 10) Suggested Study Order (Fastest)

1. Backend request lifecycle:
   - [backend/src/routes/ocr.route.ts](backend/src/routes/ocr.route.ts)
   - [backend/src/services/document.service.ts](backend/src/services/document.service.ts)
   - [backend/src/services/parser.service.ts](backend/src/services/parser.service.ts)

2. Frontend user lifecycle:
   - [frontend/src/app/upload/page.tsx](frontend/src/app/upload/page.tsx)
   - [frontend/src/lib/api.ts](frontend/src/lib/api.ts)
   - [frontend/src/app/results/page.tsx](frontend/src/app/results/page.tsx)
   - [frontend/src/app/dashboard/page.tsx](frontend/src/app/dashboard/page.tsx)

3. Data model and exports:
   - [backend/prisma/schema.prisma](backend/prisma/schema.prisma)
   - [backend/src/services/export.service.ts](backend/src/services/export.service.ts)

4. Runtime boot/auth/errors:
   - [backend/src/server.ts](backend/src/server.ts)
   - [backend/src/app.ts](backend/src/app.ts)
   - [backend/src/middleware/auth.ts](backend/src/middleware/auth.ts)
   - [backend/src/middleware/error-handler.ts](backend/src/middleware/error-handler.ts)

## 11) Debug Checklist While Studying

1. Upload fails immediately
   - Check MIME/size in upload middleware.
   - Check route prefix (`/ocrr` vs `/ocr`).

2. Job stays pending
   - Check queue worker and server logs.

3. Job fails
   - Inspect `errorMessage` and `metrics.failureReason`.

4. Preview missing
   - Check document `storagePath` and local file existence.

5. Review save fails
   - Validate `rowIndex` values from frontend payload.

## 12) Where To Extend Next

1. Password-protected PDF flow
2. Scan preprocessing (deskew/denoise/rotation)
3. Tenant isolation enforcement
4. Durable queue (Redis/SQS)
5. Parser profile versioning and bank-specific templates
6. Reconciliation against ledger imports

---

If you want, the next doc I can add is a line-by-line API reference with sample request/response JSON for each endpoint in this codebase.
