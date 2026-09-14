import { forwardRef } from "react";

const Card = forwardRef(
  (
    { children, className = "", padding = "p-5 sm:p-6", hover = false, ...props },
    ref
  ) => {
    const baseClasses =
      "bg-white dark:bg-[#13161a] rounded-xl border border-gray-200 dark:border-[#1f242b] shadow-xs transition-all duration-200";
    const hoverClasses = hover ? "cursor-pointer hover:border-gray-300 dark:hover:border-[#2d3540]" : "";
    const classes = `${baseClasses} ${hoverClasses} ${padding} ${className}`;

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

const CardHeader = forwardRef(({ children, className = "", ...props }, ref) => {
  return (
    <div ref={ref} className={`mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
});

CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef(({ children, className = "", ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={`text-base sm:text-lg font-bold text-gray-900 dark:text-white tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
});

CardTitle.displayName = "CardTitle";

const CardContent = forwardRef(
  ({ children, className = "", ...props }, ref) => {
    return (
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = "CardContent";

const CardFooter = forwardRef(({ children, className = "", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`mt-4 pt-4 border-t border-gray-100 dark:border-[#1b2538] text-gray-500 dark:text-slate-400 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

CardFooter.displayName = "CardFooter";

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
