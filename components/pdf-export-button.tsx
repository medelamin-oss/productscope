"use client";

import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui";
import { generateAnalysisPDF } from "@/lib/pdf";
import type { AnalysisResult } from "@/types";

export function PdfExportButton({
  result,
  productUrl,
  productName,
}: {
  result: AnalysisResult;
  productUrl: string;
  productName?: string;
}) {
  const [loading, setLoading] = useState(false);

  function handleExport() {
    setLoading(true);
    try {
      const blob = generateAnalysisPDF(result, productUrl, productName);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `product-analysis-${result.id.slice(0, 8)}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleExport} disabled={loading}>
      {loading ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <FileDown className="w-4 h-4 mr-2" />
      )}
      Export PDF
    </Button>
  );
}
