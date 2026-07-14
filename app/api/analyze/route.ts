import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase-server";
import { analyzeProduct } from "@/lib/ai";
import { log } from "@/lib/utils";

export async function POST(request: Request) {
  try {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { content, contentType, language, imageData } = body as {
      content: string;
      contentType: "url" | "image";
      language: "en" | "ar";
      imageData?: string;
    };

    if (!language || !["en", "ar"].includes(language)) {
      return NextResponse.json({ error: "Invalid language" }, { status: 400 });
    }

    const { data: project, error: projectError } = await supabase
      .from("projects")
      .insert({
        user_id: user.id,
        product_url: contentType === "url" ? content : null,
        product_image_url: contentType === "image" ? "uploaded" : null,
        language,
      })
      .select()
      .single();

    if (projectError) {
      log("error", "Failed to create project", { error: projectError.message });
      return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
    }

    const { data: result, error: resultError } = await supabase
      .from("analysis_results")
      .insert({ project_id: project.id, status: "processing" })
      .select()
      .single();

    if (resultError) {
      log("error", "Failed to create analysis result", { error: resultError.message });
      return NextResponse.json({ error: "Failed to create analysis" }, { status: 500 });
    }

    try {
      const aiResult = await analyzeProduct(
        contentType === "url" ? content : null,
        language,
        contentType === "image" ? imageData : undefined
      );

      await supabase
        .from("analysis_results")
        .update({
          status: "completed",
          product_description: aiResult.product_description,
          ad_headlines: aiResult.ad_headlines,
          marketing_hooks: aiResult.marketing_hooks,
          strengths: aiResult.strengths,
          weaknesses: aiResult.marketing_angles,
          target_audience: aiResult.target_audience,
          main_objection: aiResult.main_objection,
          objection_response: aiResult.objection_response,
          completed_at: new Date().toISOString(),
        })
        .eq("id", result.id);

      return NextResponse.json({ projectId: project.id, resultId: result.id });
    } catch (aiError) {
      await supabase
        .from("analysis_results")
        .update({
          status: "failed",
          error_message: aiError instanceof Error ? aiError.message : "AI analysis failed",
        })
        .eq("id", result.id);

      log("error", "AI analysis failed", {
        error: aiError instanceof Error ? aiError.message : "Unknown",
      });

      return NextResponse.json(
        { error: "Analysis failed. Please try again." },
        { status: 500 }
      );
    }
  } catch (err) {
    log("error", "Analyze API error", {
      error: err instanceof Error ? err.message : "Unknown",
    });
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
