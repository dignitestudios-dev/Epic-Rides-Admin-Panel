import { useCallback, useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

const SIZES = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
  full: "max-w-[calc(100vw-2rem)]",
};

const FOCUSABLE =
  'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  footer,
  children,
  size = "md",
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEscape = true,
  className = "",
}) => {
  const [mounted, setMounted] = useState(false);
  const panelRef = useRef(null);
  const restoreFocusRef = useRef(null);
  const titleId = useId();

  // Keep the node mounted briefly so the exit transition can play.
  useEffect(() => {
    if (isOpen) {
      setMounted(true);
      return;
    }
    const timer = setTimeout(() => setMounted(false), 140);
    return () => clearTimeout(timer);
  }, [isOpen]);

  // Lock body scroll while open, compensating for the scrollbar so the page
  // behind doesn't shift sideways when it disappears.
  useEffect(() => {
    if (!isOpen) return;
    const { body, documentElement } = document;
    const scrollbar = window.innerWidth - documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPadding = body.style.paddingRight;

    body.style.overflow = "hidden";
    if (scrollbar > 0) body.style.paddingRight = `${scrollbar}px`;

    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPadding;
    };
  }, [isOpen]);

  // Move focus in on open, and back to the trigger on close.
  useEffect(() => {
    if (!isOpen) {
      restoreFocusRef.current?.focus?.();
      restoreFocusRef.current = null;
      return;
    }
    restoreFocusRef.current = document.activeElement;
    const timer = setTimeout(() => {
      const panel = panelRef.current;
      if (!panel) return;
      const target = panel.querySelector(FOCUSABLE) ?? panel;
      target.focus?.();
    }, 20);
    return () => clearTimeout(timer);
  }, [isOpen]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape" && closeOnEscape) {
        event.stopPropagation();
        onClose?.();
        return;
      }

      // Keep Tab inside the dialog.
      if (event.key !== "Tab") return;
      const panel = panelRef.current;
      if (!panel) return;
      const items = Array.from(panel.querySelectorAll(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null
      );
      if (items.length === 0) return;

      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [closeOnEscape, onClose]
  );

  if (!mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-4 sm:p-6"
      onKeyDown={handleKeyDown}
    >
      <div
        className={`fixed inset-0 bg-neutral-950/50 backdrop-blur-[2px] transition-opacity duration-150 ${
          isOpen ? "opacity-100" : "opacity-0"
        }`}
        onClick={closeOnOverlayClick ? onClose : undefined}
        aria-hidden="true"
      />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        tabIndex={-1}
        className={[
          "relative w-full my-auto",
          SIZES[size] ?? SIZES.md,
          "bg-surface-raised border border-line rounded-xl shadow-overlay",
          "transition-all duration-150 ease-out outline-none",
          isOpen ? "opacity-100 scale-100" : "opacity-0 scale-[0.98]",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {(title || showCloseButton) && (
          <div className="flex items-start justify-between gap-4 px-5 py-4 border-b border-line">
            <div className="min-w-0">
              {title && (
                <h2 id={titleId} className="text-lg font-semibold text-ink truncate">
                  {title}
                </h2>
              )}
              {description && (
                <p className="mt-0.5 text-caption text-ink-muted">{description}</p>
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="shrink-0 -mr-1 -mt-0.5 h-7 w-7 inline-flex items-center justify-center rounded text-ink-faint hover:text-ink hover:bg-surface-hover transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        <div className="px-5 py-4">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-2 px-5 py-3.5 border-t border-line bg-surface-sunken rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default Modal;
