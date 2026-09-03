import { forwardRef } from "react";

/**
 * Flat surface with a hairline border. Elevation is used sparingly — a card
 * earns a shadow only when it floats above the page (menus, popovers).
 */
const Card = forwardRef(
  (
    {
      children,
      className = "",
      padding = "p-4",
      hover = false,
      interactive = false,
      inset = false,
      ...props
    },
    ref
  ) => {
    const classes = [
      inset ? "bg-surface-sunken" : "bg-surface",
      "border border-line rounded-lg",
      "transition-colors duration-150",
      hover || interactive
        ? "hover:border-line-strong hover:bg-surface-hover cursor-pointer"
        : "",
      padding,
      className,
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

const CardHeader = forwardRef(
  ({ children, className = "", divided = false, ...props }, ref) => (
    <div
      ref={ref}
      className={[
        "flex items-start justify-between gap-3",
        divided ? "pb-3 mb-4 border-b border-line" : "mb-3",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </div>
  )
);

CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef(({ children, className = "", ...props }, ref) => (
  <h3
    ref={ref}
    className={`text-lg font-semibold text-ink ${className}`}
    {...props}
  >
    {children}
  </h3>
));

CardTitle.displayName = "CardTitle";

const CardDescription = forwardRef(
  ({ children, className = "", ...props }, ref) => (
    <p ref={ref} className={`text-caption text-ink-muted ${className}`} {...props}>
      {children}
    </p>
  )
);

CardDescription.displayName = "CardDescription";

const CardContent = forwardRef(({ children, className = "", ...props }, ref) => (
  <div ref={ref} className={className} {...props}>
    {children}
  </div>
));

CardContent.displayName = "CardContent";

const CardFooter = forwardRef(({ children, className = "", ...props }, ref) => (
  <div
    ref={ref}
    className={`mt-4 pt-3 border-t border-line text-caption text-ink-muted ${className}`}
    {...props}
  >
    {children}
  </div>
));

CardFooter.displayName = "CardFooter";

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
