import { FileText } from "lucide-react";
import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-white">
      <div className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-1">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black">
                <FileText className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-semibold">DocuParse</span>
            </div>
            <p className="mt-4 text-sm text-neutral-500 leading-relaxed">
              Intuitive OCR infrastructure to digitize any bank statement or
              receipt. Built for Nepal&apos;s financial ecosystem.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-black">Product</h4>
            <ul className="space-y-2 text-sm text-neutral-500">
              <li>
                <Link
                  href="/features"
                  className="hover:text-black transition-colors"
                >
                  Features
                </Link>
              </li>
              <li>
                <Link
                  href="/pricing"
                  className="hover:text-black transition-colors"
                >
                  Pricing
                </Link>
              </li>
              <li>
                <Link
                  href="/upload"
                  className="hover:text-black transition-colors"
                >
                  Upload Document
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="hover:text-black transition-colors"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/login"
                  className="hover:text-black transition-colors"
                >
                  Sign In
                </Link>
              </li>
              <li>
                <span className="cursor-default">API Access (Coming Soon)</span>
              </li>
            </ul>
          </div>

          {/* Supported */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-black">
              Supported Documents
            </h4>
            <ul className="space-y-2 text-sm text-neutral-500">
              <li>Bank Statements</li>
              <li>Receipts & Invoices</li>
              <li>Tax Documents</li>
              <li>PAN/Citizenship Cards</li>
            </ul>
          </div>

          {/* Banks */}
          <div>
            <h4 className="mb-4 text-sm font-semibold text-black">
              Supported Banks
            </h4>
            <ul className="space-y-2 text-sm text-neutral-500">
              <li>NIC Asia Bank</li>
              <li>Nabil Bank</li>
              <li>Global IME Bank</li>
              <li>Machhapuchchhre Bank</li>
              <li>
                <Link
                  href="/features#banks"
                  className="hover:text-black transition-colors"
                >
                  + 16 more banks →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-[var(--color-border)] pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-neutral-400">
          <span>
            © {new Date().getFullYear()} DocuParse Nepal. All rights reserved.
          </span>
          <div className="flex gap-6">
            <Link
              href="/features"
              className="hover:text-neutral-600 transition-colors"
            >
              Features
            </Link>
            <Link
              href="/pricing"
              className="hover:text-neutral-600 transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/login"
              className="hover:text-neutral-600 transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
