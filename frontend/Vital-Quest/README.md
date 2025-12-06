# 🎮 Vital Quest - Gamified Health Motivation Platform

Transform your health journey into an epic RPG adventure! Vital Quest combines the addictive mechanics of Habitica with modern health tracking to make wellness fun, engaging, and sustainable.

## ✨ Features

### 🎯 Core Gamification
- **RPG Character System**: Level up your character from 1 to 30
- **XP & Leveling**: Earn experience points from real health activities
- **HP System**: Maintain your health or face consequences for missed habits
- **Gold & Rewards**: Collect coins and unlock items
- **Streak Tracking**: Build consistency with fire streaks 🔥

### 📊 Health Tracking
- **Steps**: Track daily steps (Health Connect ready)
- **Exercise**: Log workout sessions and duration
- **Meditation**: Track mindfulness minutes
- **Nutrition**: Log meals and water intake
- **Sleep**: Monitor sleep quality and duration

### 🏆 Quest System
- **Daily Quests**: Reset at midnight, complete or lose HP
- **Weekly Challenges**: Bigger goals, bigger rewards
- **Custom Quests**: Create your own health goals
- **Auto-Progress**: Quests update automatically from health data

### 🎖️ Achievements
- 20+ unlockable achievements
- 5 rarity tiers (Common → Legendary)
- Categories: Fitness, Meditation, Nutrition, Sleep, Streaks
- Automatic progress tracking

### 🎨 Premium UI/UX
- Fantasy RPG theme with deep purples and gold accents
- Smooth animations using React Native Reanimated
- Gradient effects and visual polish
- Habitica-inspired design language

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Expo CLI
- Android Studio (for Android development)
- Physical Android device or emulator

### Installation

```bash
# Install dependencies
npm install

# Start the development server
npm start

# Run on Android
npm run android

# Run on iOS (macOS only)
npm run ios
```

## 📱 Tech Stack

- **Framework**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: Zustand + AsyncStorage
- **Animations**: React Native Reanimated
- **UI**: Expo Linear Gradient, React Native SVG
- **Health Data**: React Native Health Connect (Android)
- **Notifications**: Expo Notifications
- **TypeScript**: Full type safety

## 🎮 Game Mechanics

### XP Rewards
- **Steps**: 1 XP per 100 steps, bonuses at 1K, 5K, 10K
- **Exercise**: 2 XP/min + 50 XP session bonus (30+ min)
- **Meditation**: 3 XP/min + 40 XP session bonus (10+ min)
- **Sleep**: 5 XP/hour + 50 XP for perfect sleep (7-9 hours)
- **Water**: 5 XP per glass
- **Meals**: 10-25 XP based on healthiness

### Leveling System
- 30 levels total
- XP thresholds increase progressively
- Each level grants +10 max HP and gold bonus
- Full HP restoration on level up

### HP System
- Base: 100 HP
- Damage: -15 HP for missed daily quests
- Healing: +5 HP per completed habit
- Game over at 0 HP (future feature)

## 📂 Project Structure

```
Vital-Quest/
├── app/                    # Expo Router screens
│   └── (tabs)/
│       └── index.tsx       # Main dashboard
├── components/             # Reusable components
│   └── game/
│       ├── CharacterAvatar.tsx
│       ├── ProgressBar.tsx
│       ├── StatsPanel.tsx
│       └── QuestCard.tsx
├── constants/              # Configuration
│   ├── theme.ts           # Design system
│   └── gameConfig.ts      # Game balance
├── services/               # Business logic
│   ├── gamificationEngine.ts
│   └── mockData.ts
├── store/                  # State management
│   ├── gameStore.ts
│   └── healthStore.ts
└── types/                  # TypeScript definitions
    └── index.ts
```

## 🔧 Configuration

### Health Connect (Android)
To enable Health Connect integration:

1. Add permissions to `app.json`:
```json
{
  "expo": {
    "android": {
      "permissions": [
        "android.permission.health.READ_STEPS",
        "android.permission.health.READ_HEART_RATE",
        "android.permission.health.READ_SLEEP"
      ]
    }
  }
}
```

2. Request permissions in your app (service ready to implement)

### Notifications
Local notifications are configured with Expo Notifications. For FCM (future):
1. Create Firebase project
2. Add `google-services.json`
3. Configure FCM in `app.json`

## 🎯 Roadmap

### Phase 1: Core Features (Current)
- [x] Game mechanics (XP, leveling, quests)
- [x] Health tracking stores
- [x] Main dashboard UI
- [x] Quest system
- [x] Achievement system
- [ ] Health Connect integration
- [ ] Local notifications

### Phase 2: Enhanced UX
- [ ] Onboarding flow
- [ ] Quest creation UI
- [ ] Profile & settings screens
- [ ] Achievement showcase
- [ ] Lottie animations

### Phase 3: Social Features (Requires Backend)
- [ ] Leaderboards
- [ ] Party system
- [ ] Friend challenges
- [ ] Global competitions

### Phase 4: AI & Analytics
- [ ] Custom backend integration
- [ ] AI coach recommendations
- [ ] Progress insights
- [ ] Personalized challenges

## 🤝 Contributing

This is a hackathon project for Periscope 2025. Contributions, ideas, and feedback are welcome!

## 📄 License

MIT License - feel free to use this project as inspiration for your own health apps!

## 🙏 Acknowledgments

- Inspired by [Habitica](https://habitica.com/) - the original gamified habit tracker
- Built with ❤️ for the Periscope Hackathon 2025
- Team: Binary Bandits

---

**Made with 💪 by Binary Bandits** | Periscope Hackathon 2025
