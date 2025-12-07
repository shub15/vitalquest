import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * FCM Token Service (using Expo Notifications)
 * Gets native FCM tokens when google-services.json is configured
 */

export interface FCMTokenResult {
  token: string | null;
  error: string | null;
}

/**
 * Request notification permissions
 */
export async function requestNotificationPermissions(): Promise<boolean> {
  try {
    if (!Device.isDevice) {
      console.warn('[FCM] Push notifications only work on physical devices');
      return false;
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[FCM] Notification permission not granted');
      return false;
    }

    return true;
  } catch (error) {
    console.error('[FCM] Error requesting permissions:', error);
    return false;
  }
}

/**
 * Get native FCM token (works when google-services.json is configured)
 * This returns the actual FCM token, not Expo Push Token!
 */
export async function getFCMToken(): Promise<FCMTokenResult> {
  try {
    console.log('[FCM] Requesting native FCM token...');

    // Check if device supports push notifications
    if (!Device.isDevice) {
      return {
        token: null,
        error: 'Push notifications only work on physical devices',
      };
    }

    // Request permissions first
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) {
      return {
        token: null,
        error: 'Notification permissions not granted',
      };
    }

    // Set up notification channel for Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#8B5CF6',
      });
    }

    // Get native device push token (FCM for Android, APNs for iOS)
    // When google-services.json is configured, this returns the actual FCM token!
    const devicePushToken = await Notifications.getDevicePushTokenAsync();
    
    console.log('[FCM] Native FCM Token received:', devicePushToken.data);

    return {
      token: devicePushToken.data,
      error: null,
    };
  } catch (error) {
    console.error('[FCM] Error getting FCM token:', error);
    return {
      token: null,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Register FCM token with your backend
 */
export async function registerFCMTokenWithBackend(
  token: string,
  userId: string
): Promise<boolean> {
  try {
    console.log('[FCM] Registering FCM token with backend for user:', userId);

    // Replace with your actual backend API endpoint
    const response = await fetch('YOUR_BACKEND_URL/api/fcm/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Add your auth headers here
        // 'Authorization': `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        userId,
        fcmToken: token,
        platform: Platform.OS,
        deviceInfo: {
          brand: Device.brand,
          modelName: Device.modelName,
          osName: Device.osName,
          osVersion: Device.osVersion,
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend registration failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('[FCM] Token registered successfully:', data);
    return true;
  } catch (error) {
    console.error('[FCM] Error registering token with backend:', error);
    return false;
  }
}

/**
 * Unregister FCM token from backend (call on logout)
 */
export async function unregisterFCMTokenFromBackend(
  token: string,
  userId: string
): Promise<boolean> {
  try {
    console.log('[FCM] Unregistering token from backend for user:', userId);

    const response = await fetch('YOUR_BACKEND_URL/api/fcm/unregister', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        fcmToken: token,
      }),
    });

    if (!response.ok) {
      throw new Error(`Backend unregistration failed: ${response.status}`);
    }

    console.log('[FCM] Token unregistered successfully');
    return true;
  } catch (error) {
    console.error('[FCM] Error unregistering token from backend:', error);
    return false;
  }
}

/**
 * Setup Expo notification handlers
 * Call this in app initialization
 */
export function setupNotificationHandlers() {
  // Set notification handler for when app is in foreground
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });

  // Add notification received listener
  const notificationReceivedListener = Notifications.addNotificationReceivedListener(
    (notification) => {
      console.log('[FCM] Notification received:', notification);
      // Handle notification received while app is in foreground
    }
  );

  // Add notification response listener (when user taps notification)
  const notificationResponseListener = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      console.log('[FCM] Notification tapped:', response);
      // Handle notification tap - navigate to specific screen, etc.
      const data = response.notification.request.content.data;
      // Example: if (data.questId) { navigateToQuest(data.questId); }
    }
  );

  // Return cleanup function
  return () => {
    notificationReceivedListener.remove();
    notificationResponseListener.remove();
  };
}
