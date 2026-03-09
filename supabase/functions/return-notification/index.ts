import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { return_request_id, order_number, user_id, new_status, resolution } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // 1. Get user email
    const { data: user } = await supabase.auth.admin.getUserById(user_id);
    const email = user?.user?.email;

    if (!email) {
      console.log("No email found for user:", user_id);
      return new Response(JSON.stringify({ success: false, error: "No email found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // 2. Log notification in database for the user to see in their dashboard
    await supabase.from("notifications").insert({
      user_id,
      title: "Return Status Updated",
      message: `Your return request #${return_request_id} for order #${order_number} has been updated to: ${new_status}.`,
      type: "return",
      link: "/account",
    });

    console.log(`Notification sent to ${email} for return ${return_request_id} (Status: ${new_status})`);

    // Note: In a real production environment, you would integrate with Resend/SendGrid here.
    // For now, we are triggering a platform notification and logging the event.

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("return-notification error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
