import { NextRequest, NextResponse } from "next/server";
import { generateOrderPdfBuffer, type OrderPdfData } from "@/lib/order-pdf";

export async function POST(request: NextRequest) {
  try {
    let orderData: OrderPdfData;
    let dispositionType: "attachment" | "inline" = "attachment";
    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      orderData = await request.json();
      const queryDisposition = request.nextUrl.searchParams.get("disposition");
      if (queryDisposition === "inline") {
        dispositionType = "inline";
      }
    } else {
      const formData = await request.formData();
      const payload = formData.get("payload");
      const formDisposition = formData.get("disposition");
      if (formDisposition === "inline") {
        dispositionType = "inline";
      }
      if (typeof payload !== "string") {
        return NextResponse.json(
          { error: "Geçersiz sipariş verisi" },
          { status: 400 }
        );
      }
      orderData = JSON.parse(payload) as OrderPdfData;
    }

    const pdfBuffer = await generateOrderPdfBuffer(orderData);
    const filename = `siparis-${orderData.orderId}.pdf`;

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `${dispositionType}; filename="${filename}"`,
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
