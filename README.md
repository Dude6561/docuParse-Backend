# DocuParse Nepal — OCR Document Processing MVP

Convert bank statements, receipts, and financial documents into structured Excel data. Built for Nepal's financial ecosystem.

## Tech Stack

| Layer    | Technology                           |
| -------- | ------------------------------------ |
| Frontend | Next.js 16, TypeScript, Tailwind CSS |
| Backend  | Express.js, TypeScript               |
| OCR      | Tesseract.js (English + Nepali)      |
| Export   | SheetJS (xlsx)                       |

## Project Structure

```
MVP-OCR/
├── backend/              # Express.js API (TypeScript)
│   ├── src/
│   │   ├── index.ts              # Server entry point
│   │   ├── types.ts              # Shared type definitions
│   │   ├── routes/
│   │   │   ├── health.ts         # Health check endpoint
│   │   │   └── ocr.ts            # OCR upload & processing routes
│   │   ├── controllers/
│   │   │   └── ocrController.ts  # Upload, process, download logic
│   │   ├── middleware/
│   │   │   ├── upload.ts         # Multer file upload config
│   │   │   └── errorHandler.ts   # Global error handler
│   │   └── utils/
│   │       ├── ocrEngine.ts      # Tesseract.js OCR wrapper
│   │       ├── parser.ts         # Bank statement text parser
│   │       └── excelExporter.ts  # Excel file generator
│   ├── tsconfig.json
│   └── package.json
├── frontend/             # Next.js App (TypeScript)
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx          # Landing page (Render-inspired)
│   │   │   ├── layout.tsx        # Root layout with Navbar/Footer
│   │   │   ├── upload/page.tsx   # Document upload page
│   │   │   ├── dashboard/page.tsx # Processing history dashboard
│   │   │   └── results/page.tsx  # Results & download page
│   │   ├── components/
│   │   │   ├── Navbar.tsx
│   │   │   └── Footer.tsx
│   │   └── lib/
│   │       └── api.ts            # Axios API client & types
│   └── package.json
└── package.json          # Root scripts (concurrently)
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm

### Install Dependencies

```bash
npm install           # root (concurrently)
npm run install:all   # backend + frontend
```

### Run in Development

```bash
npm run dev
```

This starts both:

- **Backend** → http://localhost:5001
- **Frontend** → http://localhost:3000

Or run them individually:

```bash
npm run dev:backend   # Express API on :5001
npm run dev:frontend  # Next.js on :3000
```

## API Endpoints

| Method | Endpoint                | Description               |
| ------ | ----------------------- | ------------------------- |
| GET    | `/api/health`           | Health check              |
| POST   | `/api/ocr/process`      | Upload & process document |
| GET    | `/api/ocr/status/:id`   | Check processing status   |
| GET    | `/api/ocr/download/:id` | Download Excel export     |
| GET    | `/api/ocr/history`      | Get all processing jobs   |

### Upload Example

```bash
curl -X POST http://localhost:5001/api/ocr/process \
  -F "document=@statement.png" \
  -F "documentType=bank_statement"
```

## Supported Banks

NIC Asia, Nabil, Global IME, NMB, Himalayan, Kumari, Mega, Sanima, Citizens, Prime Commercial, Sunrise, Machhapuchchhre, Laxmi Sunrise, Siddhartha, Everest, Standard Chartered, Rastriya Banijya, Nepal Bank, Agriculture Development Bank — and more.

## Features

- **Drag & Drop Upload** — JPEG, PNG, PDF, TIFF, WebP support
- **OCR Engine** — Tesseract.js with English + Nepali language support
- **Smart Parsing** — Auto-detects bank name, account number, transactions
- **Excel Export** — 3-sheet workbook (Transactions, Summary, Raw Text)
- **Real-time Status** — Auto-polling for processing progress
- **Dashboard** — Full history of all processed documents
- **Responsive** — Works on desktop and mobile

## Environment Variables

### Backend (`backend/.env`)

```
PORT=5001
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
UPLOAD_DIR=./src/uploads
MAX_FILE_SIZE=10485760
```

### Frontend (`frontend/.env.local`)

```
NEXT_PUBLIC_API_URL=http://localhost:5001/api
```

## License

MIT
