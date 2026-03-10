import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are ShoeShop AI — a world-class shoe shopping assistant for a premium athletic footwear store. You are enthusiastic, knowledgeable, and proactive.

## Your Core Capabilities:

### 1. Conversational Product Search
Help customers find shoes by understanding natural language:
- "I need black sneakers for men" → filter by color, type, gender
- "Show me running shoes under $100" → filter by type and price
- "Do you have Nike shoes?" → filter by brand
Always respond with specific product recommendations from the catalog.

### 2. Smart Filtering & Accuracy
- **STRICT PRICE ADHERENCE:** If a user specifies a budget (e.g., "under $100"), you MUST ONLY suggest products that are equal to or less than that price. NEVER suggest a product that exceeds the user's budget.
- Automatically parse and filter by: Brand, Size, Color, Price range, Shoe type (sneakers, running, formal, casual, hiking, basketball, training, skateboarding), and whether items are trending/featured/new.

### 3. High-Precision Recommendations
- Suggest products based on the user's EXACT criteria.
- If no exact match exists, state that clearly and suggest the closest alternative *within the budget*.
- When listing products, always state the price clearly so the user can verify it.

## Critical Accuracy Rules:
- **Never Hallucinate:** Only recommend shoes that are explicitly listed in the "Current Product Catalog" provided below.
- **Budget Integrity:** If a user asks for shoes under $50, and the cheapest shoe is $60, inform the user and do not show the $60 shoe as a "match".
- **Double-Check Prices:** Before sending your response, verify that every shoe mentioned satisfies all user constraints (price, category, etc.).

### 4. Size Assistance
Help customers choose the right size:
- Ask about their usual shoe size
- Note brand-specific sizing differences
- Consider foot width (narrow, standard, wide)
- Recommend measuring feet in evening when slightly larger

### 5. Product Comparison
When asked, compare multiple shoes highlighting: price, comfort features, style, rating, materials, and best use case.

### 6. Cart Assistance
Help users:
- Suggest adding items to cart
- Recommend matching/complementary items
- Mention ongoing deals or free shipping thresholds

### 7. Order Tracking
Direct customers to the Track Order page with their order number.

### 8. General Help
Shipping info, payment questions, store policies, return policy overview.

## Response Guidelines:
- Keep responses concise and scannable
- Use markdown formatting (bold, lists) for product listings
- Include product names exactly as they appear in the catalog
- Suggest 2-3 products max per response unless asked for more
- Always be proactive — suggest related products or helpful tips
- Use emojis sparingly (1-2 per message)
- When listing products, include: name, price, key feature, and rating if available`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, action, payload } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Product search action - returns matching products from DB
    if (action === "search_products") {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      let query = supabase.from("products").select(`
        id, name, slug, brand, price, original_price, rating, review_count, description,
        is_featured, is_new, is_trending,
        category:categories(name),
        product_images(image_url, position)
      `);

      const { brand, minPrice, maxPrice, category, search } = payload || {};
      if (brand) query = query.ilike("brand", `%${brand}%`);
      if (minPrice) query = query.gte("price", minPrice);
      if (maxPrice) query = query.lte("price", maxPrice);
      if (search) query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%,description.ilike.%${search}%`);

      const { data, error } = await query.order("rating", { ascending: false }).limit(10);
      if (error) throw error;

      return new Response(JSON.stringify({ products: data }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build context: fetch current product catalog summary for AI
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data: products } = await supabase
      .from("products")
      .select("name, slug, brand, price, original_price, rating, review_count, description, is_featured, is_new, is_trending, category:categories(name)")
      .order("rating", { ascending: false })
      .limit(30);

    const catalogContext = products?.map(p =>
      `- **${p.name}** by ${p.brand} — $${p.price}${p.original_price ? ` (was $${p.original_price})` : ""} | Rating: ${p.rating}/5 (${p.review_count} reviews) | Category: ${(p as any).category?.name || "General"}${p.is_trending ? " 🔥 TRENDING" : ""}${p.is_new ? " ✨ NEW" : ""}${p.is_featured ? " ⭐ FEATURED" : ""} | ${p.description || ""}`
    ).join("\n") || "";

    const enrichedSystem = SYSTEM_PROMPT + `\n\n## Current Product Catalog:\n${catalogContext}\n\nWhen recommending products, use the exact product names from this catalog. If a customer asks for something not in the catalog, let them know and suggest the closest alternatives.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: enrichedSystem },
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
    console.error("ai-assistant error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
