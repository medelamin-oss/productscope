"use client";

import { useState, useRef, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Link2, ImageUp, Loader2, X } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

type InputMode = "url" | "image";

export function AnalysisForm() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mode, setMode] = useState<InputMode>("url");
  const [url, setUrl] = useState("");
  const [language, setLanguage] = useState<"en" | "ar">("en");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageData, setImageData] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const data = reader.result as string;
      setImagePreview(data);
      setImageData(data);
    };
    reader.readAsDataURL(file);
  }

  function clearImage() {
    setImagePreview(null);
    setImageData(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (mode === "url" && !url.trim()) {
      toast.error("Please enter a product URL");
      return;
    }
    if (mode === "image" && !imageData) {
      toast.error("Please upload a product image");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: mode === "url" ? url.trim() : "",
          contentType: mode,
          language,
          imageData: mode === "image" ? imageData : undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.code === "trial_exhausted") {
          toast.error("Free trial used. Please subscribe.");
          router.push("/dashboard/subscribe");
          return;
        }
        throw new Error(data.error ?? "Analysis failed");
      }

      toast.success("Analysis complete!");
      router.push(`/dashboard/project/${data.projectId}`);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Card className="p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Toggle */}
        <div className="flex bg-surface rounded-md p-1 border border-border w-fit">
          {(["url", "image"] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); clearImage(); }}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-all duration-150",
                mode === m
                  ? "bg-white text-[#0F172A] shadow-sm"
                  : "text-muted hover:text-[#0F172A]"
              )}
            >
              {m === "url" ? (
                <Link2 className="w-4 h-4" />
              ) : (
                <ImageUp className="w-4 h-4" />
              )}
              {m === "url" ? "Paste URL" : "Upload Image"}
            </button>
          ))}
        </div>

        {/* URL input */}
        {mode === "url" && (
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-[#0F172A] mb-1.5">
              Product URL
            </label>
            <input
              id="url"
              type="url"
              placeholder="https://example.com/product"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-sm text-[#0F172A] placeholder:text-muted transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
            />
          </div>
        )}

        {/* Image upload */}
        {mode === "image" && (
          <div>
            <label className="block text-sm font-medium text-[#0F172A] mb-1.5">
              Product Image
            </label>
            {imagePreview ? (
              <div className="relative rounded-md border border-border overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={imagePreview}
                  alt="Product preview"
                  className="w-full h-64 object-contain bg-white"
                />
                <button
                  type="button"
                  onClick={clearImage}
                  className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/50 flex items-center justify-center hover:bg-black/70"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full h-40 rounded-md border-2 border-dashed border-border bg-white hover:border-brand-primary/50 transition-colors duration-150 flex flex-col items-center justify-center gap-2 text-muted hover:text-brand-primary"
              >
                <ImageUp className="w-8 h-8" />
                <span className="text-sm font-medium">Click to upload product image</span>
                <span className="text-xs">PNG, JPG up to 5MB</span>
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileSelect}
            />
          </div>
        )}

        {/* Language */}
        <div>
          <label htmlFor="language" className="block text-sm font-medium text-[#0F172A] mb-1.5">
            Content Language
          </label>
          <select
            id="language"
            value={language}
            onChange={(e) => setLanguage(e.target.value as "en" | "ar")}
            className="w-full rounded-md border border-border bg-white px-3.5 py-2.5 text-sm text-[#0F172A] focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary"
          >
            <option value="en">English</option>
            <option value="ar">Arabic</option>
          </select>
        </div>

        {/* Submit */}
        <Button type="submit" className="w-full h-12 text-base" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Analyzing…
            </>
          ) : (
            "Analyze Product"
          )}
        </Button>
      </form>
    </Card>
  );
}
