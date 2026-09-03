import { forwardRef, useId } from "react";
import { fieldBase } from "./Input";

const TextArea = forwardRef(
  (
    {
      label,
      error,
      helperText,
      required = false,
      rows = 4,
      className = "",
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const fieldId = id || generatedId;
    const describedBy = error
      ? `${fieldId}-error`
      : helperText
      ? `${fieldId}-help`
      : undefined;

    return (
      <div className={`space-y-1.5 ${className}`}>
        {label && (
          <label
            htmlFor={fieldId}
            className="block text-caption font-medium text-ink-muted"
          >
            {label}
            {required && <span className="text-danger ml-0.5">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          id={fieldId}
          rows={rows}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={[
            fieldBase,
            "px-2.5 py-2 text-sm resize-y min-h-[64px]",
            error ? "border-danger focus:border-danger focus:ring-danger/25" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          {...props}
        />

        {error && (
          <p id={`${fieldId}-error`} className="text-caption text-danger">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${fieldId}-help`} className="text-caption text-ink-subtle">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

TextArea.displayName = "TextArea";

export default TextArea;
