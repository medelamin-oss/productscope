import Link from "next/link";
import { Plus } from "lucide-react";
import { createClient } from "@/lib/supabase-server";
import { Button } from "@/components/ui";
import { ProjectCard } from "@/components/project-card";

export default async function DashboardPage() {
  const supabase = createClient();

  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-muted">Could not load projects.</p>
        <p className="text-xs text-muted mt-1">{error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display text-2xl font-bold text-[#0F172A]">My Projects</h1>
          <p className="text-sm text-muted mt-1">
            Manage your product analyses
          </p>
        </div>
        <Link href="/dashboard/project/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Analysis
          </Button>
        </Link>
      </div>

      {!projects || projects.length === 0 ? (
        <div className="text-center py-24 border-2 border-dashed border-border rounded-lg bg-white">
          <div className="analysis-ring mx-auto w-20 h-20 opacity-30" />
          <h2 className="font-display text-lg font-semibold text-[#0F172A] mt-6">
            No projects yet
          </h2>
          <p className="text-sm text-muted mt-2 max-w-sm mx-auto">
            Paste a product URL or upload an image to get AI-powered marketing analysis instantly.
          </p>
          <Link href="/dashboard/project/new">
            <Button className="mt-6">
              <Plus className="w-4 h-4 mr-2" />
              Analyze Your First Product
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </div>
  );
}
