import { Quest } from '@/types';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSequence,
  withSpring,
  withTiming
} from 'react-native-reanimated';

// --- Retro Dark Configuration ---
const RETRO_BORDER_WIDTH = 2;
const RETRO_DEPTH = 5;
const RETRO_RADIUS = 4;

// Color Palette (Cyberpunk/Dark RPG)
const PALETTE = {
  cardBg: '#1e293b',       // Slate 800
  cardBorder: '#0f172a',   // Slate 900 (The "Shadow")
  cardCompleteBg: '#064e3b', // Dark Emerald
  cardCompleteBorder: '#022c22',
  text: '#f1f5f9',         // Slate 100
  textDim: '#94a3b8',      // Slate 400
  slotBg: '#020617',       // Almost Black (for empty bars/checks)
  slotBorder: '#334155',   // Slate 700
  neon: {
    green: '#4ade80',
    blue: '#22d3ee',
    red: '#fb7185',
    purple: '#e879f9',
    gold: '#facc15'
  }
};

const getIconName = (iconName: string): any => {
  const map: Record<string, string> = {
    '👣': 'shoe-print', '💪': 'dumbbell', '💧': 'water', '🧘': 'meditation',
    '🍽️': 'food-apple', '🏃': 'run', '⚡': 'flash', '🕉️': 'flower-tulip',
    '😴': 'bed', '🌙': 'moon-waning-crescent', '🔥': 'fire', '⭐': 'star',
    '💰': 'hand-coin', '🎉': 'party-popper', '🏆': 'trophy', '✨': 'star-four-points',
    '🎯': 'target', 'coins': 'hand-coin',
  };
  return map[iconName] || iconName;
};

interface QuestCardProps {
  quest: Quest;
  onPress?: () => void;
  onComplete?: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// --- Retro CRT Progress Bar ---
const RetroProgressBar = ({ current, max, color }: { current: number; max: number; color: string }) => {
  const percent = Math.min(Math.max(current / max, 0), 1) * 100;
  return (
    <View style={styles.retroProgressContainer}>
      {/* Background Grid Texture */}
      <View style={styles.gridTexture} />
      
      <View style={[styles.retroProgressFill, { width: `${percent}%`, backgroundColor: color }]} />
      
      {/* CRT Scanline Glare */}
      <View style={styles.retroProgressGlare} />
    </View>
  );
};

export const QuestCard: React.FC<QuestCardProps> = ({ quest, onPress, onComplete }) => {
  const scale = useSharedValue(1);
  const checkScale = useSharedValue(0);
  const [localCompleted, setLocalCompleted] = React.useState(quest.completed);
  const [hideCheckbox, setHideCheckbox] = React.useState(quest.completed);
  
  const progress = quest.progress / quest.target;
  const isComplete = progress >= 1 || localCompleted;
  
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));
  
  const checkAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: checkScale.value }],
    opacity: checkScale.value,
  }));
  
  const handlePress = () => {
    scale.value = withSequence(
      withTiming(0.95, { duration: 50 }),
      withSpring(1, { damping: 12, stiffness: 200 })
    );
    if (onPress) setTimeout(() => onPress(), 100);
  };
  
  const handleComplete = () => {
    if (isComplete) return;
    setLocalCompleted(true);
    checkScale.value = withSequence(
      withSpring(1.5, { damping: 8 }),
      withSpring(1, { damping: 12 })
    );
    if (onComplete) setTimeout(() => onComplete(), 300);
    // Hide checkbox after animation completes
    setTimeout(() => setHideCheckbox(true), 800);
  };
  
  const getDifficultyColor = () => {
    switch (quest.difficulty) {
      case 'easy': return PALETTE.neon.green; 
      case 'medium': return PALETTE.neon.blue; 
      case 'hard': return PALETTE.neon.red; 
      case 'epic': return PALETTE.neon.purple; 
      default: return PALETTE.textDim;
    }
  };

  return (
    <AnimatedTouchable
      style={[
        styles.container, 
        cardAnimatedStyle,
        { 
          backgroundColor: isComplete ? PALETTE.cardCompleteBg : PALETTE.cardBg,
          borderColor: isComplete ? PALETTE.cardCompleteBorder : PALETTE.cardBorder,
          borderBottomWidth: isComplete ? RETRO_BORDER_WIDTH : RETRO_DEPTH 
        }
      ]}
      onPress={handlePress}
      activeOpacity={1} 
    >
      <View style={styles.contentInner}>
        {/* Header */}
        <View style={styles.header}>
          <View style={[styles.iconBox, { borderColor: getDifficultyColor() }]}>
            <MaterialCommunityIcons 
              name={getIconName(quest.icon)} 
              size={24} 
              color={getDifficultyColor()} 
            />
          </View>
          
          <View style={styles.headerInfo}>
            <View style={styles.badges}>
              {/* Inverted "Select" Button Badge */}
              <View style={[styles.pixelBadge, { backgroundColor: getDifficultyColor() }]}>
                <Text style={styles.pixelBadgeText}>{quest.type}</Text>
              </View>
              <Text style={[styles.difficultyText, { color: getDifficultyColor() }]}>
                LVL.{quest.difficulty === 'epic' ? '99' : quest.difficulty === 'hard' ? '50' : '10'}
              </Text>
            </View>
            
            <Text style={[styles.title, isComplete && styles.titleComplete]} numberOfLines={1}>
              {quest.title}
            </Text>
          </View>
          
          {/* Dark Slot Checkbox */}
          {!hideCheckbox && (
            <Pressable
              style={[
                styles.checkbox, 
                isComplete && { backgroundColor: PALETTE.neon.green, borderColor: PALETTE.neon.green }
              ]}
              onPress={handleComplete}
              disabled={isComplete}
            >
              {isComplete && (
                <Animated.View style={checkAnimatedStyle}>
                  <MaterialCommunityIcons name="skull" size={18} color="#022c22" />
                </Animated.View>
              )}
            </Pressable>
          )}
        </View>
        
        <Text style={styles.description} numberOfLines={2}>
          {quest.description}
        </Text>
        
        {/* Progress */}
        {!isComplete && (
          <View style={styles.progressSection}>
            <View style={styles.progressLabelRow}>
              <Text style={styles.progressLabel}>HP</Text>
              <Text style={styles.progressValue}>{quest.progress}/{quest.target}</Text>
            </View>
            <RetroProgressBar 
              current={quest.progress} 
              max={quest.target} 
              color={getDifficultyColor()} 
            />
          </View>
        )}
        
        {/* Dark Loot Section */}
        <View style={styles.divider} />
        <View style={styles.rewards}>
          <Text style={styles.lootLabel}>LOOT</Text>
          
          <View style={[styles.rewardTag, { borderColor: PALETTE.slotBorder }]}>
            <Text style={styles.rewardText}>XP +{quest.xpReward}</Text>
          </View>
          
          <View style={[styles.rewardTag, { borderColor: PALETTE.neon.gold }]}>
             <MaterialCommunityIcons name="gold" size={10} color={PALETTE.neon.gold} style={{marginRight:4}} />
             <Text style={[styles.rewardText, { color: PALETTE.neon.gold }]}>{quest.goldReward}</Text>
          </View>
          
          {quest.streak > 0 && (
             <View style={[styles.rewardTag, { borderColor: PALETTE.neon.red }]}>
               <MaterialCommunityIcons name="fire" size={10} color={PALETTE.neon.red} style={{marginRight:2}} />
               <Text style={[styles.rewardText, { color: PALETTE.neon.red }]}>{quest.streak}</Text>
             </View>
          )}
        </View>
      </View>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    borderRadius: RETRO_RADIUS,
    borderWidth: RETRO_BORDER_WIDTH,
    // Background and border colors handled inline for state
  },
  contentInner: {
    padding: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderWidth: 2,
    borderRadius: RETRO_RADIUS,
    backgroundColor: PALETTE.slotBg, // Dark slot for the icon
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderStyle: 'dashed',
  },
  headerInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  badges: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  pixelBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 2,
    marginRight: 8,
  },
  pixelBadgeText: {
    color: '#000', // Black text on neon badge
    fontSize: 9,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  difficultyText: {
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 1,
    textShadowColor: 'rgba(0,0,0,0.5)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: PALETTE.text,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  titleComplete: {
    textDecorationLine: 'line-through',
    color: PALETTE.neon.green,
    opacity: 0.8,
  },
  checkbox: {
    width: 32,
    height: 32,
    borderWidth: 2,
    borderColor: PALETTE.slotBorder,
    borderRadius: 4,
    backgroundColor: PALETTE.slotBg, // Deep dark hole
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    // Simulating "Pressed in" depth
    borderTopWidth: 4, 
    borderBottomWidth: 0,
  },
  description: {
    fontSize: 13,
    color: PALETTE.textDim,
    marginBottom: 16,
    fontFamily: 'monospace',
    lineHeight: 18,
  },
  // Retro Bar
  progressSection: {
    marginBottom: 14,
  },
  progressLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  progressLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: PALETTE.textDim,
    letterSpacing: 1,
  },
  progressValue: {
    fontSize: 10,
    fontWeight: '900',
    color: PALETTE.text,
  },
  retroProgressContainer: {
    height: 16,
    backgroundColor: PALETTE.slotBg,
    borderWidth: 2,
    borderColor: PALETTE.cardBorder,
    borderRadius: 2,
    overflow: 'hidden',
    position: 'relative',
  },
  retroProgressFill: {
    height: '100%',
    borderRadius: 1,
  },
  retroProgressGlare: {
    position: 'absolute',
    top: 2,
    left: 4,
    right: 4,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 1,
  },
  gridTexture: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.1,
    // If you had a grid image, this is where it goes. 
    // For now, it's just a placeholder for texture depth.
    backgroundColor: '#334155', 
  },
  // Loot
  divider: {
    height: 2,
    backgroundColor: PALETTE.slotBorder,
    marginBottom: 10,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: PALETTE.cardBorder,
  },
  rewards: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  lootLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: PALETTE.textDim,
    marginRight: 8,
  },
  rewardTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: PALETTE.slotBg,
    borderWidth: 1,
    borderColor: PALETTE.textDim,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginRight: 8,
  },
  rewardText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: PALETTE.text,
  },
});