import React from 'react';

const TextArea = React.forwardRef(({ label, error, helperText, className = '', ...props }, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-xs font-semibold text-gray-700 dark:text-slate-300">
          {label}
        </label>
      )}
      <textarea
        ref={ref}
        className={`block w-full px-3.5 py-2.5 border rounded-lg shadow-xs bg-white dark:bg-[#13161a] text-gray-900 dark:text-slate-100 placeholder-gray-400 dark:placeholder-slate-500 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#61CB08]/20 focus:border-[#61CB08] transition-all duration-150 ${
          error
            ? 'border-rose-400 dark:border-rose-500 focus:ring-rose-500/30 focus:border-rose-500'
            : 'border-gray-200 dark:border-[#1f242b]'
        } ${className}`}
        {...props}
      />
      {error && <p className="text-xs text-rose-500 mt-0.5">{error}</p>}
      {helperText && !error && (
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{helperText}</p>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';

export default TextArea;

