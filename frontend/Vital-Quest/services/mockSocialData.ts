import { Friend, LeaderboardEntry } from '@/store/socialStore';

// Mock friends data
export const mockFriends: Friend[] = [
  {
    id: 'friend-1',
    username: 'FitWarrior92',
    level: 12,
    totalXp: 4500,
    currentStreak: 15,
    avatarColor: '#FF6B35',
    status: 'online',
    lastActive: new Date(),
  },
  {
    id: 'friend-2',
    username: 'HealthMaster',
    level: 18,
    totalXp: 7200,
    currentStreak: 30,
    avatarColor: '#10B981',
    status: 'online',
    lastActive: new Date(),
  },
  {
    id: 'friend-3',
    username: 'YogaQueen',
    level: 10,
    totalXp: 3800,
    currentStreak: 8,
    avatarColor: '#8B5CF6',
    status: 'offline',
    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
  },
  {
    id: 'friend-4',
    username: 'RunnerPro',
    level: 15,
    totalXp: 5900,
    currentStreak: 22,
    avatarColor: '#3B82F6',
    status: 'offline',
    lastActive: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
  },
  {
    id: 'friend-5',
    username: 'GymBeast',
    level: 20,
    totalXp: 8500,
    currentStreak: 45,
    avatarColor: '#EF4444',
    status: 'online',
    lastActive: new Date(),
  },
];

// Mock pending friend requests
export const mockPendingRequests: Friend[] = [
  {
    id: 'request-1',
    username: 'NewRunner',
    level: 5,
    totalXp: 1200,
    currentStreak: 3,
    avatarColor: '#F59E0B',
    status: 'online',
    lastActive: new Date(),
  },
  {
    id: 'request-2',
    username: 'FitnessFreak',
    level: 8,
    totalXp: 2400,
    currentStreak: 12,
    avatarColor: '#EC4899',
    status: 'offline',
    lastActive: new Date(Date.now() - 1 * 60 * 60 * 1000),
  },
];

// Mock leaderboard data
export const generateMockLeaderboard = (currentUserId: string, currentUserXp: number, currentUserLevel: number): LeaderboardEntry[] => {
  const entries: LeaderboardEntry[] = [
    {
      rank: 1,
      userId: 'user-top1',
      username: 'HealthLegend',
      level: 25,
      totalXp: 12500,
      weeklyXp: 2800,
      monthlyXp: 9500,
      avatarColor: '#FFD700',
    },
    {
      rank: 2,
      userId: 'user-top2',
      username: 'FitnessPro',
      level: 23,
      totalXp: 11200,
      weeklyXp: 2500,
      monthlyXp: 8900,
      avatarColor: '#C0C0C0',
    },
    {
      rank: 3,
      userId: 'user-top3',
      username: 'WellnessKing',
      level: 22,
      totalXp: 10800,
      weeklyXp: 2300,
      monthlyXp: 8200,
      avatarColor: '#CD7F32',
    },
    {
      rank: 4,
      userId: 'user-4',
      username: 'GymBeast',
      level: 20,
      totalXp: 8500,
      weeklyXp: 1900,
      monthlyXp: 6800,
      avatarColor: '#EF4444',
    },
    {
      rank: 5,
      userId: 'user-5',
      username: 'HealthMaster',
      level: 18,
      totalXp: 7200,
      weeklyXp: 1600,
      monthlyXp: 5900,
      avatarColor: '#10B981',
    },
    {
      rank: 6,
      userId: 'user-6',
      username: 'RunnerPro',
      level: 15,
      totalXp: 5900,
      weeklyXp: 1400,
      monthlyXp: 4800,
      avatarColor: '#3B82F6',
    },
    {
      rank: 7,
      userId: 'user-7',
      username: 'FitWarrior92',
      level: 12,
      totalXp: 4500,
      weeklyXp: 1100,
      monthlyXp: 3700,
      avatarColor: '#FF6B35',
    },
    {
      rank: 8,
      userId: 'user-8',
      username: 'YogaQueen',
      level: 10,
      totalXp: 3800,
      weeklyXp: 950,
      monthlyXp: 3100,
      avatarColor: '#8B5CF6',
    },
    {
      rank: 9,
      userId: 'user-9',
      username: 'ActiveLife',
      level: 9,
      totalXp: 3200,
      weeklyXp: 850,
      monthlyXp: 2600,
      avatarColor: '#06B6D4',
    },
    {
      rank: 10,
      userId: 'user-10',
      username: 'HealthSeeker',
      level: 8,
      totalXp: 2800,
      weeklyXp: 750,
      monthlyXp: 2200,
      avatarColor: '#A855F7',
    },
  ];

  // Insert current user if not in top 10
  const currentUserRank = Math.floor(Math.random() * 20) + 11; // Random rank between 11-30
  const currentUserEntry: LeaderboardEntry = {
    rank: currentUserRank,
    userId: currentUserId,
    username: 'You',
    level: currentUserLevel,
    totalXp: currentUserXp,
    weeklyXp: Math.floor(currentUserXp * 0.2),
    monthlyXp: Math.floor(currentUserXp * 0.7),
    avatarColor: '#6B2FBF',
    isCurrentUser: true,
  };

  // If user is in top 10, replace their entry
  const topUserIndex = entries.findIndex(e => e.totalXp < currentUserXp);
  if (topUserIndex !== -1) {
    currentUserEntry.rank = topUserIndex + 1;
    entries.splice(topUserIndex, 0, currentUserEntry);
    // Update ranks
    entries.forEach((entry, index) => {
      entry.rank = index + 1;
    });
    return entries.slice(0, 10);
  }

  // Otherwise, add user entry at the end
  return [...entries, currentUserEntry];
};
