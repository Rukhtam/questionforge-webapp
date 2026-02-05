import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  isLoading?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'xl' | 'icon';
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, isLoading, children, disabled, style, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    
    // Base styles
    const baseStyle: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '0.5rem',
      whiteSpace: 'nowrap',
      borderRadius: '0.75rem',
      fontWeight: '500',
      transition: 'all 0.2s',
      cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
      opacity: disabled || isLoading ? 0.5 : 1,
      border: 'none',
      outline: 'none',
    };

    // Size styles
    const sizeStyles: Record<string, React.CSSProperties> = {
      default: { height: '3rem', padding: '0.5rem 1.25rem', fontSize: '0.875rem' },
      sm: { height: '2.5rem', padding: '0.5rem 1rem', fontSize: '0.875rem' },
      lg: { height: '3rem', padding: '0.5rem 2rem', fontSize: '1rem' },
      xl: { height: '3.5rem', padding: '0.5rem 2.5rem', fontSize: '1.125rem' },
      icon: { height: '3rem', width: '3rem', padding: '0' },
    };

    // Variant styles
    const variantStyles: Record<string, React.CSSProperties> = {
      default: { 
        backgroundColor: '#2563EB', 
        color: '#FFFFFF',
      },
      destructive: { 
        backgroundColor: '#DC2626', 
        color: '#FFFFFF',
      },
      outline: { 
        backgroundColor: 'transparent', 
        color: '#D1D5DB',
        border: '1px solid #374151',
      },
      secondary: { 
        backgroundColor: '#1F2937', 
        color: '#F3F4F6',
      },
      ghost: { 
        backgroundColor: 'transparent', 
        color: '#D1D5DB',
      },
      link: { 
        backgroundColor: 'transparent', 
        color: '#3B82F6',
        textDecoration: 'underline',
      },
    };

    const combinedStyle: React.CSSProperties = {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...style,
    };

    return (
      <Comp
        style={combinedStyle}
        className={cn("hover:opacity-90", className)}
        ref={ref}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading ? (
          <>
            <svg
              style={{ animation: 'spin 1s linear infinite', height: '1rem', width: '1rem' }}
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                style={{ opacity: 0.25 }}
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                style={{ opacity: 0.75 }}
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>Loading...</span>
          </>
        ) : (
          children
        )}
      </Comp>
    );
  }
);
Button.displayName = "Button";

export { Button };
