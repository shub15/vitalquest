import { useGameStore } from '@/store/gameStore';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useGameStore((state) => state.user);
  const hasHydrated = useGameStore((state) => state._hasHydrated);

  useEffect(() => {
    // Wait for store hydration with timeout fallback
    const timer = setTimeout(() => {
      if (!hasHydrated) {
        console.warn('Store hydration timeout - proceeding anyway');
      }
      setIsLoading(false);
    }, 2000); // Increased timeout for physical devices

    // If hydration completes early, proceed immediately
    if (hasHydrated) {
      clearTimeout(timer);
      setIsLoading(false);
    }

    return () => clearTimeout(timer);
  }, [hasHydrated]);

  // Show error state if something went wrong
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0A1E', padding: 20 }}>
        <Text style={{ color: '#EF4444', fontSize: 18, marginBottom: 10, textAlign: 'center' }}>
          Error Loading App
        </Text>
        <Text style={{ color: '#9CA3AF', fontSize: 14, textAlign: 'center' }}>
          {error}
        </Text>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0A1E' }}>
        <ActivityIndicator size="large" color="#8B5CF6" />
        <Text style={{ color: '#9CA3AF', marginTop: 16, fontSize: 14 }}>
          Loading Vital Quest...
        </Text>
      </View>
    );
  }

  // Redirect to onboarding if no user, otherwise to main app
  if (!user) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
