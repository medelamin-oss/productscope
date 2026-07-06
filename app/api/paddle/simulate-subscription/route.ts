import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { log } from "@/lib/utils";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");
  const plan = searchParams.get("plan") ?? "monthly";

  if (!email) {
    return NextResponse.json({ error: "Missing ?email= parameter" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { error } = await supabase
    .from("users")
    .update({
      role: "subscribed",
      paddle_subscription_id: "sandbox_sim_" + Date.now(),
      subscription_plan: plan === "yearly" ? "yearly" : "monthly",
      subscription_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .eq("email", email);

  if (error) {
    log("error", "Simulation failed", { error: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    message: `User ${email} upgraded to ${plan}`,
  });
}
