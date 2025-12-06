import { useHealthConnectSync } from '@/hooks/useHealthConnectSync';
import { initializeNotifications, scheduleDailyReminders } from '@/services/notifications';
import { useGameStore } from '@/store/gameStore';
import { useHealthStore } from '@/store/healthStore';
import { useEffect, useRef, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';

/**
 * Custom hook to manage automated health data syncing
 * Syncs data on app foreground and periodically
 */
export function useHealthDataSync() {
  const { syncData, isAvailable, initialize, isInitialized } = useHealthConnectSync();
  const { lastSyncDate } = useHealthStore();
  const user = useGameStore((state) => state.user);
  const appState = useRef(AppState.currentState);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Initialize Health Connect ONCE on mount if available and user exists
  useEffect(() => {
    if (isAvailable && user && !hasInitialized && !isInitialized) {
      console.log('[useHealthDataSync] Initializing Health Connect...');
      initialize().then(() => {
        setHasInitialized(true);
      });
    }
  }, [isAvailable, user, hasInitialized, isInitialized]); // Only run when these change

  // Sync when app comes to foreground
  useEffect(() => {
    if (!user) return;

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        console.log('[useHealthDataSync] App came to foreground, checking if sync needed...');
        
        // Check if we should sync (only if last sync was more than 30 minutes ago)
        const shouldSync = !lastSyncDate || 
          (new Date().getTime() - new Date(lastSyncDate).getTime()) > 30 * 60 * 1000;

        if (shouldSync) {
          console.log('[useHealthDataSync] Triggering sync...');
          syncData();
        } else {
          console.log('[useHealthDataSync] Skipping sync (too recent)');
        }
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [lastSyncDate, user]); // Removed syncData from dependencies

  // Periodic sync every 30 minutes when app is active
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      if (AppState.currentState === 'active') {
        console.log('[useHealthDataSync] Periodic sync triggered');
        syncData();
      }
    }, 30 * 60 * 1000); // 30 minutes

    return () => clearInterval(interval);
  }, [user]); // Removed syncData from dependencies

  return {
    syncNow: syncData,
  };
}

/**
 * Custom hook to initialize and manage notifications
 */
export function useNotificationSetup() {
  const user = useGameStore((state) => state.user);
  const [hasSetup, setHasSetup] = useState(false);

  useEffect(() => {
    if (!user || hasSetup) return;

    const setupNotifications = async () => {
      console.log('[useNotificationSetup] Initializing notifications...');
      
      try {
        // Initialize notification system
        const initialized = await initializeNotifications();
        
        if (initialized) {
          console.log('[useNotificationSetup] Notifications initialized successfully');
          
          // Schedule daily reminders
          await scheduleDailyReminders();
          console.log('[useNotificationSetup] Daily reminders scheduled');
          setHasSetup(true);
        } else {
          console.warn('[useNotificationSetup] Failed to initialize notifications');
        }
      } catch (error) {
        console.error('[useNotificationSetup] Error setting up notifications:', error);
      }
    };

    setupNotifications();
  }, [user, hasSetup]); // Only run when user changes or setup status changes
}
