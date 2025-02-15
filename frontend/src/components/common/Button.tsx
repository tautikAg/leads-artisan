import { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className = '',
    variant = 'primary',
    isLoading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props
  }, ref) => {
    const baseStyles = `
      inline-flex
      items-center
      justify-center
      px-4
      py-2.5
      text-sm
      font-medium
      rounded-lg
      transition-colors
      focus:outline-none
      focus:ring-2
      focus:ring-offset-2
      disabled:opacity-50
      disabled:cursor-not-allowed
    `

    const variants = {
      primary: `
        bg-purple-600
        text-white
        hover:bg-purple-700
        focus:ring-purple-500
      `,
      secondary: `
        bg-white
        text-gray-700
        border
        border-gray-300
        hover:bg-gray-50
        focus:ring-purple-500
      `
    }

    return (
      <button
        ref={ref}
        className={`
          ${baseStyles}
          ${variants[variant]}
          ${className}
        `}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && (
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        )}
        {!isLoading && leftIcon && (
          <span className="mr-2">{leftIcon}</span>
        )}
        {children}
        {!isLoading && rightIcon && (
          <span className="ml-2">{rightIcon}</span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button'

export default Button 