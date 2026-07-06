import { forwardRef, type ButtonHTMLAttributes, type InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

// ─── Button ───
interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex items-center justify-center rounded-md font-display font-semibold transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-brand-primary/50 disabled:opacity-50 disabled:pointer-events-none",
        {
          primary: "bg-brand-primary text-white hover:bg-brand-primary/90 active:bg-brand-primary/80 shadow-sm",
          secondary: "bg-brand-accent text-[#0C1B33] hover:bg-brand-accent/90 active:bg-brand-accent/80 shadow-sm",
          outline: "border-2 border-brand-primary text-brand-primary hover:bg-brand-primary/5",
          ghost: "text-muted hover:text-brand-primary hover:bg-black/5",
        }[variant],
        {
          sm: "h-9 px-3 text-sm",
          md: "h-11 px-5 text-sm",
          lg: "h-13 px-8 text-base",
        }[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
);
Button.displayName = "Button";

// ─── Input ───
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, id, ...props }, ref) => (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={id} className="block text-sm font-medium text-[#0F172A]">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={id}
        className={cn(
          "w-full rounded-md border bg-white px-3.5 py-2.5 text-sm text-[#0F172A] placeholder:text-muted transition-colors duration-150",
          "focus:outline-none focus:ring-2 focus:ring-brand-primary/30 focus:border-brand-primary",
          error ? "border-red-400 focus:border-red-400 focus:ring-red-200" : "border-border",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
);
Input.displayName = "Input";

// ─── Card ───
interface CardProps {
  className?: string;
  children: React.ReactNode;
}

export function Card({ className, children }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-lg border border-border bg-white shadow-sm",
        className
      )}
    >
      {children}
    </div>
  );
}
