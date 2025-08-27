import React from 'react';
import { cn } from '../../lib/utils';
import { useTranslation } from 'react-i18next';

interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  highZIndex?: boolean;
}

interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

interface DialogTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  children: React.ReactNode;
}

const Dialog: React.FC<DialogProps> = ({ open, onOpenChange, children }) => {
  const [isOpen, setIsOpen] = React.useState(open || false);

  React.useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open);
    }
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    setIsOpen(newOpen);
    onOpenChange?.(newOpen);
  };

  return (
    <div>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { 
            open: isOpen, 
            onOpenChange: handleOpenChange 
          } as any);
        }
        return child;
      })}
    </div>
  );
};

const DialogTrigger: React.FC<DialogTriggerProps> = ({ 
  asChild, 
  children, 
  onClick,
  ...props 
}) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onClick?.(e);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: handleClick,
    } as any);
  }

  return (
    <div onClick={handleClick} {...props}>
      {children}
    </div>
  );
};

const DialogContent: React.FC<DialogContentProps & { open?: boolean; onOpenChange?: (open: boolean) => void }> = ({ 
  className, 
  children, 
  open, 
  onOpenChange,
  highZIndex = false,
  ...props 
}) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  if (!open) return null;

  const zIndexClasses = highZIndex 
    ? { container: 'z-[9999]', backdrop: 'z-[9998]', content: 'z-[9999]' }
    : { container: 'z-50', backdrop: 'z-40', content: 'z-50' };

  return (
    <div className={`fixed inset-0 ${zIndexClasses.container} flex items-center justify-center`}>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/80 ${zIndexClasses.backdrop}`}
        onClick={() => onOpenChange?.(false)}
      />
      
      {/* Content */}
      <div
        className={cn(
          `relative ${zIndexClasses.content} grid w-full max-w-lg gap-4 border bg-background p-6 shadow-lg duration-200 sm:rounded-lg`,
          className
        )}
        {...props}
      >
        {children}
        
        {/* Close button - RTL aware */}
        <button
          onClick={() => onOpenChange?.(false)}
          className={cn(
            "absolute top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
            isRTL ? "left-4" : "right-4"
          )}
        >
          <span className="sr-only">Close</span>
          ✕
        </button>
      </div>
    </div>
  );
};

const DialogHeader: React.FC<DialogHeaderProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  return (
    <div
      className={cn(
        'flex flex-col space-y-1.5 text-center',
        isRTL ? 'sm:text-right' : 'sm:text-left',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const DialogTitle: React.FC<DialogTitleProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <h3
      className={cn(
        'text-lg font-semibold leading-none tracking-tight',
        className
      )}
      {...props}
    >
      {children}
    </h3>
  );
};

export { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
};
export type { 
  DialogProps, 
  DialogContentProps, 
  DialogHeaderProps, 
  DialogTitleProps, 
  DialogTriggerProps 
}; 