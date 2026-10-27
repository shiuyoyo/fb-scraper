import type { AnchorHTMLAttributes, ReactNode } from "react";
import { buttonClasses, type ButtonVariant } from "./button-styles";

type CtaLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
};

/**
 * A call to action that navigates. Looks like Button but renders an anchor, so
 * it keeps link semantics: focusable, right-clickable, works without JS.
 */
export function CtaLink({
  children,
  variant = "primary",
  className = "",
  ...props
}: CtaLinkProps) {
  return (
    <a className={buttonClasses(variant, className)} {...props}>
      {children}
    </a>
  );
}
