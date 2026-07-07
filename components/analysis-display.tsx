"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, ExternalLink, ChevronRight, Pencil, Trash2, Check, X, Loader2, FileText, Copy, CheckCheck } from "lucide-react";
import { Card } from "@/components/ui";
import { PdfExportButton } from "@/components/pdf-export-button";
import { formatDate } from "@/lib/utils";
import type { AnalysisResult, Project } from "@/types";

export function AnalysisDisplay({
  project,
  initialResult,
}: {
  project: Project;
  initialResult: AnalysisResult | null;
}) {
  const router = useRouter();
  const [result, setResult] = useState<AnalysisResult | null>(initialResult);
  const [polling, setPolling] = useState(false);
  const resultId = initialResult?.id;
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(project.product_name ?? "");
  const [renameSaving, setRenameSaving] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [adCopy, setAdCopy] = useState<string | null>(null);
  const [adLoading, setAdLoading] = useState(false);
  const [adCopied, setAdCopied] = useState(false);
  const mounted = useRef(true);

  useEffect(() => {
    if (!resultId) return;
    if (result && result.status !== "processing") return;

    setPolling(true);
    const interval = setInterval(async () => {
      const res = await fetch(`/api/analyze/status?resultId=${resultId}`, {
        cache: "no-store",
      });
      if (!mounted.current) return;
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        if (data.status === "completed" || data.status === "failed") {
          clearInterval(interval);
          setPolling(false);
          router.refresh();
        }
      }
    }, 3000);

    return () => {
      clearInterval(interval);
      mounted.current = false;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRename = async () => {
    const trimmed = editName.trim();
    if (!trimmed) return;
    setRenameSaving(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product_name: trimmed }),
      });
      if (!res.ok) throw new Error("Failed to rename");
      setIsEditing(false);
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setRenameSaving(false);
    }
  };

  const handleCancelRename = () => {
    setEditName(project.product_name ?? "");
    setIsEditing(false);
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Failed to delete");
      }
      router.push("/dashboard");
    } catch (err) {
      console.error(err);
      setDeleting(false);
      setShowConfirmDelete(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          {isEditing ? (
            <div className="flex items-center gap-2 max-w-md">
              <input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleRename();
                  if (e.key === "Escape") handleCancelRename();
                }}
                className="w-full rounded-md border border-border bg-white px-3.5 py-2 text-lg font-display font-bold text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
                autoFocus
              />
              <button
                onClick={handleRename}
                disabled={renameSaving || !editName.trim()}
                className="p-2 text-green-600 hover:bg-green-50 rounded-md disabled:opacity-50"
              >
                {renameSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              </button>
              <button
                onClick={handleCancelRename}
                className="p-2 text-muted hover:bg-black/5 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <h1 className="font-display text-2xl font-bold text-[#0F172A] truncate">
                {project.product_name ?? "Analysis Result"}
              </h1>
              <button
                onClick={() => { setIsEditing(true); setEditName(project.product_name ?? ""); }}
                className="p-1.5 text-muted hover:text-brand-primary hover:bg-black/5 rounded-md shrink-0"
                title="Rename"
              >
                <Pencil className="w-4 h-4" />
              </button>
            </div>
          )}
          <p className="text-sm text-muted mt-1 flex flex-wrap items-center gap-x-2">
            {project.product_url && (
              <a
                href={project.product_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 underline hover:text-brand-primary truncate max-w-md"
              >
                {project.product_url}
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            )}
            <span className="text-muted">·</span>
            <span>{formatDate(project.created_at)}</span>
            <span className="text-muted">·</span>
            <span className="uppercase text-xs font-medium">{project.language}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {result && result.status === "completed" && (
            <PdfExportButton
              result={result}
              productUrl={project.product_url ?? ""}
              productName={project.product_name ?? undefined}
            />
          )}
          <button
            onClick={() => setShowConfirmDelete(true)}
            className="p-2 text-red-500 hover:bg-red-50 rounded-md"
            title="Delete project"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Processing */}
      {(!result || result.status === "processing") && (
        <Card className="p-16 text-center">
          <div className="analysis-ring mx-auto w-20 h-20" />
          <p className="font-display text-lg font-semibold text-[#0F172A] mt-6">
            Analyzing your product…
          </p>
          <p className="text-sm text-muted mt-2">
            Our AI is generating marketing insights. This takes a few seconds.
          </p>
          {polling && (
            <p className="text-xs text-muted mt-4 flex items-center justify-center gap-1.5">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Checking for results…
            </p>
          )}
        </Card>
      )}

      {/* Failed */}
      {result?.status === "failed" && (
        <Card className="p-8 border-red-200 bg-red-50">
          <h2 className="font-display font-semibold text-red-800">Analysis Failed</h2>
          <p className="text-sm text-red-600 mt-1">
            {result.error_message ?? "An unknown error occurred. Please try again."}
          </p>
        </Card>
      )}

      {/* Completed Results */}
      {result?.status === "completed" && (
        <div className="space-y-6">
          {result.product_description && (
            <Card className="p-6">
              <h2 className="font-display font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-brand-primary" />
                Product Description
              </h2>
              <p className="text-sm leading-relaxed text-muted whitespace-pre-line">
                {result.product_description}
              </p>
            </Card>
          )}

          {result.ad_headlines && result.ad_headlines.length > 0 && (
            <Card className="p-6">
              <h2 className="font-display font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-brand-primary" />
                Ad Headlines
              </h2>
              <ul className="space-y-2.5">
                {result.ad_headlines.map((h: string, i: number) => (
                  <li key={i} className="text-sm text-muted flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-brand-accent/20 text-brand-accent flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {h}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {result.marketing_hooks && result.marketing_hooks.length > 0 && (
            <Card className="p-6">
              <h2 className="font-display font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-brand-primary" />
                Marketing Hooks
              </h2>
              <ul className="space-y-2.5">
                {result.marketing_hooks.map((h: string, i: number) => (
                  <li key={i} className="text-sm text-muted flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    {h}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          <div className="grid gap-6 md:grid-cols-2">
            {result.strengths && result.strengths.length > 0 && (
              <Card className="p-6 border-l-4 border-l-green-500">
                <h2 className="font-display font-semibold text-green-700 mb-3">{project.language === "ar" ? "نقاط قوة المنتج" : "Product Strengths"}</h2>
                <ul className="space-y-1.5">
                  {result.strengths.map((s: string, i: number) => (
                    <li key={i} className="text-sm text-muted flex items-start gap-2">
                      <span className="text-green-600 font-bold mt-0.5">+</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            {result.weaknesses && result.weaknesses.length > 0 && (
              <Card className="p-6 border-l-4 border-l-brand-primary">
                <h2 className="font-display font-semibold text-brand-primary mb-3">{project.language === "ar" ? "الزوايا التسويقية" : "Marketing Angles"}</h2>
                <ul className="space-y-1.5">
                  {result.weaknesses.map((w: string, i: number) => (
                    <li key={i} className="text-sm text-muted flex items-start gap-2">
                      <span className="text-brand-primary font-bold mt-0.5">→</span>
                      {w}
                    </li>
                  ))}
                </ul>
              </Card>
            )}
          </div>

          {result.target_audience && (
            <Card className="p-6 bg-gradient-to-br from-brand-primary/5 to-transparent">
              <h2 className="font-display font-semibold text-[#0F172A] mb-3 flex items-center gap-2">
                <ChevronRight className="w-4 h-4 text-brand-primary" />
                Target Audience
              </h2>
              <p className="text-sm leading-relaxed text-muted">{result.target_audience}</p>
            </Card>
          )}

          {result.main_objection && (
            <Card className="p-6 border-l-4 border-l-brand-accent bg-amber-50/50">
              <h2 className="font-display font-semibold text-[#0F172A] mb-1">Main Objection</h2>
              <p className="text-sm text-muted mb-4 italic border-l-2 border-brand-accent pl-3">
                &ldquo;{result.main_objection}&rdquo;
              </p>
              <h3 className="font-display font-semibold text-sm text-brand-primary mb-1">Recommended Response</h3>
              <p className="text-sm leading-relaxed text-muted">{result.objection_response}</p>
            </Card>
          )}

          <button
            onClick={async () => {
              setAdLoading(true);
              setAdCopy(null);
              try {
                const res = await fetch("/api/generate-ad", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    description: result.product_description,
                    headlines: result.ad_headlines,
                    strengths: result.strengths,
                    targetAudience: result.target_audience,
                    language: project.language,
                  }),
                });
                const data = await res.json();
                if (data.ad) setAdCopy(data.ad);
                else setAdCopy("Failed to generate ad copy.");
              } catch {
                setAdCopy("Network error. Try again.");
              } finally {
                setAdLoading(false);
              }
            }}
            disabled={adLoading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-md font-display font-semibold h-12 px-6 bg-brand-primary text-white hover:bg-brand-primary/90 disabled:opacity-50 transition-all duration-150"
          >
            {adLoading ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> جاري الكتابة...</>
            ) : (
              <><FileText className="w-5 h-5" /> اكتب لي نص اعلاني</>
            )}
          </button>
        </div>
      )}

      {/* Ad Copy Modal */}
      {adCopy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => { setAdCopy(null); setAdCopied(false); }}>
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display font-semibold text-lg text-[#0F172A]">نص إعلاني احترافي</h3>
              <button
                onClick={() => { setAdCopy(null); setAdCopied(false); }}
                className="p-1.5 text-muted hover:bg-black/5 rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm leading-relaxed text-muted whitespace-pre-line mb-4">{adCopy}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(adCopy);
                  setAdCopied(true);
                  setTimeout(() => setAdCopied(false), 2000);
                }}
                className="inline-flex items-center justify-center gap-2 rounded-md font-display font-semibold h-11 px-5 text-sm bg-brand-primary text-white hover:bg-brand-primary/90 transition-all duration-150"
              >
                {adCopied ? <><CheckCheck className="w-4 h-4" /> تم النسخ</> : <><Copy className="w-4 h-4" /> نسخ النص</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showConfirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full mx-4 shadow-xl">
            <h3 className="font-display font-semibold text-lg text-[#0F172A]">
              Delete project?
            </h3>
            <p className="text-sm text-muted mt-2">
              This will permanently delete this project and its analysis results.
            </p>
            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowConfirmDelete(false)}
                className="inline-flex items-center justify-center rounded-md font-display font-semibold h-11 px-5 text-sm text-muted hover:text-brand-primary hover:bg-black/5 transition-all duration-150"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="inline-flex items-center justify-center rounded-md font-display font-semibold h-11 px-5 text-sm border-2 border-red-500 text-red-500 hover:bg-red-50 transition-all duration-150 disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
