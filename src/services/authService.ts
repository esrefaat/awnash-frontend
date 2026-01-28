import { apiService } from './api';

export interface User {
  id: string;
  mobileNumber: string;
  email?: string;
  role: string;
  roles?: string[];
  permissions?: string[];
  fullName: string;
  isVerified: boolean;
  isSuperAdmin?: boolean;
}

export interface LoginCredentials {
  email?: string;
  mobileNumber?: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  message?: string;
}

export interface RegisterData {
  email?: string;
  mobileNumber: string;
  password: string;
  fullName: string;
  role?: string;
}

class AuthService {
  /**
   * Login with email/mobile and password
   * Uses HTTP-only cookies exclusively for security
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007/api/v1'}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for HTTP-only cookies
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Login failed' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const authData: AuthResponse = await response.json();
      
      // HTTP-only cookies are set by the backend automatically
      // No need to store tokens in localStorage for security
      
      return authData;
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    }
  }

  /**
   * Register a new user
   */
  async register(registerData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007/api/v1'}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(registerData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Registration failed' }));
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const authData: AuthResponse = await response.json();
      
      // HTTP-only cookies are set by the backend automatically
      
      return authData;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  /**
   * Logout and clear HTTP-only cookies
   */
  async logout(): Promise<void> {
    try {
      // Call backend logout to clear HTTP-only cookies
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007/api/v1'}/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout request failed:', error);
    }
  }

  /**
   * Get current user data from backend (using HTTP-only cookies)
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3007/api/v1'}/auth/me`, {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get current user:', error);
      return null;
    }
  }

  /**
   * Check if user is authenticated by calling backend
   */
  async isAuthenticated(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  /**
   * Check if user has required role
   */
  async hasRole(requiredRoles: string | string[]): Promise<boolean> {
    const user = await this.getCurrentUser();
    if (!user) return false;
    
    const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
    
    // Check both primary role and additional roles
    const userRoles = [user.role, ...(user.roles || [])];
    return roles.some(role => userRoles.includes(role));
  }

  /**
   * Check if user has required permission
   */
  async hasPermission(permission: string): Promise<boolean> {
    const user = await this.getCurrentUser();
    if (!user || !user.permissions) return false;
    
    return user.permissions.includes(permission);
  }

  /**
   * Check if user has any of the required permissions
   */
  async hasAnyPermission(permissions: string[]): Promise<boolean> {
    const user = await this.getCurrentUser();
    if (!user || !user.permissions) return false;
    
    return permissions.some(permission => user.permissions!.includes(permission));
  }

  /**
   * Check if user has all of the required permissions
   */
  async hasAllPermissions(permissions: string[]): Promise<boolean> {
    const user = await this.getCurrentUser();
    if (!user || !user.permissions) return false;
    
    return permissions.every(permission => user.permissions!.includes(permission));
  }

  /**
   * No need for authorization header since we use HTTP-only cookies
   * This method is kept for backward compatibility but returns empty object
   */
  getAuthHeader(): {} {
    return {}; // HTTP-only cookies are sent automatically
  }

  /**
   * Validate authentication status
   */
  async validateToken(): Promise<boolean> {
    return await this.isAuthenticated();
  }
}

export const authService = new AuthService(); 