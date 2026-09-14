import { forwardRef } from 'react'

const Input = forwardRef(({ 
  label, 
  prefix,
  error, 
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  ...props 
}, ref) => {
  const baseClasses = 'block w-full px-3.5 py-2.5 border rounded-lg shadow-xs text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#61CB08]/25 focus:border-[#61CB08] text-sm font-medium transition-all duration-150'
  const borderClasses = error
    ? 'border-rose-400 dark:border-rose-500 focus:ring-rose-500/30 focus:border-rose-500 bg-white dark:bg-[#141a24]'
    : 'border-gray-300 dark:border-[#2d3748] hover:border-gray-400 dark:hover:border-[#4a5568] bg-white dark:bg-[#141a24]'
  
  return (
    <div className="space-y-1.5">
      {label && !prefix && (
        <label className="block text-xs font-semibold text-gray-700 dark:text-slate-200">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 w-24 text-xs font-medium text-gray-500 dark:text-slate-400 pointer-events-none whitespace-nowrap overflow-hidden text-ellipsis">
            {prefix}:
          </span>
        )}
        {leftIcon && !prefix && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-slate-400">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={`${baseClasses} ${borderClasses} ${prefix ? 'pl-28' : (leftIcon ? 'pl-9' : '')} ${rightIcon ? 'pr-9' : ''} ${className}`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 dark:text-slate-400">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="text-xs text-rose-500 mt-0.5">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{helperText}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
