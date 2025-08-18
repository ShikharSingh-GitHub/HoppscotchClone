import React from "react";

const Button = ({
  variant = "default",
  size = "md",
  children,
  className = "",
  disabled = false,
  ...props
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-semibold transition whitespace-nowrap focus:outline-none";

  const variants = {
    default: "text-zinc-400 hover:text-white",
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary:
      "text-secondary hover:text-secondaryDark focus-visible:text-secondaryDark",
    danger: "text-red-500 hover:text-red-600 focus-visible:text-red-600",
    ghost:
      "text-zinc-300 hover:text-white border border-zinc-700 hover:border-zinc-600 bg-search-bg hover:bg-search-bg-hover",
  };

  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2",
  };

  const variantClasses = variants[variant] || variants.default;
  const sizeClasses = sizes[size] || sizes.md;
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";

  return (
    <button
      className={`${baseClasses} ${variantClasses} ${sizeClasses} ${disabledClasses} rounded ${className}`}
      disabled={disabled}
      {...props}>
      <span className="inline-flex items-center justify-center whitespace-nowrap">
        {children}
      </span>
    </button>
  );
};

export default Button;
