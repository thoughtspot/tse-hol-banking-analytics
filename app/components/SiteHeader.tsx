"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoMark } from "./icons";

const NAV_ITEMS = [
  { href: "/", label: "Home" },
  { href: "/analytics", label: "Analytics" },
  { href: "/ai", label: "Bankalytics AI" },
] as const;

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-30 shadow-[0_1px_0_rgba(255,255,255,0.06),0_4px_16px_rgba(6,18,53,0.25)]">
      <div className="bg-navy-950 text-[12px] text-brand-200">
        <div className="mx-auto flex h-8 max-w-7xl items-center justify-between px-4 sm:px-6">
          <span>Enterprise Analytics Portal</span>
          <span className="hidden sm:inline">Internal use only</span>
        </div>
      </div>
      <div className="bg-navy-900 text-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-8 px-4 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2.5">
            <LogoMark className="size-8" />
            <span className="text-lg font-semibold tracking-tight">
              Bankalytics
            </span>
          </Link>
          <nav
            aria-label="Primary"
            className="-mb-px flex h-full min-w-0 items-stretch gap-1 overflow-x-auto"
          >
            {NAV_ITEMS.map(({ href, label }) => {
              const active = isActive(pathname, href);
              return (
                <Link
                  key={href}
                  href={href}
                  aria-current={active ? "page" : undefined}
                  className={`flex items-center whitespace-nowrap border-b-[3px] px-3 text-sm font-medium transition-colors ${
                    active
                      ? "border-brand-500 text-white"
                      : "border-transparent text-brand-200 hover:text-white"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
