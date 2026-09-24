import type { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary";
};

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const base =
    "text-label-md uppercase inline-flex items-center justify-center px-8 py-4 border transition-colors disabled:cursor-not-allowed disabled:opacity-40";
  const styles =
    variant === "primary"
      ? "bg-gold border-gold text-bg hover:bg-[#d9ad4d] hover:border-white"
      : "bg-transparent border-[#333333] text-white hover:border-gold hover:text-gold";

  return (
    <button className={`${base} ${styles} ${className}`} {...props}>
      {children}
    </button>
  );
}
