import { theme } from '@/constants/theme';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from 'react-native-reanimated';

interface CharacterAvatarProps {
  level: number;
  size?: number;
}

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({ level, size = 120 }) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  
  // Idle breathing animation
  React.useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.05, { duration: 2000 }),
        withTiming(1, { duration: 2000 })
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
  
  // Simple avatar based on level
  const getAvatarEmoji = () => {
    if (level >= 20) return '🦸';
    if (level >= 15) return '🧙';
    if (level >= 10) return '⚔️';
    if (level >= 5) return '🛡️';
    return '🎯';
  };
  
  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <LinearGradient
        colors={theme.colors.gradients.primary}
        style={styles.gradient}
      >
        <Animated.View style={[styles.avatarContainer, animatedStyle]}>
          <Text style={[styles.avatar, { fontSize: size * 0.5 }]}>
            {getAvatarEmoji()}
          </Text>
        </Animated.View>
        
        {/* Level Badge */}
        <View style={styles.levelBadge}>
          <LinearGradient
            colors={theme.colors.gradients.gold}
            style={styles.levelGradient}
          >
            <Text style={styles.levelText}>{level}</Text>
          </LinearGradient>
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    ...theme.shadows.lg,
  },
  gradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: theme.colors.accent.gold,
    borderRadius: theme.borderRadius.full,
  },
  avatarContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatar: {
    textAlign: 'center',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    width: 32,
    height: 32,
    borderRadius: theme.borderRadius.full,
    borderWidth: 2,
    borderColor: theme.colors.background.primary,
  },
  levelGradient: {
    flex: 1,
    borderRadius: theme.borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  levelText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.background.primary,
  },
});
