import Link from "next/link";
import type { ReactNode } from "react";

type Base = {
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "ghost";
};

type ButtonAsButton = Base &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
    href?: undefined;
  };

type ButtonAsLink = Base & {
  href: string;
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href" | "className">;

const variants = {
  primary:
    "bg-gradient-to-r from-[#D6A77A] to-[#C48A5A] text-white shadow-soft hover:shadow-soft-md hover:-translate-y-0.5 active:translate-y-0",
  secondary:
    "bg-luxury-primary/20 text-luxury-text border border-luxury-accent/30 shadow-soft hover:bg-luxury-primary/30 hover:border-luxury-accent/50 hover:-translate-y-0.5",
  ghost:
    "bg-transparent text-luxury-text hover:bg-luxury-primary/15 hover:text-luxury-accent",
};

/**
 * Primary CTA / secondary actions — `href` verilirse Next.js Link, aksi halde <button>.
 */
export function Button(props: ButtonAsButton | ButtonAsLink) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-[30px] px-7 py-3.5 text-sm font-semibold tracking-wide transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none";

  if ("href" in props && props.href) {
    const {
      children,
      className = "",
      variant = "primary",
      href,
      ...rest
    } = props as ButtonAsLink;
    return (
      <Link
        href={href}
        className={`${base} ${variants[variant]} ${className}`}
        {...rest}
      >
        {children}
      </Link>
    );
  }

  const {
    children,
    className = "",
    variant = "primary",
    type,
    ...rest
  } = props as ButtonAsButton;

  return (
    <button
      type={type ?? "button"}
      className={`${base} ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
