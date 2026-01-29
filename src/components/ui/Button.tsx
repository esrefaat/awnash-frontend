import React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-awnash-primary focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none",
  {
    variants: {
      variant: {
        // Primary: Yellow background, black text (Awnash brand)
        default: "bg-awnash-primary text-awnash-secondary border-2 border-awnash-primary hover:bg-awnash-primary-hover hover:border-awnash-primary-hover",
        // Secondary: Black background, white text
        secondary: "bg-awnash-secondary text-white border-2 border-awnash-secondary hover:bg-awnash-secondary-hover hover:border-awnash-secondary-hover",
        // Destructive: Red for dangerous actions
        destructive: "bg-red-600 text-white border-2 border-red-600 hover:bg-red-700 hover:border-red-700",
        // Outline: Transparent with border
        outline: "border-2 border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 hover:border-gray-400",
        // Ghost: No background, subtle hover
        ghost: "text-gray-700 hover:bg-gray-100",
        // Link: Text only, underline on hover
        link: "underline-offset-4 hover:underline text-awnash-accent",
        // Accent: Blue for secondary actions
        accent: "bg-awnash-accent text-white border-2 border-awnash-accent hover:bg-awnash-accent-hover hover:border-awnash-accent-hover",
        // Success: Green for positive actions
        success: "bg-green-600 text-white border-2 border-green-600 hover:bg-green-700 hover:border-green-700",
        // Dark: Gray/dark background
        dark: "bg-gray-700 text-white border-2 border-gray-700 hover:bg-gray-600 hover:border-gray-600",
      },
      size: {
        default: "h-10 py-2 px-6",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, buttonVariants }; 