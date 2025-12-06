import { AchievementBadge } from '@/components/game/AchievementBadge';
import { CharacterAvatar } from '@/components/game/CharacterAvatar';
import { gameConfig } from '@/constants/gameConfig';
import { theme } from '@/constants/theme';
import { useGameStore } from '@/store/gameStore';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { format } from 'date-fns';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProfileScreen() {
  const user = useGameStore((state) => state.user);
  const achievements = useGameStore((state) => state.achievements);
  const unlockedAchievements = useGameStore((state) => state.unlockedAchievements);
  
  const [selectedTab, setSelectedTab] = useState<'stats' | 'achievements'>('stats');
  
  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }
  
  const xpForNextLevel = user.character.level < gameConfig.levels.maxLevel
    ? gameConfig.levels.xpThresholds[user.character.level]
    : gameConfig.levels.xpThresholds[gameConfig.levels.maxLevel - 1];
  
  const currentXp = user.character.totalXp - gameConfig.levels.xpThresholds[user.character.level - 1];
  const xpNeeded = xpForNextLevel - gameConfig.levels.xpThresholds[user.character.level - 1];
  const progressToNextLevel = (currentXp / xpNeeded) * 100;
  
  const unlockedCount = unlockedAchievements.length;
  const totalAchievements = achievements.length;
  const achievementProgress = totalAchievements > 0 ? (unlockedCount / totalAchievements) * 100 : 0;
  
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <LinearGradient
        colors={[theme.colors.background.primary, theme.colors.background.secondary]}
        style={styles.container}
      >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <CharacterAvatar level={user.character.level} size={120} />
          <View style={styles.profileInfo}>
            <Text style={styles.username}>{user.username}</Text>
            <Text style={styles.joinDate}>
              Joined {format(new Date(user.stats.joinedDate), 'MMM d, yyyy')}
            </Text>
            
            {/* Level Progress */}
            <View style={styles.levelProgress}>
              <Text style={styles.levelText}>
                Level {user.character.level} → {user.character.level + 1}
              </Text>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${progressToNextLevel}%` }]} />
              </View>
              <Text style={styles.xpText}>
                {currentXp.toLocaleString()} / {xpNeeded.toLocaleString()} XP
              </Text>
            </View>
          </View>
        </View>
        
        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'stats' && styles.tabActive]}
            onPress={() => setSelectedTab('stats')}
          >
            <Text style={[styles.tabText, selectedTab === 'stats' && styles.tabTextActive]}>
              Stats
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'achievements' && styles.tabActive]}
            onPress={() => setSelectedTab('achievements')}
          >
            <Text style={[styles.tabText, selectedTab === 'achievements' && styles.tabTextActive]}>
              Achievements ({unlockedCount}/{totalAchievements})
            </Text>
          </TouchableOpacity>
        </View>
        
        {selectedTab === 'stats' ? (
          <>
            {/* Character Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Character Stats</Text>
              <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                  <MaterialCommunityIcons name="crown" size={32} color={theme.colors.accent.gold} style={styles.statIcon} />
                  <Text style={styles.statValue}>{user.character.level}</Text>
                  <Text style={styles.statLabel}>Level</Text>
                </View>
                <View style={styles.statCard}>
                  <MaterialCommunityIcons name="star-four-points" size={32} color={theme.colors.stats.xp} style={styles.statIcon} />
                  <Text style={styles.statValue}>{user.character.totalXp.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>Total XP</Text>
                </View>
                <View style={styles.statCard}>
                  <MaterialCommunityIcons name="heart" size={32} color={theme.colors.stats.hp} style={styles.statIcon} />
                  <Text style={styles.statValue}>{user.character.hp}/{user.character.maxHp}</Text>
                  <Text style={styles.statLabel}>HP</Text>
                </View>
                <View style={styles.statCard}>
                  <MaterialCommunityIcons name="hand-coin" size={32} color={theme.colors.accent.gold} style={styles.statIcon} />
                  <Text style={styles.statValue}>{user.character.gold.toLocaleString()}</Text>
                  <Text style={styles.statLabel}>Gold</Text>
                </View>
              </View>
            </View>
            
            {/* Progress Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Progress</Text>
              <View style={styles.progressCard}>
                <View style={styles.progressRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="script-text-outline" size={20} color={theme.colors.text.secondary} style={{ marginRight: 8 }} />
                    <Text style={styles.progressLabel}>Quests Completed</Text>
                  </View>
                  <Text style={styles.progressValue}>{user.stats.totalQuestsCompleted}</Text>
                </View>
                <View style={styles.progressRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="trophy" size={20} color={theme.colors.text.secondary} style={{ marginRight: 8 }} />
                    <Text style={styles.progressLabel}>Achievements Unlocked</Text>
                  </View>
                  <Text style={styles.progressValue}>{user.stats.totalAchievementsUnlocked}</Text>
                </View>
                <View style={styles.progressRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="fire" size={20} color={theme.colors.text.secondary} style={{ marginRight: 8 }} />
                    <Text style={styles.progressLabel}>Current Streak</Text>
                  </View>
                  <Text style={styles.progressValue}>{user.stats.currentStreak} days</Text>
                </View>
                <View style={styles.progressRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="target" size={20} color={theme.colors.text.secondary} style={{ marginRight: 8 }} />
                    <Text style={styles.progressLabel}>Longest Streak</Text>
                  </View>
                  <Text style={styles.progressValue}>{user.stats.longestStreak} days</Text>
                </View>
              </View>
            </View>
            
            {/* Health Stats */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Health Stats</Text>
              <View style={styles.progressCard}>
                <View style={styles.progressRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="shoe-print" size={20} color={theme.colors.text.secondary} style={{ marginRight: 8 }} />
                    <Text style={styles.progressLabel}>Total Steps</Text>
                  </View>
                  <Text style={styles.progressValue}>{user.stats.totalSteps.toLocaleString()}</Text>
                </View>
                <View style={styles.progressRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="dumbbell" size={20} color={theme.colors.text.secondary} style={{ marginRight: 8 }} />
                    <Text style={styles.progressLabel}>Exercise Minutes</Text>
                  </View>
                  <Text style={styles.progressValue}>{user.stats.totalExerciseMinutes.toLocaleString()}</Text>
                </View>
                <View style={styles.progressRow}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialCommunityIcons name="meditation" size={20} color={theme.colors.text.secondary} style={{ marginRight: 8 }} />
                    <Text style={styles.progressLabel}>Meditation Minutes</Text>
                  </View>
                  <Text style={styles.progressValue}>{user.stats.totalMeditationMinutes.toLocaleString()}</Text>
                </View>
              </View>
            </View>
          </>
        ) : (
          <>
            {/* Achievement Progress */}
            <View style={styles.achievementProgress}>
              <Text style={styles.achievementProgressText}>
                {unlockedCount} of {totalAchievements} unlocked
              </Text>
              <View style={styles.achievementProgressBar}>
                <View style={[styles.achievementProgressFill, { width: `${achievementProgress}%` }]} />
              </View>
              <Text style={styles.achievementProgressPercent}>
                {achievementProgress.toFixed(0)}% Complete
              </Text>
            </View>
            
            {/* Achievements Grid */}
            <View style={styles.achievementsGrid}>
              {achievements.map((achievement) => (
                <AchievementBadge
                  key={achievement.id}
                  achievement={achievement}
                />
              ))}
            </View>
            
            {achievements.length === 0 && (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="trophy-outline" size={64} color={theme.colors.text.tertiary} style={{ marginBottom: 16 }} />
                <Text style={styles.emptyText}>
                  Complete quests and activities to unlock achievements!
                </Text>
              </View>
            )}
          </>
        )}
        
        {/* Bottom Padding */}
        <View style={{ height: 40 }} />
      </ScrollView>
    </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.secondary,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  profileHeader: {
    flexDirection: 'row',
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.xl,
    borderWidth: 2,
    borderColor: theme.colors.primary.dark,
    ...theme.shadows.md,
  },
  profileInfo: {
    flex: 1,
    marginLeft: theme.spacing.lg,
    justifyContent: 'center',
  },
  username: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  joinDate: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.md,
  },
  levelProgress: {
    marginTop: theme.spacing.sm,
  },
  levelText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.secondary,
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: theme.colors.primary.light,
    borderRadius: theme.borderRadius.full,
  },
  xpText: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xs,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.primary.dark,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: theme.colors.primary.main,
  },
  tabText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.tertiary,
  },
  tabTextActive: {
    color: theme.colors.text.primary,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  statCard: {
    width: '48%',
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.primary.dark,
  },
  statIcon: {
    marginBottom: theme.spacing.sm,
  },
  statValue: {
    fontSize: theme.typography.fontSize['2xl'],
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  statLabel: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  progressCard: {
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary.dark,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.background.tertiary,
  },
  progressLabel: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  progressValue: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  achievementProgress: {
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.primary.dark,
  },
  achievementProgressText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  achievementProgressBar: {
    height: 12,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.full,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  achievementProgressFill: {
    height: '100%',
    backgroundColor: theme.colors.accent.gold,
    borderRadius: theme.borderRadius.full,
  },
  achievementProgressPercent: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  emptyContainer: {
    alignItems: 'center',
    padding: theme.spacing['3xl'],
  },
  emptyIcon: {
    marginBottom: theme.spacing.md,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
  },
});
