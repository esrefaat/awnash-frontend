import React from 'react';
import { cn } from '../../lib/utils';

interface TooltipProviderProps {
  children: React.ReactNode;
}

interface TooltipProps {
  children: React.ReactNode;
}

interface TooltipTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  children: React.ReactNode;
}

interface TooltipContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
}

interface TooltipContextType {
  isVisible: boolean;
  setIsVisible: (visible: boolean) => void;
}

const TooltipContext = React.createContext<TooltipContextType | null>(null);

const TooltipProvider: React.FC<TooltipProviderProps> = ({ children }) => {
  return <>{children}</>;
};

const Tooltip: React.FC<TooltipProps> = ({ children }) => {
  const [isVisible, setIsVisible] = React.useState(false);

  return (
    <TooltipContext.Provider value={{ isVisible, setIsVisible }}>
      <div className="relative inline-block">
        {children}
      </div>
    </TooltipContext.Provider>
  );
};

const TooltipTrigger: React.FC<TooltipTriggerProps> = ({ 
  asChild, 
  children, 
  onMouseEnter,
  onMouseLeave,
  ...props 
}) => {
  const context = React.useContext(TooltipContext);
  if (!context) {
    throw new Error('TooltipTrigger must be used within a Tooltip');
  }

  const { setIsVisible } = context;

  const handleMouseEnter = (e: React.MouseEvent) => {
    setIsVisible(true);
    if (typeof onMouseEnter === 'function') {
      onMouseEnter(e as React.MouseEvent<HTMLDivElement>);
    }
  };

  const handleMouseLeave = (e: React.MouseEvent) => {
    setIsVisible(false);
    if (typeof onMouseLeave === 'function') {
      onMouseLeave(e as React.MouseEvent<HTMLDivElement>);
    }
  };

  if (asChild && React.isValidElement(children)) {
    // Only pass DOM-safe props to cloned elements
    const childProps = children.props as any;
    const existingMouseEnter = childProps.onMouseEnter;
    const existingMouseLeave = childProps.onMouseLeave;
    
    return React.cloneElement(children, {
      onMouseEnter: (e: React.MouseEvent) => {
        handleMouseEnter(e);
        if (typeof existingMouseEnter === 'function') {
          existingMouseEnter(e);
        }
      },
      onMouseLeave: (e: React.MouseEvent) => {
        handleMouseLeave(e);
        if (typeof existingMouseLeave === 'function') {
          existingMouseLeave(e);
        }
      },
    } as any);
  }

  return (
    <div 
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      {...props}
    >
      {children}
    </div>
  );
};

const TooltipContent: React.FC<TooltipContentProps> = ({ 
  className, 
  children, 
  side = 'top',
  ...props 
}) => {
  const context = React.useContext(TooltipContext);
  if (!context) {
    throw new Error('TooltipContent must be used within a Tooltip');
  }

  const { isVisible } = context;

  if (!isVisible) return null;

  const sideClasses = {
    top: 'bottom-full left-1/2 transform -translate-x-1/2 mb-2', 
    right: 'left-full top-1/2 transform -translate-y-1/2 ml-2',
    bottom: 'top-full left-1/2 transform -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 transform -translate-y-1/2 mr-2', 
  };

  return (
    <div
      className={cn(
        'absolute z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-xs text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95',
        sideClasses[side],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export { 
  Tooltip, 
  TooltipContent, 
  TooltipProvider, 
  TooltipTrigger 
};
export type { 
  TooltipProps, 
  TooltipContentProps, 
  TooltipProviderProps, 
  TooltipTriggerProps 
}; 