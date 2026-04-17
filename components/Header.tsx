"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNav, isNavActive } from "@/lib/navigation";

export function Header() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-[rgba(245,233,226,0.85)] pt-[env(safe-area-inset-top,0px)] shadow-soft backdrop-blur-xl">
      <div className="mx-auto flex max-w-6xl items-center justify-center gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <div className="text-4xl tracking-[0.08em] text-[#3b2f2f] sm:text-5xl md:hidden" style={{ fontFamily: "'Playfair Display', serif" }}>
          Crumbella Bakery
        </div>

        {/* Masaüstü: tam menü + CTA */}
        <nav
          className="hidden items-center gap-1 md:flex"
          aria-label="Ana navigasyon"
        >
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                isNavActive(pathname, item.href)
                  ? "bg-luxury-accent/20 text-luxury-accent"
                  : "text-luxury-text/70 hover:bg-luxury-secondary/15 hover:text-luxury-text"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

      </div>
    </header>
  );
}
