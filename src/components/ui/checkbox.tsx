import * as React from "react";
import { cn } from "@/lib/utils";
import { Check, Minus } from "lucide-react";

export interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  indeterminate?: boolean;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, indeterminate, checked, ...props }, ref) => {
    const innerRef = React.useRef<HTMLInputElement>(null);

    React.useImperativeHandle(ref, () => innerRef.current as HTMLInputElement);

    React.useEffect(() => {
      if (innerRef.current) {
        innerRef.current.indeterminate = indeterminate ?? false;
      }
    }, [indeterminate]);

    return (
      <label className="relative inline-flex items-center cursor-pointer">
        <input
          type="checkbox"
          ref={innerRef}
          checked={checked}
          className="sr-only peer"
          {...props}
        />
        <div
          style={{
            height: '1.375rem',
            width: '1.375rem',
            borderRadius: '0.3125rem',
            border: '2px solid',
            borderColor: checked || indeterminate ? '#3B82F6' : '#6B7280',
            backgroundColor: checked || indeterminate ? '#3B82F6' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 150ms ease',
            flexShrink: 0
          }}
          className={cn(
            "peer-focus-visible:ring-2 peer-focus-visible:ring-blue-500 peer-focus-visible:ring-offset-2",
            "peer-disabled:opacity-50 peer-disabled:cursor-not-allowed",
            "dark:border-gray-500",
            className
          )}
        >
          {(checked || indeterminate) && (
            indeterminate ? (
              <Minus style={{ height: '0.875rem', width: '0.875rem', color: 'white', display: 'block' }} strokeWidth={3} />
            ) : (
              <Check style={{ height: '0.875rem', width: '0.875rem', color: 'white', display: 'block' }} strokeWidth={3} />
            )
          )}
        </div>
      </label>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
