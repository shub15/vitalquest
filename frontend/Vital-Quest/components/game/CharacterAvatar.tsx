import { determineCharacterClass, getClassName } from '@/services/dynamicClass';
import { useGameStore } from '@/store/gameStore';
import React, { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import { AvatarProgressionModal } from './AvatarProgressionModal';

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
    master: '#fbbf24',     // Gold
    grandmaster: '#f97316', // Orange
    legend: '#ef4444',     // Red
    mythic: '#a855f7',     // Purple/Violet
  }
};

// Character class type
export type CharacterClass = 'warrior' | 'assassin' | 'monk' | 'villager';

// All character class avatar images (8 progression stages each)
const CLASS_AVATARS = {
  warrior: {
    1: require('@/assets/images/avatar/class 1/class 1_1.jpeg'),
    2: require('@/assets/images/avatar/class 1/class 1_2.jpeg'),
    3: require('@/assets/images/avatar/class 1/class 1_3.jpeg'),
    4: require('@/assets/images/avatar/class 1/class 1_4.jpeg'),
    5: require('@/assets/images/avatar/class 1/class 1_5.jpeg'),
    6: require('@/assets/images/avatar/class 1/class 1_6.jpeg'),
    7: require('@/assets/images/avatar/class 1/class 1_7.jpeg'),
    8: require('@/assets/images/avatar/class 1/class 1_8.jpeg'),
  },
  assassin: {
    1: require('@/assets/images/avatar/class 2/class 2_1.jpeg'),
    2: require('@/assets/images/avatar/class 2/class 2_2.jpeg'),
    3: require('@/assets/images/avatar/class 2/class 2_3.jpeg'),
    4: require('@/assets/images/avatar/class 2/class 2_4.jpeg'),
    5: require('@/assets/images/avatar/class 2/class 2_5.jpeg'),
    6: require('@/assets/images/avatar/class 2/class 2_6.jpeg'),
    7: require('@/assets/images/avatar/class 2/class 2_7.jpeg'),
    8: require('@/assets/images/avatar/class 2/class 2_8.jpeg'),
  },
  monk: {
    1: require('@/assets/images/avatar/class 3/class 3_1.jpeg'),
    2: require('@/assets/images/avatar/class 3/class 3_2.jpeg'),
    3: require('@/assets/images/avatar/class 3/class 3_3.jpeg'),
    4: require('@/assets/images/avatar/class 3/class 3_4.jpeg'),
    5: require('@/assets/images/avatar/class 3/class 3_5.jpeg'),
    6: require('@/assets/images/avatar/class 3/class 3_6.jpeg'),
    7: require('@/assets/images/avatar/class 3/class 3_7.jpeg'),
    8: require('@/assets/images/avatar/class 3/class 3_8.jpeg'),
  },
  villager: {
    1: require('@/assets/images/avatar/class 4/class 4_1.jpeg'),
    2: require('@/assets/images/avatar/class 4/class 4_2.jpeg'),
    3: require('@/assets/images/avatar/class 4/class 4_3.jpeg'),
    4: require('@/assets/images/avatar/class 4/class 4_4.jpeg'),
    5: require('@/assets/images/avatar/class 4/class 4_5.jpeg'),
    6: require('@/assets/images/avatar/class 4/class 4_6.jpeg'),
    7: require('@/assets/images/avatar/class 4/class 4_7.jpeg'),
    8: require('@/assets/images/avatar/class 4/class 4_8.jpeg'),
  },
};

interface CharacterAvatarProps {
  level: number;
  size?: number;
}

export const CharacterAvatar: React.FC<CharacterAvatarProps> = ({ level, size = 120 }) => {
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const [showProgressionModal, setShowProgressionModal] = useState(false);
  
  // Get user and determine character class based on activity
  const user = useGameStore((state) => state.user);
  const characterClass: CharacterClass = user ? determineCharacterClass(user) : 'villager';
  const className = getClassName(characterClass);
  
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
    if (level >= 36) return PALETTE.ranks.mythic;
    if (level >= 31) return PALETTE.ranks.legend;
    if (level >= 26) return PALETTE.ranks.grandmaster;
    if (level >= 21) return PALETTE.ranks.master;
    if (level >= 16) return PALETTE.ranks.expert;
    if (level >= 11) return PALETTE.ranks.adept;
    if (level >= 6) return PALETTE.ranks.apprentice;
    return PALETTE.ranks.novice;
  };

  // Map level to avatar image stage (1-8)
  const getAvatarStage = (): number => {
    if (level >= 36) return 8;
    if (level >= 31) return 7;
    if (level >= 26) return 6;
    if (level >= 21) return 5;
    if (level >= 16) return 4;
    if (level >= 11) return 3;
    if (level >= 6) return 2;
    return 1;
  };

  const rankColor = getRankColor();
  const avatarStage = getAvatarStage();
  const avatarImage = CLASS_AVATARS[characterClass][avatarStage as keyof typeof CLASS_AVATARS.warrior];
  
  return (
    <>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={() => setShowProgressionModal(true)}
        style={[
          styles.container, 
          { width: size, height: size, borderColor: rankColor }
    ]}>
      
      {/* Background "Screen" */}
      <View style={styles.screenBackground}>
        
        {/* The Avatar */}
        <Animated.View style={[styles.avatarContainer, animatedStyle]}>
          <Image
            source={avatarImage}
            style={[styles.avatarImage, { width: size - 16, height: size - 16 }]}
            resizeMode="cover"
          />
        </Animated.View>

        {/* CRT Scanline Effect */}
        <View style={styles.scanline} />
        <View style={styles.glare} />
      </View>
      
      {/* Level Tag */}
      <View style={[styles.levelTag, { backgroundColor: rankColor }]}>
        <Text style={[
          styles.levelText, 
          { color: level >= 21 ? '#000' : '#1e293b' }
        ]}>
          LVL.{level}
        </Text>
      </View>
      
      {/* Class Badge */}
      <View style={styles.classBadge}>
        <Text style={styles.classText}>{className}</Text>
      </View>

      </TouchableOpacity>

      {/* Progression Modal */}
      <AvatarProgressionModal
        visible={showProgressionModal}
        onClose={() => setShowProgressionModal(false)}
        currentLevel={level}
        characterClass={characterClass}
      />
    </>
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
  avatarImage: {
    borderRadius: 4,
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
  classBadge: {
    position: 'absolute',
    top: -8,
    left: -4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: PALETTE.surface,
    borderRadius: 2,
    borderWidth: 1,
    borderColor: PALETTE.ranks.cyan,
  },
  classText: {
    fontSize: 8,
    fontWeight: '900',
    color: PALETTE.ranks.cyan,
    letterSpacing: 0.5,
    fontFamily: 'monospace',
  },
});