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
      from: "Crumbella <onboarding@resend.dev>",
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
      return Response.json(
        { error: "Failed to send email" },
        { status: 500 }
      );
    }

    // Send customer confirmation email
    const pdfBuffer = await generateOrderPdfBuffer(orderPdfData);
    const customerResponse = await resend.emails.send({
      from: "Crumbella <onboarding@resend.dev>",
      to: email,
      subject: `Sipariş Belgeniz Hazır #${orderId}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #c89b7b; border-bottom: 2px solid #c89b7b; padding-bottom: 10px;">
            Sipariş Onayı
          </h2>
          <p>Merhaba ${firstName} ${lastName},</p>
          <p>Siparişiniz tarafımıza ulaştı. Sipariş numaranız: <strong>${orderId}</strong></p>

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

          <p>En kısa sürede sizinle iletişime geçeceğiz.</p>
          <p>Crumbella Bakery</p>
        </div>
      `,
      attachments: [
        {
          filename: `siparis-${orderId}.pdf`,
          content: pdfBuffer,
        },
      ],
    });

    if (customerResponse.error) {
      return Response.json(
        { error: "Failed to send customer email" },
        { status: 500 }
      );
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
