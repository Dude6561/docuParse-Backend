import Link from "next/link";
import {
  Upload,
  Table2,
  Shield,
  Zap,
  Building2,
  ArrowRight,
  CheckCircle2,
  Receipt,
  FileSpreadsheet,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero Section - Render.com inspired */}
      <section className="relative overflow-hidden bg-white pt-32 pb-20">
        {/* Subtle grid bg */}
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#f5f5f5_1px,transparent_1px),linear-gradient(to_bottom,#f5f5f5_1px,transparent_1px)] bg-[size:4rem_4rem]" />

        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-2">
            {/* Left - Text */}
            <div className="flex flex-col justify-center">
              <div className="animate-fade-in">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-neutral-50 px-4 py-1.5 text-sm text-neutral-600">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Built for Nepal&apos;s financial ecosystem
                </div>

                <h1 className="text-5xl font-bold leading-[1.1] tracking-tight text-black lg:text-6xl">
                  Your fastest path to
                  <br />
                  <span className="text-neutral-400">digitized documents</span>
                </h1>

                <p className="mt-6 max-w-lg text-lg leading-relaxed text-neutral-500">
                  Intuitive OCR infrastructure to convert any bank statement,
                  receipt, or financial document into structured Excel data —
                  from your first document to your millionth.
                </p>

                <div className="mt-8 flex items-center gap-4">
                  <Link
                    href="/upload"
                    className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-all hover:bg-neutral-800 hover:gap-3"
                  >
                    Start for free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-neutral-50"
                  >
                    View Dashboard
                  </Link>
                </div>
              </div>
            </div>

            {/* Right - Terminal / Dashboard Preview */}
            <div className="animate-slide-up relative">
              {/* Terminal Window */}
              <div className="rounded-xl border border-neutral-200 bg-neutral-950 p-4 shadow-2xl">
                <div className="mb-3 flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-400" />
                  <div className="h-3 w-3 rounded-full bg-yellow-400" />
                  <div className="h-3 w-3 rounded-full bg-green-400" />
                  <span className="ml-2 text-xs text-neutral-500">
                    terminal
                  </span>
                </div>
                <div className="font-mono text-sm leading-relaxed">
                  <p className="text-neutral-400">
                    <span className="text-emerald-400">$</span> docuparse upload
                    statement.pdf
                  </p>
                  <p className="mt-1 text-neutral-500">
                    ✓ Document uploaded successfully
                  </p>
                  <p className="text-neutral-500">✓ OCR processing... 100%</p>
                  <p className="text-neutral-500">
                    ✓ Extracted 47 transactions
                  </p>
                  <p className="mt-1 text-emerald-400">
                    ✓ Excel export ready: statement_export.xlsx
                  </p>
                </div>
              </div>

              {/* Dashboard Preview Cards */}
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-neutral-400" />
                      <span className="text-sm font-medium">NIC Asia</span>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-emerald-600">
                      <CheckCircle2 className="h-3 w-3" /> Processed
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-neutral-400">
                        Transactions
                      </p>
                      <p className="text-lg font-semibold">47</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-neutral-400">
                        Total (NPR)
                      </p>
                      <p className="text-lg font-semibold">2.4L</p>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Receipt className="h-4 w-4 text-neutral-400" />
                      <span className="text-sm font-medium">Receipt</span>
                    </div>
                    <span className="flex items-center gap-1 text-xs text-emerald-600">
                      <CheckCircle2 className="h-3 w-3" /> Processed
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-neutral-400">
                        Line Items
                      </p>
                      <p className="text-lg font-semibold">12</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-neutral-400">
                        Amount
                      </p>
                      <p className="text-lg font-semibold">₨ 3.2K</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logos / Social Proof */}
      <section className="border-y border-[var(--color-border)] bg-neutral-50 py-10">
        <div className="mx-auto max-w-7xl px-6">
          <p className="mb-6 text-center text-xs font-medium uppercase tracking-widest text-neutral-400">
            Supports 20+ Nepali Banks
          </p>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm font-medium text-neutral-400">
            <span>NIC Asia</span>
            <span>Nabil Bank</span>
            <span>Global IME</span>
            <span>NMB Bank</span>
            <span>Himalayan Bank</span>
            <span>Kumari Bank</span>
            <span>Machhapuchchhre</span>
            <span>Sanima Bank</span>
            <span>Siddhartha Bank</span>
            <span>Everest Bank</span>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Everything you need to digitize documents
            </h2>
            <p className="mt-4 text-lg text-neutral-500">
              Powerful OCR engine built specifically for Nepali financial
              documents with Excel export capability.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<Upload className="h-5 w-5" />}
              title="Simple Upload"
              description="Drag and drop bank statements, receipts, or any financial document. Supports JPEG, PNG, PDF, and more."
            />
            <FeatureCard
              icon={<Zap className="h-5 w-5" />}
              title="Fast OCR Engine"
              description="Powered by Tesseract.js with support for English and Nepali text recognition."
            />
            <FeatureCard
              icon={<Table2 className="h-5 w-5" />}
              title="Excel Export"
              description="Automatically parse transactions and export structured data to Excel with summary sheets."
            />
            <FeatureCard
              icon={<Building2 className="h-5 w-5" />}
              title="20+ Banks Supported"
              description="Pre-built parsers for NIC Asia, Nabil, Global IME, NMB, Himalayan Bank, and more."
            />
            <FeatureCard
              icon={<Shield className="h-5 w-5" />}
              title="Secure Processing"
              description="Documents are processed locally and deleted after export. Your data never leaves the server."
            />
            <FeatureCard
              icon={<FileSpreadsheet className="h-5 w-5" />}
              title="Multiple Document Types"
              description="Bank statements, receipts, invoices, tax documents — parse them all into structured data."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="border-t border-[var(--color-border)] bg-neutral-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              How it works
            </h2>
            <p className="mt-4 text-lg text-neutral-500">
              Three simple steps to go from paper to structured data
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <StepCard
              step="01"
              title="Upload Document"
              description="Upload a scanned bank statement, receipt, or photo of any financial document."
            />
            <StepCard
              step="02"
              title="OCR Processing"
              description="Our engine extracts text, identifies transactions, amounts, dates and structures the data."
            />
            <StepCard
              step="03"
              title="Download Excel"
              description="Get a clean Excel file with transactions, summary, and raw text — ready for accounting."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
            Ready to digitize your documents?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-lg text-neutral-500">
            Start converting your bank statements and receipts into Excel
            spreadsheets in seconds.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-all hover:bg-neutral-800 hover:gap-3"
            >
              Start for free
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group rounded-xl border border-[var(--color-border)] bg-white p-6 transition-all hover:border-neutral-300 hover:shadow-md">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600 transition-colors group-hover:bg-black group-hover:text-white">
        {icon}
      </div>
      <h3 className="mb-2 text-base font-semibold">{title}</h3>
      <p className="text-sm leading-relaxed text-neutral-500">{description}</p>
    </div>
  );
}

function StepCard({
  step,
  title,
  description,
}: {
  step: string;
  title: string;
  description: string;
}) {
  return (
    <div className="relative rounded-xl border border-[var(--color-border)] bg-white p-8">
      <span className="text-4xl font-bold text-neutral-100">{step}</span>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-neutral-500">
        {description}
      </p>
    </div>
  );
}
