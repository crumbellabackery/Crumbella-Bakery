/**
 * Cart order email API endpoint
 */

import { Resend } from "resend";
import type { CartItem } from "@/lib/cart-types";
import { generateOrderPdfBuffer } from "@/lib/order-pdf";

export type CartOrderRequest = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  cartItems: CartItem[];
  cartTotal: number;
  note?: string;
};

function getResendErrorMessage(error: unknown): string {
  if (!error) return "Unknown email provider error";
  if (typeof error === "string") return error;
  if (typeof error === "object" && "message" in error) {
    return String((error as { message?: unknown }).message ?? "Unknown error");
  }
  return "Unknown email provider error";
}

export async function POST(request: Request) {
  try {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      // API key missing
      return Response.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const resend = new Resend(apiKey);
    const fromEmail =
      process.env.ORDER_FROM_EMAIL ||
      process.env.RESEND_FROM_EMAIL ||
      "Crumbella <onboarding@resend.dev>";
    const body: CartOrderRequest = await request.json();

    const {
      firstName,
      lastName,
      email,
      phone,
      cartItems,
      cartTotal,
      note,
    } = body;

    // Validate
    if (!firstName || !lastName || !email || !phone || !cartItems || cartItems.length === 0) {
      // Validation failed
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return Response.json(
        { error: "Invalid email" },
        { status: 400 }
      );
    }

    const orderId = `CR-${Date.now().toString().slice(-8)}`;
    const orderPdfData = {
      firstName,
      lastName,
      phone,
      orderId,
      items: cartItems.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        totalPrice: item.totalPrice,
        portionType: item.portionType,
      })),
      total: cartTotal,
    };

    // Build HTML table for cart items
    const itemsHtml = cartItems
      .map((item) => {
        const itemType = item.type === "package" ? "📦 Paket" : "🛒 Ürün";
        const portion = item.portionType ? ` (${item.portionType})` : "";
        return `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">
              ${itemType}: ${item.name}${portion}
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: center;">
              ${item.quantity}
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: right;">
              ₺${item.unitPrice.toFixed(2)}
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: right; font-weight: bold;">
              ₺${item.totalPrice.toFixed(2)}
            </td>
          </tr>
        `;
      })
      .join("");

    // Send admin email
    const adminResponse = await resend.emails.send({
      from: fromEmail,
      to: process.env.CONTACT_EMAIL || "crumbellabackery@gmail.com",
      subject: `🎁 Yeni Sipariş #${orderId} - ${firstName} ${lastName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #c89b7b; border-bottom: 2px solid #c89b7b; padding-bottom: 10px;">
            📋 Yeni Sipariş Talebi
          </h2>
          <p><strong>Sipariş No:</strong> ${orderId}</p>
          
          <h3 style="color: #333; margin-top: 20px;">Müşteri Bilgileri</h3>
          <p><strong>İsim:</strong> ${firstName} ${lastName}</p>
          <p><strong>E-posta:</strong> ${email}</p>
          <p><strong>Telefon:</strong> ${phone}</p>
          
          <h3 style="color: #333; margin-top: 20px;">Sipariş Detayları</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 10px; text-align: left; border-bottom: 2px solid #c89b7b;">Ürün</th>
                <th style="padding: 10px; text-align: center; border-bottom: 2px solid #c89b7b;">Miktar</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #c89b7b;">Birim Fiyatı</th>
                <th style="padding: 10px; text-align: right; border-bottom: 2px solid #c89b7b;">Toplam</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>
          
          <div style="background-color: #faf7f2; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <div style="display: flex; justify-content: space-between; font-size: 18px;">
              <strong>Genel Toplam:</strong>
              <strong style="color: #c89b7b; font-size: 24px;">₺${cartTotal.toFixed(2)}</strong>
            </div>
          </div>
          
          ${note ? `
            <h3 style="color: #333; margin-top: 20px;">Özel Notlar</h3>
            <p style="background-color: #f9f9f9; padding: 10px; border-left: 4px solid #c89b7b;">
              ${note}
            </p>
          ` : ""}
          
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #e0e0e0;" />
          <p style="color: #999; font-size: 12px; margin-top: 20px;">
            ✉️ Lütfen müşteriyle en kısa sürede iletişime geçerek sipariş detaylarını onaylayınız.
          </p>
        </div>
      `,
    });

    if (adminResponse.error) {
      // Email send failed
      const details = getResendErrorMessage(adminResponse.error);
      return Response.json(
        { error: "Failed to send admin email", details },
        { status: 500 }
      );
    }

    // Send customer confirmation email first (without attachment for best deliverability)
    const customerHtml = `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 640px; margin: 0 auto; background: #fffdf9; border: 1px solid #f0e7dd; border-radius: 12px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #fff6ea, #f7ead7); padding: 20px 24px; border-bottom: 1px solid #ead8c3;">
          <p style="margin: 0; font-size: 12px; letter-spacing: 1px; color: #8f6f4b; text-transform: uppercase;">Crumbella Bakery</p>
          <h2 style="margin: 8px 0 0 0; color: #5e4122; font-size: 24px;">Sipariş Onayınız Hazır</h2>
        </div>

        <div style="padding: 24px; color: #3f3a33;">
          <p style="margin-top: 0;">Merhaba <strong>${firstName} ${lastName}</strong>,</p>
          <p>Siparişiniz başarıyla alındı. Sipariş numaranız:</p>
          <p style="display: inline-block; margin: 8px 0 20px 0; padding: 10px 14px; background: #f8f1e8; border: 1px solid #e6d7c6; border-radius: 8px; font-weight: 700; color: #5e4122;">#${orderId}</p>

          <table style="width: 100%; border-collapse: collapse; margin: 4px 0 16px 0; font-size: 14px;">
            <thead>
              <tr style="background: #f7efe6;">
                <th style="padding: 10px; text-align: left; border-bottom: 1px solid #e4d4c2;">Ürün</th>
                <th style="padding: 10px; text-align: center; border-bottom: 1px solid #e4d4c2;">Miktar</th>
                <th style="padding: 10px; text-align: right; border-bottom: 1px solid #e4d4c2;">Birim</th>
                <th style="padding: 10px; text-align: right; border-bottom: 1px solid #e4d4c2;">Toplam</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div style="margin: 0 0 16px 0; padding: 14px; border-radius: 8px; background: #fff7ee; border: 1px solid #efdcc7;">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span style="font-size: 15px;">Genel Toplam</span>
              <strong style="font-size: 22px; color: #8a6438;">₺${cartTotal.toFixed(2)}</strong>
            </div>
          </div>

          ${note ? `<p style="margin: 0 0 16px 0;"><strong>Notunuz:</strong> ${note}</p>` : ""}

          <p style="margin: 0 0 6px 0;">En kısa sürede sizinle iletişime geçeceğiz.</p>
          <p style="margin: 0; color: #7d6f60; font-size: 13px;">Bu e-posta otomatik oluşturulmuştur.</p>
        </div>
      </div>
    `;

    const customerMainMail = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `Siparişiniz Alındı #${orderId}`,
      html: customerHtml,
    });

    if (customerMainMail.error) {
      const details = getResendErrorMessage(customerMainMail.error);
      return Response.json(
        {
          error: "Failed to send customer email",
          details,
          hint: "Resend domain verification ve ORDER_FROM_EMAIL değerini kontrol edin.",
        },
        { status: 500 }
      );
    }

    // Try sending PDF as a secondary email (does not block order flow)
    try {
      const pdfBuffer = await generateOrderPdfBuffer(orderPdfData);
      await resend.emails.send({
        from: fromEmail,
        to: email,
        subject: `Sipariş Belgeniz (PDF) #${orderId}`,
        html: `<p>Merhaba ${firstName}, sipariş belgeniz PDF olarak ektedir.</p>`,
        attachments: [
          {
            filename: `siparis-${orderId}.pdf`,
            content: pdfBuffer,
          },
        ],
      });
    } catch (pdfMailError) {
      console.error("PDF ekli müşteri maili gönderilemedi:", pdfMailError);
    }

    // Order processed
    return Response.json({ success: true, id: orderId });
  } catch (error) {
    // Error logged internally
    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
