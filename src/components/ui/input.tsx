import * as React from "react";
import { cn } from "@/lib/utils";
import { Eye, EyeOff } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, icon, error, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";
    const inputType = isPassword && showPassword ? "text" : type;

    return (
      <div style={{ position: 'relative', width: '100%' }}>
        {icon && (
          <div style={{ 
            position: 'absolute', 
            left: '1rem', 
            top: '50%', 
            transform: 'translateY(-50%)', 
            color: '#6B7280',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {icon}
          </div>
        )}
        <input
          type={inputType}
          style={{
            display: 'flex',
            height: '3rem',
            width: '100%',
            borderRadius: '0.75rem',
            border: error ? '1px solid #EF4444' : '1px solid #374151',
            backgroundColor: 'rgba(17, 24, 39, 0.6)',
            paddingLeft: icon ? '3rem' : '1rem',
            paddingRight: isPassword ? '3rem' : '1rem',
            paddingTop: '0.5rem',
            paddingBottom: '0.5rem',
            fontSize: '1rem',
            color: 'white',
            outline: 'none',
            transition: 'all 0.2s'
          }}
          className={cn(
            "placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '1rem',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9CA3AF',
              padding: '0.25rem',
              borderRadius: '0.25rem',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer'
            }}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff style={{ height: '1.25rem', width: '1.25rem' }} />
            ) : (
              <Eye style={{ height: '1.25rem', width: '1.25rem' }} />
            )}
          </button>
        )}
        {error && (
          <p style={{ marginTop: '0.25rem', fontSize: '0.875rem', color: '#F87171' }}>{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
