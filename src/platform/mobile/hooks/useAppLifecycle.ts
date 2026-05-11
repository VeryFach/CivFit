import { useEffect, useRef } from 'react';
import { AppState, Platform } from 'react-native';

/**
 * App Lifecycle Hook
 * Handles app state changes like background/foreground transitions.
 */
export function useAppLifecycle(onForeground?: () => void, onBackground?: () => void) {
  const appState = useRef(Platform.OS === 'web' ? 'active' : AppState.currentState);

  useEffect(() => {
    if (Platform.OS === 'web') {
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'visible') {
          appState.current = 'active';
          onForeground?.();
        } else {
          appState.current = 'background';
          onBackground?.();
        }
      };
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    } else {
      const subscription = AppState.addEventListener('change', nextAppState => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === 'active'
        ) {
          onForeground?.();
        } else if (nextAppState.match(/inactive|background/)) {
          onBackground?.();
        }
        appState.current = nextAppState;
      });
      return () => subscription.remove();
    }
  }, [onForeground, onBackground]);

  return appState.current;
}
