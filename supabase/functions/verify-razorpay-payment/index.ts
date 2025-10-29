import { createClient } from 'npm:@supabase/supabase-js@2.55.0';
import { crypto } from 'https://deno.land/std@0.224.0/crypto/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Client-Info, Apikey',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderData } = await req.json();

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !orderData) {
      return new Response(
        JSON.stringify({ error: 'Missing required payment verification data' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: settingsData, error: settingsError } = await supabase
      .from('site_settings')
      .select('key, value')
      .in('key', ['razorpay_key_secret'])
      .maybeSingle();

    if (settingsError || !settingsData) {
      console.error('Error fetching Razorpay settings:', settingsError);
      return new Response(
        JSON.stringify({ error: 'Payment gateway configuration error' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const razorpayKeySecret = settingsData.value;

    if (!razorpayKeySecret) {
      return new Response(
        JSON.stringify({ error: 'Razorpay not configured' }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const generatedSignature = await crypto.subtle.digest(
      'SHA-256',
      new TextEncoder().encode(`${razorpay_order_id}|${razorpay_payment_id}${razorpayKeySecret}`)
    );

    const generatedSignatureHex = Array.from(new Uint8Array(generatedSignature))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    if (generatedSignatureHex !== razorpay_signature) {
      return new Response(
        JSON.stringify({ error: 'Invalid payment signature', verified: false }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Invalid user token' }),
        {
          status: 401,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        guest_email: orderData.guest_email || null,
        total_amount: orderData.total_amount,
        status: 'confirmed',
        payment_method: 'razorpay',
        payment_status: 'paid',
        razorpay_order_id,
        razorpay_payment_id,
        shipping_address: orderData.shipping_address,
        billing_address: orderData.billing_address,
        items: orderData.items,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order:', orderError);
      return new Response(
        JSON.stringify({ error: 'Failed to create order', details: orderError }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    await supabase
      .from('cart_items')
      .delete()
      .eq('user_id', user.id);

    return new Response(
      JSON.stringify({ verified: true, order }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error: any) {
    console.error('Error in verify-razorpay-payment:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});