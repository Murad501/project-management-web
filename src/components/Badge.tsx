import { ReactNode } from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

interface BadgeProps {
  children: ReactNode;
  variant?: "brand" | "success" | "warning" | "danger" | "info" | "neutral";
  className?: string;
}

export default function Badge({ children, variant = "neutral", className }: BadgeProps) {
  const baseStyles =
    "inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider";

  const variants = {
    brand: "bg-brand/10 text-brand border border-brand/20",
    success: "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20",
    warning: "bg-amber-500/10 text-amber-500 border border-amber-500/20",
    danger: "bg-red-500/10 text-red-500 border border-red-500/20",
    info: "bg-sky-500/10 text-sky-500 border border-sky-500/20",
    neutral: "bg-border-main text-text-muted border border-border-main",
  };

  return (
    <span className={twMerge(clsx(baseStyles, variants[variant], className))}>
      {children}
    </span>
  );
}
