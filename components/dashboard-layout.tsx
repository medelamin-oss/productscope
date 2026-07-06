"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  CreditCard,
  Receipt,
  LogOut,
  Loader2,
} from "lucide-react";
import { createClient } from "@/lib/supabase-browser";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui";
import { useState } from "react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "My Projects", icon: LayoutDashboard },
  { href: "/dashboard/subscribe", label: "Subscribe", icon: CreditCard },
  { href: "/dashboard/billing", label: "Billing", icon: Receipt },
] as const;

export function DashboardLayout({
  children,
  email,
  role,
}: {
  children: React.ReactNode;
  email: string;
  role: string;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen bg-surface">
      <aside className="w-64 bg-white border-r border-border flex flex-col shrink-0">
        <div className="px-6 pt-6 pb-4">
          <Link href="/dashboard" className="font-display text-xl font-bold text-brand-deep">
            ProductScope
          </Link>
        </div>

        <nav className="flex-1 px-3 space-y-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors duration-150",
                  active
                    ? "bg-brand-primary/10 text-brand-primary"
                    : "text-muted hover:text-[#0F172A] hover:bg-black/5"
                )}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-brand-primary flex items-center justify-center text-white text-xs font-semibold">
              {email[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-[#0F172A] truncate">{email}</p>
              <p className="text-xs text-muted capitalize">{role}</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted"
            onClick={handleLogout}
            disabled={loggingOut}
          >
            {loggingOut ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4 mr-2" />
            )}
            Sign out
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  );
}
