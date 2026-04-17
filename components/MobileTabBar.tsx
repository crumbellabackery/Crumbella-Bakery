"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { mainNav, isNavActive } from "@/lib/navigation";
import { useCart } from "@/lib/cart-context";

type NavHref = (typeof mainNav)[number]["href"];

const iconMap: Record<NavHref, string> = {
  "/": "/images/house.svg",
  "/menu": "/images/fork-knife.svg",
  "/packages": "/images/package.svg",
  "/about": "/images/info.svg",
  "/cart": "/images/shopping-cart.svg",
};

const iconAltMap: Record<NavHref, string> = {
  "/": "Ana sayfa",
  "/menu": "Menü",
  "/packages": "Paketler",
  "/about": "Hakkımızda",
  "/cart": "Sepet",
};

function Icon({ name, active }: { name: NavHref; active: boolean }) {
  const opacity = active ? "opacity-100" : "opacity-60";
  return (
    <img
      src={iconMap[name]}
      alt={iconAltMap[name]}
      className={`h-6 w-6 ${opacity}`}
    />
  );
}

/**
 * Mobil “native app” alt sekme çubuğu — md ve üzeri ekranlarda gizlenir.
 */
export function MobileTabBar() {
  const pathname = usePathname();
  const { cart } = useCart();

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 select-none md:hidden"
      aria-label="Mobil sekme menüsü"
      style={{
        background: "linear-gradient(to top, rgb(234, 215, 197), rgba(234, 215, 197, 0.95))",
        paddingLeft: "0.5rem",
        paddingRight: "0.5rem",
        paddingTop: "0.75rem",
        paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))",
        boxShadow: "0 -1px 3px rgba(0, 0, 0, 0.1)",
      }}
    >
      <ul
        style={{
          marginLeft: "auto",
          marginRight: "auto",
          maxWidth: "32rem",
          display: "flex",
          alignItems: "stretch",
          justifyContent: "space-between",
          gap: "0",
        }}
      >
        {mainNav.map((item) => {
          const active = isNavActive(pathname, item.href);
          const isCart = item.href === "/cart";
          const cartCount = cart.items.length;

          return (
            <li key={item.href} style={{ minWidth: 0, flex: 1 }}>
              <Link
                href={item.href}
                style={{
                  display: "flex",
                  minHeight: "3rem",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.125rem",
                  paddingLeft: "0.5rem",
                  paddingRight: "0.5rem",
                  paddingTop: "0.25rem",
                  paddingBottom: "0.25rem",
                  fontSize: "10px",
                  fontWeight: 600,
                  color: active ? "rgb(200, 155, 123)" : "rgba(43, 43, 43, 0.6)",
                } as React.CSSProperties}
              >
                <span
                  style={{
                    position: "relative",
                    display: "flex",
                    height: "2rem",
                    width: "2rem",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "0.75rem",
                    color: active ? "rgb(200, 155, 123)" : "rgba(43, 43, 43, 0.6)",
                  }}
                >
                  <Icon name={item.href} active={active} />
                  {isCart && cartCount > 0 ? (
                    <span
                      style={{
                        position: "absolute",
                        top: "-0.35rem",
                        right: "-0.35rem",
                        minWidth: "1rem",
                        height: "1rem",
                        padding: "0 0.2rem",
                        borderRadius: "999px",
                        background: "rgb(220, 53, 69)",
                        color: "white",
                        fontSize: "0.625rem",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        lineHeight: 1,
                        boxShadow: "0 0 0 2px rgba(255,255,255,0.85)",
                      }}
                    >
                      {cartCount}
                    </span>
                  ) : null}
                </span>
                <span
                  style={{
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    lineHeight: 1.25,
                  }}
                >
                  {item.shortLabel}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
