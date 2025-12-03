import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OrderEmailRequest {
  customerEmail: string;
  customerName: string;
  orderNumber: string;
  status: string;
  items?: Array<{ product_name: string; quantity: number; price: number }>;
  total?: number;
}

const getStatusMessage = (status: string): { subject: string; body: string } => {
  const statusMessages: Record<string, { subject: string; body: string }> = {
    received: {
      subject: "Order Confirmed - Friends Store",
      body: "Your order has been received and is being processed. We'll notify you when it ships.",
    },
    dispatched: {
      subject: "Order Shipped - Friends Store",
      body: "Great news! Your order has been dispatched and is on its way to you.",
    },
    completed: {
      subject: "Order Delivered - Friends Store",
      body: "Your order has been successfully delivered. Thank you for shopping with Friends Store!",
    },
    returned: {
      subject: "Order Return Processed - Friends Store",
      body: "Your order return has been processed. Please contact us if you have any questions.",
    },
    cancelled: {
      subject: "Order Cancelled - Friends Store",
      body: "Your order has been cancelled. If you didn't request this, please contact us immediately.",
    },
  };
  return statusMessages[status] || { subject: "Order Update - Friends Store", body: "Your order status has been updated." };
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { customerEmail, customerName, orderNumber, status, items, total }: OrderEmailRequest = await req.json();

    console.log(`Sending email to ${customerEmail} for order ${orderNumber} with status ${status}`);

    const smtpHost = Deno.env.get("SMTP_HOST");
    const smtpPort = parseInt(Deno.env.get("SMTP_PORT") || "587");
    const smtpUser = Deno.env.get("SMTP_USER");
    const smtpPass = Deno.env.get("SMTP_PASS");
    const fromEmail = Deno.env.get("SMTP_FROM_EMAIL");

    if (!smtpHost || !smtpUser || !smtpPass || !fromEmail) {
      throw new Error("SMTP configuration is incomplete");
    }

    const client = new SMTPClient({
      connection: {
        hostname: smtpHost,
        port: smtpPort,
        tls: true,
        auth: {
          username: smtpUser,
          password: smtpPass,
        },
      },
    });

    const { subject, body } = getStatusMessage(status);

    let itemsHtml = "";
    if (items && items.length > 0) {
      const rows = items
        .map(
          (item) =>
            `<tr><td style="padding: 10px; border-bottom: 1px solid #eee;">${item.product_name}</td><td style="padding: 10px; text-align: center; border-bottom: 1px solid #eee;">${item.quantity}</td><td style="padding: 10px; text-align: right; border-bottom: 1px solid #eee;">₹${item.price}</td></tr>`
        )
        .join("");

      const totalRow = total
        ? `<tr style="font-weight: bold;"><td colspan="2" style="padding: 10px; text-align: right;">Total:</td><td style="padding: 10px; text-align: right;">₹${total}</td></tr>`
        : "";

      itemsHtml = `<table style="width: 100%; border-collapse: collapse; margin: 20px 0;"><tr style="background: #f5f5f5;"><th style="padding: 10px; text-align: left; border-bottom: 1px solid #ddd;">Product</th><th style="padding: 10px; text-align: center; border-bottom: 1px solid #ddd;">Qty</th><th style="padding: 10px; text-align: right; border-bottom: 1px solid #ddd;">Price</th></tr>${rows}${totalRow}</table>`;
    }

    const htmlContent = `<!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2d5016 0%, #4a7c23 100%); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; }
            .status-badge { display: inline-block; padding: 8px 16px; background: #4a7c23; color: white; border-radius: 20px; font-weight: bold; text-transform: capitalize; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1 style="margin: 0;">🌿 Friends Store</h1>
              <p style="margin: 10px 0 0 0;">Beautiful Artificial Plants for Your Home</p>
            </div>
            <div class="content">
              <h2>Hello ${customerName}!</h2>
              <p>${body}</p>
              <p><strong>Order Number:</strong> ${orderNumber}</p>
              <p><strong>Status:</strong> <span class="status-badge">${status}</span></p>
              ${itemsHtml}
              <p>If you have any questions, feel free to reach out to us on WhatsApp.</p>
              <p>Thank you for choosing Friends Store!</p>
            </div>
            <div class="footer">
              <p>© 2024 Friends Store. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>`;

    await client.send({
      from: fromEmail,
      to: customerEmail,
      subject: subject,
      html: htmlContent,
    });

    await client.close();

    console.log("Email sent successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending email:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
