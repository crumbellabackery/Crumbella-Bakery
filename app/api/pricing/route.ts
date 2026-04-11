/**
 * API endpoint - Google Sheets'ten fiyat verilerini çeker ve parse eder
 * Format: Ürün Adı | Porsiyon Tipi | Birim Fiyatı | Açıklama | Görsel URL
 * Örnek: Poğaça | Adet | 25 | Taze pişmiş... | URL
 *        Poğaça | Tepsi | 150 | Taze pişmiş... | URL
 */

const SPREADSHEET_ID = "1vpGMQ_W__sc4VYnqZGoItyL5j4LMmDSEMzylC2hDq7k";
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/export?format=csv`;

export type PortionOption = {
  portionType: string;  // "Adet", "Tepsi", "Desen", vb.
  unitPrice: number;    // Birim fiyat (25, 150, vb.)
};

export type ProductItem = {
  id: string;
  name: string;
  description?: string;
  portionOptions: PortionOption[];
  image?: string;
};

export type PricingData = Record<string, ProductItem>;

async function fetchAndParsePricing(): Promise<PricingData> {
  try {
    const response = await fetch(CSV_URL, {
      next: { revalidate: 60 }, // 60 second cache
      signal: AbortSignal.timeout(10000), // 10 second timeout
    });

    if (!response.ok) {
      return {};
    }

    const csv = await response.text();
    const lines = csv.trim().split("\n");

    // Skip header row and parse data
    const data: PricingData = {};

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim()) continue;

      // Parse CSV handling quoted values (for descriptions with commas)
      let parts: string[] = [];
      let current = "";
      let inQuotes = false;

      for (let j = 0; j < line.length; j++) {
        const char = line[j];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if ((char === "\t" || char === ",") && !inQuotes) {
          parts.push(current.trim());
          current = "";
        } else {
          current += char;
        }
      }
      if (current) parts.push(current.trim());

      if (parts.length < 4) continue;

      const productName = parts[0].replace(/"/g, "");
      const portionType = parts[1].replace(/"/g, "");  // "Adet", "Tepsi", vb.
      const unitPriceStr = parts[2].replace(/"/g, "");
      const description = parts[3]?.replace(/"/g, "") || "";         // Açıklama (4. sütun)
      let imageUrl = parts[4]?.replace(/"/g, "") || "";              // Görsel URL (5. sütun)

      // Remove ₺ or " TL" if present and parse as number
      const unitPrice = parseFloat(
        unitPriceStr
          .replace(" TL", "")
          .replace("₺", "")
          .trim()
      );
      if (isNaN(unitPrice)) continue;

      // Validate image URL - fallback to logo if empty or placeholder
      if (!imageUrl || imageUrl.includes("example.com") || !imageUrl.startsWith("http")) {
        imageUrl = "/logo.png";
      } else if (imageUrl.includes("drive.google.com")) {
        // Convert Google Drive URL to direct download/preview format
        const fileIdMatch = imageUrl.match(/id=([a-zA-Z0-9-_]+)/);
        if (fileIdMatch) {
          imageUrl = `https://drive.google.com/uc?export=view&id=${fileIdMatch[1]}`;
        }
      }

      // Create ID from product name (lowercase, replace spaces/special chars)
      // Normalize Turkish characters first
      let normalized = productName
        .toLowerCase()
        .replace(/ç/g, "c")
        .replace(/ğ/g, "g")
        .replace(/ş/g, "s")
        .replace(/ı/g, "i")
        .replace(/ö/g, "o")
        .replace(/ü/g, "u");
      
      const productId = normalized
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");

      if (!data[productId]) {
        // First occurrence - set name, description, and image
        data[productId] = {
          id: productId,
          name: productName,
          description: description || undefined,
          portionOptions: [],
          image: imageUrl,
        };
      } else if (!data[productId].image || data[productId].image === "/logo.png") {
        // Update image from subsequent rows if not properly set
        data[productId].image = imageUrl;
      }

      // Add portion option (can be multiple per product)
      data[productId].portionOptions.push({ portionType, unitPrice });
    }

    return data;
  } catch (error) {
    // Error logged internally
    // Return empty object on error - components should handle gracefully
    return {};
  }
}

export async function GET() {
  const pricing = await fetchAndParsePricing();
  return Response.json(pricing);
}
