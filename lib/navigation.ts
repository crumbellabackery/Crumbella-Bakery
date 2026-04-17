/**
 * Ana navigasyon — Header ve mobil alt sekme çubuğu bu listeyi kullanır.
 * Etiketleri buradan güncelleyin.
 */
export const mainNav = [
  { href: "/", label: "Ana Sayfa", shortLabel: "Ana Sayfa" },
  { href: "/menu", label: "Menü", shortLabel: "Menü" },
  { href: "/packages", label: "Özel Paketler", shortLabel: "Paketler" },
  { href: "/cart", label: "Sepetim", shortLabel: "Sepetim" },
  { href: "/about", label: "Hakkımızda", shortLabel: "Hakkımızda" },
] as const;

export function isNavActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname.startsWith(href);
}
