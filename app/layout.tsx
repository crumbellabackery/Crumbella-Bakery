import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { MobileTabBar } from "@/components/MobileTabBar";
import { CartProvider } from "@/lib/cart-context";
import { site } from "@/lib/site-config";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
  display: "swap",
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://crumbella.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: `${site.name} · Ev yapımı tatlı & tuzlu`,
    template: `%s · ${site.name}`,
  },
  description: site.tagline,
  appleWebApp: {
    capable: true,
    title: site.name,
    statusBarStyle: "default",
  },
  openGraph: {
    title: site.name,
    description: site.tagline,
    locale: "tr_TR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: site.name,
    description: site.tagline,
  },
};

/** Mobil notch / home indicator ile uyum + tema çubuğu */
export const viewport: Viewport = {
  themeColor: "#FAF7F2",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className={poppins.variable}>
      <body
        className={`${poppins.className} min-h-[100dvh] bg-luxury-bg text-luxury-text antialiased`}
      >
        <CartProvider>
          <Header />
          {/* Alt sekme çubuğu için boşluk (mobil); masaüstünde sıfır */}
          <div className="pb-[calc(5.75rem+env(safe-area-inset-bottom,0px))] md:pb-0">
            <main className="min-h-[50vh]">{children}</main>
            <Footer />
          </div>
          <MobileTabBar />
        </CartProvider>
      </body>
    </html>
  );
}
