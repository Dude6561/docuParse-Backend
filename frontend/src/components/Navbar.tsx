"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FileText, Menu, X, LogIn, User } from "lucide-react";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";

const navLinks = [
  { href: "/features", label: "Features" },
  { href: "/pricing", label: "Pricing" },
  { href: "/upload", label: "Upload" },
  { href: "/dashboard", label: "Dashboard" },
];

export function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session, status } = useSession();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-border)] bg-white/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-black">
            <FileText className="h-4 w-4 text-white" />
          </div>
          <span className="text-lg font-semibold tracking-tight">
            DocuParse
          </span>
        </Link>

        {/* Desktop Nav */}
        <div className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors ${
                pathname === link.href
                  ? "font-medium text-black"
                  : "text-neutral-500 hover:text-black"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth / CTA */}
        <div className="hidden items-center gap-3 md:flex">
          {status === "loading" ? (
            <div className="h-8 w-20 animate-pulse rounded-full bg-neutral-100" />
          ) : session?.user ? (
            <>
              <Link
                href="/dashboard"
                className="flex items-center gap-2 rounded-full border border-[var(--color-border)] px-3 py-1.5 text-sm text-neutral-600 transition-colors hover:border-neutral-400 hover:text-black"
              >
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.name ?? "User"}
                    width={20}
                    height={20}
                    className="rounded-full"
                  />
                ) : (
                  <User className="h-4 w-4" />
                )}
                <span className="max-w-[100px] truncate">
                  {session.user.name ?? "Account"}
                </span>
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="rounded-full px-4 py-1.5 text-sm text-neutral-500 transition-colors hover:text-black"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm text-neutral-500 transition-colors hover:text-black"
              >
                <LogIn className="h-3.5 w-3.5" />
                Sign In
              </Link>
              <Link
                href="/upload"
                className="rounded-full bg-black px-5 py-2 text-sm font-medium text-white transition-all hover:bg-neutral-800"
              >
                Get Started
              </Link>
            </>
          )}
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </nav>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="border-t border-[var(--color-border)] bg-white px-6 py-4 md:hidden">
          <div className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={`text-sm ${
                  pathname === link.href
                    ? "font-medium text-black"
                    : "text-neutral-500"
                }`}
              >
                {link.label}
              </Link>
            ))}

            <div className="mt-2 border-t border-[var(--color-border)] pt-4">
              {session?.user ? (
                <>
                  <div className="mb-3 flex items-center gap-2">
                    {session.user.image ? (
                      <Image
                        src={session.user.image}
                        alt={session.user.name ?? "User"}
                        width={24}
                        height={24}
                        className="rounded-full"
                      />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    <span className="text-sm font-medium">
                      {session.user.name}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setMobileOpen(false);
                      signOut({ callbackUrl: "/" });
                    }}
                    className="text-sm text-neutral-500"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="mb-2 block text-sm text-neutral-500"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/upload"
                    onClick={() => setMobileOpen(false)}
                    className="block rounded-full bg-black px-5 py-2 text-center text-sm font-medium text-white"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
