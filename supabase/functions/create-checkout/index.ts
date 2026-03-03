import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? ""
  );

  try {
    const { items, shippingCost, tax, shippingAddress, shippingMethod } = await req.json();

    if (!items || items.length === 0) {
      throw new Error("No items in cart");
    }

    // Get user if authenticated
    const authHeader = req.headers.get("Authorization");
    let user = null;
    if (authHeader) {
      const token = authHeader.replace("Bearer ", "");
      const { data } = await supabaseClient.auth.getUser(token);
      user = data.user;
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Check for existing Stripe customer
    let customerId: string | undefined;
    if (user?.email) {
      const customers = await stripe.customers.list({
        email: user.email,
        limit: 1,
      });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    // Build line items from cart
    const lineItems = items.map((item: any) => ({
      price_data: {
        currency: "usd",
        product_data: {
          name: item.product_name,
          description: `Size: ${item.variant_size} | Color: ${item.variant_color}`,
          images: item.image ? [item.image] : undefined,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Add shipping as a line item if > 0
    if (shippingCost > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: `Shipping - ${shippingMethod || "Standard"}`,
            description: "Shipping & handling",
          },
          unit_amount: Math.round(shippingCost * 100),
        },
        quantity: 1,
      });
    }

    // Add tax as a line item
    if (tax > 0) {
      lineItems.push({
        price_data: {
          currency: "usd",
          product_data: {
            name: "Tax",
            description: "Sales tax",
          },
          unit_amount: Math.round(tax * 100),
        },
        quantity: 1,
      });
    }

    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const origin = req.headers.get("origin") || "https://id-preview--6f830c61-ce0a-4e28-a809-cdcd46e64fdc.lovable.app";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user?.email || undefined,
      line_items: lineItems,
      mode: "payment",
      success_url: `${origin}/checkout?success=true&order=${orderNumber}`,
      cancel_url: `${origin}/checkout?canceled=true`,
      metadata: {
        order_number: orderNumber,
        user_id: user?.id || "guest",
        shipping_address: JSON.stringify(shippingAddress || {}),
        shipping_method: shippingMethod || "",
      },
    });

    // Create order in database
    const subtotal = items.reduce(
      (sum: number, i: any) => sum + i.price * i.quantity,
      0
    );
    const total = subtotal + (shippingCost || 0) + (tax || 0);

    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    await serviceClient.from("orders").insert({
      user_id: user?.id || null,
      order_number: orderNumber,
      status: "pending",
      items: items,
      subtotal,
      shipping: shippingCost || 0,
      tax: tax || 0,
      total,
      shipping_address: shippingAddress || null,
      payment_method: "stripe",
    });

    return new Response(
      JSON.stringify({ url: session.url, orderNumber }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Checkout error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
