import Link from "next/link";
import { ExternalLink } from "lucide-react";
import { Card } from "@/components/ui";
import { formatDate } from "@/lib/utils";
import type { Project } from "@/types";

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link href={`/dashboard/project/${project.id}`}>
      <Card className="p-5 hover:shadow-md hover:border-brand-primary/30 transition-all duration-200 cursor-pointer h-full">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="font-display font-semibold text-[#0F172A] truncate">
              {project.product_name ?? "Untitled"}
            </h3>
            <p className="text-xs text-muted truncate mt-0.5">
              {project.product_url}
            </p>
          </div>
          <ExternalLink className="w-3.5 h-3.5 text-muted shrink-0 mt-1" />
        </div>

        <div className="flex items-center gap-3 mt-4 text-xs text-muted">
          <span className="uppercase font-medium">{project.language}</span>
          <span>{formatDate(project.created_at)}</span>
        </div>
      </Card>
    </Link>
  );
}
