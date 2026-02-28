import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Upload,
  Zap,
  Table2,
  Building2,
  Shield,
  FileSpreadsheet,
  Clock,
  Globe,
  FileText,
  Receipt,
  FileCheck,
  CreditCard,
  Languages,
  Workflow,
  BarChart3,
  Lock,
  Server,
  CheckCircle2,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Features - DocuParse Nepal | OCR Document Processing",
  description:
    "Powerful OCR features for Nepal: bank statement parsing, receipt digitization, Excel export, 20+ bank support, Nepali language OCR, and 97%+ accuracy.",
  keywords:
    "OCR features Nepal, bank statement parser, receipt OCR, Excel export, Nepali OCR, document digitization features",
};

const coreFeatures = [
  {
    icon: <Upload className="h-6 w-6" />,
    title: "Smart Document Upload",
    description:
      "Drag & drop or click to upload bank statements, receipts, invoices — JPEG, PNG, PDF, TIFF, WebP supported. Up to 10MB per file.",
    details: [
      "Drag & drop interface",
      "Multi-format support (JPEG, PNG, PDF, TIFF, WebP)",
      "Up to 10MB per file",
      "Bulk upload support",
    ],
  },
  {
    icon: <Zap className="h-6 w-6" />,
    title: "AI-Powered OCR Engine",
    description:
      "Advanced text recognition powered by machine learning. Extracts text from scanned documents, photos, and even low-quality images.",
    details: [
      "97%+ accuracy on Nepal documents",
      "English + Nepali (Devanagari) support",
      "Handles skewed & rotated images",
      "Processing in under 10 seconds",
    ],
  },
  {
    icon: <Table2 className="h-6 w-6" />,
    title: "Structured Data Extraction",
    description:
      "Automatically identifies and extracts dates, amounts, descriptions, account numbers, and balances into structured format.",
    details: [
      "Transaction date & description",
      "Debit, credit & balance columns",
      "Account number detection",
      "Bank name auto-identification",
    ],
  },
  {
    icon: <FileSpreadsheet className="h-6 w-6" />,
    title: "Excel & CSV Export",
    description:
      "One-click export to Excel with multiple sheets: Transactions, Summary, and Raw OCR Text. CSV and JSON exports also available.",
    details: [
      "3-sheet Excel workbook",
      "Transaction summary with totals",
      "Raw OCR text preserved",
      "CSV & JSON formats (Pro+)",
    ],
  },
  {
    icon: <Building2 className="h-6 w-6" />,
    title: "20+ Nepali Banks Supported",
    description:
      "Pre-built parsers optimized for Nepal's major banks. Each parser understands the specific format of that bank's statements.",
    details: [
      "NIC Asia, Nabil, Global IME",
      "NMB, Himalayan, Kumari, Sanima",
      "Siddhartha, Everest, Mega",
      "New banks added weekly",
    ],
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Secure Processing",
    description:
      "Your documents are encrypted in transit, processed in isolated environments, and deleted from our servers after export.",
    details: [
      "TLS encryption in transit",
      "Auto-deletion after processing",
      "No data stored permanently",
      "SOC 2 compliance (planned)",
    ],
  },
];

const documentTypes = [
  {
    icon: <FileText className="h-5 w-5" />,
    title: "Bank Statements",
    description:
      "Extract transactions, balances, dates from all major Nepal bank statement formats.",
    status: "Available",
  },
  {
    icon: <Receipt className="h-5 w-5" />,
    title: "Receipts & Invoices",
    description:
      "Parse line items, totals, tax amounts, vendor names from receipts and invoices.",
    status: "Available",
  },
  {
    icon: <CreditCard className="h-5 w-5" />,
    title: "Credit Card Statements",
    description:
      "Extract transactions, payment due dates, minimum payments from credit card bills.",
    status: "Available",
  },
  {
    icon: <FileCheck className="h-5 w-5" />,
    title: "Tax Documents",
    description:
      "Process PAN certificates, tax clearance forms, and IRD documents.",
    status: "Coming Soon",
  },
  {
    icon: <Globe className="h-5 w-5" />,
    title: "Utility Bills",
    description:
      "Parse NEA electricity bills, NTC/Ncell bills, and water bills.",
    status: "Coming Soon",
  },
  {
    icon: <FileText className="h-5 w-5" />,
    title: "Custom Documents",
    description:
      "Enterprise customers can request custom parsers for any document format.",
    status: "Enterprise",
  },
];

const techSpecs = [
  {
    icon: <Clock className="h-5 w-5" />,
    label: "Processing Speed",
    value: "< 10 seconds per page",
  },
  {
    icon: <Languages className="h-5 w-5" />,
    label: "Languages",
    value: "English + Nepali (Devanagari)",
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    label: "Accuracy",
    value: "97%+ on standard documents",
  },
  { icon: <Server className="h-5 w-5" />, label: "Uptime", value: "99.9% SLA" },
  {
    icon: <Lock className="h-5 w-5" />,
    label: "Security",
    value: "TLS 1.3, auto-delete",
  },
  {
    icon: <Workflow className="h-5 w-5" />,
    label: "API",
    value: "RESTful API with webhooks",
  },
];

export default function FeaturesPage() {
  return (
    <div className="flex flex-col bg-white">
      {/* Hero */}
      <section className="relative pt-32 pb-16">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#f5f5f5_1px,transparent_1px),linear-gradient(to_bottom,#f5f5f5_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-neutral-50 px-4 py-1.5 text-sm text-neutral-600">
            <Zap className="h-3.5 w-3.5 text-emerald-500" />
            Built for Nepal&apos;s document ecosystem
          </div>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Powerful features for
            <br />
            <span className="text-neutral-400">every document type</span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-500">
            From bank statements to receipts — DocuParse gives you everything
            you need to digitize, extract, and export financial data.
          </p>
        </div>
      </section>

      {/* Core Features */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {coreFeatures.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-2xl border border-[var(--color-border)] bg-white p-8 transition-all hover:border-neutral-300 hover:shadow-lg"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-neutral-100 text-neutral-600 transition-colors group-hover:bg-black group-hover:text-white">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-neutral-500">
                  {feature.description}
                </p>
                <ul className="mt-5 space-y-2">
                  {feature.details.map((detail) => (
                    <li
                      key={detail}
                      className="flex items-center gap-2 text-sm text-neutral-600"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works - Visual Pipeline */}
      <section className="border-t border-[var(--color-border)] bg-neutral-950 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              The processing pipeline
            </h2>
            <p className="mt-4 text-lg text-neutral-400">
              What happens when you upload a document
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
            <PipelineStep
              step="01"
              title="Upload"
              description="Document is uploaded securely via TLS. Accepted formats: JPEG, PNG, PDF, TIFF, WebP."
              color="text-blue-400"
            />
            <PipelineStep
              step="02"
              title="Pre-process"
              description="Image is enhanced: contrast adjustment, de-skewing, noise removal for optimal OCR."
              color="text-purple-400"
            />
            <PipelineStep
              step="03"
              title="OCR Extract"
              description="AI engine reads text in English and Nepali. Identifies tables, amounts, dates."
              color="text-amber-400"
            />
            <PipelineStep
              step="04"
              title="Structure & Export"
              description="Data is parsed into transactions, summarized, and exported to Excel/CSV."
              color="text-emerald-400"
            />
          </div>
        </div>
      </section>

      {/* Supported Document Types */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Supported document types
            </h2>
            <p className="mt-4 text-lg text-neutral-500">
              Process a wide range of Nepali financial documents
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {documentTypes.map((doc) => (
              <div
                key={doc.title}
                className="rounded-xl border border-[var(--color-border)] bg-white p-6 transition-all hover:shadow-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
                    {doc.icon}
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-medium ${
                      doc.status === "Available"
                        ? "bg-emerald-100 text-emerald-700"
                        : doc.status === "Enterprise"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-neutral-100 text-neutral-500"
                    }`}
                  >
                    {doc.status}
                  </span>
                </div>
                <h3 className="mt-4 font-semibold">{doc.title}</h3>
                <p className="mt-1 text-sm leading-relaxed text-neutral-500">
                  {doc.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Specs */}
      <section className="border-t border-[var(--color-border)] bg-neutral-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Technical specifications
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {techSpecs.map((spec) => (
              <div
                key={spec.label}
                className="flex items-start gap-4 rounded-xl border border-[var(--color-border)] bg-white p-6"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-neutral-100 text-neutral-600">
                  {spec.icon}
                </div>
                <div>
                  <p className="text-sm font-medium text-neutral-400">
                    {spec.label}
                  </p>
                  <p className="mt-0.5 text-base font-semibold">{spec.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Banks Grid */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight md:text-4xl">
              Supported Nepali banks
            </h2>
            <p className="mt-4 text-neutral-500">
              Optimized parsers for each bank&apos;s unique statement format
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {[
              "NIC Asia Bank",
              "Nabil Bank",
              "Global IME Bank",
              "NMB Bank",
              "Himalayan Bank",
              "Kumari Bank",
              "Mega Bank",
              "Sanima Bank",
              "Citizens Bank",
              "Prime Commercial",
              "Sunrise Bank",
              "Machhapuchchhre Bank",
              "Laxmi Sunrise Bank",
              "Siddhartha Bank",
              "Everest Bank",
              "Standard Chartered",
              "Rastriya Banijya Bank",
              "Nepal Bank Limited",
              "Agriculture Dev Bank",
              "Century Commercial",
            ].map((bank) => (
              <div
                key={bank}
                className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-white px-4 py-3 text-sm"
              >
                <Building2 className="h-4 w-4 shrink-0 text-neutral-400" />
                <span className="truncate font-medium text-neutral-700">
                  {bank}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--color-border)] bg-neutral-50 py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to try it out?
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-neutral-500">
            Upload your first document for free. See the results in seconds.
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-all hover:bg-neutral-800 hover:gap-3"
            >
              Get started free
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/pricing"
              className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-6 py-3 text-sm font-medium text-black transition-colors hover:bg-neutral-50"
            >
              View pricing
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

function PipelineStep({
  step,
  title,
  description,
  color,
}: {
  step: string;
  title: string;
  description: string;
  color: string;
}) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6">
      <span className={`text-3xl font-bold ${color}`}>{step}</span>
      <h3 className="mt-3 text-lg font-semibold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-neutral-400">
        {description}
      </p>
    </div>
  );
}
