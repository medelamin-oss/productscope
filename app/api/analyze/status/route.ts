import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";

export async function GET(request: Request) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const resultId = searchParams.get("resultId");
  if (!resultId) {
    return NextResponse.json({ error: "Missing resultId" }, { status: 400 });
  }

  const { data: result } = await supabase
    .from("analysis_results")
    .select("*")
    .eq("id", resultId)
    .single();

  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}
