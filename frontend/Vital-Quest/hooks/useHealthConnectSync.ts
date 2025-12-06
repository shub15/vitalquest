import { calculateXpForActivity } from '@/services/gamificationEngine';
import {
  initializeHealthConnect,
  isHealthConnectAvailable,
  syncHealthDataRange,
  syncTodayHealthData,
} from '@/services/healthConnect';
import { useGameStore } from '@/store/gameStore';
import { useHealthStore } from '@/store/healthStore';
import { HealthActivity } from '@/types';
import { useCallback, useEffect, useState } from 'react';

/**
 * Custom hook to manage Health Connect integration
 */
export function useHealthConnectSync() {
  const [isAvailable, setIsAvailable] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { importHealthData, setSyncStatus, isSyncing } = useHealthStore();
  const { addXp, user } = useGameStore();

  // Check availability on mount
  useEffect(() => {
    checkAvailability();
  }, []);

  const checkAvailability = async () => {
    console.log('[useHealthConnectSync] Checking availability...');
    try {
      const available = await isHealthConnectAvailable();
      console.log('[useHealthConnectSync] Availability result:', available);
      setIsAvailable(available);
    } catch (err) {
      console.error('[useHealthConnectSync] Error checking availability:', err);
      setError('Failed to check Health Connect availability');
    }
  };

  const initialize = useCallback(async (): Promise<boolean> => {
    console.log('[useHealthConnectSync] Initializing...');
    try {
      setError(null);
      const success = await initializeHealthConnect();
      console.log('[useHealthConnectSync] Initialization result:', success);
      setIsInitialized(success);
      
      if (!success) {
        const errorMsg = 'Failed to initialize Health Connect. Please check permissions.';
        console.warn('[useHealthConnectSync]', errorMsg);
        setError(errorMsg);
      }
      
      return success;
    } catch (err) {
      console.error('[useHealthConnectSync] Error initializing:', err);
      setError('Failed to initialize Health Connect');
      return false;
    }
  }, []); // No dependencies - function is stable

  const syncData = useCallback(async (): Promise<boolean> => {
    console.log('[useHealthConnectSync] === STARTING SYNC ===');
    
    if (!isInitialized) {
      console.log('[useHealthConnectSync] Not initialized, initializing now...');
      const initialized = await initialize();
      if (!initialized) {
        console.error('[useHealthConnectSync] Initialization failed, aborting sync');
        return false;
      }
    }

    try {
      setSyncStatus(true);
      setError(null);
      console.log('[useHealthConnectSync] Fetching today\'s health data...');

      // Fetch today's health data
      const healthData = await syncTodayHealthData();
      console.log('[useHealthConnectSync] Received health data:', healthData);

      // Convert Health Connect data to our HealthActivity format
      const activities: Omit<HealthActivity, 'id'>[] = [];

      // Add steps
      if (healthData.steps > 0) {
        console.log('[useHealthConnectSync] Adding steps activity:', healthData.steps);
        activities.push({
          type: 'steps',
          date: new Date(),
          value: healthData.steps,
          unit: 'steps',
          source: 'health_connect',
        });
      }

      // Add exercises
      console.log('[useHealthConnectSync] Processing', healthData.exercises.length, 'exercises');
      healthData.exercises.forEach((exercise) => {
        const duration = exercise.metadata?.duration || 0;
        console.log('[useHealthConnectSync] Exercise:', { duration, date: exercise.date });
        activities.push({
          type: 'exercise',
          date: exercise.date,
          value: duration,
          unit: 'minutes',
          source: 'health_connect',
          metadata: {
            duration,
          },
        });
      });

      // Add sleep
      console.log('[useHealthConnectSync] Processing', healthData.sleep.length, 'sleep sessions');
      healthData.sleep.forEach((sleep) => {
        const sleepHours = sleep.value || 0;
        console.log('[useHealthConnectSync] Sleep:', { hours: sleepHours, date: sleep.date });
        activities.push({
          type: 'sleep',
          date: sleep.date,
          value: sleepHours,
          unit: 'hours',
          source: 'health_connect',
          metadata: {
            duration: sleep.metadata?.duration,
            quality: sleep.metadata?.quality,
          },
        });
      });

      // Import all activities into health store
      if (activities.length > 0) {
        console.log('[useHealthConnectSync] Importing', activities.length, 'activities');
        importHealthData(activities);

        // Award XP for synced activities
        if (user) {
          let totalXp = 0;

          // Calculate XP for steps
          if (healthData.steps > 0) {
            const stepsXp = calculateXpForActivity('steps', healthData.steps);
            console.log('[useHealthConnectSync] Steps XP:', stepsXp);
            totalXp += stepsXp;
          }

          // Calculate XP for exercises
          healthData.exercises.forEach((exercise) => {
            const duration = exercise.metadata?.duration || 0;
            const exerciseXp = calculateXpForActivity('exercise', duration);
            console.log('[useHealthConnectSync] Exercise XP:', exerciseXp);
            totalXp += exerciseXp;
          });

          // Calculate XP for sleep
          healthData.sleep.forEach((sleep) => {
            const sleepHours = sleep.value || 0;
            const sleepXp = calculateXpForActivity('sleep', sleepHours);
            console.log('[useHealthConnectSync] Sleep XP:', sleepXp);
            totalXp += sleepXp;
          });

          if (totalXp > 0) {
            console.log('[useHealthConnectSync] Awarding total XP:', totalXp);
            addXp(totalXp);
          }
        }
      } else {
        console.log('[useHealthConnectSync] No activities to import');
      }

      setSyncStatus(false);
      console.log('[useHealthConnectSync] === SYNC COMPLETE ===');
      return true;
    } catch (err) {
      console.error('[useHealthConnectSync] Error syncing:', err);
      setError('Failed to sync health data');
      setSyncStatus(false);
      return false;
    }
  }, [isInitialized, initialize, setSyncStatus, importHealthData, user, addXp]);

  const syncDataRange = useCallback(async (startDate: Date, endDate: Date): Promise<boolean> => {
    console.log('[useHealthConnectSync] === STARTING RANGE SYNC ===');
    console.log('[useHealthConnectSync] From:', startDate.toISOString(), 'To:', endDate.toISOString());
    
    if (!isInitialized) {
      console.log('[useHealthConnectSync] Not initialized, initializing now...');
      const initialized = await initialize();
      if (!initialized) {
        console.error('[useHealthConnectSync] Initialization failed, aborting sync');
        return false;
      }
    }

    try {
      setSyncStatus(true);
      setError(null);
      console.log('[useHealthConnectSync] Fetching health data for date range...');

      // Fetch health data for the date range
      const healthData = await syncHealthDataRange(startDate, endDate);
      console.log('[useHealthConnectSync] Received health data:', healthData);

      // Convert Health Connect data to our HealthActivity format
      const activities: Omit<HealthActivity, 'id'>[] = [];

      // Add steps
      if (healthData.steps > 0) {
        console.log('[useHealthConnectSync] Adding steps activity:', healthData.steps);
        activities.push({
          type: 'steps',
          date: new Date(),
          value: healthData.steps,
          unit: 'steps',
          source: 'health_connect',
        });
      }

      // Add exercises
      console.log('[useHealthConnectSync] Processing', healthData.exercises.length, 'exercises');
      healthData.exercises.forEach((exercise) => {
        const duration = exercise.metadata?.duration || 0;
        console.log('[useHealthConnectSync] Exercise:', { duration, date: exercise.date });
        activities.push({
          type: 'exercise',
          date: exercise.date,
          value: duration,
          unit: 'minutes',
          source: 'health_connect',
          metadata: {
            duration,
          },
        });
      });

      // Add sleep
      console.log('[useHealthConnectSync] Processing', healthData.sleep.length, 'sleep sessions');
      healthData.sleep.forEach((sleep) => {
        const sleepHours = sleep.value || 0;
        console.log('[useHealthConnectSync] Sleep:', { hours: sleepHours, date: sleep.date });
        activities.push({
          type: 'sleep',
          date: sleep.date,
          value: sleepHours,
          unit: 'hours',
          source: 'health_connect',
          metadata: {
            duration: sleep.metadata?.duration,
            quality: sleep.metadata?.quality,
          },
        });
      });

      // Import all activities into health store
      if (activities.length > 0) {
        console.log('[useHealthConnectSync] Importing', activities.length, 'activities from date range');
        importHealthData(activities);

        // Award XP for synced activities
        if (user) {
          let totalXp = 0;

          // Calculate XP for steps
          if (healthData.steps > 0) {
            const stepsXp = calculateXpForActivity('steps', healthData.steps);
            console.log('[useHealthConnectSync] Steps XP:', stepsXp);
            totalXp += stepsXp;
          }

          // Calculate XP for exercises
          healthData.exercises.forEach((exercise) => {
            const duration = exercise.metadata?.duration || 0;
            const exerciseXp = calculateXpForActivity('exercise', duration);
            console.log('[useHealthConnectSync] Exercise XP:', exerciseXp);
            totalXp += exerciseXp;
          });

          // Calculate XP for sleep
          healthData.sleep.forEach((sleep) => {
            const sleepHours = sleep.value || 0;
            const sleepXp = calculateXpForActivity('sleep', sleepHours);
            console.log('[useHealthConnectSync] Sleep XP:', sleepXp);
            totalXp += sleepXp;
          });

          if (totalXp > 0) {
            console.log('[useHealthConnectSync] Awarding total XP for range:', totalXp);
            addXp(totalXp);
          }
        }
      } else {
        console.log('[useHealthConnectSync] No activities to import from date range');
      }

      setSyncStatus(false);
      console.log('[useHealthConnectSync] === RANGE SYNC COMPLETE ===');
      return true;
    } catch (err) {
      console.error('[useHealthConnectSync] Error syncing range:', err);
      setError('Failed to sync health data for date range');
      setSyncStatus(false);
      return false;
    }
  }, [isInitialized, initialize, setSyncStatus, importHealthData, user, addXp]);

  return {
    isAvailable,
    isInitialized,
    isSyncing,
    error,
    initialize,
    syncData,
    syncDataRange,
  };
}
