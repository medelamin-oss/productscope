import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { AnalysisDisplay } from "@/components/analysis-display";

export default async function ProjectPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", params.id)
    .eq("user_id", user.id)
    .single();

  if (!project) notFound();

  const { data: result } = await supabase
    .from("analysis_results")
    .select("*")
    .eq("project_id", project.id)
    .maybeSingle();

  return (
    <AnalysisDisplay
      project={project}
      initialResult={result}
    />
  );
}
