import { useMemo } from 'react';
import { useTheme } from 'next-themes';

/**
 * Hook that returns chart tooltip styles based on the current theme.
 * Use this for Recharts Tooltip contentStyle, labelStyle, and itemStyle props.
 */
export const useChartTooltipStyle = () => {
  const { resolvedTheme } = useTheme();
  const isDarkMode = resolvedTheme === 'dark';

  const tooltipStyle = useMemo(() => ({
    contentStyle: {
      backgroundColor: isDarkMode ? '#111827' : '#ffffff',
      border: `1px solid ${isDarkMode ? '#374151' : '#e5e7eb'}`,
      borderRadius: '8px',
      color: isDarkMode ? '#F9FAFB' : '#111827',
      fontSize: '14px',
      boxShadow: isDarkMode
        ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
        : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      padding: '12px'
    },
    labelStyle: {
      color: isDarkMode ? '#F9FAFB' : '#111827',
      fontWeight: 'bold' as const
    },
    itemStyle: {
      color: isDarkMode ? '#D1D5DB' : '#4B5563'
    }
  }), [isDarkMode]);

  return tooltipStyle;
};

export default useChartTooltipStyle;
