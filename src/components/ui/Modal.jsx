import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Button from "./Button";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md", // sm, md, lg, xl, full
  showCloseButton = true,
  closeOnOverlayClick = true,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsAnimating(true);
      document.body.style.overflow = "hidden";

      // Trigger animation after mount
      setTimeout(() => setIsAnimating(false), 10);
    } else {
      setIsAnimating(true);
      // Wait for animation to complete before hiding
      setTimeout(() => {
        setIsVisible(false);
        document.body.style.overflow = "unset";
      }, 200);
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isVisible) return null;

  const sizes = {
    sm: "max-w-md",
    md: "max-w-lg",
    lg: "max-w-2xl",
    xl: "max-w-4xl",
    full: "max-w-full mx-4",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div
          className={`fixed inset-0 transition-all duration-200 ease-out bg-gray-500 bg-opacity-75 backdrop-blur-sm ${
            isAnimating ? "opacity-0" : "opacity-100"
          }`}
          onClick={handleOverlayClick}
        />

        {/* Modal */}
        <div
          className={`inline-block w-full ${
            sizes[size]
          } p-5 sm:p-6 my-8 text-left align-middle transition-all duration-200 ease-out transform bg-white dark:bg-[#13161a] border border-gray-200 dark:border-[#1f242b] shadow-2xl rounded-xl ${
            isAnimating
              ? "opacity-0 scale-95 translate-y-4"
              : "opacity-100 scale-100 translate-y-0"
          }`}
        >
          {(title || showCloseButton) && (
            <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-gray-100 dark:border-[#1f242b]">
              <div>
                {title && (
                  <h3 className="text-base font-bold text-gray-900 dark:text-white tracking-tight">
                    {title}
                  </h3>
                )}
              </div>
              {showCloseButton && (
                <button
                  type="button"
                  onClick={onClose}
                  className="p-1 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-[#181d24] transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          <div className="animate-fade-in">{children}</div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
