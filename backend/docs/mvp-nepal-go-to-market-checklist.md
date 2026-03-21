# MVP Nepal Go-To-Market Checklist (Solo Founder)

Date: 2026-03-21
Focus: English documents only (no Nepali language support in MVP)

## 1) MVP You Should Build First (Not Everything)

Product name (working): Bank Statement to Audit-Ready Excel (Nepal)

Core promise:

- Convert Nepal bank statement PDFs/images into clean Excel/CSV
- Validate totals and balances automatically
- Produce an audit-ready output CA can use immediately

MVP in one line:

- Better than PDF-to-Excel tools because it adds trust checks and review workflow.

### Must-Have Scope (Ship This)

- [x] Upload bank statement PDF/image (single and batch)
- [x] OCR extraction into normalized transaction table
- [x] Standard columns: date, description, cheque_ref, debit, credit, balance
- [x] Opening/closing balance validation
- [x] Duplicate transaction detection
- [x] Low-confidence flagging per row/field
- [x] Side-by-side review screen (PDF + parsed rows)
- [x] One-click export to Excel and CSV
- [x] Basic audit log: uploaded_by, processed_at, edited_by
- [x] Multi-bank template support for top Nepal banks (start with 3)

### Out of Scope for MVP (Do Later)

- [ ] Full accounting software direct integrations
- [ ] Complex AI categorization engine
- [ ] Multi-language extraction
- [ ] Advanced role hierarchy and SSO
- [ ] Full reconciliation against ERP/ledger APIs
- [ ] Mobile app

## 2) Features Needed for Nepal Market (Prioritized)

### P0 (Critical to Win First Clients)

- [ ] Nepal bank statement format handling (layout variations)
- [ ] Date normalization robustness (different date styles)
- [ ] Currency and amount normalization
- [ ] Debit/credit sign correctness checks
- [ ] Password-protected PDF handling flow
- [ ] Scanned PDF quality fallback (deskew, denoise, rotate)
- [ ] Fast correction UX for CAs (keyboard-first editing)
- [ ] Export template that matches CA working format

### P1 (Add Soon After First 2-3 Clients)

- [ ] Bank auto-detection by layout/signature text
- [ ] Statement period detection and missing-page checks
- [ ] Cross-page continuity checks
- [ ] Rule-based exception report (suspicious entries)
- [ ] Client workspace separation (basic multi-tenant)
- [ ] Versioned re-processing (same file, improved parser)

### P2 (Only After Revenue)

- [ ] Ledger import and auto-reconciliation
- [ ] API for accounting firms
- [ ] Bulk folder ingestion from cloud drives
- [ ] Advanced anomaly scoring

## 3) Research Plan Before Building Too Much

Goal: Build only what buyers pay for.

### ICP (Who to Target First)

- [ ] Mid-to-large CA firms in Nepal handling bank-heavy audits
- [ ] Finance teams with monthly bank reconciliation pain
- [ ] Businesses with high PDF statement volume and manual cleanup

### 30 Interviews (2-3 Weeks)

- [ ] 15 CA/audit professionals
- [ ] 10 finance managers/accountants
- [ ] 5 operations owners in larger businesses

### Interview Questions You Must Ask

- [ ] How many statements per month per client/company?
- [ ] Which banks create the most cleanup pain?
- [ ] Time spent from PDF to usable sheet?
- [ ] Error types that cause rework or tax risk?
- [ ] What output format do they finally use?
- [ ] Who approves final numbers?
- [ ] What is unacceptable error rate?
- [ ] What would make them switch from current workflow?
- [ ] Budget owner and buying process?
- [ ] Security/compliance requirements before pilot?

### Evidence to Collect

- [ ] 300-500 anonymized statement files across top banks
- [ ] Mix: digital PDFs, scanned PDFs, low quality images
- [ ] At least 12-month range for layout drift
- [ ] Ground truth labels for 50 files (manually verified)

## 4) Technical Build Plan (Solo-Dev Realistic)

### Sprint 1 (Week 1-2): Extraction Baseline

- [x] Finalize canonical transaction schema
- [x] Build parser pipeline with confidence output
- [x] Process single file end-to-end
- [x] Export valid Excel/CSV
- [x] Add opening/closing balance checks

### Sprint 2 (Week 3-4): Review + Quality

- [x] Build row-level review UI
- [x] Add edit + save corrections
- [x] Add parser metrics dashboard
- [x] Add failure reason tagging

### Sprint 3 (Week 5-6): Multi-Bank + Batch

- [x] Add top 3 Nepal bank profiles
- [x] Add batch processing queue hardening
- [x] Add duplicate and continuity checks
- [ ] Improve low-quality scan handling

### Sprint 4 (Week 7-8): Pilot Readiness

- [ ] Add tenant isolation basics
- [ ] Add audit log and download trace
- [ ] Add simple admin panel for support
- [ ] Prepare onboarding and pilot SOP

## 5) Go-To-Market Plan to Get Bigger Clients

### Positioning Statement

- [ ] Not "PDF to Excel"
- [ ] Say: "Audit-ready bank statement intelligence for Nepal CA firms"

### Pilot Offer (30 Days)

- [ ] Process up to fixed volume (example: 1,000 pages)
- [ ] Define SLA and expected accuracy target
- [ ] Weekly quality report to decision maker
- [ ] End-of-pilot ROI report (hours saved + error reduction)

### Pricing Test (Simple)

- [ ] Per page plan
- [ ] Per client/accounting firm plan
- [ ] Setup fee for custom bank template

### Sales Assets You Need

- [ ] 1-page problem-solution ROI PDF
- [ ] 5-slide demo deck
- [ ] Security and data handling FAQ
- [ ] Pilot agreement template
- [ ] Case study template (before/after metrics)

## 6) KPIs You Must Track from Day 1

- [ ] Extraction accuracy by field
- [ ] Statement-level pass rate without manual edits
- [ ] Manual correction minutes per statement
- [ ] End-to-end processing time
- [ ] Pilot conversion rate to paid
- [ ] Net revenue retention per firm

## 7) Biggest Risks and Mitigations

- [ ] Risk: OCR errors on poor scans
  - Mitigation: image preprocessing + review UI + confidence flags
- [ ] Risk: layout changes by banks
  - Mitigation: bank profile versioning + quick patch workflow
- [ ] Risk: buyer says "we already use Excel"
  - Mitigation: sell speed + trust checks + audit traceability
- [ ] Risk: solo founder bandwidth
  - Mitigation: strict scope, no custom one-off features in MVP

## 8) 14-Day Immediate Action Checklist

- [x] Day 1-2: Define schema and golden output format
- [x] Day 3-4: Build baseline extraction and export
- [x] Day 5-6: Implement balance validation checks
- [ ] Day 7: Prepare interview list of 30 prospects
- [ ] Day 8-10: Run 10 interviews and capture pains
- [x] Day 11-12: Build review/edit UI for low-confidence rows
- [ ] Day 13: Create pilot offer and one-page pitch
- [ ] Day 14: Start outreach to 20 targets (CA firms + finance teams)

## 9) Decision Rules (So You Do Not Drift)

- [ ] If a feature does not reduce manual review time, defer it
- [ ] If a feature does not improve trust/accuracy, defer it
- [ ] If a client asks for custom work before pilot success, charge setup
- [ ] If you cannot demo value in 10 minutes, simplify the product

## 10) What "Ready for Market" Means

- [ ] > =95% row extraction accuracy on your target bank set
- [ ] <=5 minutes manual review time per average statement
- [ ] At least 2 pilot clients using weekly
- [ ] One quantified case study with measurable ROI
- [ ] Repeatable onboarding process under 60 minutes
