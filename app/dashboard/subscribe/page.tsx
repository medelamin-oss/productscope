"use client";

import { useState, useEffect, useCallback } from "react";
import { Check, Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Plan = "monthly" | "yearly";
type Region = "international" | "dz-sa";

const PRICING: Record<Region, { monthly: number; yearly: number; yearlyLabel: string }> = {
  international: { monthly: 9, yearly: 69, yearlyLabel: "Save $39" },
  "dz-sa": { monthly: 4, yearly: 29, yearlyLabel: "خاص بالسعودية والجزائر" },
};

const FEATURES = [
  "Unlimited product analyses",
  "AI-powered marketing insights",
  "PDF export",
  "Arabic & English support",
];

function detectRegion(): Region {
  if (typeof window === "undefined") return "international";
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    if (tz === "Asia/Riyadh" || tz === "Africa/Algiers") return "dz-sa";
  } catch { /* empty */ }
  return "international";
}

export default function SubscribePage() {
  const [selected, setSelected] = useState<Plan>("monthly");
  const [region] = useState<Region>(detectRegion);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [paddle, setPaddle] = useState<any>(null);

  useEffect(() => {
    let mounted = true;
    import("@paddle/paddle-js").then((mod) =>
      mod.initializePaddle({
        token: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN!,
        environment: "sandbox",
      }).then((p) => {
        if (mounted && p) setPaddle(p);
      })
    );
    return () => { mounted = false; };
  }, []);

  const handleSubscribe = useCallback(async () => {
    setLoading(true);
    setError("");

    const priceId = selected === "monthly"
      ? process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_MONTHLY!
      : process.env.NEXT_PUBLIC_PADDLE_PRICE_ID_YEARLY!;

    if (paddle) {
      try {
        paddle.Checkout.open({
          settings: { displayMode: "overlay", theme: "light" },
          items: [{ priceId, quantity: 1 }],
        });
      } catch {
        setError("Checkout overlay failed. Redirecting...");
        redirectFallback(priceId);
      } finally { setLoading(false); }
    } else {
      redirectFallback(priceId);
    }
  }, [selected, paddle]);

  function redirectFallback(priceId: string) {
    window.location.href = `https://sandbox-buy.paddle.com/checkout/custom/checkout?display=overlay&theme=light&items[0][priceId]=${encodeURIComponent(priceId)}&items[0][quantity]=1`;
  }

  return (
    <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="font-display text-2xl font-bold text-[#0F172A]">Upgrade your plan</h1>
          <p className="text-sm text-muted mt-1">Choose the plan that fits your business</p>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {(["monthly", "yearly"] as const).map((plan) => {
            const active = selected === plan;
            const isMonthly = plan === "monthly";
            const p = PRICING[region];
            return (
              <button
                key={plan}
                type="button"
                onClick={() => setSelected(plan)}
                className={cn(
                  "relative rounded-xl border-2 p-6 text-left transition-all duration-150 text-start",
                  active ? "border-brand-primary bg-brand-primary/5" : "border-border bg-white hover:border-brand-primary/50"
                )}
              >
                {active && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-brand-primary flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-white" />
                  </div>
                )}
                <h3 className="font-display text-lg font-bold text-[#0F172A]">
                  {isMonthly ? "Monthly" : "Yearly"}
                </h3>
                <p className="text-3xl font-bold text-[#0F172A] mt-3">
                  ${isMonthly ? p.monthly : p.yearly}
                  <span className="text-sm font-normal text-muted">/{isMonthly ? "month" : "year"}</span>
                </p>
                {!isMonthly && (
                  <p className="text-xs mt-1 font-semibold" style={{ color: region === "dz-sa" ? "#F59E0B" : "#16a34a" }}>
                    {p.yearlyLabel}
                    {region === "international" && ` — Save $${9 * 12 - 69}`}
                  </p>
                )}
                <ul className="mt-4 space-y-2 text-sm text-muted">
                  {FEATURES.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
              </button>
            );
          })}
        </div>

        <button
          className="w-full h-14 text-lg inline-flex items-center justify-center rounded-md font-display font-semibold bg-brand-primary text-white hover:bg-brand-primary/90 disabled:opacity-50"
          disabled={loading}
          onClick={handleSubscribe}
        >
          {loading ? (
            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Opening checkout...</>
          ) : (
            <>{selected === "monthly" ? "Subscribe Monthly" : "Subscribe Yearly"} <ArrowRight className="w-5 h-5 ml-2" /></>
          )}
        </button>
    </div>
  );
}
