import React from 'react';
import { cn } from '../../lib/utils';
import { useTranslation } from 'react-i18next';

interface AlertDialogProps {
  children: React.ReactNode;
}

interface AlertDialogTriggerProps extends React.HTMLAttributes<HTMLDivElement> {
  asChild?: boolean;
  children: React.ReactNode;
}

interface AlertDialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  highZIndex?: boolean;
}

interface AlertDialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface AlertDialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

interface AlertDialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

interface AlertDialogDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children: React.ReactNode;
}

interface AlertDialogActionProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

interface AlertDialogCancelProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const AlertDialog: React.FC<AlertDialogProps> = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, { 
            open: isOpen, 
            onOpenChange: setIsOpen 
          } as any);
        }
        return child;
      })}
    </div>
  );
};

const AlertDialogTrigger: React.FC<AlertDialogTriggerProps & { onOpenChange?: (open: boolean) => void }> = ({ 
  asChild, 
  children, 
  onOpenChange,
  onClick,
  ...props 
}) => {
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    onOpenChange?.(true);
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

const AlertDialogContent: React.FC<AlertDialogContentProps & { open?: boolean; onOpenChange?: (open: boolean) => void }> = ({ 
  className, 
  children, 
  open, 
  onOpenChange,
  highZIndex = false,
  ...props 
}) => {
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
      </div>
    </div>
  );
};

const AlertDialogHeader: React.FC<AlertDialogHeaderProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  return (
    <div
      className={cn(
        'flex flex-col space-y-2 text-center',
        isRTL ? 'sm:text-right' : 'sm:text-left',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const AlertDialogFooter: React.FC<AlertDialogFooterProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  
  return (
    <div
      className={cn(
        'flex flex-col-reverse sm:flex-row',
        isRTL ? 'sm:justify-start sm:space-x-reverse sm:space-x-2' : 'sm:justify-end sm:space-x-2',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

const AlertDialogTitle: React.FC<AlertDialogTitleProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <h2
      className={cn(
        'text-lg font-semibold',
        className
      )}
      {...props}
    >
      {children}
    </h2>
  );
};

const AlertDialogDescription: React.FC<AlertDialogDescriptionProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <p
      className={cn(
        'text-sm text-muted-foreground',
        className
      )}
      {...props}
    >
      {children}
    </p>
  );
};

const AlertDialogAction: React.FC<AlertDialogActionProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <button
      className={cn(
        'inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

const AlertDialogCancel: React.FC<AlertDialogCancelProps> = ({ 
  className, 
  children, 
  ...props 
}) => {
  return (
    <button
      className={cn(
        'mt-2 inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-semibold ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 sm:mt-0',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
};
export type { 
  AlertDialogProps, 
  AlertDialogActionProps, 
  AlertDialogCancelProps, 
  AlertDialogContentProps, 
  AlertDialogDescriptionProps, 
  AlertDialogFooterProps, 
  AlertDialogHeaderProps, 
  AlertDialogTitleProps, 
  AlertDialogTriggerProps 
}; 