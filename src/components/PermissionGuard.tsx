import React from 'react';
import { usePermissions } from '../hooks/usePermissions';

interface PermissionGuardProps {
  permission?: string;
  permissions?: string[];
  role?: string;
  roles?: string[];
  requireAll?: boolean; // For permissions: require all vs any (default: any)
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  permissions,
  role,
  roles,
  requireAll = false,
  fallback = null,
  children,
}) => {
  const { hasPermission, hasRole, hasAnyPermission, hasAllPermissions } = usePermissions();

  // Check single permission
  if (permission && !hasPermission(permission)) {
    return <>{fallback}</>;
  }

  // Check multiple permissions
  if (permissions && permissions.length > 0) {
    const hasPermissions = requireAll 
      ? hasAllPermissions(permissions)
      : hasAnyPermission(permissions);
    
    if (!hasPermissions) {
      return <>{fallback}</>;
    }
  }

  // Check single role
  if (role && !hasRole(role)) {
    return <>{fallback}</>;
  }

  // Check multiple roles
  if (roles && roles.length > 0) {
    const hasRequiredRole = roles.some(r => hasRole(r));
    if (!hasRequiredRole) {
      return <>{fallback}</>;
    }
  }

  return <>{children}</>;
};

// Higher-order component version
export const withPermissions = (
  WrappedComponent: React.ComponentType<any>,
  requiredPermissions: string | string[],
  fallback?: React.ReactNode
) => {
  return function PermissionWrappedComponent(props: any) {
    const permissions = Array.isArray(requiredPermissions) 
      ? requiredPermissions 
      : [requiredPermissions];

    return (
      <PermissionGuard permissions={permissions} fallback={fallback}>
        <WrappedComponent {...props} />
      </PermissionGuard>
    );
  };
};

// Utility components for common use cases
export const AdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard 
    roles={['super_admin', 'booking_admin', 'content_admin']} 
    fallback={fallback}
  >
    {children}
  </PermissionGuard>
);

export const SuperAdminOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard role="super_admin" fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const OwnerOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard roles={['owner', 'hybrid']} fallback={fallback}>
    {children}
  </PermissionGuard>
);

export const RenterOnly: React.FC<{ children: React.ReactNode; fallback?: React.ReactNode }> = ({ 
  children, 
  fallback 
}) => (
  <PermissionGuard roles={['renter', 'hybrid']} fallback={fallback}>
    {children}
  </PermissionGuard>
); 