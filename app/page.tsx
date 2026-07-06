import Link from "next/link";
import { ArrowRight, FileText, Sparkles, TrendingUp } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-surface">
      {/* Nav */}
      <header className="sticky top-0 z-40 bg-surface/80 backdrop-blur-md border-b border-border">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="font-display text-xl font-bold text-brand-deep">
            ProductScope
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-muted hover:text-brand-primary transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-md bg-brand-primary text-white font-display font-semibold text-sm h-10 px-5 shadow-sm hover:bg-brand-primary/90 transition-all duration-150"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-20 pb-28 md:pt-28 md:pb-36">
        <div className="flex flex-col md:flex-row items-center gap-12 md:gap-16">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-primary/10 text-brand-primary text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              AI-Powered Product Analysis
            </div>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-brand-deep leading-[1.1] tracking-tight">
              Turn any product into a marketing powerhouse
            </h1>
            <p className="text-muted text-lg mt-6 max-w-lg mx-auto md:mx-0 leading-relaxed">
              Paste a product URL or upload an image. Get AI-generated ad headlines,
              marketing hooks, descriptions, and audience insights in seconds.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-3 mt-8">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-md bg-brand-primary text-white font-display font-semibold h-12 px-7 text-sm shadow-sm hover:bg-brand-primary/90 transition-all duration-150 w-full sm:w-auto"
              >
                Analyze Your First Product Free
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-md border-2 border-border text-muted font-display font-semibold h-12 px-7 text-sm hover:border-brand-primary hover:text-brand-primary transition-all duration-150 w-full sm:w-auto"
              >
                Sign In
              </Link>
            </div>
          </div>
          <div className="shrink-0">
            <div className="analysis-ring w-56 h-56 md:w-72 md:h-72" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-t border-border py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold text-brand-deep">
              Everything you need to sell more
            </h2>
            <p className="text-muted mt-3 max-w-lg mx-auto">
              ProductScope analyzes your product from every angle marketing needs.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={FileText}
              title="Instant Analysis"
              description="Paste any product URL or upload an image. Our AI analyzes the product, its market position, and target audience in under a minute."
            />
            <FeatureCard
              icon={Sparkles}
              title="Marketing Content"
              description="Get ad-ready headlines, marketing hooks, and product descriptions optimized for e-commerce platforms and social media."
            />
            <FeatureCard
              icon={TrendingUp}
              title="Competitive Edge"
              description="Understand strengths, weaknesses, and objections. Know exactly who to target and how to position your product."
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl font-bold text-brand-deep">
              Three clicks to better marketing
            </h2>
            <p className="text-muted mt-3 max-w-lg mx-auto">
              No setup, no training. Just results.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <StepCard
              number="01"
              title="Submit a product"
              description="Paste a link from Amazon, AliExpress, or any store. Or upload a product image directly."
            />
            <StepCard
              number="02"
              title="AI works its magic"
              description="Our AI analyzes your product, audience, and competition. Results in about 30 seconds."
            />
            <StepCard
              number="03"
              title="Export and use"
              description="Copy ad headlines, save marketing hooks, or export everything as a PDF to share with your team."
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="bg-brand-deep py-24">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl font-bold text-white">
            Start with a free analysis
          </h2>
          <p className="text-blue-200/70 mt-3 max-w-lg mx-auto">
            Try ProductScope free. When you&apos;re ready, upgrade for unlimited analysis.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mt-10">
            <PricingCard
              name="Monthly"
              price="$9"
              period="/month"
              description="For occasional product research"
              href="/signup"
            />
            <PricingCard
              name="Yearly"
              price="$69"
              period="/year"
              description="Best value &mdash; save 36%"
              href="/signup"
              highlighted
            />
          </div>
          <p className="text-blue-200/50 text-sm mt-8">
            Regional pricing available for KSA and Algeria.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-12">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted">
            &copy; {new Date().getFullYear()} ProductScope. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-sm text-muted hover:text-brand-primary transition-colors">
              Sign in
            </Link>
            <Link href="/signup" className="text-sm text-muted hover:text-brand-primary transition-colors">
              Get started
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface p-6 hover:shadow-sm transition-shadow duration-200">
      <div className="w-10 h-10 rounded-lg bg-brand-primary/10 flex items-center justify-center mb-4">
        <Icon className="w-5 h-5 text-brand-primary" />
      </div>
      <h3 className="font-display font-semibold text-brand-deep mb-2">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{description}</p>
    </div>
  );
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <div className="w-12 h-12 rounded-full bg-brand-primary/10 text-brand-primary flex items-center justify-center font-display font-bold text-lg mx-auto mb-4">
        {number}
      </div>
      <h3 className="font-display font-semibold text-brand-deep mb-2">{title}</h3>
      <p className="text-sm text-muted leading-relaxed max-w-xs mx-auto">{description}</p>
    </div>
  );
}

function PricingCard({
  name,
  price,
  period,
  description,
  href,
  highlighted,
}: {
  name: string;
  price: string;
  period: string;
  description: string;
  href: string;
  highlighted?: boolean;
}) {
  return (
    <div
      className={`rounded-lg p-8 w-full max-w-xs ${
        highlighted ? "bg-white/10 ring-1 ring-white/20" : "bg-white/5"
      }`}
    >
      <h3 className="font-display font-semibold text-white text-lg">{name}</h3>
      <div className="flex items-baseline gap-1 mt-3">
        <span className="font-display text-4xl font-bold text-white">{price}</span>
        <span className="text-blue-200/50 text-sm">{period}</span>
      </div>
      <p className="text-blue-200/70 text-sm mt-2">{description}</p>
      <Link
        href={href}
        className="inline-flex items-center justify-center rounded-md bg-white text-brand-deep font-display font-semibold h-11 px-6 text-sm w-full mt-6 hover:bg-white/90 transition-all duration-150"
      >
        Start Free
      </Link>
    </div>
  );
}
