/**
 * Fiyatlar Google Sheets'ten /api/pricing endpoint'inden çekiliyor.
 * Format: Ürün Adı | Porsiyon Tipi | Birim Fiyatı | Açıklama | Görsel URL
 * Örnek: Poğaça | Adet | 25 | Taze pişmiş... | URL
 *        Poğaça | Tepsi | 150 | Taze pişmiş... | URL
 */

export type PortionOption = {
  portionType: string;  // "Adet", "Tepsi", "Desen", vb.
  unitPrice: number;    // 25, 150, 45 (birim fiyat)
};

export type ProductItem = {
  id: string;           // pogaca, biberli, kurabiye, vb.
  name: string;         // Ürün Adı
  description?: string; // Açıklama (sadece birinci satırdan)
  portionOptions: PortionOption[]; // Mevcut porsiyon tipleri
  image?: string;       // Görsel URL (sadece birinci satırdan)
  category: string;     // Kategori: Tatlılar, Tuzlular, Pastalar
};

export type PricingData = Record<string, ProductItem>;
