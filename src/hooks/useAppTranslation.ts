import { useTranslation } from 'react-i18next';
import { useCallback } from 'react';

/**
 * RTL Languages
 * Languages that are written right-to-left
 */
const RTL_LANGUAGES = ['ar', 'he', 'fa', 'ur'];

/**
 * Custom translation hook with RTL support
 * 
 * This hook wraps react-i18next's useTranslation and adds:
 * - RTL detection for Arabic and other RTL languages
 * - Convenience language change method
 * - Type-safe namespace support
 * 
 * @example
 * ```tsx
 * const { t, isRTL, language, changeLanguage } = useAppTranslation('equipment');
 * 
 * // Use in components
 * <div className={isRTL ? 'text-right' : 'text-left'}>
 *   {t('title')}
 * </div>
 * 
 * // Conditional RTL classes
 * <div className={cn(
 *   'flex items-center gap-2',
 *   isRTL && 'flex-row-reverse'
 * )}>
 *   <Icon /> {t('label')}
 * </div>
 * 
 * // Icon positioning
 * <div className={`absolute ${isRTL ? 'left-3' : 'right-3'}`}>
 *   <SearchIcon />
 * </div>
 * ```
 */
export function useAppTranslation(namespace?: string | string[]) {
  const { t, i18n } = useTranslation(namespace);
  
  /**
   * Check if current language is RTL
   */
  const isRTL = RTL_LANGUAGES.includes(i18n.language);
  
  /**
   * Current language code
   */
  const language = i18n.language;
  
  /**
   * Change language and update document direction
   */
  const changeLanguage = useCallback(async (lang: string) => {
    await i18n.changeLanguage(lang);
    
    // Update document direction
    if (typeof document !== 'undefined') {
      const newIsRTL = RTL_LANGUAGES.includes(lang);
      document.documentElement.dir = newIsRTL ? 'rtl' : 'ltr';
      document.documentElement.lang = lang;
    }
  }, [i18n]);

  /**
   * Get text alignment class based on RTL
   */
  const getTextAlign = useCallback((defaultAlign: 'left' | 'right' = 'left'): string => {
    if (defaultAlign === 'left') {
      return isRTL ? 'text-right' : 'text-left';
    }
    return isRTL ? 'text-left' : 'text-right';
  }, [isRTL]);

  /**
   * Get flex direction class based on RTL
   */
  const getFlexDirection = useCallback((): string => {
    return isRTL ? 'flex-row-reverse' : 'flex-row';
  }, [isRTL]);

  /**
   * Get margin/padding direction for icons/elements
   * @param side - Which side the spacing should be on (in LTR mode)
   * @param spacing - Tailwind spacing value (e.g., '2', '4', 'px')
   * @param type - 'margin' or 'padding'
   */
  const getDirectionalSpacing = useCallback((
    side: 'left' | 'right',
    spacing: string,
    type: 'margin' | 'padding' = 'margin'
  ): string => {
    const prefix = type === 'margin' ? 'm' : 'p';
    const actualSide = isRTL 
      ? (side === 'left' ? 'r' : 'l') 
      : (side === 'left' ? 'l' : 'r');
    return `${prefix}${actualSide}-${spacing}`;
  }, [isRTL]);

  /**
   * Get position class for absolute positioned elements
   * @param side - Which side in LTR mode
   * @param value - Tailwind position value (e.g., '0', '4', 'auto')
   */
  const getPositionSide = useCallback((
    side: 'left' | 'right',
    value: string
  ): string => {
    const actualSide = isRTL
      ? (side === 'left' ? 'right' : 'left')
      : side;
    return `${actualSide}-${value}`;
  }, [isRTL]);

  return {
    t,
    i18n,
    isRTL,
    language,
    changeLanguage,
    // Utility functions for RTL-aware styling
    getTextAlign,
    getFlexDirection,
    getDirectionalSpacing,
    getPositionSide,
  };
}

export type UseAppTranslationReturn = ReturnType<typeof useAppTranslation>;
