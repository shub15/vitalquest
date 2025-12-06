import { useGameStore } from '@/store/gameStore';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const user = useGameStore((state) => state.user);

  useEffect(() => {
    // Small delay to ensure store is hydrated from AsyncStorage
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F0A1E' }}>
        <ActivityIndicator size="large" color="#8B5CF6" />
      </View>
    );
  }

  // Redirect to onboarding if no user, otherwise to main app
  if (!user) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}
