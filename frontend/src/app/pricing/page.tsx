import type { Metadata } from "next";
import Link from "next/link";
import {
  Check,
  X,
  ArrowRight,
  Calculator,
  Clock,
  Users,
  TrendingDown,
  Zap,
  Building2,
  Shield,
} from "lucide-react";

export const metadata: Metadata = {
  title: "Pricing - DocuParse Nepal | OCR Document Processing",
  description:
    "Affordable OCR pricing for Nepal. Convert bank statements to Excel 10x cheaper than manual data entry. Plans starting from NPR 999/month. Khalti payment supported.",
  keywords:
    "OCR pricing Nepal, bank statement digitization cost, data entry Nepal, document processing pricing, Khalti payment",
};

const plans = [
  {
    name: "Starter",
    description: "For individuals & freelancers",
    price: "999",
    priceNote: "/month",
    pages: "100 pages/month",
    popular: false,
    features: [
      { text: "100 pages per month", included: true },
      { text: "Bank statements & receipts", included: true },
      { text: "Excel & CSV export", included: true },
      { text: "5 bank formats supported", included: true },
      { text: "Email support", included: true },
      { text: "API access", included: false },
      { text: "Priority processing", included: false },
      { text: "Custom templates", included: false },
    ],
  },
  {
    name: "Professional",
    description: "For accounting firms & SMBs",
    price: "2,999",
    priceNote: "/month",
    pages: "500 pages/month",
    popular: true,
    features: [
      { text: "500 pages per month", included: true },
      { text: "All document types", included: true },
      { text: "Excel, CSV & JSON export", included: true },
      { text: "20+ bank formats", included: true },
      { text: "Priority email & chat support", included: true },
      { text: "API access (1,000 calls/mo)", included: true },
      { text: "Priority processing", included: true },
      { text: "Custom templates", included: false },
    ],
  },
  {
    name: "Enterprise",
    description: "For banks & large organizations",
    price: "9,999",
    priceNote: "/month",
    pages: "Unlimited pages",
    popular: false,
    features: [
      { text: "Unlimited pages", included: true },
      { text: "All document types + custom", included: true },
      { text: "All export formats + API", included: true },
      { text: "All banks + custom parsers", included: true },
      { text: "Dedicated account manager", included: true },
      { text: "Unlimited API access", included: true },
      { text: "Fastest processing queue", included: true },
      { text: "Custom templates & training", included: true },
    ],
  },
];

const manualCostComparison = [
  {
    metric: "Cost per 100 pages",
    manual: "NPR 5,000 - 8,000",
    docuparse: "NPR 999",
    savings: "Up to 87% cheaper",
  },
  {
    metric: "Time per 100 pages",
    manual: "8 - 12 hours",
    docuparse: "< 15 minutes",
    savings: "50x faster",
  },
  {
    metric: "Error rate",
    manual: "5 - 15% errors",
    docuparse: "< 3% errors",
    savings: "5x more accurate",
  },
  {
    metric: "Monthly capacity (1 person)",
    manual: "~500 pages",
    docuparse: "Unlimited",
    savings: "No bottleneck",
  },
  {
    metric: "Available hours",
    manual: "8 hrs/day, weekdays",
    docuparse: "24/7",
    savings: "Always available",
  },
  {
    metric: "Hiring & training cost",
    manual: "NPR 15,000 - 25,000/mo",
    docuparse: "NPR 0",
    savings: "Zero overhead",
  },
];

export default function PricingPage() {
  return (
    <div className="flex flex-col bg-white">
      {/* Hero */}
      <section className="relative pt-32 pb-16">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#f5f5f5_1px,transparent_1px),linear-gradient(to_bottom,#f5f5f5_1px,transparent_1px)] bg-[size:4rem_4rem]" />
        <div className="relative mx-auto max-w-7xl px-6 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-neutral-50 px-4 py-1.5 text-sm text-neutral-600">
            <Zap className="h-3.5 w-3.5 text-emerald-500" />
            Save up to 87% vs manual data entry
          </div>
          <h1 className="text-4xl font-bold tracking-tight md:text-5xl">
            Simple, transparent pricing
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-500">
            Stop paying data entry operators NPR 15,000+/month. DocuParse
            processes documents 50x faster at a fraction of the cost.
          </p>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="pb-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-8 transition-all ${
                  plan.popular
                    ? "border-black shadow-lg scale-[1.02]"
                    : "border-[var(--color-border)] hover:border-neutral-300 hover:shadow-md"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-black px-4 py-1 text-xs font-medium text-white">
                    Most Popular
                  </div>
                )}

                <div>
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className="mt-1 text-sm text-neutral-500">
                    {plan.description}
                  </p>
                </div>

                <div className="mt-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm text-neutral-500">NPR</span>
                    <span className="text-4xl font-bold tracking-tight">
                      {plan.price}
                    </span>
                    <span className="text-sm text-neutral-500">
                      {plan.priceNote}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-neutral-400">{plan.pages}</p>
                </div>

                <Link
                  href="/login"
                  className={`mt-6 flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-all ${
                    plan.popular
                      ? "bg-black text-white hover:bg-neutral-800"
                      : "border border-[var(--color-border)] text-black hover:bg-neutral-50"
                  }`}
                >
                  Get started
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <div className="mt-8 space-y-3">
                  {plan.features.map((feature) => (
                    <div
                      key={feature.text}
                      className="flex items-start gap-3 text-sm"
                    >
                      {feature.included ? (
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      ) : (
                        <X className="mt-0.5 h-4 w-4 shrink-0 text-neutral-300" />
                      )}
                      <span
                        className={
                          feature.included
                            ? "text-neutral-700"
                            : "text-neutral-400"
                        }
                      >
                        {feature.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Payment note */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-neutral-400">
            <span className="flex items-center gap-1.5">
              <Shield className="h-4 w-4" />
              Secure payments via Khalti
            </span>
            <span>•</span>
            <span>eSewa support coming soon</span>
            <span>•</span>
            <span>Cancel anytime</span>
            <span>•</span>
            <span>First 50 pages free</span>
          </div>
        </div>
      </section>

      {/* Manual Labor Cost Comparison */}
      <section className="border-t border-[var(--color-border)] bg-neutral-950 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-neutral-800 bg-neutral-900 px-4 py-1.5 text-sm text-neutral-400">
              <Calculator className="h-3.5 w-3.5 text-emerald-400" />
              Cost Analysis
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
              How much does manual data entry really cost?
            </h2>
            <p className="mt-4 text-lg text-neutral-400">
              Most Nepali businesses hire data entry operators at NPR 15,000 -
              25,000/month. Here&apos;s how DocuParse compares.
            </p>
          </div>

          {/* Comparison Table */}
          <div className="overflow-hidden rounded-2xl border border-neutral-800">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-neutral-800 bg-neutral-900">
                  <th className="px-6 py-4 text-left font-medium text-neutral-400">
                    Metric
                  </th>
                  <th className="px-6 py-4 text-left font-medium text-red-400">
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4" />
                      Manual / Hiring
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left font-medium text-emerald-400">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      DocuParse
                    </div>
                  </th>
                  <th className="hidden px-6 py-4 text-left font-medium text-neutral-400 md:table-cell">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="h-4 w-4" />
                      Your Savings
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {manualCostComparison.map((row, i) => (
                  <tr
                    key={row.metric}
                    className={`border-b border-neutral-800 last:border-0 ${
                      i % 2 === 0 ? "bg-neutral-950" : "bg-neutral-900/50"
                    }`}
                  >
                    <td className="px-6 py-4 font-medium text-white">
                      {row.metric}
                    </td>
                    <td className="px-6 py-4 text-red-300">{row.manual}</td>
                    <td className="px-6 py-4 text-emerald-300">
                      {row.docuparse}
                    </td>
                    <td className="hidden px-6 py-4 md:table-cell">
                      <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-400">
                        {row.savings}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Bottom stats */}
          <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 text-center">
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-5 w-5 text-emerald-400" />
              </div>
              <p className="mt-3 text-3xl font-bold text-white">50x</p>
              <p className="mt-1 text-sm text-neutral-400">
                Faster than manual entry
              </p>
            </div>
            <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 text-center">
              <div className="flex items-center justify-center gap-2">
                <TrendingDown className="h-5 w-5 text-emerald-400" />
              </div>
              <p className="mt-3 text-3xl font-bold text-white">87%</p>
              <p className="mt-1 text-sm text-neutral-400">
                Cost reduction vs hiring
              </p>
            </div>
            <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-6 text-center">
              <div className="flex items-center justify-center gap-2">
                <Building2 className="h-5 w-5 text-emerald-400" />
              </div>
              <p className="mt-3 text-3xl font-bold text-white">97%+</p>
              <p className="mt-1 text-sm text-neutral-400">
                OCR accuracy on Nepal docs
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Real-world example */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-center text-3xl font-bold tracking-tight md:text-4xl">
              Real-world example
            </h2>
            <p className="mt-4 text-center text-lg text-neutral-500">
              An accounting firm in Kathmandu processing 2,000 pages/month
            </p>

            <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Manual */}
              <div className="rounded-2xl border border-red-200 bg-red-50 p-8">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-red-700">
                  <Users className="h-5 w-5" />
                  Manual Approach
                </h3>
                <div className="mt-6 space-y-4 text-sm">
                  <div className="flex justify-between border-b border-red-200 pb-2">
                    <span className="text-red-600">2 data entry operators</span>
                    <span className="font-medium text-red-700">
                      NPR 40,000/mo
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-red-200 pb-2">
                    <span className="text-red-600">Office space & PC</span>
                    <span className="font-medium text-red-700">
                      NPR 8,000/mo
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-red-200 pb-2">
                    <span className="text-red-600">
                      Error correction / QA time
                    </span>
                    <span className="font-medium text-red-700">
                      NPR 5,000/mo
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-red-200 pb-2">
                    <span className="text-red-600">Training & management</span>
                    <span className="font-medium text-red-700">
                      NPR 3,000/mo
                    </span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="font-semibold text-red-700">
                      Total monthly cost
                    </span>
                    <span className="text-xl font-bold text-red-700">
                      NPR 56,000
                    </span>
                  </div>
                </div>
              </div>

              {/* DocuParse */}
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-8">
                <h3 className="flex items-center gap-2 text-lg font-semibold text-emerald-700">
                  <Zap className="h-5 w-5" />
                  DocuParse Approach
                </h3>
                <div className="mt-6 space-y-4 text-sm">
                  <div className="flex justify-between border-b border-emerald-200 pb-2">
                    <span className="text-emerald-600">
                      Enterprise plan (unlimited)
                    </span>
                    <span className="font-medium text-emerald-700">
                      NPR 9,999/mo
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-emerald-200 pb-2">
                    <span className="text-emerald-600">
                      No extra staff needed
                    </span>
                    <span className="font-medium text-emerald-700">NPR 0</span>
                  </div>
                  <div className="flex justify-between border-b border-emerald-200 pb-2">
                    <span className="text-emerald-600">
                      Auto error detection
                    </span>
                    <span className="font-medium text-emerald-700">NPR 0</span>
                  </div>
                  <div className="flex justify-between border-b border-emerald-200 pb-2">
                    <span className="text-emerald-600">Zero training time</span>
                    <span className="font-medium text-emerald-700">NPR 0</span>
                  </div>
                  <div className="flex justify-between pt-2">
                    <span className="font-semibold text-emerald-700">
                      Total monthly cost
                    </span>
                    <span className="text-xl font-bold text-emerald-700">
                      NPR 9,999
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Savings callout */}
            <div className="mt-8 rounded-2xl bg-black p-8 text-center">
              <p className="text-sm font-medium uppercase tracking-widest text-neutral-400">
                Monthly savings
              </p>
              <p className="mt-2 text-5xl font-bold text-white">NPR 46,001</p>
              <p className="mt-2 text-neutral-400">
                That&apos;s{" "}
                <span className="font-semibold text-emerald-400">
                  NPR 5,52,012 saved per year
                </span>
              </p>
              <Link
                href="/login"
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-medium text-black transition-all hover:bg-neutral-200 hover:gap-3"
              >
                Start saving today
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Payment Methods */}
      <section className="border-t border-[var(--color-border)] bg-neutral-50 py-16">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight">
              Payment methods
            </h2>
            <p className="mt-4 text-neutral-500">
              Pay with Nepal&apos;s most trusted payment platforms
            </p>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
              {/* Khalti */}
              <div className="flex flex-col items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-8 py-6 shadow-sm">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-xl font-bold text-purple-700">
                  K
                </div>
                <span className="text-sm font-medium">Khalti</span>
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700">
                  Available
                </span>
              </div>

              {/* eSewa */}
              <div className="flex flex-col items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-8 py-6 shadow-sm opacity-60">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-xl font-bold text-green-700">
                  e
                </div>
                <span className="text-sm font-medium">eSewa</span>
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500">
                  Coming Soon
                </span>
              </div>

              {/* ConnectIPS */}
              <div className="flex flex-col items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-8 py-6 shadow-sm opacity-60">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-xl font-bold text-blue-700">
                  C
                </div>
                <span className="text-sm font-medium">ConnectIPS</span>
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500">
                  Coming Soon
                </span>
              </div>

              {/* Bank Transfer */}
              <div className="flex flex-col items-center gap-2 rounded-xl border border-[var(--color-border)] bg-white px-8 py-6 shadow-sm opacity-60">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100 text-xl font-bold text-neutral-700">
                  ₹
                </div>
                <span className="text-sm font-medium">Bank Transfer</span>
                <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[10px] font-medium text-neutral-500">
                  Coming Soon
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24">
        <div className="mx-auto max-w-3xl px-6">
          <h2 className="text-center text-3xl font-bold tracking-tight">
            Frequently asked questions
          </h2>

          <div className="mt-12 space-y-6">
            <FaqItem
              question="What counts as a 'page'?"
              answer="One page = one side of a document. A 2-page bank statement counts as 2 pages. Multi-page PDFs are counted by the number of pages in the file."
            />
            <FaqItem
              question="Is there a free trial?"
              answer="Yes! Every new account gets 50 pages free — no credit card required. Upload your first document and see the results before you pay anything."
            />
            <FaqItem
              question="Which banks are supported?"
              answer="We support 20+ Nepali banks including NIC Asia, Nabil, Global IME, NMB, Himalayan, Kumari, Sanima, Siddhartha, Everest, and more. New banks are added every week."
            />
            <FaqItem
              question="How accurate is the OCR?"
              answer="Our OCR engine achieves 97%+ accuracy on standard Nepal bank statements. For clear, high-quality scans, accuracy can reach 99%+. We continuously improve our parsing models."
            />
            <FaqItem
              question="Can I cancel anytime?"
              answer="Yes, all plans are month-to-month. Cancel anytime from your dashboard — no questions asked, no cancellation fees."
            />
            <FaqItem
              question="Do you support Nepali (Devanagari) text?"
              answer="Yes! Our OCR engine supports both English and Nepali (Devanagari) text recognition, which is essential for processing Nepal bank statements and government documents."
            />
            <FaqItem
              question="How do I pay with Khalti?"
              answer="After selecting your plan, you'll be redirected to Khalti's secure payment page. You can pay using your Khalti balance, bank transfer, or mobile banking."
            />
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-[var(--color-border)] bg-neutral-50 py-20">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight">
            Start processing documents today
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-neutral-500">
            50 pages free. No credit card required. Start converting your bank
            statements to Excel in seconds.
          </p>
          <Link
            href="/login"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-black px-6 py-3 text-sm font-medium text-white transition-all hover:bg-neutral-800 hover:gap-3"
          >
            Get started for free
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-white p-6">
      <h3 className="font-semibold">{question}</h3>
      <p className="mt-2 text-sm leading-relaxed text-neutral-500">{answer}</p>
    </div>
  );
}
