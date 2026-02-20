import { renderHook } from '@testing-library/react';
import { useAppTranslation } from './useAppTranslation';

describe('useAppTranslation', () => {
  it('returns t function that echoes keys (mocked)', () => {
    const { result } = renderHook(() => useAppTranslation('common'));
    expect(result.current.t('someKey')).toBe('someKey');
  });

  it('isRTL is false for English', () => {
    const { result } = renderHook(() => useAppTranslation());
    expect(result.current.isRTL).toBe(false);
  });

  it('language is "en"', () => {
    const { result } = renderHook(() => useAppTranslation());
    expect(result.current.language).toBe('en');
  });

  describe('getTextAlign', () => {
    it('returns text-left for LTR default', () => {
      const { result } = renderHook(() => useAppTranslation());
      expect(result.current.getTextAlign('left')).toBe('text-left');
    });

    it('returns text-right when default is right in LTR', () => {
      const { result } = renderHook(() => useAppTranslation());
      expect(result.current.getTextAlign('right')).toBe('text-right');
    });
  });

  describe('getFlexDirection', () => {
    it('returns flex-row in LTR', () => {
      const { result } = renderHook(() => useAppTranslation());
      expect(result.current.getFlexDirection()).toBe('flex-row');
    });
  });

  describe('getDirectionalSpacing', () => {
    it('returns ml-2 for left margin in LTR', () => {
      const { result } = renderHook(() => useAppTranslation());
      expect(result.current.getDirectionalSpacing('left', '2', 'margin')).toBe('ml-2');
    });

    it('returns mr-4 for right margin in LTR', () => {
      const { result } = renderHook(() => useAppTranslation());
      expect(result.current.getDirectionalSpacing('right', '4', 'margin')).toBe('mr-4');
    });

    it('returns pl-3 for left padding in LTR', () => {
      const { result } = renderHook(() => useAppTranslation());
      expect(result.current.getDirectionalSpacing('left', '3', 'padding')).toBe('pl-3');
    });

    it('defaults type to margin', () => {
      const { result } = renderHook(() => useAppTranslation());
      expect(result.current.getDirectionalSpacing('left', '2')).toBe('ml-2');
    });
  });

  describe('getPositionSide', () => {
    it('returns left-0 for left side in LTR', () => {
      const { result } = renderHook(() => useAppTranslation());
      expect(result.current.getPositionSide('left', '0')).toBe('left-0');
    });

    it('returns right-4 for right side in LTR', () => {
      const { result } = renderHook(() => useAppTranslation());
      expect(result.current.getPositionSide('right', '4')).toBe('right-4');
    });
  });
});
