"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-6">
      <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mb-6">
        <span className="text-red-600 text-2xl font-bold">!</span>
      </div>
      <h1 className="font-display text-2xl font-bold text-[#0F172A]">
        Something went wrong
      </h1>
      <p className="text-sm text-muted mt-2 max-w-sm">
        An unexpected error occurred. Please try again or return to the dashboard.
      </p>
      <div className="flex items-center gap-3 mt-8">
        <Button onClick={reset}>Try again</Button>
        <Link href="/dashboard">
          <Button variant="outline">Go to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}
