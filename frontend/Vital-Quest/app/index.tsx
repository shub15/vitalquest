import { useGameStore } from '@/store/gameStore';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

// --- Retro Palette ---
const PALETTE = {
  bg: '#0f172a',           // Deep Slate
  text: '#f8fafc',         // White
  textDim: '#64748b',      // Slate 400
  accent: {
    cyan: '#22d3ee',       // System Active
    red: '#ef4444',        // Error
    purple: '#c084fc',     // Loading
  }
};

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = useGameStore((state) => state.user);
  const hasHydrated = useGameStore((state) => state._hasHydrated);

  useEffect(() => {
    // Wait for store hydration with timeout fallback
    const timer = setTimeout(() => {
      if (!hasHydrated) {
        console.warn('SYSTEM WARNING: Hydration latency detected. Bypassing checks...');
      }
      setIsLoading(false);
    }, 2000);

    // If hydration completes early, proceed immediately
    if (hasHydrated) {
      clearTimeout(timer);
      setIsLoading(false);
    }

    return () => clearTimeout(timer);
  }, [hasHydrated]);

  // --- CRITICAL ERROR STATE ---
  if (error) {
    return (
      <View style={styles.container}>
        <MaterialCommunityIcons name="alert-octagon" size={64} color={PALETTE.accent.red} style={{ marginBottom: 20 }} />
        <Text style={[styles.terminalText, { color: PALETTE.accent.red, fontSize: 18 }]}>
          // CRITICAL_SYSTEM_FAILURE
        </Text>
        <Text style={[styles.terminalText, { color: PALETTE.textDim, marginTop: 10 }]}>
          ERROR_CODE: {error}
        </Text>
        <Text style={[styles.terminalText, { color: PALETTE.textDim, marginTop: 4 }]}>
          PLEASE REBOOT TERMINAL manually.
        </Text>
      </View>
    );
  }

  // --- BOOT SEQUENCE (LOADING) ---
  if (isLoading) {
    return (
      <View style={styles.container}>
        <View style={styles.iconContainer}>
          <MaterialCommunityIcons name="console-network" size={48} color={PALETTE.accent.cyan} />
        </View>
        
        <View style={styles.logContainer}>
          <Text style={styles.terminalText}>&gt; INITIALIZING VITAL_QUEST_OS...</Text>
          <Text style={[styles.terminalText, { color: PALETTE.textDim }]}>&gt; CHECKING MEMORY... OK</Text>
          <Text style={[styles.terminalText, { color: PALETTE.textDim }]}>&gt; CONNECTING TO NEURAL NET...</Text>
        </View>

        <ActivityIndicator size="large" color={PALETTE.accent.purple} style={{ marginTop: 30 }} />
        
        <Text style={styles.loadingLabel}>
          LOADING_MODULES...
        </Text>
        
        <View style={styles.versionTag}>
          <Text style={styles.versionText}>v1.0.4 [STABLE]</Text>
        </View>
      </View>
    );
  }

  // --- SYSTEM REDIRECTION ---
  if (!user) {
    return <Redirect href="/onboarding" />;
  }

  return <Redirect href="/(tabs)" />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: PALETTE.bg,
    padding: 20,
  },
  iconContainer: {
    marginBottom: 40,
    width: 80,
    height: 80,
    borderWidth: 2,
    borderColor: PALETTE.accent.cyan,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    borderStyle: 'dashed',
    backgroundColor: 'rgba(34, 211, 238, 0.05)',
  },
  logContainer: {
    alignItems: 'flex-start',
    width: '100%',
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  terminalText: {
    fontFamily: 'monospace',
    color: PALETTE.accent.cyan,
    fontSize: 12,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  loadingLabel: {
    marginTop: 16,
    color: PALETTE.accent.purple,
    fontSize: 10,
    fontFamily: 'monospace',
    fontWeight: 'bold',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  versionTag: {
    position: 'absolute',
    bottom: 40,
    borderWidth: 1,
    borderColor: PALETTE.textDim,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  versionText: {
    color: PALETTE.textDim,
    fontSize: 10,
    fontFamily: 'monospace',
  }
});