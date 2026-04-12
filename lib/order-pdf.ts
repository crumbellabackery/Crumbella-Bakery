import PDFDocument from "pdfkit";

export interface OrderPdfItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  portionType?: string;
}

export interface OrderPdfData {
  firstName: string;
  lastName: string;
  phone: string;
  orderId: string;
  items: OrderPdfItem[];
  total: number;
}

// Convert mm to PDF points (1mm = 2.8346pt)
const pt = (mm: number) => mm * 2.8346;

export async function generateOrderPdfBuffer(orderData: OrderPdfData) {
  const doc = new PDFDocument({ size: "A4", margin: 0, autoFirstPage: true });
  const chunks: Uint8Array[] = [];
  doc.on("data", (chunk: Uint8Array) => chunks.push(chunk));
  const pdfReady = new Promise<void>((resolve) => doc.on("end", resolve));

  const pageWidth = doc.page.width;
  const pageHeight = doc.page.height;
  let y = pt(20);

  doc
    .font("Helvetica-Bold")
    .fontSize(20)
    .fillColor("black")
    .text("Crumbella", 0, y, { align: "center", width: pageWidth, lineBreak: false });
  y += pt(8);

  doc
    .font("Helvetica")
    .fontSize(10)
    .text("SIPARIS BELGESI", 0, y, { align: "center", width: pageWidth, lineBreak: false });
  y += pt(10);

  doc
    .font("Helvetica")
    .fontSize(9)
    .text(`Siparis No: ${orderData.orderId}`, pt(20), y, { lineBreak: false });
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

  doc.strokeColor("#D4AF37").rect(pt(20), y - pt(5), pt(170), pt(20)).stroke();
  doc
    .font("Helvetica-Bold")
    .fontSize(9)
    .fillColor("black")
    .text(`Musteri: ${orderData.firstName} ${orderData.lastName}`, pt(25), y, { lineBreak: false });
  doc.text(`Telefon: ${orderData.phone}`, pt(25), y + pt(7), { lineBreak: false });
  y += pt(28);

  const col1X = pt(20);
  const col2X = pt(130);
  const col3X = pt(150);
  const col4X = pt(165);
  const rightEdge = pt(190);

  doc.font("Helvetica-Bold").fontSize(8).fillColor("black");
  doc.text("Urun", col1X, y, { width: col2X - col1X - pt(2), lineBreak: false });
  doc.text("Miktar", col2X, y, { width: col3X - col2X - pt(2), lineBreak: false });
  doc.text("Birim Fiyat", col3X, y, { width: col4X - col3X - pt(2), lineBreak: false });
  doc.text("Toplam", col4X, y, { width: rightEdge - col4X, lineBreak: false });
  y += pt(8);

  doc.moveTo(pt(20), y - pt(2)).lineTo(rightEdge, y - pt(2)).strokeColor("#D4AF37").stroke();
  y += pt(3);

  doc.font("Helvetica").fontSize(8).fillColor("black");
  orderData.items.forEach((item) => {
    const productName = item.portionType
      ? `${item.name} (${item.portionType})`
      : item.name;
    doc.text(productName, col1X, y, { width: col2X - col1X - pt(2), lineBreak: false });
    doc.text(item.quantity.toString(), col2X, y, { width: col3X - col2X - pt(2), lineBreak: false });
    doc.text(`TL${item.unitPrice.toFixed(2)}`, col3X, y, { width: col4X - col3X - pt(2), lineBreak: false });
    doc.text(`TL${item.totalPrice.toFixed(2)}`, col4X, y, { width: rightEdge - col4X, lineBreak: false });
    y += pt(7);
  });

  y += pt(3);
  doc.moveTo(pt(20), y).lineTo(rightEdge, y).strokeColor("#D4AF37").stroke();
  y += pt(7);
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor("#D4AF37")
    .text(`TOPLAM: TL${orderData.total.toFixed(2)}`, pt(20), y, { align: "right", width: pt(170) });

  const footerY = pageHeight - pt(30);
  doc.moveTo(pt(20), footerY).lineTo(rightEdge, footerY).strokeColor("black").stroke();
  doc
    .fillColor("black")
    .font("Helvetica")
    .fontSize(7)
    .text("Siparisiniz basariyla alinmistir.", 0, footerY + pt(5), { align: "center", width: pageWidth, lineBreak: false });
  doc.text(
    "En kisa zamanda mesaj yoluyla sizinle iletisime gececegiz.",
    0,
    footerY + pt(10),
    { align: "center", width: pageWidth, lineBreak: false }
  );
  doc.text("Crumbella Bakery", 0, footerY + pt(17), { align: "center", width: pageWidth, lineBreak: false });

  doc.end();
  await pdfReady;
  return Buffer.concat(chunks);
}