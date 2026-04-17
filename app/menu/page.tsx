"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Section } from "@/components/Section";
import { AddToCartModal } from "@/components/AddToCartModal";
import type { PricingData, ProductItem } from "@/data/pricing";

export default function MenuPage() {
  const [pricing, setPricing] = useState<PricingData>({});
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('Tümü');

  useEffect(() => {
    // Fetch pricing from API (Google Sheets)
    fetch("/api/pricing")
      .then((res) => res.json())
      .then((data) => {
        if (Object.keys(data).length > 0) {
          setPricing(data);
        }
      })
      .catch((err) => {
        // Silent fail - use local data
      })
      .finally(() => setLoading(false));
  }, []);

  // Get unique categories
  const categories = ['Tümü', ...Array.from(new Set(Object.values(pricing).map(p => p.category).filter(Boolean)))];

  // Filter products by category
  const filteredProducts = selectedCategory === 'Tümü' 
    ? Object.values(pricing) 
    : Object.values(pricing).filter(p => p.category === selectedCategory);
  return (
    <Section
      eyebrow="Fiyat listesi"
      title="Menümüz"
      className="pt-6"
    >
      <p className="mx-auto mb-4 max-w-2xl text-center text-luxury-text/70">
        Her ısırıkta ev sıcaklığı ile hazırlanan ürünlerimizi keşfedin. Her ürün özenle hazırlanır. Bireysel ve tepsi siparişleri için çeşitli seçenekler.{" "}
        <span className="font-medium text-luxury-accent">Sipariş üzerine</span> ürünler işaretlidir.
      </p>
      <p className="mx-auto mb-8 max-w-2xl text-center text-xs text-luxury-text/50">
        📸 Fotoğraflar tamamen kendi çekimimizdir
      </p>

      {/* Category Filter */}
      <div className="mx-auto mb-8 flex max-w-2xl flex-wrap justify-center gap-2">
        {['Tümü', '🍰 Tatlılar', '🎂 Pastalar', '🥐 Tuzlular', '🍪 Atıştırmalıklar'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              selectedCategory === cat
                ? 'bg-luxury-accent text-luxury-bg shadow-soft'
                : 'bg-luxury-primary/30 text-luxury-text/70 hover:bg-luxury-primary/50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 pb-24 sm:pb-6">
        {filteredProducts.map((product) => (
          <li
            key={product.id}
            className="group relative flex flex-col overflow-hidden rounded-3xl bg-luxury-bg/95 shadow-soft ring-1 ring-luxury-accent/20 transition duration-300 hover:-translate-y-1 hover:shadow-soft-md"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-luxury-primary">
              <Image
                src={product.image || "/logo.png"}
                alt={product.name || "Crumbella"}
                fill
                className="object-cover transition duration-500 group-hover:scale-[1.04]"
                sizes="(max-width: 640px) 100vw, 33vw"
              />
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="text-lg font-semibold text-luxury-text">
                {product.name}
              </h3>
              <p className="mt-2 text-sm text-luxury-text/70 flex-1">
                {product.description}
              </p>

              {/* Fiyat Listesi */}
              <div className="mt-4 space-y-2 p-3 bg-luxury-primary/30 rounded-lg">
                {product.portionOptions?.map((portion, idx) => (
                  <div key={idx} className="flex justify-between text-sm text-luxury-text/80">
                    <span>{portion.portionType}</span>
                    <span className="font-semibold text-luxury-accent">₺{portion.unitPrice.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Sepete Ekle Butonu */}
              <button
                onClick={() => setSelectedProduct(product)}
                className="mt-3 w-full rounded-lg bg-gradient-to-r from-luxury-accent to-luxury-secondary text-luxury-bg px-4 py-2.5 font-semibold hover:shadow-soft-md transition flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2 9m10 0l2-9m-10 9h14m-7-7l.4-2H5.4" />
                </svg>
                Sepete Ekle
              </button>
            </div>
          </li>
        ))}
      </ul>

      {selectedProduct && (
        <AddToCartModal
          product={selectedProduct}
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </Section>
  );
}
