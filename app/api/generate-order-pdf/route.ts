// @ts-ignore
import PDFDocument from "pdfkit";
import { NextRequest, NextResponse } from "next/server";

interface OrderItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  portionType?: string;
}

interface OrderData {
  firstName: string;
  lastName: string;
  phone: string;
  orderId: string;
  items: OrderItem[];
  total: number;
}

export async function POST(request: NextRequest) {
  try {
    const orderData: OrderData = await request.json();

    // PDF oluştur
    const doc = new PDFDocument({
      size: "A4",
      margin: 40,
    });

    // Stream'e yazıyoruz
    const chunks: Buffer[] = [];
    doc.on("data", (chunk: Buffer) => chunks.push(chunk));

    // Header
    doc.fontSize(24).font("Helvetica-Bold").text("Crumbella", { align: "center" });
    doc.fontSize(10).font("Helvetica").text("SİPARİŞ BELGESİ", { align: "center" });
    doc.moveTo(40, doc.y + 5).lineTo(555, doc.y + 5).stroke("#d4af37");
    doc.moveDown(1);

    // Sipariş bilgileri
    doc.fontSize(9).font("Helvetica");
    doc.text(`Sipariş No: ${orderData.orderId}`);
    doc.text(
      `Tarih: ${new Date().toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })}`
    );
    doc.moveDown(0.5);

    // Müşteri bilgileri box
    doc.rect(40, doc.y, 515, 35).stroke("#d4af37");
    doc.fontSize(9).font("Helvetica-Bold");
    doc.text(`Müşteri: ${orderData.firstName} ${orderData.lastName}`, 50, doc.y + 5);
    doc.text(`Telefon: ${orderData.phone}`, 50, doc.y + 5);
    doc.moveDown(2);

    // Tablo header
    doc.fontSize(9).font("Helvetica-Bold");
    const tableTop = doc.y;
    const col1 = 50;
    const col2 = 350;
    const col3 = 430;
    const col4 = 505;

    doc.text("Ürün", col1, tableTop);
    doc.text("Miktar", col2, tableTop);
    doc.text("Birim Fiyat", col3, tableTop);
    doc.text("Toplam", col4, tableTop, { align: "right" });
    doc.moveTo(40, tableTop + 20).lineTo(555, tableTop + 20).stroke("#d4af37");
    doc.moveDown(1.5);

    // Tablo içeriği
    doc.fontSize(8).font("Helvetica");
    orderData.items.forEach((item) => {
      const yPosition = doc.y;
      const productName = item.portionType ? `${item.name} (${item.portionType})` : item.name;
      doc.text(productName, col1, yPosition, { width: 280, align: "left" });
      doc.text(item.quantity.toString(), col2, yPosition, { width: 50, align: "center" });
      doc.text(`₺${item.unitPrice.toFixed(2)}`, col3, yPosition, { width: 50, align: "right" });
      doc.text(`₺${item.totalPrice.toFixed(2)}`, col4, yPosition, { width: 40, align: "right" });
      doc.moveDown(1.2);
    });

    // Total
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke("#d4af37");
    doc.moveDown(0.5);
    doc.fontSize(12).font("Helvetica-Bold").fillColor("#d4af37");
    doc.text(`TOPLAM: ₺${orderData.total.toFixed(2)}`, { align: "right", width: 500 });
    doc.fillColor("black");

    // Alt bilgi
    doc.moveDown(2);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke("#999999");
    doc.moveDown(0.5);
    doc.fontSize(8).font("Helvetica").fillColor("#666666");
    doc.text("Siparişiniz başarıyla alınmıştır.", { align: "center" });
    doc.text("En kısa zamanda mesaj yoluyla sizinle iletişime geçeceğiz.", { align: "center" });
    doc.moveDown(1);
    doc.text("Crumbella Bakery", { align: "center" });

    // PDF'i sonlandır
    doc.end();

    // Tüm chunks'i birleştir
    return new Promise((resolve) => {
      doc.on("end", () => {
        const pdfBuffer = Buffer.concat(chunks);
        const filename = `siparis-${orderData.orderId}.pdf`;

        resolve(
          new NextResponse(pdfBuffer, {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename="${filename}"`,
              "Content-Length": pdfBuffer.length.toString(),
            },
          })
        );
      });
    });
  } catch (error) {
    console.error("PDF oluşturma hatası:", error);
    return NextResponse.json({ error: "PDF oluşturulamadı" }, { status: 500 });
  }
}
