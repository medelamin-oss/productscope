import type { Metadata } from "next";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const display = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["500", "600", "700", "800"],
});

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "ProductScope — AI-Powered Product Analysis for Dropshippers",
  description:
    "Analyze any e-commerce product with AI. Generate ad headlines, marketing hooks, product descriptions, and audience insights in seconds. Free trial available.",
  openGraph: {
    title: "ProductScope — AI-Powered Product Analysis",
    description:
      "Paste any product URL or upload an image. Get AI-generated marketing content in seconds.",
    type: "website",
    locale: "en_US",
    siteName: "ProductScope",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable}`}>
      <body className="font-body antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
