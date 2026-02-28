import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Providers } from "@/components/Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DocuParse Nepal - OCR Document Processing for Nepal",
    template: "%s | DocuParse Nepal",
  },
  description:
    "Convert bank statements, receipts, and financial documents into structured Excel data. Supports 20+ Nepali banks with 97%+ accuracy. Built for Nepal's financial ecosystem.",
  keywords: [
    "OCR Nepal",
    "bank statement OCR",
    "document processing Nepal",
    "receipt to Excel",
    "Nepali bank statement parser",
    "DocuParse",
    "data entry automation Nepal",
    "financial document digitization",
    "NIC Asia statement",
    "Nabil bank statement",
    "Khalti payment",
  ],
  authors: [{ name: "DocuParse Nepal" }],
  openGraph: {
    title: "DocuParse Nepal - OCR Document Processing",
    description:
      "Convert bank statements to Excel in seconds. 97%+ accuracy. 20+ Nepali banks supported.",
    url: "https://docuparse.com.np",
    siteName: "DocuParse Nepal",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "DocuParse Nepal - OCR Document Processing",
    description:
      "Convert bank statements to Excel in seconds. 97%+ accuracy. 20+ Nepali banks supported.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <Navbar />
          <main className="min-h-screen">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
