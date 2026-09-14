import { forwardRef } from 'react'

const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  icon, 
  disabled = false, 
  loading = false, 
  className = '',
  onClick,
  ...props 
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.98]'
  
  const variants = {
    primary: 'bg-[#61CB08] hover:bg-[#52ad06] text-black font-bold shadow-xs focus:ring-[#61CB08]',
    secondary: 'bg-gray-100 dark:bg-[#181d24] border border-gray-200 dark:border-[#1f242b] hover:bg-gray-200 dark:hover:bg-[#202731] text-gray-800 dark:text-slate-200 focus:ring-slate-500',
    ghost: 'text-gray-600 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-[#181d24] hover:text-gray-900 dark:hover:text-white focus:ring-slate-500',
    danger: 'bg-rose-600 hover:bg-rose-700 text-white font-semibold shadow-xs focus:ring-rose-500',
    success: 'bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-xs focus:ring-emerald-500',
    warning: 'bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-xs focus:ring-amber-500',
    outline: 'border border-gray-200 dark:border-[#1f242b] text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-[#181d24] hover:text-gray-900 dark:hover:text-white bg-transparent focus:ring-slate-500'
  }
  
  const sizes = {
    sm: 'px-3 py-1.5 text-xs font-semibold gap-1.5 min-h-[34px]',
    md: 'px-4 py-2.5 text-sm font-semibold gap-2 min-h-[40px]',
    lg: 'px-5 py-3 text-sm font-bold gap-2.5 min-h-[44px]',
    xl: 'px-6 py-3.5 text-base font-bold gap-3 min-h-[48px]'
  }

  const classes = `${baseClasses} ${variants[variant] || variants.primary} ${sizes[size] || sizes.md} ${className}`

  return (
    <button
      ref={ref}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      {...props}
    >
      {loading && (
        <div className="w-3.5 h-3.5 mr-1.5 spinner shrink-0" />
      )}
      {icon && !loading && (
        <span className="shrink-0">{icon}</span>
      )}
      {children}
    </button>
  )
})

Button.displayName = 'Button'

export default Button
