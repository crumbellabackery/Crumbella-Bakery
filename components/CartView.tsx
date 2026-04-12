"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/lib/cart-context";
import { Section } from "@/components/Section";
import Link from "next/link";

type PdfPayload = {
  firstName: string;
  lastName: string;
  phone: string;
  orderId: string;
  items: ReturnType<typeof useCart>["cart"]["items"];
  total: number;
};

export function CartView() {
  const { cart, removeItem, updateQuantity, clearCart } = useCart();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    note: "",
  });

  // Telefon numarasını format et (5xx xx xx şeklinde)
  const formatPhoneNumber = (value: string) => {
    const digits = value.replace(/\D/g, "");
    const cleaned = digits.startsWith("0") ? digits.slice(1) : digits;
    
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`;
    } else {
      return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 10)}`;
    }
  };
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submittedTotal, setSubmittedTotal] = useState(0);
  const [submittedData, setSubmittedData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
  });
  const [countdown, setCountdown] = useState(10);
  const [orderId, setOrderId] = useState<string>("");
  const [submittedCart, setSubmittedCart] = useState<typeof cart.items>([]);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string>("");
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfError, setPdfError] = useState("");
  const [pdfPayload, setPdfPayload] = useState<PdfPayload | null>(null);

  const isInAppBrowser =
    typeof navigator !== "undefined" &&
    /Instagram|FBAN|FBAV|Line|Twitter/i.test(navigator.userAgent);

  useEffect(() => {
    if (submitted && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (submitted && countdown === 0) {
      window.location.href = "/";
    }
  }, [submitted, countdown]);

  useEffect(() => {
    return () => {
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
    };
  }, [pdfBlobUrl]);

  const generatePdf = async (payload: PdfPayload) => {
    setPdfGenerating(true);
    setPdfError("");

    try {
      const response = await fetch("/api/generate-order-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("PDF endpoint başarısız döndü");
      }

      const pdfBlob = await response.blob();
      if (pdfBlobUrl) {
        URL.revokeObjectURL(pdfBlobUrl);
      }
      const url = URL.createObjectURL(pdfBlob);
      setPdfBlobUrl(url);
    } catch (error) {
      console.error("PDF oluşturma hatası:", error);
      setPdfError("Sipariş belgesi hazırlanamadı. Lütfen 'Belgeyi Yeniden Oluştur' butonunu deneyin.");
    } finally {
      setPdfGenerating(false);
    }
  };

  const openPdfInSameTab = (payload: PdfPayload) => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/api/generate-order-pdf";
    form.target = "_self";

    const payloadInput = document.createElement("input");
    payloadInput.type = "hidden";
    payloadInput.name = "payload";
    payloadInput.value = JSON.stringify(payload);

    form.appendChild(payloadInput);
    document.body.appendChild(form);
    form.submit();
    document.body.removeChild(form);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 animate-in fade-in backdrop-blur-sm">
        <div className="bg-luxury-bg rounded-3xl p-10 shadow-2xl max-w-md w-full mx-4 animate-in scale-in duration-300 border border-luxury-accent/30">
          <div className="text-center">
            <div className="text-4xl mb-6 animate-bounce">✅</div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-luxury-accent to-luxury-secondary bg-clip-text text-transparent mb-3">
              Sipariş Başarıyla Gönderildi!
            </h2>
            <p className="text-luxury-text/70 mb-8">İlk bilgilendirme <span className="font-semibold text-luxury-accent">{submittedData.phone}</span> numarasına kısa mesaj ile yapılacaktır.</p>
            <div className="bg-gradient-to-br from-luxury-accent/15 to-luxury-secondary/10 rounded-2xl p-6 mb-8 border border-luxury-accent/30 space-y-3 text-left">
              <div className="flex justify-between"><span className="text-luxury-text/70">Müşteri</span><span className="font-semibold">{submittedData.firstName} {submittedData.lastName}</span></div>
              <div className="h-px bg-luxury-accent/20"></div>
              <div className="flex justify-between"><span className="text-luxury-text/70">Telefon</span><span className="font-semibold">{submittedData.phone}</span></div>
              <div className="h-px bg-luxury-accent/20"></div>
              <div className="flex justify-between"><span className="text-luxury-text/70">Tutar</span><span className="text-lg font-bold text-luxury-accent">₺{submittedTotal}</span></div>
            </div>
            <p className="text-sm text-luxury-text/60 mb-5"><span className="text-2xl font-bold text-luxury-accent">{countdown}</span> saniye içinde anasayfaya yönlendiriliyorsunuz...</p>
            {isInAppBrowser && (
              <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2 mb-4">
                Instagram içi tarayıcı indirmeyi engelleyebilir. Gerekirse sağ üstten Safari/Chrome ile açın.
              </p>
            )}
            {isInAppBrowser && pdfPayload && (
              <button
                onClick={() => openPdfInSameTab(pdfPayload)}
                className="w-full mb-4 px-4 py-2 rounded-lg border border-amber-300 hover:bg-amber-50 text-amber-800 font-semibold text-sm transition"
              >
                Belgeyi Aynı Sekmede Aç
              </button>
            )}
            {pdfGenerating && (
              <p className="text-xs text-luxury-accent mb-4 font-semibold">Sipariş belgesi hazırlanıyor...</p>
            )}
            {pdfBlobUrl && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
                <a
                  href={pdfBlobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 rounded-lg border border-luxury-accent/40 hover:border-luxury-accent hover:bg-luxury-accent/5 text-luxury-text font-semibold text-sm text-center transition"
                >
                  Belgeyi Aç
                </a>
                <a
                  href={pdfBlobUrl}
                  download={`siparis-${orderId}.pdf`}
                  className="px-4 py-2 rounded-lg border border-luxury-accent/40 hover:border-luxury-accent hover:bg-luxury-accent/5 text-luxury-text font-semibold text-sm text-center transition"
                >
                  Belgeyi İndir
                </a>
              </div>
            )}
            {pdfError && (
              <div className="mb-4">
                <p className="text-xs text-red-600 mb-2">{pdfError}</p>
                <button
                  onClick={() =>
                    generatePdf({
                      firstName: submittedData.firstName,
                      lastName: submittedData.lastName,
                      phone: submittedData.phone,
                      orderId,
                      items: submittedCart,
                      total: submittedTotal,
                    })
                  }
                  className="w-full px-4 py-2 rounded-lg border border-red-300 hover:bg-red-50 text-red-700 font-semibold text-sm transition"
                >
                  Belgeyi Yeniden Oluştur
                </button>
              </div>
            )}
            <button onClick={() => (window.location.href = "/")} className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-luxury-accent to-luxury-secondary text-luxury-bg font-semibold hover:shadow-soft-md transition transform hover:scale-[1.02]">
              Anasayfaya Git →
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <Section eyebrow="Sepetim" title="Sepetiniz Boş" className="pt-10 text-center">
        <p className="mx-auto mb-12 max-w-2xl text-luxury-text/70 text-lg">Menüden sevdiğiniz ürünleri ekleyin!</p>
        <div className="flex flex-col gap-3 sm:flex-row justify-center">
          <Link href="/menu" className="px-8 py-3 rounded-lg bg-gradient-to-r from-luxury-accent to-luxury-secondary text-luxury-bg font-semibold hover:shadow-soft-md transition transform hover:scale-105">
            🍰 Menüyü Gözat
          </Link>
          <Link href="/gallery" className="px-8 py-3 rounded-lg border-2 border-luxury-accent/40 hover:border-luxury-accent hover:bg-luxury-accent/5 text-luxury-text font-semibold transition transform hover:scale-105">
            📦 Özel Paketler
          </Link>
        </div>
      </Section>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.firstName.trim()) {
      alert("Lütfen adınızı girin");
      return;
    }
    if (!formData.lastName.trim()) {
      alert("Lütfen soyadınızı girin");
      return;
    }
    const cleanedPhone = formData.phone.replace(/\D/g, "");
    const phoneDigits = cleanedPhone.startsWith("0") ? cleanedPhone.slice(1) : cleanedPhone;
    if (phoneDigits.length !== 10 || !phoneDigits.startsWith("5")) {
      alert("Lütfen geçerli bir telefon numarası girin (10 rakam, 5 ile başlamalı)");
      return;
    }
    
    setLoading(true);

    try {
      const response = await fetch("/api/send-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          cartItems: cart.items,
          cartTotal: cart.totalPrice,
          note: formData.note,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const nextOrderId = data.id || "";
        const submittedPayload = {
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
          orderId: nextOrderId,
          items: cart.items,
          total: cart.totalPrice,
        };

        setSubmittedData({
          firstName: formData.firstName,
          lastName: formData.lastName,
          phone: formData.phone,
        });
        setSubmittedTotal(cart.totalPrice);
        setOrderId(nextOrderId);
        setSubmittedCart(cart.items);
        setPdfPayload(submittedPayload);
        setPdfBlobUrl("");
        setPdfError("");
        clearCart();
        setFormData({ firstName: "", lastName: "", phone: "", note: "" });
        setLoading(false);
        setCountdown(10);
        setSubmitted(true);
        void generatePdf(submittedPayload);
      } else {
        setLoading(false);
        alert(`Hata: ${data.error}`);
      }
    } catch (error) {
      setLoading(false);
      alert("Sipariş gönderilemedi!");
    }
  };

  return (
    <Section eyebrow="Sepetim" title="Sipariş Özeti" className="pt-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* LEFT: Products */}
          <div className="lg:col-span-2">

            <div className="space-y-3">
              {cart.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 rounded-xl p-5 bg-gradient-to-br from-luxury-accent/8 to-luxury-secondary/5 border border-luxury-accent/20 shadow-soft-sm hover:shadow-soft-md hover:border-luxury-accent/40 transition-all duration-300">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-1">
                      {item.emoji && <span className="text-lg sm:text-2xl flex-shrink-0">{item.emoji}</span>}
                      <h3 className="font-semibold text-luxury-text text-xs sm:text-base">
                        {item.name}
                      </h3>
                    </div>
                    {item.portionType && (
                      <p className="text-xs sm:text-sm text-luxury-text/60 mb-1">
                        {item.portionType}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-1.5 text-xs sm:text-sm">
                      <p className="text-luxury-accent font-bold">₺{item.unitPrice.toFixed(2)}</p>
                      <span className="text-luxury-text/30">×</span>
                      <p className="text-luxury-text/70">{item.quantity}x</p>
                      <span className="text-luxury-text/30">=</span>
                      <p className="font-bold text-luxury-accent">₺{item.totalPrice.toFixed(2)}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-luxury-accent/15 hover:bg-luxury-accent/30 flex items-center justify-center text-luxury-accent transition duration-200 font-bold text-xs sm:text-sm" title="Azalt">
                      −
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => {
                        const newQty = parseInt(e.target.value, 10);
                        if (newQty > 0) updateQuantity(item.id, newQty);
                      }}
                      className="w-8 sm:w-11 text-center bg-luxury-primary/40 border border-luxury-accent/30 rounded-lg px-1 sm:px-2 py-1 sm:py-1.5 text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-luxury-accent/50"
                    />
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-luxury-accent/15 hover:bg-luxury-accent/30 flex items-center justify-center text-luxury-accent transition duration-200 font-bold text-xs sm:text-sm" title="Artır">
                      +
                    </button>
                    <button onClick={() => removeItem(item.id)} className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-red-100/60 hover:bg-red-200/70 flex items-center justify-center text-red-600 transition duration-200 font-bold text-sm sm:text-lg" title="Sil">
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: Summary & Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-6">
              {/* Summary */}
              <div className="rounded-2xl bg-gradient-to-br from-luxury-accent/12 to-luxury-secondary/8 p-4 sm:p-6 border border-luxury-accent/40 shadow-soft-md">
                <h4 className="text-xs font-bold uppercase tracking-widest text-luxury-accent mb-3 sm:mb-5">ÖZET</h4>
                <div className="space-y-2 sm:space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs sm:text-sm text-luxury-text/70">Ürün Sayısı</span>
                    <span className="text-base sm:text-lg font-bold text-luxury-text">{cart.totalQuantity}</span>
                  </div>
                  <div className="h-px bg-luxury-accent/20"></div>
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-xs sm:text-sm font-semibold text-luxury-text">Toplam</span>
                    <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-luxury-accent to-luxury-secondary bg-clip-text text-transparent">
                      ₺{cart.totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4 p-4 sm:p-6 rounded-2xl bg-gradient-to-br from-luxury-primary/40 to-luxury-secondary/10 border border-luxury-accent/20">
                <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-luxury-accent mb-3 sm:mb-4">Müşteri Bilgileri</h4>

                <div>
                  <label className="block text-xs font-bold text-luxury-accent mb-1.5 sm:mb-2 uppercase">Ad</label>
                  <input type="text" required value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} className="w-full px-3 py-2 sm:py-2.5 rounded-lg border border-luxury-accent/30 bg-luxury-bg focus:outline-none focus:ring-2 focus:ring-luxury-accent/50 text-xs sm:text-sm" placeholder="Adınız" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-luxury-accent mb-1.5 sm:mb-2 uppercase">Soyad</label>
                  <input type="text" required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} className="w-full px-3 py-2 sm:py-2.5 rounded-lg border border-luxury-accent/30 bg-luxury-bg focus:outline-none focus:ring-2 focus:ring-luxury-accent/50 text-xs sm:text-sm" placeholder="Soyadınız" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-luxury-accent mb-1.5 sm:mb-2 uppercase">Telefon</label>
                  <input 
                    type="tel" 
                    required 
                    value={formData.phone} 
                    onChange={(e) => setFormData({ ...formData, phone: formatPhoneNumber(e.target.value) })} 
                    className={`w-full px-3 py-2 sm:py-2.5 rounded-lg bg-luxury-bg focus:outline-none focus:ring-2 focus:ring-luxury-accent/50 text-xs sm:text-sm border ${ formData.phone.replace(/\s/g, '').length > 0 && !formData.phone.replace(/\s/g, '').startsWith('5') ? 'border-red-500' : 'border-luxury-accent/30' }`}
                    placeholder="5XX XXX XXXX" 
                    maxLength={14}
                  />
                  {formData.phone.replace(/\s/g, '').length > 0 && !formData.phone.replace(/\s/g, '').startsWith('5') && (
                    <p className="text-xs text-red-500 mt-1.5 font-semibold">Lütfen geçerli bir telefon numarası giriniz</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-luxury-accent mb-1.5 sm:mb-2 uppercase">Not</label>
                  <textarea value={formData.note} onChange={(e) => setFormData({ ...formData, note: e.target.value })} className="w-full px-3 py-2 sm:py-2.5 rounded-lg border border-luxury-accent/30 bg-luxury-bg focus:outline-none focus:ring-2 focus:ring-luxury-accent/50 text-xs sm:text-sm resize-none" placeholder="İsteğiniz..." rows={2} />
                </div>

                <button 
                  type="submit" 
                  disabled={loading || !formData.firstName.trim() || !formData.lastName.trim() || formData.phone.replace(/\s/g, '').length !== 10 || !formData.phone.replace(/\s/g, '').startsWith('5')} 
                  className="w-full px-4 py-2 sm:py-3 rounded-lg bg-gradient-to-r from-luxury-accent to-luxury-secondary text-luxury-bg font-bold text-xs sm:text-sm hover:shadow-soft-md transition transform hover:scale-[1.02] duration-300 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide"
                >
                  {loading ? "⏳ Gönderiliyor..." : "✓ Sipariş Oluştur"}
                </button>
              </form>

              {/* Info */}
              <div className="rounded-lg bg-luxury-primary/40 p-3.5 text-xs border border-luxury-accent/20">
                <p className="text-luxury-text/75"><span className="font-semibold"> Teslimat:</span> Siparişler onaylandıktan sonra hazırlanır.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Section>
  );
}
