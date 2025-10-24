import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const SMTP_CONFIG = {
  host: 'smtp.hostinger.com',
  port: 465,
  username: 'orders@veloratradings.com',
  password: 'Velora@123',
  from: 'orders@veloratradings.com',
  fromName: 'Velora Tradings'
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
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
          <p style="margin: 5px 0;">${data.shippingAddress.firstName} ${data.shippingAddress.lastName}</p>
          <p style="margin: 5px 0;">${data.shippingAddress.address}</p>
          <p style="margin: 5px 0;">${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zipCode}</p>
          <p style="margin: 5px 0;">Phone: ${data.shippingAddress.phone}</p>
        </div>
        
        <div style="margin-top: 30px; padding: 20px; background: #f0f0f0; border-radius: 5px; text-align: center;">
          <p style="margin: 0;">Need help? Contact us at <a href="mailto:orders@veloratradings.com" style="color: #815536;">orders@veloratradings.com</a></p>
        </div>
      </div>
      
      <div style="background: #815536; padding: 20px; text-align: center; border-radius: 0 0 10px 10px;">
        <p style="color: white; margin: 0; font-size: 14px;">© 2025 Velora Tradings. All rights reserved.</p>
      </div>
    </body>
    </html>
  `;
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.smtp2go.com/v3/email/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Smtp2go-Api-Key': 'api-' + SMTP_CONFIG.password,
      },
      body: JSON.stringify({
        sender: `${SMTP_CONFIG.fromName} <${SMTP_CONFIG.from}>`,
        to: [to],
        subject: subject,
        html_body: html,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('SMTP2GO API error:', errorText);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending email:', error);
    return false;
  }
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { to, subject, orderData }: EmailRequest = await req.json();

    if (!to || !subject || !orderData) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const html = generateOrderEmailHTML(orderData);
    const sent = await sendEmail(to, subject, html);

    if (sent) {
      return new Response(
        JSON.stringify({ success: true, message: 'Email sent successfully' }),
        {
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    } else {
      return new Response(
        JSON.stringify({ error: 'Failed to send email' }),
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
