import { HealthActivity } from '@/types';
import { Platform } from 'react-native';
import { initialize, readRecords, requestPermission, SdkAvailabilityStatus } from 'react-native-health-connect';

// Health Connect record types
export enum HealthConnectPermission {
  STEPS = 'Steps',
  DISTANCE = 'Distance',
  ACTIVE_CALORIES_BURNED = 'ActiveCaloriesBurned',
  HEART_RATE = 'HeartRate',
  SLEEP_SESSION = 'SleepSession',
  EXERCISE_SESSION = 'ExerciseSession',
}

/**
 * Check if Health Connect is available on the device
 */
export async function isHealthConnectAvailable(): Promise<boolean> {
  console.log('[Health Connect] Checking availability...');
  
  if (Platform.OS !== 'android') {
    console.warn('[Health Connect] Not on Android, Health Connect unavailable');
    return false;
  }

  try {
    const status = await initialize();
    console.log('[Health Connect] SDK Status:', status);
    const isAvailable = status === SdkAvailabilityStatus.SDK_AVAILABLE;
    console.log('[Health Connect] Is Available:', isAvailable);
    return isAvailable;
  } catch (error) {
    console.error('[Health Connect] Error checking availability:', error);
    return false;
  }
}

/**
 * Request Health Connect permissions
 */
export async function requestHealthConnectPermissions(): Promise<boolean> {
  console.log('[Health Connect] Requesting permissions...');
  
  if (Platform.OS !== 'android') {
    console.warn('[Health Connect] Not on Android, skipping permissions');
    return false;
  }

  try {
    const permissions = [
      { accessType: 'read' as const, recordType: HealthConnectPermission.STEPS },
      { accessType: 'read' as const, recordType: HealthConnectPermission.DISTANCE },
      { accessType: 'read' as const, recordType: HealthConnectPermission.ACTIVE_CALORIES_BURNED },
      { accessType: 'read' as const, recordType: HealthConnectPermission.HEART_RATE },
      { accessType: 'read' as const, recordType: HealthConnectPermission.SLEEP_SESSION },
      { accessType: 'read' as const, recordType: HealthConnectPermission.EXERCISE_SESSION },
    ];

    console.log('[Health Connect] Requesting permissions for:', permissions.map(p => p.recordType));
    const granted = await requestPermission(permissions as any);
    console.log('[Health Connect] Permissions granted:', granted);
    return !!granted;
  } catch (error) {
    console.error('[Health Connect] Error requesting permissions:', error);
    return false;
  }
}

/**
 * Get steps data for a date range
 */
export async function getStepsData(startDate: Date, endDate: Date): Promise<number> {
  console.log('[Health Connect] Fetching steps data from', startDate.toISOString(), 'to', endDate.toISOString());
  
  try {
    const result: any = await readRecords(HealthConnectPermission.STEPS, {
      timeRangeFilter: {
        operator: 'between',
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      },
    });

    console.log('[Health Connect] Steps result:', JSON.stringify(result, null, 2));

    let totalSteps = 0;
    if (Array.isArray(result)) {
      result.forEach((record: any) => {
        const steps = record.count || 0;
        totalSteps += steps;
        console.log('[Health Connect] Step record:', { count: steps, time: record.time });
      });
    }

    console.log('[Health Connect] Total steps:', totalSteps);
    return totalSteps;
  } catch (error) {
    console.error('[Health Connect] Error fetching steps:', error);
    return 0;
  }
}

/**
 * Get exercise sessions for a date range
 */
export async function getExerciseSessions(startDate: Date, endDate: Date): Promise<HealthActivity[]> {
  console.log('[Health Connect] Fetching exercise sessions from', startDate.toISOString(), 'to', endDate.toISOString());
  
  try {
    const result: any = await readRecords(HealthConnectPermission.EXERCISE_SESSION, {
      timeRangeFilter: {
        operator: 'between',
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      },
    });

    console.log('[Health Connect] Exercise result:', JSON.stringify(result, null, 2));

    const activities: HealthActivity[] = [];
    
    if (Array.isArray(result)) {
      result.forEach((record: any) => {
        const startTime = new Date(record.startTime);
        const endTime = new Date(record.endTime);
        const durationMinutes = Math.floor((endTime.getTime() - startTime.getTime()) / 60000);

        const activity: HealthActivity = {
          id: record.metadata?.id || `exercise-${Date.now()}`,
          type: 'exercise',
          date: startTime,
          value: durationMinutes,
          unit: 'minutes',
          source: 'health_connect',
          metadata: {
            duration: durationMinutes,
          },
        };

        activities.push(activity);
        console.log('[Health Connect] Exercise activity:', activity);
      });
    }

    console.log('[Health Connect] Total exercises:', activities.length);
    return activities;
  } catch (error) {
    console.error('[Health Connect] Error fetching exercises:', error);
    return [];
  }
}

/**
 * Get sleep data for a date range
 */
export async function getSleepData(startDate: Date, endDate: Date): Promise<HealthActivity[]> {
  console.log('[Health Connect] Fetching sleep data from', startDate.toISOString(), 'to', endDate.toISOString());
  
  try {
    const result: any = await readRecords(HealthConnectPermission.SLEEP_SESSION, {
      timeRangeFilter: {
        operator: 'between',
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      },
    });

    console.log('[Health Connect] Sleep result:', JSON.stringify(result, null, 2));

    const sleepActivities: HealthActivity[] = [];
    
    if (Array.isArray(result)) {
      result.forEach((record: any) => {
        const startTime = new Date(record.startTime);
        const endTime = new Date(record.endTime);
        const durationHours = (endTime.getTime() - startTime.getTime()) / 3600000;

        const activity: HealthActivity = {
          id: record.metadata?.id || `sleep-${Date.now()}`,
          type: 'sleep',
          date: startTime,
          value: durationHours,
          unit: 'hours',
          source: 'health_connect',
          metadata: {
            duration: Math.floor(durationHours * 60),
            quality: determineSleepQuality(durationHours),
          },
        };

        sleepActivities.push(activity);
        console.log('[Health Connect] Sleep activity:', activity);
      });
    }

    console.log('[Health Connect] Total sleep sessions:', sleepActivities.length);
    return sleepActivities;
  } catch (error) {
    console.error('[Health Connect] Error fetching sleep:', error);
    return [];
  }
}

/**
 * Get heart rate data for a date range
 */
export async function getHeartRateData(startDate: Date, endDate: Date): Promise<number> {
  console.log('[Health Connect] Fetching heart rate from', startDate.toISOString(), 'to', endDate.toISOString());
  
  try {
    const result: any = await readRecords(HealthConnectPermission.HEART_RATE, {
      timeRangeFilter: {
        operator: 'between',
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
      },
    });

    console.log('[Health Connect] Heart rate result:', JSON.stringify(result, null, 2));

    let totalBpm = 0;
    let count = 0;

    if (Array.isArray(result)) {
      result.forEach((record: any) => {
        if (record.samples) {
          record.samples.forEach((sample: any) => {
            totalBpm += sample.beatsPerMinute || 0;
            count++;
          });
        }
      });
    }

    const avgBpm = count > 0 ? Math.round(totalBpm / count) : 0;
    console.log('[Health Connect] Average heart rate:', avgBpm, 'from', count, 'samples');
    return avgBpm;
  } catch (error) {
    console.error('[Health Connect] Error fetching heart rate:', error);
    return 0;
  }
}

/**
 * Sync all health data for today
 */
export async function syncTodayHealthData(): Promise<{
  steps: number;
  exercises: HealthActivity[];
  sleep: HealthActivity[];
  avgHeartRate: number;
}> {
  console.log('[Health Connect] === SYNCING TODAY\'S DATA ===');
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  console.log('[Health Connect] Date range:', today.toISOString(), 'to', tomorrow.toISOString());

  const [steps, exercises, sleep, avgHeartRate] = await Promise.all([
    getStepsData(today, tomorrow),
    getExerciseSessions(today, tomorrow),
    getSleepData(today, tomorrow),
    getHeartRateData(today, tomorrow),
  ]);

  const result = {
    steps,
    exercises,
    sleep,
    avgHeartRate,
  };

  console.log('[Health Connect] === SYNC COMPLETE ===');
  console.log('[Health Connect] Summary:', {
    steps,
    exerciseCount: exercises.length,
    sleepCount: sleep.length,
    avgHeartRate,
  });

  return result;
}

/**
 * Sync health data for a specific date range
 */
export async function syncHealthDataRange(startDate: Date, endDate: Date): Promise<{
  steps: number;
  exercises: HealthActivity[];
  sleep: HealthActivity[];
  avgHeartRate: number;
}> {
  console.log('[Health Connect] === SYNCING DATE RANGE ===');
  console.log('[Health Connect] From:', startDate.toISOString(), 'To:', endDate.toISOString());

  const [steps, exercises, sleep, avgHeartRate] = await Promise.all([
    getStepsData(startDate, endDate),
    getExerciseSessions(startDate, endDate),
    getSleepData(startDate, endDate),
    getHeartRateData(startDate, endDate),
  ]);

  const result = {
    steps,
    exercises,
    sleep,
    avgHeartRate,
  };

  console.log('[Health Connect] === RANGE SYNC COMPLETE ===');
  console.log('[Health Connect] Summary:', {
    steps,
    exerciseCount: exercises.length,
    sleepCount: sleep.length,
    avgHeartRate,
  });

  return result;
}

/**
 * Helper: Map Health Connect exercise types to our categories
 */
function mapExerciseType(exerciseType: number): string {
  // Health Connect exercise type codes
  const typeMap: { [key: number]: string } = {
    1: 'walking',
    2: 'running',
    3: 'cycling',
    4: 'swimming',
    5: 'yoga',
    6: 'strength_training',
    7: 'cardio',
    // Add more mappings as needed
  };

  return typeMap[exerciseType] || 'other';
}

/**
 * Helper: Determine sleep quality based on duration
 */
function determineSleepQuality(durationHours: number): 'poor' | 'fair' | 'good' | 'excellent' {
  if (durationHours < 5) return 'poor';
  if (durationHours < 6.5) return 'fair';
  if (durationHours < 9) return 'good';
  return 'excellent';
}

/**
 * Initialize Health Connect and request permissions
 */
export async function initializeHealthConnect(): Promise<boolean> {
  console.log('[Health Connect] === INITIALIZING ===');
  
  const isAvailable = await isHealthConnectAvailable();
  
  if (!isAvailable) {
    console.warn('[Health Connect] Not available on this device');
    return false;
  }

  const hasPermissions = await requestHealthConnectPermissions();
  
  if (!hasPermissions) {
    console.warn('[Health Connect] Permissions not granted');
    return false;
  }

  console.log('[Health Connect] === INITIALIZATION COMPLETE ===');
  return true;
}
