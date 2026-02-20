import { transformKeysToCamelCase, transformKeysToSnakeCase } from './caseTransform';

describe('caseTransform', () => {
  describe('transformKeysToCamelCase', () => {
    it('converts snake_case keys to camelCase', () => {
      const input = { user_name: 'John', created_at: '2024-01-01' };
      expect(transformKeysToCamelCase(input)).toEqual({
        userName: 'John',
        createdAt: '2024-01-01',
      });
    });

    it('handles nested objects', () => {
      const input = { user_info: { first_name: 'Jane' } };
      expect(transformKeysToCamelCase(input)).toEqual({
        userInfo: { firstName: 'Jane' },
      });
    });

    it('handles arrays', () => {
      const input = [{ item_id: 1 }, { item_id: 2 }];
      expect(transformKeysToCamelCase(input)).toEqual([
        { itemId: 1 },
        { itemId: 2 },
      ]);
    });

    it('passes through primitives unchanged', () => {
      expect(transformKeysToCamelCase('hello')).toBe('hello');
      expect(transformKeysToCamelCase(42)).toBe(42);
      expect(transformKeysToCamelCase(null)).toBeNull();
      expect(transformKeysToCamelCase(undefined)).toBeUndefined();
    });
  });

  describe('transformKeysToSnakeCase', () => {
    it('converts camelCase keys to snake_case', () => {
      const input = { userName: 'John', createdAt: '2024-01-01' };
      expect(transformKeysToSnakeCase(input)).toEqual({
        user_name: 'John',
        created_at: '2024-01-01',
      });
    });

    it('handles nested objects', () => {
      const input = { userInfo: { firstName: 'Jane' } };
      expect(transformKeysToSnakeCase(input)).toEqual({
        user_info: { first_name: 'Jane' },
      });
    });

    it('converts Date to ISO string', () => {
      const date = new Date('2024-01-15T00:00:00.000Z');
      expect(transformKeysToSnakeCase(date)).toBe('2024-01-15T00:00:00.000Z');
    });
  });
});
