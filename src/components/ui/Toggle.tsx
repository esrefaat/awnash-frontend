import React from 'react';
import { cn } from '../../lib/utils';

interface ToggleProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked?: boolean;
  onChange?: (checked: boolean) => void;
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

const Toggle = React.forwardRef<HTMLButtonElement, ToggleProps>(
  ({ className, checked, onChange, pressed, onPressedChange, variant = 'default', size = 'default', ...props }, ref) => {
    const isPressed = checked !== undefined ? checked : pressed;
    const handleChange = onChange || onPressedChange;
    
    const handleClick = () => {
      handleChange?.(!isPressed);
    };

    return (
      <button
        type="button"
        ref={ref}
        className={cn(
          'inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors hover:bg-muted hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
          {
            'bg-transparent': variant === 'default' && !isPressed,
            'bg-accent text-accent-foreground': variant === 'default' && isPressed,
            'border border-input bg-transparent hover:bg-accent hover:text-accent-foreground': variant === 'outline' && !isPressed,
            'border border-input bg-accent text-accent-foreground': variant === 'outline' && isPressed,
          },
          {
            'h-10 px-3': size === 'default',
            'h-9 px-2.5': size === 'sm',
            'h-11 px-5': size === 'lg',
          },
          className
        )}
        onClick={handleClick}
        data-state={isPressed ? 'on' : 'off'}
        {...props}
      />
    );
  }
);

Toggle.displayName = 'Toggle';

export { Toggle };
export type { ToggleProps }; 