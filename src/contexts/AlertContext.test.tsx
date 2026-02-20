import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { AlertProvider, useAlert } from './AlertContext';

function wrapper({ children }: { children: React.ReactNode }) {
  return <AlertProvider>{children}</AlertProvider>;
}

describe('AlertContext', () => {
  describe('showAlert', () => {
    it('adds an alert to the list', () => {
      const { result } = renderHook(() => useAlert(), { wrapper });

      act(() => {
        result.current.showAlert({ message: 'Test alert', type: 'info' });
      });

      expect(result.current.alerts).toHaveLength(1);
      expect(result.current.alerts[0].message).toBe('Test alert');
      expect(result.current.alerts[0].type).toBe('info');
      expect(result.current.alerts[0].visible).toBe(true);
    });

    it('defaults type to info', () => {
      const { result } = renderHook(() => useAlert(), { wrapper });

      act(() => {
        result.current.showAlert({ message: 'Default type' });
      });

      expect(result.current.alerts[0].type).toBe('info');
    });
  });

  describe('showSuccess', () => {
    it('creates a success alert', () => {
      const { result } = renderHook(() => useAlert(), { wrapper });

      act(() => {
        result.current.showSuccess('Operation successful');
      });

      expect(result.current.alerts[0].type).toBe('success');
      expect(result.current.alerts[0].message).toBe('Operation successful');
    });

    it('accepts optional title', () => {
      const { result } = renderHook(() => useAlert(), { wrapper });

      act(() => {
        result.current.showSuccess('Done', 'Success Title');
      });

      expect(result.current.alerts[0].title).toBe('Success Title');
    });
  });

  describe('showError', () => {
    it('creates an error alert', () => {
      const { result } = renderHook(() => useAlert(), { wrapper });

      act(() => {
        result.current.showError('Something failed');
      });

      expect(result.current.alerts[0].type).toBe('error');
      expect(result.current.alerts[0].message).toBe('Something failed');
    });
  });

  describe('showWarning', () => {
    it('creates a warning alert', () => {
      const { result } = renderHook(() => useAlert(), { wrapper });

      act(() => {
        result.current.showWarning('Be careful');
      });

      expect(result.current.alerts[0].type).toBe('warning');
    });
  });

  describe('showInfo', () => {
    it('creates an info alert', () => {
      const { result } = renderHook(() => useAlert(), { wrapper });

      act(() => {
        result.current.showInfo('FYI');
      });

      expect(result.current.alerts[0].type).toBe('info');
    });
  });

  describe('dismissAlert', () => {
    it('removes an alert by id', () => {
      const { result } = renderHook(() => useAlert(), { wrapper });

      act(() => {
        result.current.showAlert({ message: 'Alert 1', duration: 0 });
        result.current.showAlert({ message: 'Alert 2', duration: 0 });
      });

      expect(result.current.alerts).toHaveLength(2);

      const idToRemove = result.current.alerts[0].id;

      act(() => {
        result.current.dismissAlert(idToRemove);
      });

      expect(result.current.alerts).toHaveLength(1);
      expect(result.current.alerts[0].message).toBe('Alert 2');
    });
  });

  describe('showConfirm', () => {
    it('returns a promise that resolves with true on confirm', async () => {
      const { result } = renderHook(() => useAlert(), { wrapper });

      let confirmResult: boolean | undefined;

      act(() => {
        result.current.showConfirm({ message: 'Are you sure?' }).then((val) => {
          confirmResult = val;
        });
      });

      expect(result.current.confirmState).not.toBeNull();
      expect(result.current.confirmState?.message).toBe('Are you sure?');

      act(() => {
        result.current.handleConfirmResponse(true);
      });

      await act(async () => {
        await Promise.resolve();
      });

      expect(confirmResult).toBe(true);
      expect(result.current.confirmState).toBeNull();
    });

    it('returns a promise that resolves with false on cancel', async () => {
      const { result } = renderHook(() => useAlert(), { wrapper });

      let confirmResult: boolean | undefined;

      act(() => {
        result.current.showConfirm({ message: 'Delete?' }).then((val) => {
          confirmResult = val;
        });
      });

      act(() => {
        result.current.handleConfirmResponse(false);
      });

      await act(async () => {
        await Promise.resolve();
      });

      expect(confirmResult).toBe(false);
    });
  });

  describe('useAlert outside provider', () => {
    it('throws error when used outside AlertProvider', () => {
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      expect(() => {
        renderHook(() => useAlert());
      }).toThrow('useAlert must be used within an AlertProvider');

      consoleSpy.mockRestore();
    });
  });
});
