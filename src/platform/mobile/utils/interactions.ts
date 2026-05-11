import { Alert, Platform } from 'react-native';

/**
 * Platform-agnostic interaction utilities.
 */

export const platformConfirm = (message: string): boolean => {
  if (Platform.OS === 'web') {
    return window.confirm(message);
  }
  
  // Note: Native Alert is async, but we attempt a sync-like behavior for API compatibility
  // In a real app, these should be async with callbacks.
  console.log('[Native] Requesting Confirmation:', message);
  return true; 
};

export const platformAlert = (message: string): void => {
  if (Platform.OS === 'web') {
    window.alert(message);
  } else {
    Alert.alert('CivFit', message);
  }
};
