import Link from "next/link";
import { site, social, whatsappUrl } from "@/lib/site-config";

const year = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="border-t border-luxury-secondary/20 bg-gradient-to-b from-luxury-primary/30 to-luxury-primary/20 shadow-soft">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 sm:py-16 lg:grid-cols-3 lg:px-8">
        <div>
          <p className="text-lg font-semibold text-luxury-text">{site.name}</p>
          <p className="mt-2 max-w-xs text-sm leading-relaxed text-luxury-text/70">
            {site.tagline}
          </p>
          <p className="mt-4 text-sm text-luxury-text/60">{site.location}</p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-luxury-accent">
            Hızlı bağlantılar
          </p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link
                href="/menu"
                className="text-luxury-text/70 transition hover:text-luxury-accent"
              >
                Menü & fiyatlar
              </Link>
            </li>
            <li>
              <Link
                href="/packages"
                className="text-luxury-text/70 transition hover:text-luxury-accent"
              >
                Özel Paketler
              </Link>
            </li>
            <li>
              <Link
                href="/contact"
                className="text-luxury-text/70 transition hover:text-luxury-accent"
              >
                Sipariş / iletişim
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-luxury-accent">
            Bize ulaşın
          </p>
          <ul className="mt-3 space-y-3 text-sm text-luxury-text/70">
            <li className="flex items-center gap-2">
              <span className="text-luxury-text/40" aria-hidden>
                ✉
              </span>
              <a href={`tel:${site.phoneTel}`} className="hover:text-luxury-accent">
                {site.phoneDisplay}
              </a>
            </li>
            <li className="flex items-center gap-2">
    
             
            </li>
            <li className="flex flex-wrap gap-3 pt-1">
              <a
                href={social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full bg-luxury-primary px-3 py-1.5 text-xs font-medium text-luxury-accent shadow-soft ring-1 ring-luxury-accent/30 transition hover:ring-luxury-accent/60"
              >
                <span aria-hidden>Instagram</span>
                <span className="sr-only">(yeni sekme)</span>
              </a>
              {social.facebook ? (
                <a
                  href={social.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-full bg-luxury-primary px-3 py-1.5 text-xs font-medium text-luxury-accent shadow-soft ring-1 ring-luxury-accent/30"
                >
                  Facebook
                </a>
              ) : null}
              {social.tiktok ? (
                <a
                  href={social.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex rounded-full bg-luxury-primary px-3 py-1.5 text-xs font-medium text-luxury-accent shadow-soft ring-1 ring-luxury-accent/30"
                >
                  TikTok
                </a>
              ) : null}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-luxury-secondary/20 py-6 text-center text-xs text-luxury-text/60">
        © {year} {site.name}. Tüm hakları saklıdır.
      </div>
    </footer>
  );
}
