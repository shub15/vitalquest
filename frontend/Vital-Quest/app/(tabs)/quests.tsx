import { QuestCard } from '@/components/game/QuestCard';
import { theme } from '@/constants/theme';
import { useGameStore } from '@/store/gameStore';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function QuestsScreen() {
  const activeQuests = useGameStore((state) => state.activeQuests);
  const completedQuests = useGameStore((state) => state.completedQuests);
  const completeQuest = useGameStore((state) => state.completeQuest);
  
  const [selectedTab, setSelectedTab] = useState<'active' | 'completed'>('active');
  
  const dailyQuests = activeQuests.filter((q) => q.type === 'daily');
  const weeklyQuests = activeQuests.filter((q) => q.type === 'weekly');
  const customQuests = activeQuests.filter((q) => q.type === 'custom');
  
  const recentCompleted = completedQuests.slice(0, 10);
  
  const handleQuestComplete = (questId: string) => {
    completeQuest(questId);
  };
  
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
    <LinearGradient
      colors={[theme.colors.background.primary, theme.colors.background.primary]}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Quests</Text>
          <Text style={styles.subtitle}>Complete quests to earn XP and gold!</Text>
        </View>
        
        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'active' && styles.tabActive]}
            onPress={() => setSelectedTab('active')}
          >
            <Text style={[styles.tabText, selectedTab === 'active' && styles.tabTextActive]}>
              Active ({activeQuests.length})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'completed' && styles.tabActive]}
            onPress={() => setSelectedTab('completed')}
          >
            <Text style={[styles.tabText, selectedTab === 'completed' && styles.tabTextActive]}>
              Completed ({completedQuests.length})
            </Text>
          </TouchableOpacity>
        </View>
        
        {selectedTab === 'active' ? (
          <>
            {/* Daily Quests */}
            {dailyQuests.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="calendar-clock" size={24} color={theme.colors.text.primary} style={styles.sectionIcon} />
                  <Text style={styles.sectionTitle}>Daily Quests</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{dailyQuests.length}</Text>
                  </View>
                </View>
                {dailyQuests.map((quest) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    onComplete={() => handleQuestComplete(quest.id)}
                  />
                ))}
              </View>
            )}
            
            {/* Weekly Quests */}
            {weeklyQuests.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="calendar-week" size={24} color={theme.colors.text.primary} style={styles.sectionIcon} />
                  <Text style={styles.sectionTitle}>Weekly Challenges</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{weeklyQuests.length}</Text>
                  </View>
                </View>
                {weeklyQuests.map((quest) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    onComplete={() => handleQuestComplete(quest.id)}
                  />
                ))}
              </View>
            )}
            
            {/* Custom Quests */}
            {customQuests.length > 0 && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <MaterialCommunityIcons name="star" size={24} color={theme.colors.accent.gold} style={styles.sectionIcon} />
                  <Text style={styles.sectionTitle}>Custom Goals</Text>
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{customQuests.length}</Text>
                  </View>
                </View>
                {customQuests.map((quest) => (
                  <QuestCard
                    key={quest.id}
                    quest={quest}
                    onComplete={() => handleQuestComplete(quest.id)}
                  />
                ))}
              </View>
            )}
            
            {activeQuests.length === 0 && (
              <View style={styles.emptyContainer}>
                <MaterialCommunityIcons name="party-popper" size={64} color={theme.colors.text.tertiary} style={{ marginBottom: 16 }} />
                <Text style={styles.emptyTitle}>All Caught Up!</Text>
                <Text style={styles.emptyText}>
                  You've completed all your quests. New daily quests will appear tomorrow!
                </Text>
              </View>
            )}
          </>
        ) : (
          <>
            {/* Completed Quests */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MaterialCommunityIcons name="check-circle" size={24} color={theme.colors.stats.xp} style={styles.sectionIcon} />
                <Text style={styles.sectionTitle}>Recently Completed</Text>
              </View>
              {recentCompleted.length > 0 ? (
                recentCompleted.map((quest) => (
                  <QuestCard key={quest.id} quest={quest} />
                ))
              ) : (
                <View style={styles.emptyContainer}>
                  <MaterialCommunityIcons name="script-text-outline" size={64} color={theme.colors.text.tertiary} style={{ marginBottom: 16 }} />
                  <Text style={styles.emptyTitle}>No Completed Quests Yet</Text>
                  <Text style={styles.emptyText}>
                    Start completing quests to build your achievement history!
                  </Text>
                </View>
              )}
            </View>
          </>
        )}
        
        {/* Create Quest Button */}
        <TouchableOpacity style={styles.createButton}>
          <LinearGradient
            colors={theme.colors.gradients.primary}
            style={styles.createGradient}
          >
            <MaterialCommunityIcons name="plus" size={24} color={theme.colors.text.primary} style={{ marginRight: 8 }} />
            <Text style={styles.createText}>Create Custom Quest</Text>
          </LinearGradient>
        </TouchableOpacity>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: theme.spacing.lg,
  },
  header: {
    marginBottom: theme.spacing.xl,
  },
  title: {
    fontSize: theme.typography.fontSize['4xl'],
    fontWeight: theme.typography.fontWeight.extrabold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.secondary,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xs,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border.subtle,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabActive: {
    backgroundColor: theme.colors.primary.main,
  },
  tabText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
  },
  tabTextActive: {
    color: theme.colors.text.primary,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  sectionIcon: {
    fontSize: 24,
    marginRight: theme.spacing.sm,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    flex: 1,
  },
  badge: {
    backgroundColor: theme.colors.primary.main,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.borderRadius.full,
    minWidth: 28,
    alignItems: 'center',
  },
  badgeText: {
    fontSize: theme.typography.fontSize.xs,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  emptyContainer: {
    alignItems: 'center',
    padding: theme.spacing['3xl'],
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.md,
  },
  emptyTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  emptyText: {
    fontSize: theme.typography.fontSize.base,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    lineHeight: 22,
  },
  createButton: {
    marginTop: theme.spacing.md,
    borderRadius: theme.borderRadius.xl,
    overflow: 'hidden',
    ...theme.shadows.md,
  },
  createGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
    borderWidth: 2,
    borderColor: theme.colors.primary.light,
    borderRadius: theme.borderRadius.xl,
  },
  createIcon: {
    fontSize: 24,
    marginRight: theme.spacing.sm,
  },
  createText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
});
