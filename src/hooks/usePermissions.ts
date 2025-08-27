import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  sub: string;
  email: string;
  role: string;
  roles?: string[];
  permissions?: string[];
  exp: number;
}

interface PermissionContext {
  permissions: string[];
  roles: string[];
  user: {
    id: string;
    email: string;
    role: string;
  } | null;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
  isAuthenticated: boolean;
}

export const usePermissions = (): PermissionContext => {
  const [permissionData, setPermissionData] = useState<{
    permissions: string[];
    roles: string[];
    user: {
      id: string;
      email: string;
      role: string;
    } | null;
    isAuthenticated: boolean;
  }>({
    permissions: [],
    roles: [],
    user: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    const loadPermissions = async () => {
      try {
        // Use HTTP-only cookies exclusively - call backend to get user info
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'}/auth/me`, {
          method: 'GET',
          credentials: 'include', // Include HTTP-only cookies
        });

        if (!response.ok) {
          // Not authenticated or token expired
          setPermissionData({
            permissions: [],
            roles: [],
            user: null,
            isAuthenticated: false,
          });
          return;
        }

        const userData = await response.json();
        
        // Build roles array: include primary role + additional roles
        const allRoles = [userData.role];
        if (userData.roles && Array.isArray(userData.roles)) {
          allRoles.push(...userData.roles);
        }

        setPermissionData({
          permissions: userData.permissions || [],
          roles: allRoles,
          user: {
            id: userData.id,
            email: userData.email,
            role: userData.role,
          },
          isAuthenticated: true,
        });
      } catch (error) {
        console.error('Error loading user permissions:', error);
        setPermissionData({
          permissions: [],
          roles: [],
          user: null,
          isAuthenticated: false,
        });
      }
    };

    loadPermissions();

    // Set up periodic refresh to check authentication status
    const interval = setInterval(loadPermissions, 5 * 60 * 1000); // Check every 5 minutes
    
    return () => clearInterval(interval);
  }, []);

  const hasPermission = (permission: string): boolean => {
    return permissionData.permissions.includes(permission);
  };

  const hasRole = (role: string): boolean => {
    // Check if the role exists in the roles array (which includes primary role + additional roles)
    return permissionData.roles.includes(role);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some(permission => permissionData.permissions.includes(permission));
  };

  const hasAllPermissions = (permissions: string[]): boolean => {
    return permissions.every(permission => permissionData.permissions.includes(permission));
  };

  return {
    ...permissionData,
    hasPermission,
    hasRole,
    hasAnyPermission,
    hasAllPermissions,
  };
};

// Convenience hook for checking a single permission
export const usePermission = (permission: string): boolean => {
  const { hasPermission } = usePermissions();
  return hasPermission(permission);
};

// Convenience hook for checking multiple permissions (any)
export const useAnyPermission = (permissions: string[]): boolean => {
  const { hasAnyPermission } = usePermissions();
  return hasAnyPermission(permissions);
};

// Convenience hook for checking multiple permissions (all)
export const useAllPermissions = (permissions: string[]): boolean => {
  const { hasAllPermissions } = usePermissions();
  return hasAllPermissions(permissions);
}; 