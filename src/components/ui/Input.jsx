import { forwardRef, useId } from "react";

export const fieldBase = [
  "block w-full bg-surface text-ink placeholder:text-ink-faint",
  "border border-line rounded",
  "transition-colors duration-150",
  "hover:border-line-strong",
  "focus:outline-none focus:border-interactive focus:ring-2 focus:ring-interactive/25",
  "disabled:bg-surface-sunken disabled:text-ink-faint disabled:cursor-not-allowed",
].join(" ");

const SIZES = {
  sm: "h-7 px-2 text-caption",
  md: "h-8 px-2.5 text-sm",
  lg: "h-9 px-3 text-md",
};

const Input = forwardRef(
  (
    {
      label,
      prefix,
      error,
      helperText,
      leftIcon,
      rightIcon,
      size = "md",
      required = false,
      className = "",
      containerClassName = "",
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const describedBy = error
      ? `${inputId}-error`
      : helperText
      ? `${inputId}-help`
      : undefined;

    return (
      <div className={`space-y-1.5 ${containerClassName}`}>
        {label && !prefix && (
          <label
            htmlFor={inputId}
            className="block text-caption font-medium text-ink-muted"
          >
            {label}
            {required && <span className="text-danger ml-0.5">*</span>}
          </label>
        )}

        <div className="relative flex items-center">
          {prefix && (
            <span className="absolute left-2.5 max-w-[45%] truncate text-caption font-medium text-ink-subtle pointer-events-none">
              {prefix}
            </span>
          )}
          {leftIcon && !prefix && (
            <span className="absolute left-2.5 flex items-center text-ink-faint pointer-events-none [&>svg]:w-4 [&>svg]:h-4">
              {leftIcon}
            </span>
          )}

          <input
            ref={ref}
            id={inputId}
            aria-invalid={error ? true : undefined}
            aria-describedby={describedBy}
            className={[
              fieldBase,
              SIZES[size] ?? SIZES.md,
              prefix ? "pl-[46%]" : leftIcon ? "pl-8" : "",
              rightIcon ? "pr-8" : "",
              error
                ? "border-danger focus:border-danger focus:ring-danger/25"
                : "",
              className,
            ]
              .filter(Boolean)
              .join(" ")}
            {...props}
          />

          {rightIcon && (
            <span className="absolute right-2.5 flex items-center text-ink-faint [&>svg]:w-4 [&>svg]:h-4">
              {rightIcon}
            </span>
          )}
        </div>

        {error && (
          <p id={`${inputId}-error`} className="text-caption text-danger">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-help`} className="text-caption text-ink-subtle">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
