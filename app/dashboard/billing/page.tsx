"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Card, Button } from "@/components/ui";
import { Loader2, ExternalLink, CreditCard, Receipt, Shield } from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { formatDate } from "@/lib/utils";

interface BillingInfo {
  id: string;
  email: string;
  role: string;
  trial_used: boolean;
  subscription_plan: string | null;
  subscription_end: string | null;
  paddle_subscription_id: string | null;
}

interface Transaction {
  id: string;
  status: string;
  amount: string | null;
  currency: string;
  description: string;
  createdAt: string;
}

export default function BillingPage() {
  const router = useRouter();
  const [info, setInfo] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txLoading, setTxLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const [portalError, setPortalError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
        return;
      }
      const { data } = await supabase
        .from("users")
        .select("*")
        .eq("id", user.id)
        .single();
      setInfo(data as BillingInfo);
      setLoading(false);
    }
    load();
  }, [router]);

  useEffect(() => {
    if (!info?.paddle_subscription_id) return;
    setTxLoading(true);
    fetch("/api/billing/transactions")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setTransactions(data);
      })
      .catch(() => {})
      .finally(() => setTxLoading(false));
  }, [info?.paddle_subscription_id]);

  const openPortal = useCallback(async () => {
    setPortalLoading(true);
    setPortalError(null);
    try {
      const res = await fetch("/api/billing/portal", { method: "POST" });
      const data = await res.json();
      if (data.url) {
        window.open(data.url, "_blank");
      } else {
        setPortalError(data.error ?? "Failed to open portal");
      }
    } catch {
      setPortalError("Network error");
    } finally {
      setPortalLoading(false);
    }
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted" />
      </div>
    );
  }

  if (!info) return null;

  const isSubscribed = info.role === "subscribed" || info.role === "canceled";
  const planLabel = info.subscription_plan === "monthly" ? "Monthly" : "Yearly";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold text-[#0F172A]">Billing</h1>
        <p className="text-sm text-muted mt-1">Manage your subscription and payment details</p>
      </div>

      <Card className="p-6">
        <h2 className="font-display font-semibold text-[#0F172A] mb-4">Current Plan</h2>

        {isSubscribed ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Plan</span>
              <span className="text-sm font-medium text-[#0F172A] capitalize">{planLabel}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Status</span>
              <span
                className={`text-sm font-medium capitalize ${
                  info.role === "subscribed" ? "text-green-600" : "text-amber-600"
                }`}
              >
                {info.role === "subscribed" ? "Active" : "Canceled"}
              </span>
            </div>
            {info.subscription_end && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted">Renewal Date</span>
                <span className="text-sm font-medium text-[#0F172A]">
                  {formatDate(info.subscription_end)}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted">Free Trial Used</span>
              <span className="text-sm font-medium text-[#0F172A]">
                {info.trial_used ? "Yes" : "No"}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <CreditCard className="w-12 h-12 text-muted mx-auto mb-3" />
            <p className="text-sm text-muted mb-4">You are on the free plan</p>
            <Button onClick={() => router.push("/dashboard/subscribe")}>
              Upgrade Now
            </Button>
          </div>
        )}
      </Card>

      {info.role === "subscribed" && (
        <Card className="p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display font-semibold text-[#0F172A] mb-1">
                Manage Subscription
              </h2>
              <p className="text-sm text-muted">
                Update payment method, view invoices, or cancel through Paddle&apos;s
                secure customer portal.
              </p>
            </div>
            <Shield className="w-8 h-8 text-brand-primary shrink-0" />
          </div>
          <div className="mt-4 flex items-center gap-3">
            <Button onClick={openPortal} disabled={portalLoading}>
              {portalLoading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <ExternalLink className="w-4 h-4 mr-2" />
              )}
              Open Customer Portal
            </Button>
            {portalError && (
              <span className="text-xs text-red-600">{portalError}</span>
            )}
          </div>
        </Card>
      )}

      {info.role === "canceled" && (
        <Card className="p-6 border-l-4 border-l-brand-accent bg-amber-50/50">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display font-semibold text-[#0F172A] mb-1">
                Subscription Canceled
              </h2>
              <p className="text-sm text-muted">
                Your subscription has been canceled. You still have access until{" "}
                {info.subscription_end ? formatDate(info.subscription_end) : "the end of the billing period"}.
                After that, you will be downgraded to the free plan.
              </p>
            </div>
            <CreditCard className="w-8 h-8 text-brand-accent shrink-0" />
          </div>
          <Button
            className="mt-4"
            size="sm"
            onClick={() => router.push("/dashboard/subscribe")}
          >
            Resubscribe
          </Button>
        </Card>
      )}

      {isSubscribed && (
        <Card className="p-6">
          <h2 className="font-display font-semibold text-[#0F172A] mb-4 flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Invoice History
          </h2>

          {txLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="w-5 h-5 animate-spin text-muted" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-6">
              <Receipt className="w-10 h-10 text-muted mx-auto mb-2" />
              <p className="text-sm text-muted">No invoices yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 pr-4 font-medium text-muted">Date</th>
                    <th className="text-left py-2 pr-4 font-medium text-muted">Description</th>
                    <th className="text-right py-2 font-medium text-muted">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-border last:border-0">
                      <td className="py-3 pr-4 text-[#0F172A]">
                        {formatDate(tx.createdAt)}
                      </td>
                      <td className="py-3 pr-4 text-[#0F172A]">{tx.description}</td>
                      <td className="py-3 text-right font-medium text-[#0F172A]">
                        {tx.amount ? `${tx.currency} ${tx.amount}` : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
