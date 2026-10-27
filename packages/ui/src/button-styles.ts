export type ButtonVariant = "primary" | "secondary";

const base =
  "inline-flex items-center justify-center rounded-xl px-5 py-3 font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover focus:ring-primary",
  secondary:
    "border bg-background text-foreground hover:bg-surface focus:ring-foreground/40",
};

/** Shared so a <button> and an <a> can look identical. */
export function buttonClasses(variant: ButtonVariant = "primary", className = "") {
  return `${base} ${variants[variant]} ${className}`.trim();
}
