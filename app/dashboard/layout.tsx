import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { DashboardLayout } from "@/components/dashboard-layout";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("users")
    .select("role, trial_used")
    .eq("id", user.id)
    .single();

  return (
    <DashboardLayout
      email={user.email!}
      role={profile?.role ?? "free"}
    >
      {children}
    </DashboardLayout>
  );
}
