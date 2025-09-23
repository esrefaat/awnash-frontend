# Error Handling System

This document describes the error handling system implemented for handling 403/forbidden and other HTTP errors in the application.

## Components

### 1. ErrorPage Component (`src/components/ErrorPage.tsx`)

A reusable error page component that displays user-friendly error messages.

**Features:**
- Supports different HTTP status codes (403, 401, 404, 500)
- Customizable title, message, and icons
- Built-in navigation buttons (Go Back, Go Home)
- Responsive design

**Usage:**
```tsx
import { ErrorPage, ForbiddenPage } from '@/components/ErrorPage';

// Generic error page
<ErrorPage 
  statusCode={403}
  title="Access Forbidden"
  message="You are not authorized to access this page."
/>

// Specific error pages
<ForbiddenPage />
<UnauthorizedPage />
<NotFoundPage />
<ServerErrorPage />
```

### 2. ErrorBoundary Component (`src/components/ErrorBoundary.tsx`)

A class component that catches JavaScript errors and displays error pages.

**Usage:**
```tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

<ErrorBoundary>
  <YourComponent />
</ErrorBoundary>
```

### 3. useApiErrorHandler Hook (`src/hooks/useApiErrorHandler.ts`)

A custom hook for handling API errors and automatically showing error pages.

**Features:**
- Automatically detects 403/401 errors and shows error pages
- Supports different error formats (Axios, Fetch, etc.)
- Stores error details in sessionStorage for error pages
- Provides error state management

**Usage:**
```tsx
import { useApiErrorHandler } from '@/hooks/useApiErrorHandler';

const MyComponent = () => {
  const { handleApiError } = useApiErrorHandler();

  const fetchData = async () => {
    try {
      const response = await api.get('/some-endpoint');
      // Handle success
    } catch (error) {
      handleApiError(error); // Automatically handles 403/401 errors
    }
  };
};
```

### 4. Global Error Page (`src/app/error/page.tsx`)

A global error page that can be accessed via URL parameters or sessionStorage.

**Access via URL:**
```
/error?code=403&message=You%20are%20not%20authorized
```

**Access via sessionStorage:**
The error handler automatically stores errors in sessionStorage and navigates to this page.

## Implementation Examples

### Equipment List Page

```tsx
import { useApiErrorHandler } from '@/hooks/useApiErrorHandler';

const EquipmentPage = () => {
  const { handleApiError } = useApiErrorHandler();

  const fetchEquipment = async () => {
    try {
      const result = await equipmentService.getEquipment(params);
      // Handle success
    } catch (error) {
      handleApiError(error); // Will show error page for 403/401
    }
  };

  const deleteEquipment = async (id: string) => {
    try {
      await equipmentService.deleteEquipment(id);
      // Handle success
    } catch (error) {
      // Check for permission errors first
      if (error?.response?.data?.message?.includes('Missing required permissions')) {
        handleApiError(error);
        return;
      }
      // Handle other errors normally
      setDeleteError(error.message);
    }
  };
};
```

### Permission-Specific Error Handling

```tsx
import { usePermissionErrorHandler } from '@/hooks/useApiErrorHandler';

const MyComponent = () => {
  const { handlePermissionError } = usePermissionErrorHandler();

  const fetchData = async () => {
    try {
      const response = await api.get('/equipment');
      // Handle success
    } catch (error) {
      // Check if it's a permission error
      if (handlePermissionError(error, 'equipment:list')) {
        return; // Error page will be shown automatically
      }
      // Handle other errors
      console.error('Other error:', error);
    }
  };
};
```

## Error Response Format

The system expects API errors in this format:

```json
{
  "message": "Missing required permissions: equipment:list",
  "error": "Forbidden",
  "statusCode": 403
}
```

## Automatic Behavior

1. **403/401 Errors**: Automatically show error page and navigate to `/error`
2. **Other Errors**: Display inline error messages (configurable)
3. **Permission Errors**: Special handling for "Missing required permissions" messages

## Customization

### Custom Error Messages

```tsx
<ErrorPage
  statusCode={403}
  title="Custom Title"
  message="Custom error message"
  showBackButton={false}
  showHomeButton={true}
/>
```

### Custom Error Icons

```tsx
<ErrorPage
  statusCode={403}
  customIcon={<CustomIcon className="h-16 w-16 text-red-500" />}
/>
```

## Best Practices

1. **Always use the error handler** for API calls that might return 403/401
2. **Check for permission errors first** before handling other errors
3. **Provide fallback error messages** for network errors
4. **Use the global error page** for consistent error display
5. **Clear error states** when retrying operations

## Integration with Existing Code

To integrate with existing pages:

1. Import the error handler hook
2. Wrap API calls with try-catch
3. Use `handleApiError(error)` in catch blocks
4. Check for permission errors specifically when needed

This system provides a consistent way to handle authorization errors across the entire application.

