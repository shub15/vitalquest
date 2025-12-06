import { Leaderboard } from '@/components/social/Leaderboard';
import { theme } from '@/constants/theme';
import { generateMockLeaderboard, mockFriends, mockPendingRequests } from '@/services/mockSocialData';
import { useGameStore } from '@/store/gameStore';
import { useSocialStore } from '@/store/socialStore';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SocialScreen() {
  const [selectedPeriod, setSelectedPeriod] = useState<'weekly' | 'monthly' | 'alltime'>('weekly');
  const [selectedTab, setSelectedTab] = useState<'leaderboard' | 'friends'>('leaderboard');

  const user = useGameStore((state) => state.user);
  const { friends, leaderboard, updateLeaderboard, addFriend, pendingRequests } = useSocialStore();

  useEffect(() => {
    // Initialize mock data
    if (user && leaderboard.length === 0) {
      const mockLeaderboard = generateMockLeaderboard(
        user.id,
        user.character.totalXp,
        user.character.level
      );
      updateLeaderboard(mockLeaderboard);
    }

    // Initialize friends if empty
    if (friends.length === 0) {
      mockFriends.forEach(friend => addFriend(friend));
    }
  }, [user]);

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <LinearGradient
        colors={[theme.colors.background.primary, theme.colors.background.secondary]}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
            <MaterialCommunityIcons name="trophy" size={32} color={theme.colors.accent.gold} style={{ marginRight: 8 }} />
            <Text style={styles.title}>Social</Text>
          </View>
          <Text style={styles.subtitle}>Compete and connect with others</Text>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'leaderboard' && styles.activeTab]}
            onPress={() => setSelectedTab('leaderboard')}
          >
            <Text style={[styles.tabText, selectedTab === 'leaderboard' && styles.activeTabText]}>
              Leaderboard
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, selectedTab === 'friends' && styles.activeTab]}
            onPress={() => setSelectedTab('friends')}
          >
            <Text style={[styles.tabText, selectedTab === 'friends' && styles.activeTabText]}>
              Friends ({friends.length})
            </Text>
          </TouchableOpacity>
        </View>

        {selectedTab === 'leaderboard' ? (
          <>
            {/* Period Selector */}
            <View style={styles.periodContainer}>
              <TouchableOpacity
                style={[styles.periodButton, selectedPeriod === 'weekly' && styles.activePeriod]}
                onPress={() => setSelectedPeriod('weekly')}
              >
                <Text style={[styles.periodText, selectedPeriod === 'weekly' && styles.activePeriodText]}>
                  Weekly
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodButton, selectedPeriod === 'monthly' && styles.activePeriod]}
                onPress={() => setSelectedPeriod('monthly')}
              >
                <Text style={[styles.periodText, selectedPeriod === 'monthly' && styles.activePeriodText]}>
                  Monthly
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.periodButton, selectedPeriod === 'alltime' && styles.activePeriod]}
                onPress={() => setSelectedPeriod('alltime')}
              >
                <Text style={[styles.periodText, selectedPeriod === 'alltime' && styles.activePeriodText]}>
                  All Time
                </Text>
              </TouchableOpacity>
            </View>

            {/* Leaderboard */}
            <Leaderboard entries={leaderboard} period={selectedPeriod} />
          </>
        ) : (
          <ScrollView style={styles.friendsContainer} showsVerticalScrollIndicator={false}>
            {/* Pending Requests */}
            {mockPendingRequests.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pending Requests ({mockPendingRequests.length})</Text>
                {mockPendingRequests.map(request => (
                  <View key={request.id} style={styles.friendCard}>
                    <View style={[styles.friendAvatar, { backgroundColor: request.avatarColor }]}>
                      <Text style={styles.friendAvatarText}>
                        {request.username.substring(0, 2).toUpperCase()}
                      </Text>
                    </View>
                    <View style={styles.friendInfo}>
                      <Text style={styles.friendName}>{request.username}</Text>
                      <Text style={styles.friendStats}>Level {request.level} • {request.totalXp.toLocaleString()} XP</Text>
                    </View>
                    <View style={styles.requestButtons}>
                      <TouchableOpacity style={styles.acceptButton}>
                        <MaterialCommunityIcons name="check" size={20} color={theme.colors.text.primary} />
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.rejectButton}>
                        <MaterialCommunityIcons name="close" size={20} color={theme.colors.text.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Friends List */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>My Friends ({friends.length})</Text>
              {friends.map(friend => (
                <View key={friend.id} style={styles.friendCard}>
                  <View style={[styles.friendAvatar, { backgroundColor: friend.avatarColor }]}>
                    <Text style={styles.friendAvatarText}>
                      {friend.username.substring(0, 2).toUpperCase()}
                    </Text>
                    <View style={[styles.statusDot, friend.status === 'online' && styles.onlineStatus]} />
                  </View>
                  <View style={styles.friendInfo}>
                    <Text style={styles.friendName}>{friend.username}</Text>
                    <Text style={styles.friendStats}>
                      Level {friend.level} • {friend.totalXp.toLocaleString()} XP • {friend.currentStreak}🔥
                    </Text>
                  </View>
                  <TouchableOpacity style={styles.viewButton}>
                    <Text style={styles.viewButtonText}>View</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* Demo Notice */}
            <View style={styles.demoNotice}>
              <MaterialCommunityIcons name="gamepad-variant" size={20} color={theme.colors.text.secondary} style={{ marginRight: 8 }} />
              <Text style={styles.demoText}>
                Demo Mode: Social features use mock data for demonstration
              </Text>
            </View>
          </ScrollView>
        )}
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
    padding: theme.spacing.lg,
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
  header: {
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize['3xl'],
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
    marginBottom: theme.spacing.lg,
    backgroundColor: theme.colors.background.card,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xs,
  },
  tab: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
  },
  activeTab: {
    backgroundColor: theme.colors.primary.main,
  },
  tabText: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.tertiary,
  },
  activeTabText: {
    color: theme.colors.text.primary,
  },
  periodContainer: {
    flexDirection: 'row',
    marginBottom: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  periodButton: {
    flex: 1,
    paddingVertical: theme.spacing.sm,
    alignItems: 'center',
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.card,
    borderWidth: 1,
    borderColor: theme.colors.primary.dark,
  },
  activePeriod: {
    backgroundColor: theme.colors.primary.dark,
    borderColor: theme.colors.primary.light,
  },
  periodText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.tertiary,
  },
  activePeriodText: {
    color: theme.colors.text.primary,
  },
  friendsContainer: {
    flex: 1,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  friendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.card,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary.dark,
    marginBottom: theme.spacing.sm,
  },
  friendAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
    position: 'relative',
  },
  friendAvatarText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  statusDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: theme.colors.text.disabled,
    borderWidth: 2,
    borderColor: theme.colors.background.card,
  },
  onlineStatus: {
    backgroundColor: theme.colors.stats.xp,
  },
  friendInfo: {
    flex: 1,
  },
  friendName: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  friendStats: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  requestButtons: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  acceptButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.stats.xp,
    justifyContent: 'center',
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.primary,
  },
  rejectButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: theme.colors.stats.hp,
    justifyContent: 'center',
    alignItems: 'center',
  },
  rejectButtonText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.text.primary,
  },
  viewButton: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.primary.dark,
    borderRadius: theme.borderRadius.md,
  },
  viewButtonText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  demoNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.background.tertiary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary.dark,
    marginTop: theme.spacing.lg,
  },
  demoText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
});
