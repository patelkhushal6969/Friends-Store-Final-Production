import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactPayload {
  name: string;
  email: string;
  subject: string;
  message: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, subject, message }: ContactPayload = await req.json();

    const smtpHost = Deno.env.get("SMTP_HOST");
    const smtpPort = parseInt(Deno.env.get("SMTP_PORT") || "587");
    const smtpUser = Deno.env.get("SMTP_USER");
    const smtpPass = Deno.env.get("SMTP_PASS");
    const fromEmail = Deno.env.get("SMTP_FROM_EMAIL");
    const toEmail = Deno.env.get("CONTACT_TO_EMAIL") || fromEmail;

    if (!smtpHost || !smtpUser || !smtpPass || !fromEmail || !toEmail) {
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

    const html = `
      <div style="font-family: Inter, system-ui, Arial; background:#f8fafc; padding:24px">
        <div style="max-width:640px; margin:0 auto; background:#ffffff; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden">
          <div style="padding:20px; border-bottom:1px solid #e5e7eb;">
            <h2 style="margin:0; font-size:18px; color:#111827">New contact message</h2>
            <p style="margin:4px 0 0; font-size:12px; color:#6b7280">Friends Store</p>
          </div>
          <div style="padding:20px;">
            <table style="width:100%; border-collapse:collapse; font-size:14px; color:#111827;">
              <tr>
                <td style="padding:8px; width:120px; color:#6b7280">Name</td>
                <td style="padding:8px">${name}</td>
              </tr>
              <tr>
                <td style="padding:8px; width:120px; color:#6b7280">Email</td>
                <td style="padding:8px">${email}</td>
              </tr>
              <tr>
                <td style="padding:8px; width:120px; color:#6b7280">Subject</td>
                <td style="padding:8px">${subject}</td>
              </tr>
            </table>
            <div style="margin-top:16px; padding:12px; background:#f9fafb; border:1px solid #e5e7eb; border-radius:8px;">
              <div style="font-size:12px; color:#6b7280; margin-bottom:6px">Message</div>
              <div style="white-space:pre-wrap; line-height:1.6">${message}</div>
            </div>
          </div>
          <div style="padding:16px; border-top:1px solid #e5e7eb; font-size:12px; color:#6b7280">
            This email was sent via Friends Store contact form.
          </div>
        </div>
      </div>
    `;

    await client.send({
      from: fromEmail,
      to: toEmail,
      subject: `New contact message: ${subject}`,
      html,
    });

    await client.close();

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  }
};

serve(handler);

