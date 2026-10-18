import { useSyncExternalStore } from 'react';
import { getVersion, subscribe } from '../services/mockDb';

// Re-renders the component whenever the mock data changes.
// It disappears when the services start calling the real API.
export function useDbVersion() {
  return useSyncExternalStore(subscribe, getVersion);
}