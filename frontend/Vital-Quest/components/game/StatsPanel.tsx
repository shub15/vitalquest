import { theme } from '@/constants/theme';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { ProgressBar } from './ProgressBar';

interface StatsPanelProps {
  level: number;
  currentXp: number;
  totalXp: number;
  xpForNextLevel: number;
  hp: number;
  maxHp: number;
  gold: number;
  streak: number;
}

export const StatsPanel: React.FC<StatsPanelProps> = ({
  level,
  currentXp,
  totalXp,
  xpForNextLevel,
  hp,
  maxHp,
  gold,
  streak,
}) => {
  const scale = useSharedValue(1);
  const streakScale = useSharedValue(1);
  
  // Pulse animation for low HP
  React.useEffect(() => {
    if (hp / maxHp < 0.3) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.05, { duration: 500 }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
    } else {
      scale.value = withSpring(1);
    }
  }, [hp, maxHp]);
  
  // Pulse animation for streak
  React.useEffect(() => {
    if (streak > 0) {
      streakScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 600 }),
          withTiming(1, { duration: 600 })
        ),
        -1,
        true
      );
    }
  }, [streak]);
  
  const hpAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const streakAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: streakScale.value }],
  }));
  
  const hpPercentage = hp / maxHp;
  const hpColor = hpPercentage > 0.5
    ? theme.colors.gradients.health
    : hpPercentage > 0.3
    ? [theme.colors.status.warning, theme.colors.status.error]
    : theme.colors.gradients.health;
  
  return (
    <View style={styles.container}>
      {/* Level Badge */}
      <View style={styles.levelBadge}>
        <LinearGradient
          colors={theme.colors.gradients.gold}
          style={styles.levelGradient}
        >
          <Text style={styles.levelText}>LVL</Text>
          <Text style={styles.levelNumber}>{level}</Text>
        </LinearGradient>
      </View>
      
      {/* Stats Container */}
      <View style={styles.statsContainer}>
        {/* HP Bar */}
        <Animated.View style={[styles.statRow, hpAnimatedStyle]}>
          <View style={styles.statHeader}>
            <MaterialCommunityIcons name="heart" size={18} color={theme.colors.stats.hp} style={{ marginRight: 4 }} />
            <Text style={styles.statLabel}>HP</Text>
          </View>
          <ProgressBar
            current={hp}
            max={maxHp}
            color={hpColor}
            height={16}
            showLabel={true}
            label={`${hp} / ${maxHp}`}
          />
        </Animated.View>
        
        {/* XP Bar */}
        <View style={styles.statRow}>
          <View style={styles.statHeader}>
            <MaterialCommunityIcons name="star" size={18} color={theme.colors.stats.xp} style={{ marginRight: 4 }} />
            <Text style={styles.statLabel}>XP</Text>
          </View>
          <ProgressBar
            current={currentXp}
            max={xpForNextLevel}
            color={theme.colors.gradients.xp}
            height={16}
            showLabel={true}
            label={`${currentXp} / ${xpForNextLevel}`}
          />
        </View>
        
        {/* Gold & Streak */}
        <View style={styles.bottomRow}>
          <View style={styles.goldContainer}>
            <MaterialCommunityIcons name="hand-coin" size={18} color={theme.colors.accent.gold} style={{ marginRight: 4 }} />
            <Text style={styles.goldText}>{gold.toLocaleString()}</Text>
          </View>
          
          {streak > 0 && (
            <Animated.View style={[styles.streakContainer, streakAnimatedStyle]}>
              <MaterialCommunityIcons name="fire" size={18} color={theme.colors.status.warning} style={{ marginRight: 4 }} />
              <Text style={styles.streakText}>{streak} day{streak !== 1 ? 's' : ''}</Text>
            </Animated.View>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
    ...theme.shadows.md,
  },
  levelBadge: {
    width: 70,
    height: 70,
    marginRight: theme.spacing.md,
  },
  levelGradient: {
    flex: 1,
    borderRadius: theme.borderRadius.lg,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: theme.colors.accent.gold,
  },
  levelText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.background.primary,
  },
  levelNumber: {
    fontSize: theme.typography.fontSize['3xl'],
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.background.primary,
  },
  statsContainer: {
    flex: 1,
  },
  statRow: {
    marginBottom: theme.spacing.sm,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  statIcon: {
    fontSize: theme.typography.fontSize.lg,
    marginRight: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  goldContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.tertiary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.accent.gold,
  },
  goldIcon: {
    fontSize: theme.typography.fontSize.lg,
    marginRight: theme.spacing.xs,
  },
  goldText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.accent.gold,
  },
  streakContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.tertiary,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
    borderWidth: 1,
    borderColor: theme.colors.status.warning,
  },
  streakIcon: {
    fontSize: theme.typography.fontSize.lg,
    marginRight: theme.spacing.xs,
  },
  streakText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.status.warning,
  },
});
