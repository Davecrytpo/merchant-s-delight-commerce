import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RETURN_POLICY = {
  windowDays: 14,
  eligibleStatuses: ["delivered"],
  nonReturnableCategories: [] as string[],
};

const SYSTEM_PROMPT = `You are the ShoeShop Return Assistant — a world-class dedicated AI that helps customers process product returns. You are empathetic, efficient, and professional.

## Your Core Capabilities:

### 1. Order Verification
- **PRIMARY STEP:** Always ask for the Order Number first (e.g., ORD-XXXX).
- Once provided, use the system context to verify the order.
- If the order belongs to a guest or needs email verification, ask for the email used for the purchase.

### 2. Return Eligibility Check
- Verify that the product was purchased on our platform.
- **WINDOW CHECK:** Confirm the return request is within the allowed window of ${RETURN_POLICY.windowDays} days from delivery.
- **STATUS CHECK:** Ensure the order status is "delivered".
- If not eligible, explain the EXACT reason (e.g., "Return window expired" or "Order not yet delivered").

### 3. Reason for Return
Proactively ask for the reason for return and provide options:
- Wrong size
- Defective product
- Not as described
- Changed mind
- Other (ask for details)

### 4. Return Resolution Options
Offer clear choices:
- **Refund** to original payment method.
- **Store credit** (provide a 10% bonus as incentive).
- **Exchange** for another size or product.

### 5. Return Instructions & Generation
Once confirmed, provide:
- A unique **Return Request ID** (RET-XXXX).
- Specific packaging instructions.
- The Return Shipping Address: "ShoeShop Returns Center, 123 Return Way, Suite 100, New York, NY 10001".
- Estimated processing time (usually 7 business days).

### 6. Return Status Tracking
- Help customers track existing returns by their RET-XXXX ID.
- Provide real-time status updates from the system context.

## Critical Interaction Rules:
- **Accuracy First:** Never guess order details. Use the [SYSTEM CONTEXT] provided in the conversation.
- **Empathy:** Acknowledge that returns can be frustrating. Use phrases like "I'm sorry the item didn't work out for you."
- **Clarity:** Use bold text for IDs and status names.
- **Step-by-Step:** Do not overwhelm the customer. Handle one piece of information at a time.

When you need to look up an order, call the lookup_order tool.
When you need to create a return, call the create_return tool.
When you need to check return status, call the check_return_status tool.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, action, payload } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Direct database actions (called from client when AI instructs)
    if (action === "lookup_order") {
      const { order_number, email, user_id } = payload;
      let query = supabase.from("orders").select("*").eq("order_number", order_number);
      
      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      
      if (!data) {
        return new Response(JSON.stringify({ found: false }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Security: If user_id is provided, it must match. 
      // If not, or if it doesn't match, we MUST verify the email.
      const orderEmail = (data.shipping_address as any)?.email;
      const isOwner = user_id && data.user_id === user_id;
      const emailMatches = email && orderEmail && email.toLowerCase() === orderEmail.toLowerCase();

      if (!isOwner && !emailMatches) {
        return new Response(JSON.stringify({ 
          found: true, 
          needs_verification: true,
          message: "Please provide the email address used for this order to verify your identity."
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const deliveredDate = data.updated_at;
      const daysSinceDelivery = Math.floor(
        (Date.now() - new Date(deliveredDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      const eligible = data.status === "delivered" && daysSinceDelivery <= RETURN_POLICY.windowDays;

      return new Response(JSON.stringify({
        found: true,
        order: {
          id: data.id,
          order_number: data.order_number,
          status: data.status,
          total: data.total,
          items: data.items,
          created_at: data.created_at,
          updated_at: data.updated_at,
        },
        eligible,
        reason: !eligible
          ? data.status !== "delivered"
            ? `Order status is "${data.status}". Only delivered orders can be returned.`
            : `Return window of ${RETURN_POLICY.windowDays} days has expired (${daysSinceDelivery} days since delivery).`
          : null,
        days_remaining: eligible ? RETURN_POLICY.windowDays - daysSinceDelivery : 0,
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "create_return") {
      const { order_id, order_number, user_id, reason, reason_detail, resolution, items } = payload;
      const returnId = `RET-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

      const { data, error } = await supabase.from("return_requests").insert({
        order_id,
        order_number,
        user_id,
        reason,
        reason_detail: reason_detail || null,
        resolution: resolution || "refund",
        return_request_id: returnId,
        items: items || [],
        shipping_address: "ShoeShop Returns Center, 123 Return Way, Suite 100, New York, NY 10001",
        estimated_processing_days: 7,
      }).select().single();

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, return_request: data, return_id: returnId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "check_return_status") {
      const { return_request_id, user_id } = payload;
      let query = supabase.from("return_requests").select("*");
      if (return_request_id) query = query.eq("return_request_id", return_request_id);
      if (user_id) query = query.eq("user_id", user_id);
      const { data, error } = await query.order("created_at", { ascending: false });
      if (error) throw error;
      return new Response(JSON.stringify({ returns: data || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Streaming AI conversation
    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please try again later." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("return-assistant error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
