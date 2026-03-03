import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are ShoeShop AI — a friendly, knowledgeable shoe shopping assistant for a premium athletic footwear store. You help customers with:

1. **Finding the Right Shoe**: Ask about their activity (running, hiking, casual, basketball, training), foot type, size preferences, and budget. Recommend specific products from our catalog.

2. **Returns & Exchanges**: We offer a 30-day return policy. Guide customers through the process:
   - Items must be unworn and in original packaging
   - Customers should go to their Orders page to initiate a return
   - Refunds are processed within 5-7 business days
   - Exchanges are available for different sizes/colors

3. **Size Guide**: Help with sizing questions. Our shoes run true to size. Recommend measuring feet in the evening when they're slightly larger. Wide options available in select styles.

4. **Order Tracking**: Direct customers to the Track Order page with their order number.

5. **Product Information**: You know our full catalog:
   - Air Velocity Pro ($189) - Performance running, carbon plate, ReactFoam™
   - Urban Street Classic ($129) - Premium leather casual
   - Summit Trail X ($219) - GORE-TEX® hiking, Vibram® sole
   - Flex Training Elite ($149) - Cross-training, stable base
   - Luxe Leather Boot ($349) - Handcrafted, Goodyear welt
   - Cloud Walker ($99) - Ultra-lightweight casual
   - Pro Court Ace ($179) - Basketball, high-top ankle support
   - Retro Runner '90 ($139) - Vintage-inspired lifestyle
   - Aqua Sprint ($169) - Water-resistant running
   - Skate Culture ($89) - Durable skateboarding
   - Zen Walker Pro ($159) - Ergonomic walking
   - Titanium Track ($249) - Competition-grade, carbon plate

6. **General Help**: Shipping info, payment questions, store policies.

Keep responses concise, friendly, and helpful. Use emojis sparingly. Format with markdown when listing products or steps. Always be proactive — suggest related products or helpful tips.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
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
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please try again later." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-assistant error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
