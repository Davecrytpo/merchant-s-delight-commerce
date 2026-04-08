import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const toTitleCase = (value: string) =>
  value
    .replace(/_/g, " ")
    .split(" ")
    .map((word) => (word ? word[0].toUpperCase() + word.slice(1) : ""))
    .join(" ")
    .trim();

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const {
      return_request_id,
      order_number,
      user_id,
      new_status,
      resolution,
      customer_email,
    } = await req.json();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    let email = customer_email as string | undefined;
    let resolvedUserId = user_id as string | undefined;

    // 1. Get user email
    if (!email && user_id) {
      const { data: user } = await supabase.auth.admin.getUserById(user_id);
      email = user?.user?.email || email;
    }

    // 2. Fallback to order email if needed
    if (!email && order_number) {
      const { data: order } = await supabase
        .from("orders")
        .select("shipping_address, user_id")
        .eq("order_number", order_number)
        .maybeSingle();

      const rawAddress = order?.shipping_address as any;
      if (rawAddress) {
        if (typeof rawAddress === "string") {
          try {
            const parsed = JSON.parse(rawAddress);
            email = parsed?.email || email;
          } catch {
            // ignore invalid JSON
          }
        } else {
          email = rawAddress?.email || email;
        }
      }

      resolvedUserId = resolvedUserId || (order?.user_id as string | undefined);
    }

    if (!email) {
      console.log("No email found for user:", user_id);
      return new Response(JSON.stringify({ success: false, error: "No email found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const statusLabel = toTitleCase(String(new_status || "updated"));

    // 3. Log notification in database for the user to see in their dashboard
    if (resolvedUserId) {
      await supabase.from("notifications").insert({
        user_id: resolvedUserId,
        title: "Return Status Updated",
        message: `Your return request #${return_request_id} for order #${order_number} has been updated to: ${statusLabel}.`,
        type: "return",
        link: "/account/returns",
      });
    }
    const fromEmail = Deno.env.get("RESEND_FROM_EMAIL") || "Merchant's Delight <no-reply@merchantsdelight.com>";
    const replyTo = Deno.env.get("RESEND_REPLY_TO");
    const siteUrl = Deno.env.get("SITE_URL") || Deno.env.get("DEFAULT_SITE_URL") || "https://example.com";
    const returnsUrl = `${siteUrl.replace(/\/$/, "")}/account/returns`;

    const subject = `Return ${return_request_id} status update: ${statusLabel}`;
    const text = [
      `Hello,`,
      "",
      `Your return request ${return_request_id} for order ${order_number} is now: ${statusLabel}.`,
      resolution ? `Resolution: ${resolution}.` : "",
      "",
      `You can view your return details here: ${returnsUrl}`,
      "",
      "Thank you for shopping with Merchant's Delight.",
    ]
      .filter(Boolean)
      .join("\n");

    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #111;">
        <p>Hello,</p>
        <p>Your return request <strong>${return_request_id}</strong> for order <strong>${order_number}</strong> is now: <strong>${statusLabel}</strong>.</p>
        ${resolution ? `<p>Resolution: <strong>${resolution}</strong>.</p>` : ""}
        <p>You can view your return details here:</p>
        <p><a href="${returnsUrl}">${returnsUrl}</a></p>
        <p>Thank you for shopping with Merchant's Delight.</p>
      </div>
    `;

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      console.warn("RESEND_API_KEY is not set. Skipping email send.");
      return new Response(JSON.stringify({ success: true, email_sent: false, message: "RESEND_API_KEY not set" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailPayload: Record<string, unknown> = {
      from: fromEmail,
      to: [email],
      subject,
      html,
      text,
    };

    if (replyTo) {
      emailPayload.reply_to = [replyTo];
    }

    const sendResp = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(emailPayload),
    });

    if (!sendResp.ok) {
      const errText = await sendResp.text();
      console.error("Resend error:", sendResp.status, errText);
      return new Response(JSON.stringify({ success: false, error: "Email send failed" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`Email sent to ${email} for return ${return_request_id} (Status: ${new_status})`);

    return new Response(JSON.stringify({ success: true, email_sent: true }), {
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
