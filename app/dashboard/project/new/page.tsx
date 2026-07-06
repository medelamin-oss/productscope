import { AnalysisForm } from "@/components/analysis-form";

export default function NewAnalysisPage() {
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-[#0F172A]">New Analysis</h1>
        <p className="text-sm text-muted mt-1">
          Paste a product URL or upload an image to generate AI-powered marketing analysis.
        </p>
      </div>
      <AnalysisForm />
    </div>
  );
}
