import { Achievement } from '@/types';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming,
  withRepeat,
} from 'react-native-reanimated';

// --- Retro Palette ---
const PALETTE = {
  bg: '#0f172a',           // Deep Slate
  slot: '#020617',         // Black/Void
  surface: '#1e293b',      // Card Surface
  text: '#f8fafc',
  textDim: '#64748b',
  rarity: {
    common: '#94a3b8',     // Gray
    uncommon: '#4ade80',   // Green
    rare: '#22d3ee',       // Blue
    epic: '#c084fc',       // Purple
    legendary: '#fbbf24',  // Gold
  }
};

// --- Icon Mapping Helper ---
// Maps emojis from your database to MaterialCommunityIcon names
const getIconName = (emojiOrName: string): any => {
  const map: Record<string, string> = {
    '🏆': 'trophy',
    '🔥': 'fire',
    '⚡': 'flash',
    '💪': 'arm-flex',
    '✨': 'star-four-points',
    '💧': 'water',
    '🧘': 'meditation',
    '😴': 'power-sleep',
    '👟': 'shoe-print',
    '👣': 'shoe-print',
    '🍎': 'food-apple',
    '🍽️': 'silverware-fork-knife',
    '🎉': 'party-popper',
    '💰': 'hand-coin',
    '⚔️': 'sword',
    '🛡️': 'shield',
    '🎯': 'target',
    '🔒': 'lock',
  };
  
  // Return the mapped icon, or fallback to 'trophy-variant' if not found
  return map[emojiOrName] || 'trophy-variant';
};

interface AchievementBadgeProps {
  achievement: Achievement;
  onPress?: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const AchievementBadge: React.FC<AchievementBadgeProps> = ({ achievement, onPress }) => {
  const scale = useSharedValue(1);
  const glowOpacity = useSharedValue(0);

  // Unlocked flash animation
  React.useEffect(() => {
    if (achievement.unlocked) {
      glowOpacity.value = withRepeat(
        withSequence(
          withTiming(0.6, { duration: 1000 }),
          withTiming(0.2, { duration: 1000 })
        ),
        -1,
        true
      );
    }
  }, [achievement.unlocked]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 12, stiffness: 200 })
    );
    if (onPress) {
      setTimeout(() => onPress(), 100);
    }
  };

  const getRarityColor = () => {
    switch (achievement.rarity) {
      case 'common': return PALETTE.rarity.common;
      case 'uncommon': return PALETTE.rarity.uncommon;
      case 'rare': return PALETTE.rarity.rare;
      case 'epic': return PALETTE.rarity.epic;
      case 'legendary': return PALETTE.rarity.legendary;
      default: return PALETTE.textDim;
    }
  };

  const color = getRarityColor();
  const progress = achievement.target > 0 ? (achievement.progress / achievement.target) * 100 : 0;
  const isHidden = achievement.hidden && !achievement.unlocked;

  // Determine Icon and Color
  const iconName = achievement.unlocked ? getIconName(achievement.icon) : 'lock';
  const iconColor = achievement.unlocked ? color : PALETTE.textDim;

  return (
    <AnimatedTouchable
      style={[
        styles.container, 
        animatedStyle,
        { borderColor: achievement.unlocked ? color : PALETTE.textDim }
      ]}
      onPress={handlePress}
      activeOpacity={0.9}
    >
      {/* Background Glow for Unlocked Items */}
      {achievement.unlocked && (
        <Animated.View style={[styles.glowBackground, { backgroundColor: color }, glowStyle]} />
      )}

      {/* Rarity Tag (Top Right) */}
      <View style={[styles.rarityTag, { backgroundColor: achievement.unlocked ? color : PALETTE.surface }]}>
        <Text style={[
          styles.rarityText, 
          { color: achievement.unlocked ? PALETTE.bg : PALETTE.textDim }
        ]}>
          {achievement.rarity.toUpperCase()}
        </Text>
      </View>

      {/* Icon Frame */}
      <View style={[
        styles.iconFrame, 
        { borderColor: achievement.unlocked ? color : PALETTE.textDim }
      ]}>
        <MaterialCommunityIcons 
          name={iconName} 
          size={24} 
          color={iconColor} 
        />
        {/* Scanline Effect */}
        <View style={styles.scanline} />
      </View>

      {/* Info Section */}
      <View style={styles.infoContainer}>
        <Text 
          style={[styles.title, !achievement.unlocked && styles.textLocked]} 
          numberOfLines={2}
        >
          {isHidden ? 'ENCRYPTED DATA' : achievement.title}
        </Text>

        {/* State Display */}
        {achievement.unlocked ? (
          <View style={[styles.statusBadge, { borderColor: color }]}>
            <Text style={[styles.statusText, { color: color }]}>UNLOCKED</Text>
          </View>
        ) : (
          <View style={styles.progressSection}>
            <View style={styles.retroProgressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${Math.min(progress, 100)}%`, backgroundColor: color }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {achievement.progress}/{achievement.target}
            </Text>
          </View>
        )}
      </View>

    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '48%', // Fits 2 columns
    backgroundColor: PALETTE.slot,
    borderWidth: 2,
    borderRadius: 6,
    borderBottomWidth: 5, // Cartridge depth
    padding: 10,
    marginBottom: 16,
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  glowBackground: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
  },
  
  // Rarity Tag
  rarityTag: {
    position: 'absolute',
    top: 6,
    right: 6,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
    zIndex: 10,
  },
  rarityText: {
    fontSize: 8,
    fontWeight: '900',
    fontFamily: 'monospace',
  },

  // Icon Area
  iconFrame: {
    width: 48,
    height: 48,
    borderWidth: 2,
    borderRadius: 4,
    backgroundColor: PALETTE.bg,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  // 'icon' style removed as we are using the component props directly
  scanline: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.2)',
    zIndex: 5,
  },

  // Info Area
  infoContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
    flex: 1, // Pushes content to fill height
  },
  title: {
    fontSize: 10,
    fontWeight: 'bold',
    color: PALETTE.text,
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'monospace',
    textTransform: 'uppercase',
    minHeight: 28, // Fix height for 2 lines
  },
  textLocked: {
    color: PALETTE.textDim,
  },

  // Status / Progress
  statusBadge: {
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  statusText: {
    fontSize: 9,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  
  progressSection: {
    width: '100%',
    alignItems: 'center',
  },
  retroProgressBar: {
    width: '100%',
    height: 6,
    backgroundColor: PALETTE.surface,
    borderWidth: 1,
    borderColor: PALETTE.textDim,
    borderRadius: 2,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
  },
  progressText: {
    fontSize: 9,
    color: PALETTE.textDim,
    fontFamily: 'monospace',
  },
});