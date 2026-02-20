import { renderHook } from '@testing-library/react';
import { useChartTooltipStyle } from './useChartTooltipStyle';

describe('useChartTooltipStyle', () => {
  it('returns dark mode styles when theme is dark', () => {
    const { result } = renderHook(() => useChartTooltipStyle());

    expect(result.current.contentStyle).toEqual(
      expect.objectContaining({
        backgroundColor: '#111827',
        color: '#F9FAFB',
        borderRadius: '8px',
        fontSize: '14px',
        padding: '12px',
      }),
    );
    expect(result.current.contentStyle.border).toContain('#374151');
  });

  it('returns dark label style', () => {
    const { result } = renderHook(() => useChartTooltipStyle());

    expect(result.current.labelStyle).toEqual({
      color: '#F9FAFB',
      fontWeight: 'bold',
    });
  });

  it('returns dark item style', () => {
    const { result } = renderHook(() => useChartTooltipStyle());

    expect(result.current.itemStyle).toEqual({
      color: '#D1D5DB',
    });
  });
});
