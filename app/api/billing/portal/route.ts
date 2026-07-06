import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

const PADDLE_API = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "sandbox"
  ? "https://sandbox-api.paddle.com"
  : "https://api.paddle.com";

export async function POST() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("users")
    .select("paddle_subscription_id")
    .eq("id", user.id)
    .single();

  if (!profile?.paddle_subscription_id) {
    return NextResponse.json({ error: "No subscription found" }, { status: 400 });
  }

  try {
    const subRes = await fetch(
      `${PADDLE_API}/subscriptions/${profile.paddle_subscription_id}`,
      { headers: { Authorization: `Bearer ${process.env.PADDLE_API_KEY}` } }
    );
    if (!subRes.ok) {
      return NextResponse.json({ error: "Failed to fetch subscription" }, { status: 502 });
    }

    const subData = await subRes.json();
    const customerId = subData.data?.customer_id;
    if (!customerId) {
      return NextResponse.json({ error: "No customer found" }, { status: 400 });
    }

    const portalRes = await fetch(
      `${PADDLE_API}/customers/${customerId}/portal-sessions`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.PADDLE_API_KEY}`,
        },
        body: JSON.stringify({}),
      }
    );
    if (!portalRes.ok) {
      return NextResponse.json({ error: "Failed to create portal session" }, { status: 502 });
    }

    const portalData = await portalRes.json();
    return NextResponse.json({ url: portalData.data?.url });
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
