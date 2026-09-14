import React from "react";

const Badge = ({
  children,
  variant = "default",
  size = "md",
  dot = false,
  className = "",
}) => {
  const baseClasses = "inline-flex items-center font-semibold rounded-md transition-colors select-none";

  const variants = {
    default:
      "bg-gray-100 text-gray-700 dark:bg-[#181d24] dark:text-slate-300 border border-gray-200 dark:border-[#1f242b]",
    primary:
      "bg-[#61CB08]/15 text-[#3d8304] dark:text-[#7fe820] border border-[#61CB08]/30",
    success:
      "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-[#7fe820] border border-emerald-200 dark:border-emerald-500/30",
    warning:
      "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-500/30",
    danger:
      "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-500/30",
    info:
      "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-400 border border-sky-200 dark:border-sky-500/30",
    purple:
      "bg-purple-50 text-purple-700 dark:bg-purple-950/40 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30",
    gray:
      "bg-gray-100 text-gray-600 dark:bg-[#181d24] dark:text-slate-400 border border-gray-200 dark:border-[#1f242b]",
  };

  const dotColors = {
    default: "bg-slate-400 dark:bg-slate-400",
    primary: "bg-[#61CB08]",
    success: "bg-emerald-500 dark:bg-[#61CB08]",
    warning: "bg-amber-500",
    danger: "bg-rose-500",
    info: "bg-sky-500",
    purple: "bg-purple-500",
    gray: "bg-slate-400",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-xs",
    lg: "px-3 py-1 text-sm",
  };

  const classes = `${baseClasses} ${variants[variant] || variants.default} ${sizes[size] || sizes.md} ${className}`;

  return (
    <span className={classes}>
      {dot && (
        <span
          className={`w-1.5 h-1.5 rounded-full mr-1.5 shrink-0 ${
            dotColors[variant] || dotColors.default
          }`}
        />
      )}
      {children}
    </span>
  );
};

export default Badge;
