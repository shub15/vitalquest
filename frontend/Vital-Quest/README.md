# Vital Quest - Gamified Health Motivation Platform

Transform your health journey into an epic RPG adventure! Earn XP, level up, complete quests, and unlock achievements by maintaining healthy habits.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Platform](https://img.shields.io/badge/platform-React%20Native-green)
![License](https://img.shields.io/badge/license-MIT-orange)

---

## 🎮 Features

### Core Gamification
- **RPG Character System**: Level up from 1 to 30 with XP rewards
- **Quest System**: Daily, weekly, and custom quests with progress tracking
- **Achievement System**: Unlock badges across multiple tiers (common to legendary)
- **Streak Tracking**: Maintain daily streaks for bonus rewards
- **HP & Gold**: Character health and currency system

### Health Tracking
- **Manual Logging**: Quick-add buttons for all activities
- **Health Connect Integration**: Automatic sync from Android smartwatches
- **Activity Types**: Steps, exercise, meditation, water, meals, sleep
- **Daily Summaries**: Track progress over time

### Engagement Features
- **Local Notifications**: Daily reminders and event alerts
- **Animated UI**: Smooth transitions and breathing animations
- **Fantasy Theme**: Habitica-inspired design with gradients and effects
- **Onboarding Flow**: Welcome new users with guided setup

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Expo CLI (`npm install -g expo-cli`)
- Android device/emulator for Health Connect testing

### Installation

```bash
# Clone the repository
cd Vital-Quest

# Install dependencies
npm install

# Start the development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

---

## 📱 Usage

### First Launch
1. Enter your username
2. Learn about health tracking features
3. Grant notification permissions
4. (Optional) Enable Health Connect for automatic syncing

### Daily Workflow
1. **Check Dashboard**: View your stats, quests, and progress
2. **Log Activities**: Use quick action buttons to log health activities
3. **Complete Quests**: Earn XP and gold by completing daily/weekly quests
4. **Level Up**: Watch your character grow as you maintain healthy habits
5. **Unlock Achievements**: Reach milestones to earn badges

### Quick Actions
- **👣 Steps**: Log daily steps
- **💧 Water**: Track water intake
- **🍽️ Meal**: Log meals
- **💪 Exercise**: Record workout minutes
- **🧘 Meditation**: Track mindfulness sessions
- **😴 Sleep**: Log sleep hours

---

## 🏗️ Project Structure

```
Vital-Quest/
├── app/                      # Expo Router screens
│   ├── (tabs)/              # Tab navigation screens
│   │   ├── index.tsx        # Dashboard
│   │   ├── quests.tsx       # Quests screen
│   │   └── profile.tsx      # Profile screen
│   ├── onboarding.tsx       # Onboarding flow
│   └── index.tsx            # Root redirect
├── components/              # Reusable components
│   ├── game/               # Game-related components
│   │   ├── CharacterAvatar.tsx
│   │   ├── StatsPanel.tsx
│   │   ├── QuestCard.tsx
│   │   ├── ProgressBar.tsx
│   │   └── AchievementBadge.tsx
│   └── health/             # Health tracking components
│       └── QuickLogModal.tsx
├── constants/              # App constants
│   ├── theme.ts           # Fantasy RPG theme
│   └── gameConfig.ts      # Game balance configuration
├── services/              # Business logic
│   ├── gamificationEngine.ts  # XP, quests, achievements
│   ├── healthConnect.ts       # Health Connect integration
│   └── notifications.ts       # Local notifications
├── store/                 # Zustand state management
│   ├── gameStore.ts      # Game state (user, quests, achievements)
│   └── healthStore.ts    # Health data state
├── hooks/                # Custom React hooks
│   └── useHealthConnectSync.ts
└── types/                # TypeScript definitions
    └── index.ts
```

---

## 🎯 Game Mechanics

### XP Rewards
- **Steps**: 1 XP per 100 steps, bonuses at 1k, 5k, 10k
- **Exercise**: 2 XP/min + 50 XP session bonus (30+ mins)
- **Meditation**: 3 XP/min + 40 XP session bonus (10+ mins)
- **Sleep**: 5 XP/hour + 50 XP perfect sleep bonus (7-9 hours)
- **Water**: 5 XP per glass
- **Meals**: 10 XP per log, 25 XP for healthy meals

### Level Progression
- 30 levels total
- XP thresholds increase progressively
- Each level grants: +10 max HP, +5 gold bonus
- Full HP heal on level up

### Quest System
- **Daily Quests**: Reset at midnight, 5 quests per day
- **Weekly Quests**: Reset weekly, cumulative goals
- **Custom Quests**: User-created goals
- **Penalties**: Missed daily quests cause HP damage

---

## 🔧 Configuration

### Notifications
Edit notification times in `constants/gameConfig.ts`:
```typescript
notifications: {
  morning: 8,      // 8 AM
  midday: 12,      // 12 PM
  evening: 18,     // 6 PM
  streakAlert: 21, // 9 PM
}
```

### Game Balance
Adjust XP rewards and difficulty in `constants/gameConfig.ts`

---

## 📊 Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: Zustand with AsyncStorage persistence
- **Animations**: React Native Reanimated
- **Health Data**: React Native Health Connect (Android)
- **Notifications**: Expo Notifications
- **Styling**: Expo Linear Gradient, custom theme system
- **Date Handling**: date-fns

---

## 🤝 Contributing

This is a hackathon project. Feel free to fork and build upon it!

---

## 📄 License

MIT License - feel free to use this project for learning and development.

---

## 🎉 Acknowledgments

- Inspired by [Habitica](https://habitica.com)
- Built for health motivation and gamification
- Created with ❤️ for the hackathon

---

## 📞 Support

For issues or questions, please open an issue on GitHub.

---

**Happy questing! 🗡️✨**
