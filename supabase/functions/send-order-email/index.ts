import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailRequest {
  to: string;
  subject: string;
  orderData: {
    orderId: string;
    customerName: string;
    orderItems: Array<{
      name: string;
      quantity: number;
      price: number;
    }>;
    totalAmount: number;
    shippingAddress: any;
    paymentMethod: string;
    orderDate: string;
  };
}

function generateOrderEmailHTML(data: EmailRequest['orderData']): string {
  const itemsHTML = data.orderItems.map(item => `
    <tr>
      <td style="padding: 12px; border-bottom: 1px solid #eee;">${item.name}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${item.price.toLocaleString()}</td>
      <td style="padding: 12px; border-bottom: 1px solid #eee; text-align: right;">₹${(item.price * item.quantity).toLocaleString()}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(to right, #815536, #c9baa8); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0; font-size: 28px;">Velora Tradings</h1>
        <p style="color: #f5f5f5; margin: 10px 0 0 0;">Order Confirmation</p>
      </div>

      <div style="background: white; padding: 30px; border: 1px solid #ddd; border-top: none;">
        <h2 style="color: #815536; margin-top: 0;">Thank you for your order!</h2>
        <p>Hi ${data.customerName},</p>
        <p>We're excited to confirm that we've received your order. Your purchase is being processed and will be shipped soon.</p>

        <div style="background: #f8f8f8; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #815536;">Order Details</h3>
          <p style="margin: 5px 0;"><strong>Order ID:</strong> #${data.orderId.slice(-8)}</p>
          <p style="margin: 5px 0;"><strong>Order Date:</strong> ${new Date(data.orderDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
          <p style="margin: 5px 0;"><strong>Payment Method:</strong> ${data.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
        </div>

        <h3 style="color: #815536; margin-top: 30px;">Order Items</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 15px 0;">
          <thead>
            <tr style="background: #f8f8f8;">
              <th style="padding: 12px; text-align: left; border-bottom: 2px solid #815536;">Product</th>
              <th style="padding: 12px; text-align: center; border-bottom: 2px solid #815536;">Qty</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #815536;">Price</th>
              <th style="padding: 12px; text-align: right; border-bottom: 2px solid #815536;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHTML}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="padding: 15px; text-align: right; font-weight: bold; font-size: 16px;">Total Amount:</td>
              <td style="padding: 15px; text-align: right; font-weight: bold; font-size: 16px; color: #815536;">₹${data.totalAmount.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>

        <h3 style="color: #815536; margin-top: 30px;">Shipping Address</h3>
        <div style="background: #f8f8f8; padding: 15px; border-radius: 5px;">
          <p style="margin: 5px 0;">${data.shippingAddress.full_name}</p>
          <p style="margin: 5px 0;">${data.shippingAddress.address_line_1}${data.shippingAddress.address_line_2 ? ', ' + data.shippingAddress.address_line_2 : ''}</p>
          <p style="margin: 5px 0;">${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.postal_code}</p>
          <p style="margin: 5px 0;">Phone: ${data.shippingAddress.phone}</p>
        </div>

        <div style="margin-top: 30px; padding: 20px; background: #f0f0f0; border-radius: 5px; text-align: center;">
          <p style="margin: 0;">Need help? Contact us at <a href="mailto:${Deno.env.get('SMTP_FROM_EMAIL') || 'orders@veloratradings.com'}" style="color: #815536;">${Deno.env.get('SMTP_FROM_EMAIL') || 'orders@veloratradings.com'}</a></p>
        </div>
      </div>

      <div style="background: #815536; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
        <p style="color: white; margin: 0; font-size: 14px;">© 2025 Velora Tradings. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
}

async function sendEmail(to: string, subject: string, html: string): Promise<{ success: boolean; error?: string }> {
  try {
    const smtpHost = Deno.env.get('SMTP_HOST');
    const smtpPort = Deno.env.get('SMTP_PORT');
    const smtpUser = Deno.env.get('SMTP_USER');
    const smtpPassword = Deno.env.get('SMTP_PASSWORD');
    const smtpFromEmail = Deno.env.get('SMTP_FROM_EMAIL');
    const smtpFromName = Deno.env.get('SMTP_FROM_NAME') || 'Velora Tradings';

    if (!smtpHost || !smtpPort || !smtpUser || !smtpPassword || !smtpFromEmail) {
      console.error('Missing SMTP configuration. Please set environment variables.');
      return { success: false, error: 'SMTP configuration missing' };
    }

    const response = await fetch('https://api.smtp2go.com/v3/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Smtp2go-Api-Key': smtpPassword,
      },
      body: JSON.stringify({
        sender: `${smtpFromName} <${smtpFromEmail}>`,
        to: [to],
        subject: subject,
        html_body: html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SMTP2GO API error:', errorText);
      return { success: false, error: `SMTP error: ${errorText}` };
    }

    const result = await response.json();
    console.log('Email sent successfully:', result);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error: String(error) };
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { to, subject, orderData, sendToAdmin }: EmailRequest & { sendToAdmin?: boolean } = await req.json();

    if (!subject || !orderData) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    let recipientEmail = to;

    if (sendToAdmin) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
      const supabase = createClient(supabaseUrl, supabaseKey);

      const { data: settingsData, error: settingsError } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'adminEmail')
        .maybeSingle();

      if (!settingsError && settingsData) {
        recipientEmail = settingsData.value as string;
      } else {
        recipientEmail = 'orders@veloratradings.com';
      }
    }

    if (!recipientEmail) {
      return new Response(
        JSON.stringify({ error: 'No recipient email address' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const html = generateOrderEmailHTML(orderData);
    const result = await sendEmail(recipientEmail, subject, html);

    if (result.success) {
      return new Response(
        JSON.stringify({ success: true, message: 'Email sent successfully' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      return new Response(
        JSON.stringify({ error: result.error || 'Failed to send email' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }
  } catch (error) {
    console.error('Error in send-order-email function:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});