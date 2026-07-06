import { NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { log } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const rawBody = await request.text();
    const signature = request.headers.get("Paddle-Signature");

    log("info", "Paddle webhook received", { hasSignature: !!signature });

    // TODO: Verify webhook signature using Paddle SDK or crypto
    // For production, set PADDLE_WEBHOOK_SECRET and verify:
    //   const crypto = require('crypto');
    //   const expected = crypto.createHmac('sha256', process.env.PADDLE_WEBHOOK_SECRET!)
    //     .update(rawBody).digest('base64');
    //   if (signature !== `ts=...;h1=${expected}`) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });

    const event = JSON.parse(rawBody);
    const eventType = event.event_type;

    log("info", "Processing Paddle event", { eventType });

    const supabase = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    if (eventType === "subscription.created") {
      const data = event.data ?? event;
      const customerEmail = data.customer_email ?? data.items?.[0]?.price?.product?.name;
      const subscriptionId = data.id;
      const priceId = data.items?.[0]?.price?.id;
      const plan = priceId === process.env.PADDLE_PRICE_ID_MONTHLY ? "monthly" : "yearly";
      const endsAt = data.current_billing_period?.ends_at ?? data.scheduled_change?.effective_at;

      if (!customerEmail) {
        log("error", "Missing customer email in subscription.created");
        return NextResponse.json({ error: "Missing email" }, { status: 400 });
      }

      const { error: updateError } = await supabase
        .from("users")
        .update({
          role: "subscribed",
          paddle_subscription_id: subscriptionId,
          subscription_plan: plan,
          subscription_end: endsAt ?? null,
        })
        .eq("email", customerEmail);

      if (updateError) {
        log("error", "Failed to update user after subscription", { error: updateError.message });
      }
    }

    if (eventType === "subscription.updated") {
      const data = event.data ?? event;
      const subscriptionId = data.id;
      const priceId = data.items?.[0]?.price?.id;
      const plan = priceId === process.env.PADDLE_PRICE_ID_MONTHLY ? "monthly" : "yearly";
      const endsAt = data.current_billing_period?.ends_at ?? data.scheduled_change?.effective_at;

      const { error: updateError } = await supabase
        .from("users")
        .update({
          subscription_plan: plan,
          subscription_end: endsAt ?? null,
        })
        .eq("paddle_subscription_id", subscriptionId);

      if (updateError) {
        log("error", "Failed to update subscription", { error: updateError.message });
      }
    }

    if (eventType === "subscription.canceled") {
      const data = event.data ?? event;
      const subscriptionId = data.id;

      const { error: updateError } = await supabase
        .from("users")
        .update({
          role: "canceled",
          subscription_end: data.current_billing_period?.ends_at ?? new Date().toISOString(),
        })
        .eq("paddle_subscription_id", subscriptionId);

      if (updateError) {
        log("error", "Failed to cancel subscription", { error: updateError.message });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    log("error", "Paddle webhook error", {
      error: err instanceof Error ? err.message : "Unknown",
    });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
