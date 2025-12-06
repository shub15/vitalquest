import { theme } from '@/constants/theme';
import { LeaderboardEntry } from '@/store/socialStore';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  period: 'weekly' | 'monthly' | 'alltime';
}

export function Leaderboard({ entries, period }: LeaderboardProps) {
  const getXpForPeriod = (entry: LeaderboardEntry) => {
    switch (period) {
      case 'weekly':
        return entry.weeklyXp;
      case 'monthly':
        return entry.monthlyXp;
      default:
        return entry.totalXp;
    }
  };

  const renderRank = (rank: number) => {
    if (rank === 1) return <MaterialCommunityIcons name="medal" size={28} color={theme.colors.accent.gold} />;
    if (rank === 2) return <MaterialCommunityIcons name="medal" size={28} color="#C0C0C0" />;
    if (rank === 3) return <MaterialCommunityIcons name="medal" size={28} color="#CD7F32" />;
    return (
      <Text style={[styles.rank, rank <= 3 && styles.topRank]}>
        #{rank}
      </Text>
    );
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {entries.map((entry) => (
        <View key={entry.userId} style={styles.entryContainer}>
          <LinearGradient
            colors={
              entry.isCurrentUser
                ? [theme.colors.primary.dark, theme.colors.primary.main]
                : [theme.colors.background.card, theme.colors.background.tertiary]
            }
            style={[
              styles.entryGradient,
              entry.isCurrentUser && styles.currentUserEntry,
            ]}
          >
            {/* Rank */}
            <View style={styles.rankContainer}>
              {renderRank(entry.rank)}
            </View>

            {/* Avatar */}
            <View
              style={[
                styles.avatar,
                { backgroundColor: entry.avatarColor },
              ]}
            >
              <Text style={styles.avatarText}>
                {entry.username.substring(0, 2).toUpperCase()}
              </Text>
            </View>

            {/* User Info */}
            <View style={styles.userInfo}>
              <Text
                style={[
                  styles.username,
                  entry.isCurrentUser && styles.currentUserText,
                ]}
                numberOfLines={1}
              >
                {entry.username}
              </Text>
              <Text style={styles.level}>Level {entry.level}</Text>
            </View>

            {/* XP */}
            <View style={styles.xpContainer}>
              <Text
                style={[
                  styles.xp,
                  entry.isCurrentUser && styles.currentUserText,
                ]}
              >
                {getXpForPeriod(entry).toLocaleString()}
              </Text>
              <Text style={styles.xpLabel}>XP</Text>
            </View>
          </LinearGradient>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  entryContainer: {
    marginBottom: theme.spacing.md,
  },
  entryGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary.dark,
  },
  currentUserEntry: {
    borderWidth: 2,
    borderColor: theme.colors.primary.light,
  },
  rankContainer: {
    width: 50,
    alignItems: 'center',
  },
  rank: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.secondary,
  },
  topRank: {
    fontSize: theme.typography.fontSize['2xl'],
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  avatarText: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: theme.typography.fontSize.base,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  currentUserText: {
    color: theme.colors.accent.gold,
  },
  level: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text.tertiary,
  },
  xpContainer: {
    alignItems: 'flex-end',
  },
  xp: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  xpLabel: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.text.tertiary,
  },
});
