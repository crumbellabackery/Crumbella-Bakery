import { NextRequest, NextResponse } from "next/server";
import PDFDocument from "pdfkit";

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

// Convert mm to PDF points (1mm = 2.8346pt)
const pt = (mm: number) => mm * 2.8346;

export async function POST(request: NextRequest) {
  try {
    let orderData: OrderData;
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      orderData = await request.json();
    } else {
      const formData = await request.formData();
      const payload = formData.get("payload");
      if (typeof payload !== "string") {
        return NextResponse.json(
          { error: "Geçersiz sipariş verisi" },
          { status: 400 }
        );
      }
      orderData = JSON.parse(payload) as OrderData;
    }

    const doc = new PDFDocument({ size: "A4", margin: 0, autoFirstPage: true });
    const chunks: Uint8Array[] = [];
    doc.on("data", (chunk: Uint8Array) => chunks.push(chunk));
    const pdfReady = new Promise<void>((resolve) => doc.on("end", resolve));

    const pageWidth = doc.page.width;   // 595.28pt for A4
    const pageHeight = doc.page.height; // 841.89pt for A4
    let y = pt(20);

    // Header
    doc
      .font("Helvetica-Bold")
      .fontSize(20)
      .fillColor("black")
      .text("Crumbella", 0, y, { align: "center", width: pageWidth, lineBreak: false });
    y += pt(8);

    doc
      .font("Helvetica")
      .fontSize(10)
      .text("SİPARİŞ BELGESİ", 0, y, { align: "center", width: pageWidth, lineBreak: false });
    y += pt(10);

    // Order Info
    doc
      .font("Helvetica")
      .fontSize(9)
      .text(`Sipariş No: ${orderData.orderId}`, pt(20), y, { lineBreak: false });
    y += pt(7);
    doc.text(
      `Tarih: ${new Date().toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })}`,
      pt(20),
      y,
      { lineBreak: false }
    );
    y += pt(12);

    // Customer Info Box
    doc.strokeColor("#D4AF37").rect(pt(20), y - pt(5), pt(170), pt(20)).stroke();
    doc
      .font("Helvetica-Bold")
      .fontSize(9)
      .fillColor("black")
      .text(`Müşteri: ${orderData.firstName} ${orderData.lastName}`, pt(25), y, { lineBreak: false });
    doc.text(`Telefon: ${orderData.phone}`, pt(25), y + pt(7), { lineBreak: false });
    y += pt(28);

    // Table Headers
    const col1X = pt(20);
    const col2X = pt(130);
    const col3X = pt(150);
    const col4X = pt(165);
    const rightEdge = pt(190);

    doc.font("Helvetica-Bold").fontSize(8).fillColor("black");
    doc.text("Ürün", col1X, y, { width: col2X - col1X - pt(2), lineBreak: false });
    doc.text("Miktar", col2X, y, { width: col3X - col2X - pt(2), lineBreak: false });
    doc.text("Birim Fiyat", col3X, y, { width: col4X - col3X - pt(2), lineBreak: false });
    doc.text("Toplam", col4X, y, { width: rightEdge - col4X, lineBreak: false });
    y += pt(8);

    doc.moveTo(pt(20), y - pt(2)).lineTo(rightEdge, y - pt(2)).strokeColor("#D4AF37").stroke();
    y += pt(3);

    // Table Rows
    doc.font("Helvetica").fontSize(8).fillColor("black");
    orderData.items.forEach((item) => {
      const productName = item.portionType
        ? `${item.name} (${item.portionType})`
        : item.name;
      doc.text(productName, col1X, y, { width: col2X - col1X - pt(2), lineBreak: false });
      doc.text(item.quantity.toString(), col2X, y, { width: col3X - col2X - pt(2), lineBreak: false });
      doc.text(`₺${item.unitPrice.toFixed(2)}`, col3X, y, { width: col4X - col3X - pt(2), lineBreak: false });
      doc.text(`₺${item.totalPrice.toFixed(2)}`, col4X, y, { width: rightEdge - col4X, lineBreak: false });
      y += pt(7);
    });

    // Total
    y += pt(3);
    doc.moveTo(pt(20), y).lineTo(rightEdge, y).strokeColor("#D4AF37").stroke();
    y += pt(7);
    doc
      .font("Helvetica-Bold")
      .fontSize(12)
      .fillColor("#D4AF37")
      .text(`TOPLAM: ₺${orderData.total.toFixed(2)}`, pt(20), y, { align: "right", width: pt(170) });

    // Footer
    const footerY = pageHeight - pt(30);
    doc.moveTo(pt(20), footerY).lineTo(rightEdge, footerY).strokeColor("black").stroke();
    doc
      .fillColor("black")
      .font("Helvetica")
      .fontSize(7)
      .text("Siparişiniz başarıyla alınmıştır.", 0, footerY + pt(5), { align: "center", width: pageWidth, lineBreak: false });
    doc.text(
      "En kısa zamanda mesaj yoluyla sizinle iletişime geçeceğiz.",
      0,
      footerY + pt(10),
      { align: "center", width: pageWidth, lineBreak: false }
    );
    doc.text("Crumbella Bakery", 0, footerY + pt(17), { align: "center", width: pageWidth, lineBreak: false });

    doc.end();
    await pdfReady;
    const pdfBuffer = Buffer.concat(chunks);
    const filename = `siparis-${orderData.orderId}.pdf`;

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": pdfBuffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("PDF oluşturma hatası:", error);
    return NextResponse.json(
      { error: "PDF oluşturulamadı" },
      { status: 500 }
    );
  }
}
