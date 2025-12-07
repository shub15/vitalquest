import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React from 'react';
import { Image, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const PALETTE = {
  bg: '#0f172a',
  surface: '#1e293b',
  surfaceHighlight: '#334155',
  slot: '#020617',
  text: '#f8fafc',
  textDim: '#64748b',
  accent: {
    cyan: '#22d3ee',
    purple: '#c084fc',
    gold: '#fbbf24',
    green: '#4ade80',
  },
  ranks: {
    novice: '#94a3b8',
    apprentice: '#4ade80',
    adept: '#22d3ee',
    expert: '#c084fc',
    master: '#fbbf24',
    grandmaster: '#f97316',
    legend: '#ef4444',
    mythic: '#a855f7',
  },
};

export type CharacterClass = 'warrior' | 'assassin' | 'monk' | 'villager';

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

const AVATAR_STAGES = [
  { stage: 1, minLevel: 1, maxLevel: 5, name: 'NOVICE', color: PALETTE.ranks.novice },
  { stage: 2, minLevel: 6, maxLevel: 10, name: 'APPRENTICE', color: PALETTE.ranks.apprentice },
  { stage: 3, minLevel: 11, maxLevel: 15, name: 'ADEPT', color: PALETTE.ranks.adept },
  { stage: 4, minLevel: 16, maxLevel: 20, name: 'EXPERT', color: PALETTE.ranks.expert },
  { stage: 5, minLevel: 21, maxLevel: 25, name: 'MASTER', color: PALETTE.ranks.master },
  { stage: 6, minLevel: 26, maxLevel: 30, name: 'GRANDMASTER', color: PALETTE.ranks.grandmaster },
  { stage: 7, minLevel: 31, maxLevel: 35, name: 'LEGEND', color: PALETTE.ranks.legend },
  { stage: 8, minLevel: 36, maxLevel: 99, name: 'MYTHIC', color: PALETTE.ranks.mythic },
];

interface Props {
  visible: boolean;
  onClose: () => void;
  currentLevel: number;
  characterClass?: CharacterClass; // Character class to display
}

export function AvatarProgressionModal({ visible, onClose, currentLevel, characterClass = 'warrior' }: Props) {
  const currentStage = AVATAR_STAGES.find(
    (s) => currentLevel >= s.minLevel && currentLevel <= s.maxLevel
  )?.stage || 1;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onClose} />

        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <MaterialCommunityIcons name="shield-sword" size={24} color={PALETTE.accent.gold} />
              <Text style={styles.headerTitle}>{characterClass.toUpperCase()}_PROGRESSION</Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <MaterialCommunityIcons name="close" size={24} color={PALETTE.textDim} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {/* Current Level Info */}
            <View style={styles.currentLevelCard}>
              <Text style={styles.currentLevelLabel}>CURRENT_RANK</Text>
              <Text style={styles.currentLevelValue}>
                LVL.{currentLevel} • {AVATAR_STAGES[currentStage - 1]?.name}
              </Text>
            </View>

            {/* Progression Grid */}
            <Text style={styles.sectionTitle}>UNLOCK_PROGRESSION</Text>
            <View style={styles.grid}>
              {AVATAR_STAGES.map((avatarStage) => {
                const isUnlocked = currentLevel >= avatarStage.minLevel;
                const isCurrent = avatarStage.stage === currentStage;

                return (
                  <View
                    key={avatarStage.stage}
                    style={[
                      styles.avatarCard,
                      { borderColor: isCurrent ? avatarStage.color : PALETTE.surfaceHighlight },
                      isCurrent && styles.avatarCardCurrent,
                    ]}
                  >
                    {/* Image */}
                    <View style={styles.imageContainer}>
                      <Image
                        source={CLASS_AVATARS[characterClass][avatarStage.stage as keyof typeof CLASS_AVATARS.warrior]}
                        style={[styles.avatarPreview, !isUnlocked && styles.avatarLocked]}
                        resizeMode="cover"
                      />
                      {!isUnlocked && (
                        <View style={styles.lockOverlay}>
                          <MaterialCommunityIcons name="lock" size={32} color={PALETTE.textDim} />
                        </View>
                      )}
                      {isCurrent && (
                        <View style={styles.currentBadge}>
                          <Text style={styles.currentBadgeText}>CURRENT</Text>
                        </View>
                      )}
                    </View>

                    {/* Info */}
                    <View style={styles.avatarInfo}>
                      <Text style={[styles.rankName, { color: avatarStage.color }]}>
                        {avatarStage.name}
                      </Text>
                      <Text style={styles.levelRange}>
                        LVL.{avatarStage.minLevel}
                        {avatarStage.maxLevel < 99 ? `-${avatarStage.maxLevel}` : '+'}
                      </Text>
                      {!isUnlocked && (
                        <View style={styles.unlockTextContainer}>
                          <MaterialCommunityIcons name="lock-outline" size={10} color={PALETTE.textDim} />
                          <Text style={styles.unlockText}>
                            Unlock at LVL.{avatarStage.minLevel}
                          </Text>
                        </View>
                      )}
                      {isUnlocked && !isCurrent && (
                        <View style={styles.unlockedTextContainer}>
                          <MaterialCommunityIcons name="check-circle" size={10} color={PALETTE.accent.green} />
                          <Text style={styles.unlockedText}>UNLOCKED</Text>
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>

            {/* Footer Tip */}
            <View style={styles.tipSection}>
              <Text style={styles.tipTitle}>// WARRIOR_PATH</Text>
              <Text style={styles.tipText}>
                Your character evolves as you level up. Train hard to unlock all 8 warrior forms!
              </Text>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    backgroundColor: PALETTE.bg,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderTopWidth: 2,
    borderTopColor: PALETTE.accent.gold,
    maxHeight: '85%',
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: PALETTE.surfaceHighlight,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: PALETTE.accent.gold,
    fontFamily: 'monospace',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 16,
  },
  currentLevelCard: {
    backgroundColor: PALETTE.surface,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: PALETTE.accent.cyan,
    marginBottom: 20,
    alignItems: 'center',
  },
  currentLevelLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: PALETTE.textDim,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  currentLevelValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: PALETTE.accent.cyan,
    fontFamily: 'monospace',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: PALETTE.textDim,
    fontFamily: 'monospace',
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  avatarCard: {
    width: '48%',
    backgroundColor: PALETTE.surface,
    borderWidth: 2,
    borderRadius: 8,
    overflow: 'hidden',
    borderBottomWidth: 4,
  },
  avatarCardCurrent: {
    borderBottomWidth: 6,
  },
  imageContainer: {
    position: 'relative',
    aspectRatio: 1,
    backgroundColor: PALETTE.slot,
  },
  avatarPreview: {
    width: '100%',
    height: '100%',
  },
  avatarLocked: {
    opacity: 0.3,
  },
  lockOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  currentBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: PALETTE.accent.cyan,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  currentBadgeText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: PALETTE.bg,
    fontFamily: 'monospace',
  },
  avatarInfo: {
    padding: 10,
  },
  rankName: {
    fontSize: 12,
    fontWeight: 'bold',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  levelRange: {
    fontSize: 11,
    color: PALETTE.text,
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  unlockText: {
    fontSize: 9,
    color: PALETTE.textDim,
  },
  unlockTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  unlockedText: {
    fontSize: 9,
    color: PALETTE.accent.green,
    fontWeight: 'bold',
  },
  unlockedTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  tipSection: {
    marginTop: 20,
    padding: 12,
    backgroundColor: PALETTE.surface,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: PALETTE.surfaceHighlight,
  },
  tipTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: PALETTE.accent.gold,
    fontFamily: 'monospace',
    marginBottom: 8,
  },
  tipText: {
    fontSize: 11,
    color: PALETTE.textDim,
    lineHeight: 16,
  },
});
