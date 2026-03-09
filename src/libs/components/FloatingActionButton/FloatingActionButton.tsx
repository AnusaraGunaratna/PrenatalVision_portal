import { ButtonHTMLAttributes, ReactNode } from "react";

interface FloatingActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "default" | "save" | "success";
  size?: "sm" | "md" | "lg";
  isActive?: boolean;
}

export const FloatingActionButton = ({
  children,
  variant = "default",
  size = "md",
  isActive = false,
  className = "",
  ...props
}: FloatingActionButtonProps) => {
  const variantClass =
    variant === "save"
      ? "fab--save"
      : variant === "success"
        ? "fab--success"
        : "fab--default";

  const sizeClass = `fab--${size}`;
  const activeClass = isActive ? "fab--active" : "";

  return (
    <button
      className={`fab ${variantClass} ${sizeClass} ${activeClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
