import { NextRequest, NextResponse } from "next/server";
import jsPDF from "jspdf";

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

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header
    doc.setFontSize(20);
    doc.setFont("Helvetica", "bold");
    doc.text("Crumbella", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 8;

    doc.setFontSize(10);
    doc.setFont("Helvetica", "normal");
    doc.text("SİPARİŞ BELGESİ", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 10;

    // Order Info
    doc.setFontSize(9);
    doc.text(`Sipariş No: ${orderData.orderId}`, 20, yPosition);
    yPosition += 7;
    doc.text(
      `Tarih: ${new Date().toLocaleDateString("tr-TR", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })}`,
      20,
      yPosition
    );
    yPosition += 12;

    // Customer Info Box
    doc.setDrawColor(212, 175, 55);
    doc.rect(20, yPosition - 5, 170, 20);
    doc.setFontSize(9);
    doc.setFont("Helvetica", "bold");
    doc.text(`Müşteri: ${orderData.firstName} ${orderData.lastName}`, 25, yPosition);
    doc.text(`Telefon: ${orderData.phone}`, 25, yPosition + 7);
    yPosition += 28;

    // Table Headers
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    const col1X = 20;
    const col2X = 130;
    const col3X = 150;
    const col4X = 165;

    doc.text("Ürün", col1X, yPosition);
    doc.text("Miktar", col2X, yPosition);
    doc.text("Birim Fiyat", col3X, yPosition);
    doc.text("Toplam", col4X, yPosition, { align: "right" });
    yPosition += 8;

    doc.setDrawColor(212, 175, 55);
    doc.line(20, yPosition - 2, 190, yPosition - 2);
    yPosition += 3;

    // Table Rows
    doc.setFont("Helvetica", "normal");
    orderData.items.forEach((item) => {
      const productName = item.portionType
        ? `${item.name} (${item.portionType})`
        : item.name;
      doc.text(productName, col1X, yPosition, { maxWidth: 100 });
      doc.text(item.quantity.toString(), col2X, yPosition);
      doc.text(`₺${item.unitPrice.toFixed(2)}`, col3X, yPosition);
      doc.text(`₺${item.totalPrice.toFixed(2)}`, col4X, yPosition, {
        align: "right",
      });
      yPosition += 7;
    });

    // Total
    yPosition += 3;
    doc.setDrawColor(212, 175, 55);
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 7;
    doc.setFontSize(12);
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(212, 175, 55);
    doc.text(`TOPLAM: ₺${orderData.total.toFixed(2)}`, 190, yPosition, {
      align: "right",
    });

    // Footer
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(8);
    doc.setFont("Helvetica", "normal");
    yPosition = pageHeight - 30;
    doc.line(20, yPosition, 190, yPosition);
    yPosition += 5;
    doc.setFontSize(7);
    doc.text(
      "Siparişiniz başarıyla alınmıştır.",
      pageWidth / 2,
      yPosition,
      { align: "center" }
    );
    doc.text(
      "En kısa zamanda mesaj yoluyla sizinle iletişime geçeceğiz.",
      pageWidth / 2,
      yPosition + 5,
      { align: "center" }
    );
    doc.text("Crumbella Bakery", pageWidth / 2, yPosition + 12, {
      align: "center",
    });

    const pdfBuffer = Buffer.from(doc.output("arraybuffer"));
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
