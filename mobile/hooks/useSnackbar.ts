import { useState, useCallback, useRef } from 'react';

export type SnackbarVariant = 'neutral' | 'success' | 'error';

export interface SnackbarState {
  visible: boolean;
  message: string;
  variant: SnackbarVariant;
  action?: { label: string; onPress: () => void };
}

export function useSnackbar() {
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    visible: false,
    message: '',
    variant: 'neutral',
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSnackbar = useCallback(
    (
      message: string,
      variant: SnackbarVariant = 'neutral',
      action?: { label: string; onPress: () => void }
    ) => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      setSnackbar({ visible: true, message, variant, action });
      timerRef.current = setTimeout(() => {
        setSnackbar((s) => ({ ...s, visible: false }));
      }, 4000);
    },
    []
  );

  const hideSnackbar = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setSnackbar((s) => ({ ...s, visible: false }));
  }, []);

  return { snackbar, showSnackbar, hideSnackbar };
}
