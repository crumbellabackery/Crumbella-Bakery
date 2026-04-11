"use client";

import { useState, useEffect, type FormEvent } from "react";
import type { PricingData } from "@/data/pricing";
import { contactEmail } from "@/lib/site-config";
import { Button } from "@/components/Button";

/**
 * Sipariş formu - Email gönderimi
 */
export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [showSuccess, setShowSuccess] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedPortionType, setSelectedPortionType] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [pricing, setPricing] = useState<PricingData>({});

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
      });
  }, []);

  useEffect(() => {
    if (status === "sent") {
      setShowSuccess(true);
      const timer = setTimeout(() => {
        setShowSuccess(false);
        setStatus("idle");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [status]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const firstName = String(fd.get("firstName") ?? "").trim();
    const lastName = String(fd.get("lastName") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const productId = String(fd.get("productId") ?? "");
    const portionType = String(fd.get("portionType") ?? "");
    const quantityStr = String(fd.get("quantity") ?? "1");
    const note = String(fd.get("note") ?? "").trim();

    if (!firstName || !lastName || !phone || !productId || !portionType || !quantityStr) {
      return;
    }

    const parsedQuantity = parseInt(quantityStr, 10);
    if (isNaN(parsedQuantity) || parsedQuantity < 1) {
      return;
    }

    // Get product and portion unit price from API data
    const product = pricing[productId];
    const portionOption = product?.portionOptions?.find(
      (opt) => opt.portionType === portionType
    );

    if (!product || !portionOption) {
      return;
    }

    const productName = product.name;
    const unitPrice = portionOption.unitPrice;
    const totalPrice = parsedQuantity * unitPrice;

    setStatus("loading");

    try {
      const response = await fetch("/api/send-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          phone,
          productName,
          portionType,
          quantity: parsedQuantity,
          unitPrice,
          totalPrice,
          note: note || undefined,
        }),
      });

      if (!response.ok) {
        throw new Error("Sipariş gönderilemedi");
      }

      setStatus("sent");
      form.reset();
      setSelectedProductId("");
      setSelectedPortionType("");
      setQuantity(1);
    } catch (error) {
      // Silent error handling
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-3xl bg-luxury-bg/95 p-8 shadow-soft-lg ring-1 ring-luxury-accent/20"
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="firstName"
              className="mb-1.5 block text-sm font-medium text-luxury-text"
            >
              Ad
            </label>
            <input
              id="firstName"
              name="firstName"
              required
              autoComplete="given-name"
              placeholder="Adınız"
              className="w-full rounded-2xl border border-luxury-accent/20 bg-luxury-primary/30 px-4 py-3 text-luxury-text placeholder:text-luxury-text/50 focus:border-luxury-accent/50 focus:outline-none focus:ring-2 focus:ring-luxury-accent/30"
            />
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="mb-1.5 block text-sm font-medium text-luxury-text"
            >
              Soyad
            </label>
            <input
              id="lastName"
              name="lastName"
              required
              autoComplete="family-name"
              placeholder="Soyadınız"
              className="w-full rounded-2xl border border-luxury-accent/20 bg-luxury-primary/30 px-4 py-3 text-luxury-text placeholder:text-luxury-text/50 focus:border-luxury-accent/50 focus:outline-none focus:ring-2 focus:ring-luxury-accent/30"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="phone"
            className="mb-1.5 block text-sm font-medium text-luxury-text"
          >
            Telefon
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            required
            autoComplete="tel"
            placeholder="05xx xxx xx xx"
            className="w-full rounded-2xl border border-luxury-accent/20 bg-luxury-primary/30 px-4 py-3 text-luxury-text placeholder:text-luxury-text/50 focus:border-luxury-accent/50 focus:outline-none focus:ring-2 focus:ring-luxury-accent/30"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label
              htmlFor="productId"
              className="mb-1.5 block text-sm font-medium text-luxury-text"
            >
              Ürün seçimi
            </label>
            <select
              id="productId"
              name="productId"
              required
              defaultValue=""
              onChange={(e) => {
                setSelectedProductId(e.target.value);
                setSelectedPortionType(""); // Reset portion when product changes
              }}
              className="w-full rounded-2xl border border-luxury-accent/20 bg-luxury-primary/30 px-4 py-3 text-luxury-text focus:border-luxury-accent/50 focus:outline-none focus:ring-2 focus:ring-luxury-accent/30"
            >
              <option value="" disabled>
                Seçiniz
              </option>
              {Object.entries(pricing).map(([id, product]) => (
                <option key={id} value={id}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="portionType"
              className="mb-1.5 block text-sm font-medium text-luxury-text"
            >
              Porsiyon tipi
            </label>
            <select
              id="portionType"
              name="portionType"
              required
              defaultValue=""
              disabled={!selectedProductId}
              onChange={(e) => setSelectedPortionType(e.target.value)}
              className="w-full rounded-2xl border border-luxury-accent/20 bg-luxury-primary/30 px-4 py-3 text-luxury-text focus:border-luxury-accent/50 focus:outline-none focus:ring-2 focus:ring-luxury-accent/30 disabled:opacity-50"
            >
              <option value="" disabled>
                {selectedProductId ? "Seçiniz" : "Önce ürün seçin"}
              </option>
              {selectedProductId && 
                pricing[selectedProductId]?.portionOptions?.map((option, idx) => (
                  <option key={idx} value={option.portionType}>
                    {option.portionType} — ₺{option.unitPrice.toFixed(2)}
                  </option>
                ))}
            </select>
          </div>
        </div>

        <div>
          <label
            htmlFor="quantity"
            className="mb-1.5 block text-sm font-medium text-luxury-text"
          >
            Miktar
          </label>
          <div className="flex gap-3 items-center">
            <input
              id="quantity"
              name="quantity"
              type="number"
              required
              min="1"
              defaultValue="1"
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full rounded-2xl border border-luxury-accent/20 bg-luxury-primary/30 px-4 py-3 text-luxury-text placeholder:text-luxury-text/50 focus:border-luxury-accent/50 focus:outline-none focus:ring-2 focus:ring-luxury-accent/30"
            />
            {selectedProductId && selectedPortionType && (
              <div className="whitespace-nowrap font-bold text-luxury-accent">
                {pricing[selectedProductId]?.portionOptions
                  ?.find(opt => opt.portionType === selectedPortionType)
                  ?.unitPrice && (
                  <>
                    ₺{quantity * (pricing[selectedProductId]?.portionOptions?.find(opt => opt.portionType === selectedPortionType)?.unitPrice || 0)}
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <textarea
            id="note"
            name="note"
            rows={4}
            placeholder="Teslimat saati, alerji, yazı yazısı vb."
            className="w-full resize-y rounded-2xl border border-luxury-accent/20 bg-luxury-primary/30 px-4 py-3 text-luxury-text placeholder:text-luxury-text/50 focus:border-luxury-accent/50 focus:outline-none focus:ring-2 focus:ring-luxury-accent/30"
          />
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-luxury-text/70">
            Siparişiniz email ile bize ulaşacaktır. Sorun olursa doğrudan yazın:{" "}
            <a
              className="font-medium text-luxury-accent underline-offset-2 hover:underline"
              href={`mailto:${contactEmail}`}
            >
              {contactEmail}
            </a>
          </p>
          <Button 
            type="submit" 
            disabled={status === "loading"}
            className="shrink-0 sm:min-w-[180px]"
          >
            {status === "loading" ? "Gönderiliyor..." : "Sipariş Ver"}
          </Button>
        </div>
      </form>

      {showSuccess && status === "sent" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="relative overflow-hidden rounded-3xl bg-white px-8 py-10 shadow-2xl sm:px-12 sm:py-14 max-w-sm mx-4 animate-in zoom-in duration-300">
            {/* Animated gradient background */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 opacity-50" />
            
            {/* Top accent line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400" />
            
            <div className="relative flex flex-col items-center gap-6">
              {/* Animated checkmark circle */}
              <div className="relative h-24 w-24 sm:h-28 sm:w-28">
                <svg
                  className="absolute inset-0 h-full w-full"
                  viewBox="0 0 100 100"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    color: "rgb(16 185 129)",
                    filter: "drop-shadow(0 4px 12px rgba(16, 185, 129, 0.3))",
                  }}
                >
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    className="animate-pulse"
                    strokeOpacity="0.3"
                  />
                  <path
                    d="M 30 50 L 45 65 L 70 35"
                    className="stroke-green-500 animate-in"
                    style={{
                      animation: "drawCheck 0.6s ease-out 0.2s forwards",
                      strokeDasharray: "50",
                      strokeDashoffset: "50",
                    }}
                  />
                </svg>
              </div>

              {/* Content */}
              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-3">
                  Başarılı!
                </h2>
                <p className="text-gray-700 font-medium mb-2 text-lg">
                  Siparişiniz Alındı
                </p>
                <p className="text-gray-600 text-sm sm:text-base leading-relaxed">
                  Tatlı tercihleriniz tarafımıza ulaştı. En kısa sürede sizinle iletişime geçeceğiz ve lezzetli anları yaşayacaksınız.
                </p>
              </div>

              {/* Bottom accent */}
              <div className="w-16 h-1 bg-gradient-to-r from-green-400 via-emerald-400 to-transparent rounded-full" />
            </div>
          </div>
        </div>
      )}

      {status === "error" && (
        <p
          className="mt-6 rounded-2xl border border-red-400/40 bg-red-400/20 px-4 py-3 text-center text-sm text-red-700"
          role="alert"
        >
          ✗ Bir hata oluştu. Lütfen doğrudan {contactEmail} adresine yazınız.
        </p>
      )}
    </div>
  );
}
