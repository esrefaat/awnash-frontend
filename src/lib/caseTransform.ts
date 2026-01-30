/**
 * Case transformation utilities for API responses.
 * 
 * The backend returns snake_case JSON keys, but the frontend uses camelCase.
 * These utilities handle the bidirectional transformation.
 */

/**
 * Convert a snake_case string to camelCase.
 * Example: "created_at" -> "createdAt", "equipment_type_id" -> "equipmentTypeId"
 */
function toCamelCase(str: string): string {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

/**
 * Convert a camelCase string to snake_case.
 * Example: "createdAt" -> "created_at", "equipmentTypeId" -> "equipment_type_id"
 */
function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Recursively transform all object keys from snake_case to camelCase.
 * Used to convert backend API responses to frontend-friendly format.
 * 
 * Handles:
 * - Nested objects
 * - Arrays of objects
 * - Primitives (passed through unchanged)
 * - null/undefined (passed through unchanged)
 * 
 * @example
 * ```typescript
 * const response = { user_name: "John", created_at: "2024-01-01" };
 * const result = transformKeysToCamelCase(response);
 * // { userName: "John", createdAt: "2024-01-01" }
 * ```
 */
export function transformKeysToCamelCase(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(transformKeysToCamelCase);
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  // Handle Date objects - pass through unchanged
  if (obj instanceof Date) {
    return obj;
  }

  return Object.keys(obj as Record<string, unknown>).reduce((acc, key) => {
    const camelKey = toCamelCase(key);
    acc[camelKey] = transformKeysToCamelCase((obj as Record<string, unknown>)[key]);
    return acc;
  }, {} as Record<string, unknown>);
}

/**
 * Recursively transform all object keys from camelCase to snake_case.
 * Used to convert frontend request bodies to backend-expected format.
 * 
 * @example
 * ```typescript
 * const request = { userName: "John", createdAt: "2024-01-01" };
 * const result = transformKeysToSnakeCase(request);
 * // { user_name: "John", created_at: "2024-01-01" }
 * ```
 */
export function transformKeysToSnakeCase(obj: unknown): unknown {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(transformKeysToSnakeCase);
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  // Handle Date objects - convert to ISO string
  if (obj instanceof Date) {
    return obj.toISOString();
  }

  return Object.keys(obj as Record<string, unknown>).reduce((acc, key) => {
    const snakeKey = toSnakeCase(key);
    acc[snakeKey] = transformKeysToSnakeCase((obj as Record<string, unknown>)[key]);
    return acc;
  }, {} as Record<string, unknown>);
}
