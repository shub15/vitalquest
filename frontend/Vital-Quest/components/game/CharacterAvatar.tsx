import { theme } from '@/constants/theme';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

// --- Retro Palette ---
const PALETTE = {
  bg: '#0f172a',
  slot: '#020617',         // Deep Black (Screen background)
  surface: '#1e293b',
  text: '#f8fafc',
  ranks: {
    novice: '#94a3b8',     // Gray
    apprentice: '#4ade80', // Green
    adept: '#22d3ee',      // Cyan
    expert: '#c084fc',     // Purple
    legend: '#fbbf24',     // Gold
  }
};

interface CharacterAvatarProps {
  level: number;
  size?: number;
}

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({ level, size = 120 }) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  
  // Idle breathing animation (Hologram drift)
  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.02, { duration: 2500 }),
        withTiming(1, { duration: 2500 })
      ),
      -1,
      true
    );
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { rotate: `${rotation.value}deg` },
    ],
  }));
  
  // Determine color based on level tier
  const getRankColor = () => {
    if (level >= 25) return PALETTE.ranks.legend;
    if (level >= 20) return PALETTE.ranks.expert;
    if (level >= 10) return PALETTE.ranks.adept;
    if (level >= 5) return PALETTE.ranks.apprentice;
    return PALETTE.ranks.novice;
  };

  const getAvatarEmoji = () => {
    if (level >= 25) return '👑';
    if (level >= 20) return '🦸';
    if (level >= 15) return '🧙';
    if (level >= 10) return '⚔️';
    if (level >= 5) return '🛡️';
    return '🎯';
  };

  const rankColor = getRankColor();
  
  return (
    <View style={[
      styles.container, 
      { width: size, height: size, borderColor: rankColor }
    ]}>
      
      {/* Background "Screen" */}
      <View style={styles.screenBackground}>
        
        {/* The Avatar */}
        <Animated.View style={[styles.avatarContainer, animatedStyle]}>
          <Text style={[styles.avatar, { fontSize: size * 0.5 }]}>
            {getAvatarEmoji()}
          </Text>
        </Animated.View>

        {/* CRT Scanline Effect */}
        <View style={styles.scanline} />
        <View style={styles.glare} />
      </View>
      
      {/* Level Tag */}
      <View style={[styles.levelTag, { backgroundColor: rankColor }]}>
        <Text style={[
          styles.levelText, 
          { color: level >= 25 ? '#000' : '#1e293b' }
        ]}>
          LVL.{level}
        </Text>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: PALETTE.surface,
    borderWidth: 3,
    borderRadius: 8, // Slight rounding for "CRT" look
    padding: 4,
    // Retro depth
    borderBottomWidth: 6,
    position: 'relative',
  },
  screenBackground: {
    flex: 1,
    backgroundColor: PALETTE.slot, // The "Void" inside the screen
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: '#334155',
  },
  avatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  avatar: {
    textAlign: 'center',
    // Slight text shadow for glow effect
    textShadowColor: 'rgba(255,255,255,0.2)',
    textShadowRadius: 10,
  },
  // Retro Effects
  scanline: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.05)',
    zIndex: 3,
    // In a real app, you might use an image background with scanlines here
  },
  glare: {
    position: 'absolute',
    top: -50,
    left: -50,
    width: 200,
    height: 200,
    backgroundColor: 'rgba(255,255,255,0.03)',
    transform: [{ rotate: '45deg' }],
    zIndex: 3,
  },
  // Badge
  levelTag: {
    position: 'absolute',
    bottom: -10,
    right: -4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    borderWidth: 2,
    borderColor: PALETTE.bg,
    zIndex: 10,
  },
  levelText: {
    fontSize: 10,
    fontWeight: '900',
    fontFamily: 'monospace',
    letterSpacing: 0.5,
  },
});