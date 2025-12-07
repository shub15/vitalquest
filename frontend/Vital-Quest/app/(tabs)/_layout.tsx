import { theme } from '@/constants/theme';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { Tabs } from 'expo-router';
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// --- Retro Dark Palette ---
const PALETTE = {
  bg: '#0f172a',           // Deep Slate (Bar Background)
  border: '#334155',       // Slate 700 (Top Bezel)
  active: '#22d3ee',       // Neon Cyan
  inactive: '#64748b',     // Dimmed Slate
  indicator: '#22d3ee',    // Active Top Indicator
};

// Custom Icon Component
function TabBarIcon(props: {
  name: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  color: string;
  focused: boolean;
}) {
  return (
    <View style={styles.iconContainer}>
      <MaterialCommunityIcons 
        size={26} 
        style={{ marginBottom: -3 }} 
        {...props} 
      />
      {/* Little glow dot effect if focused */}
      {props.focused && (
        <View style={{
          position: 'absolute',
          top: -8,
          width: 32,
          height: 2,
          backgroundColor: PALETTE.active,
          shadowColor: PALETTE.active,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.8,
          shadowRadius: 4,
        }} />
      )}
    </View>
  );
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: PALETTE.active,
        tabBarInactiveTintColor: PALETTE.inactive,
        tabBarStyle: {
          backgroundColor: PALETTE.bg,
          borderTopColor: PALETTE.border,
          borderTopWidth: 2,
          // Add some padding to simulate a physical console lip
          paddingBottom: insets.bottom > 0 ? insets.bottom + 4 : 12,
          paddingTop: 12,
          height: 70 + (insets.bottom > 0 ? insets.bottom : 0),
          elevation: 0, // Remove default Android shadow
          shadowOpacity: 0, // Remove default iOS shadow
        },
        tabBarLabelStyle: {
          fontSize: 10,
          fontWeight: '900',
          fontFamily: 'monospace', // Or your system monospace
          textTransform: 'uppercase',
          letterSpacing: 1,
          marginTop: 4,
        },
        headerShown: false, // We use custom headers in screens
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'CMD_CTR', // Command Center
          tabBarLabel: 'HOME',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="console" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="quests"
        options={{
          title: 'MISSIONS',
          tabBarLabel: 'QUESTS',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="sword-cross" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="social"
        options={{
          title: 'NETWORK',
          tabBarLabel: 'NET',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="earth" color={color} focused={focused} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'DOSSIER',
          tabBarLabel: 'DATA',
          tabBarIcon: ({ color, focused }) => (
            <TabBarIcon name="account-details" color={color} focused={focused} />
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
  }
});