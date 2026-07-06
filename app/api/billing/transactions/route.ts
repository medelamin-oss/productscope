import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

const PADDLE_API = process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT === "sandbox"
  ? "https://sandbox-api.paddle.com"
  : "https://api.paddle.com";

interface PaddleTransaction {
  id: string;
  status: string;
  currency_code: string;
  created_at: string;
  details: {
    totals: {
      total: string;
    };
  };
  items: Array<{
    price: {
      description: string;
    };
  }>;
}

export async function GET() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase
    .from("users")
    .select("paddle_subscription_id")
    .eq("id", user.id)
    .single();

  if (!profile?.paddle_subscription_id) {
    return NextResponse.json([]);
  }

  try {
    const res = await fetch(
      `${PADDLE_API}/transactions?subscription_id=${profile.paddle_subscription_id}&status=billed,paid`,
      { headers: { Authorization: `Bearer ${process.env.PADDLE_API_KEY}` } }
    );

    if (!res.ok) {
      return NextResponse.json({ error: "Failed to fetch transactions" }, { status: 502 });
    }

    const data = await res.json() as { data: PaddleTransaction[] };
    const transactions = (data.data ?? []).map((tx: PaddleTransaction) => ({
      id: tx.id,
      status: tx.status,
      amount: tx.details?.totals?.total
        ? (parseInt(tx.details.totals.total) / 100).toFixed(2)
        : null,
      currency: tx.currency_code ?? "USD",
      description: tx.items?.[0]?.price?.description ?? "Subscription",
      createdAt: tx.created_at,
    }));

    return NextResponse.json(transactions);
  } catch {
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
