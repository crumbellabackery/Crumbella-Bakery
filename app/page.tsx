import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/Button";
import { Section } from "@/components/Section";
import { site } from "@/lib/site-config";

export default function HomePage() {
  return (
    <>
      {/* Hero — premium gradient + optional full-bleed photo */}
      <section className="relative overflow-hidden bg-hero-mesh">
        <div className="absolute inset-0 -z-10">
          <Image
            src="https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=1920&q=85"
            alt=""
            fill
            className="object-cover opacity-35"
            priority
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-luxury-bg/90 via-luxury-bg/75 to-luxury-bg" />
        </div>

        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 pb-24 pt-20 text-center sm:px-6 sm:pb-32 sm:pt-28 lg:px-8">
          <p
            className="animate-fade-up mb-4 text-xs font-semibold uppercase tracking-[0.25em] text-luxury-accent opacity-0 [animation-delay:0.05s]"
            style={{ animationFillMode: "forwards" }}
          >
            Tüm ürünlerimiz sipariş üzerine hazırlanır
          </p>
          <h1
            className="animate-fade-up max-w-3xl font-semibold tracking-tight text-luxury-text opacity-0 [animation-delay:0.12s]"
            style={{ animationFillMode: "forwards" }}
          >
            <span className="block text-4xl sm:text-5xl lg:text-6xl">
              {site.name}
            </span>
          </h1>
          <p
            className="animate-fade-up mt-6 max-w-xl text-lg leading-relaxed text-luxury-text/70 opacity-0 [animation-delay:0.2s] sm:text-xl"
            style={{ animationFillMode: "forwards" }}
          >
            {site.tagline}
          </p>
          <div
            className="animate-fade-up mt-10 flex flex-col items-center justify-center gap-4 opacity-0 [animation-delay:0.28s] sm:flex-row sm:gap-5"
            style={{ animationFillMode: "forwards" }}
          >
            <Link
              href="/menu"
              className="inline-flex min-w-[200px] items-center justify-center rounded-[25px] bg-[#D6A77A] px-5 py-2.5 text-sm font-medium text-white transition hover:bg-[#C48A5A]"
            >
              Menüyü İncele
            </Link>
            <Link
              href="/packages"
              className="inline-flex min-w-[200px] items-center justify-center rounded-[25px] border border-[#D6A77A] bg-transparent px-5 py-2.5 text-sm font-medium text-[#8B6F5A] transition hover:bg-[#D6A77A] hover:text-white"
            >
              Paketleri Gör
            </Link>
          </div>

        </div>
      </section>

      {/* How it works */}
      <Section
        eyebrow="Basit ve hızlı"
        title="Nasıl çalışır?"
        className="pb-8"
      >
        <div className="grid gap-8 sm:grid-cols-3">
          {/* Step 1 */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-luxury-accent/30 to-luxury-secondary/30 ring-1 ring-luxury-accent/40">
              <span className="text-4xl font-bold text-luxury-accent">1</span>
            </div>
            <h3 className="mb-3 text-xl font-semibold text-luxury-text">
              Menüyü İncele
            </h3>
            <p className="text-luxury-text/70">
              Tüm ürünlerimizi, porsiyon seçeneklerini ve fiyatlarını görmek için menümüzü açın.
            </p>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-luxury-accent/30 to-luxury-secondary/30 ring-1 ring-luxury-accent/40">
              <span className="text-4xl font-bold text-luxury-accent">2</span>
            </div>
            <h3 className="mb-3 text-xl font-semibold text-luxury-text">
              Sipariş Ver
            </h3>
            <p className="text-luxury-text/70">
              İstediğiniz ürünü seçin, miktarı belirleyin ve kişisel notlarınızı ekleyin.
            </p>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-luxury-accent/30 to-luxury-secondary/30 ring-1 ring-luxury-accent/40">
              <span className="text-4xl font-bold text-luxury-accent">3</span>
            </div>
            <h3 className="mb-3 text-xl font-semibold text-luxury-text">
              Teslim Al
            </h3>
            <p className="text-luxury-text/70">
              Ürünleriniz özenle hazırlanıp, belirtilen saatte hazır olacak.
            </p>
          </div>
        </div>

      </Section>

      {/* Trust Building */}
      <Section
        eyebrow="Güvenilir ve kaliteli"
        title="Neden Crumbella?"
        className="pb-8"
      >
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-100 to-green-200">
              <span className="text-2xl">🌱</span>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-luxury-text">
              Günlük Üretim
            </h3>
            <p className="text-sm text-luxury-text/70">
              Her gün taze pişiriyoruz, dünden kalmış ürün yok.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-200">
              <span className="text-2xl">✨</span>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-luxury-text">
              Katkısız
            </h3>
            <p className="text-sm text-luxury-text/70">
              Doğal malzemeler, koruyucu madde yok.
            </p>
          </div>

          <div className="flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-purple-200">
              <span className="text-2xl">🧼</span>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-luxury-text">
              Hijyen
            </h3>
            <p className="text-sm text-luxury-text/70">
              Temiz ve steril ortamda hazırlıyoruz.
            </p>
          </div>
        </div>

        <div className="mt-8 mx-auto grid w-full max-w-5xl gap-4 text-sm text-luxury-text/80 sm:grid-cols-3 sm:items-start sm:justify-items-center">
          <span className="flex items-center justify-center gap-2 sm:justify-start">
            <span className="text-green-600">✓</span>
            Siparişiniz mail ile teyit edilir
          </span>
          <span className="flex items-center justify-center gap-2 sm:justify-start">
            <span className="text-green-600">✓</span>
            Günlük üretim
          </span>
          <span className="flex items-center justify-center gap-2 sm:justify-start">
            <span className="text-green-600">✓</span>
            Aynı gün teslim
          </span>
        </div>
      </Section>
    </>
  );
}
