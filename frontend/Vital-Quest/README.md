# 🎮 Vital Quest

> **Gamify Your Health, Level Up Your Life**

Transform your fitness journey into an epic RPG adventure where every step counts, every workout matters, and your health becomes your ultimate power-up.

---

## 👥 Team Binary Bandits

**Team Members:**
- Team Lead & Primary Developer
- Full Stack Developer
- UI/UX Designer
- Backend Engineer

---

## 🎯 Problem Statement

Modern fitness and health tracking apps suffer from several critical issues:

1. **Low Engagement** - Users lose motivation after initial enthusiasm wears off
2. **Boring Interface** - Traditional health apps lack excitement and feel like chores
3. **No Gamification** - Missing the psychological rewards that keep users coming back
4. **Disconnected Data** - Health data scattered across multiple apps without centralization
5. **Lack of Social Motivation** - Limited community interaction and competitive elements

**The Result:** 
- 80% of fitness app users abandon within the first month
- Health goals remain unmet
- Wearable devices collect dust

---

## 💡 Solution Overview

**Vital Quest** revolutionizes health tracking by transforming it into an immersive RPG experience:

### Core Concept
Your real-world health activities (steps, workouts, sleep, hydration) directly impact your in-game character progression. Every healthy choice you make strengthens your character, unlocks new abilities, and advances your quest.

### Key Innovations
- **Real RPG Mechanics** - XP, levels, character classes, and progression systems
- **Live Health Integration** - Syncs directly with Android Health Connect
- **Dynamic Quests** - Daily, weekly, and custom health challenges
- **Character Evolution** - 8 avatar progression stages across 4 unique classes
- **Social Chronicles** - Share achievements and compete with friends
- **Smart Notifications** - Push reminders via Firebase Cloud Messaging

---

## 🛠️ Tech Stack

### Frontend
- **Framework:** React Native (Expo SDK 54)
- **UI Library:** React Native Reanimated (animations)
- **Navigation:** Expo Router
- **State Management:** Zustand
- **Storage:** AsyncStorage (local persistence)
- **Icons:** Material Community Icons

### Backend Integration (Ready)
- **Push Notifications:** Firebase Cloud Messaging (FCM)
- **Health Sync:** Android Health Connect API
- **Cloud Storage:** Firebase (configured)

### Development Tools
- **Language:** TypeScript
- **Build Tool:** Expo EAS Build
- **Package Manager:** npm
- **Version Control:** Git

### Architecture
```
Vital-Quest/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   ├── onboarding.tsx     # User onboarding flow
│   └── _layout.tsx        # Root layout
├── components/            # Reusable UI components
│   ├── game/             # Game-specific components
│   ├── health/           # Health tracking UI
│   └── social/           # Social features
├── services/             # Business logic
│   ├── fcm.ts           # Push notification service
│   ├── healthConnect.ts  # Health data integration
│   └── gamificationEngine.ts  # Quest & XP logic
├── store/               # Zustand state management
│   ├── gameStore.ts     # Game state
│   └── healthStore.ts   # Health data state
└── types/              # TypeScript definitions
```

---

## 🚀 Setup Instructions

### Prerequisites
- **Node.js** (v18 or higher)
- **npm** or **yarn**
- **Android Studio** (for Android development)
- **Physical Android device** (for Health Connect & FCM testing)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/BinaryBandits/Vital-Quest.git
   cd Vital-Quest
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Configure Firebase (Optional for Push Notifications)**
   - Place your `google-services.json` in the root directory
   - Already configured in `app.json`

4. **Generate Native Code**
   ```bash
   npx expo prebuild
   ```

5. **Run on Android Device**
   ```bash
   npx expo run:android
   ```

   **OR** for development with Expo Go:
   ```bash
   npm start
   ```

### Environment Setup

**Android Health Connect Permissions:**
The app automatically requests these permissions:
- `android.permission.health.READ_STEPS`
- `android.permission.health.READ_HEART_RATE`
- `android.permission.health.READ_EXERCISE`
- `android.permission.health.READ_SLEEP`

**FCM Token Generation:**
- Automatically generates on first launch
- Stored in user profile
- Ready for backend integration

---

## ✨ Features

### 🎮 Core Gamification

#### RPG Progression System
- **8 Rank Tiers:** Novice → Apprentice → Adept → Expert → Master → Grandmaster → Legend → Mythic
- **4 Character Classes:** Warrior, Assassin, Monk, Villager (each with unique avatars)
- **XP System:** Earn experience points from health activities
- **Level Scaling:** Smart XP thresholds with exponential progression
- **HP System:** Health points that deplete with inactivity

#### Quest System
- ✅ **Daily Quests** - Steps, exercise, water intake, meditation
- ✅ **Weekly Challenges** - Long-term health goals
- ✅ **Custom Quests** - Create your own challenges
- ✅ **Smart Progress Tracking** - Real-time quest completion detection
- ✅ **Reward System** - XP, Gold, HP restoration on completion

#### Achievement System
- 🏆 Milestone-based unlocking
- 🎖️ Rarity tiers (Common → Legendary)
- 📊 Progress tracking for each achievement
- 🎉 Visual badges and notifications

### 📱 Health Integration

#### Android Health Connect Sync
- **Real-time Data:** Steps, exercise minutes, sleep hours, heart rate
- **Manual & Auto Sync:** On-demand or scheduled syncing
- **Smart Caching:** Prevents duplicate data and XP awards
- **Activity History:** View past 7 days of health data

#### Health Dashboard
- 📊 Daily summary cards
- 📈 Week-over-week progress charts
- 🎯 Goal tracking with visual indicators
- 🔥 Streak maintenance system

### 🎨 UI/UX Features

#### Retro-Cyberpunk Design
- **Dark Theme** - Easy on eyes, battery-efficient
- **Neon Accents** - Vibrant cyan, purple, gold highlights
- **Pixel Art Elements** - Retro gaming aesthetic
- **Smooth Animations** - React Native Reanimated for 60fps transitions

#### Avatar System
- **Class Selection** - Choose your character archetype
- **8 Evolution Stages** - Visual progression as you level up
- **Interactive Modal** - Preview all avatar stages
- **Breathing Animations** - Idle state hologram effects

#### Quest Cards
- **Retro CRT Styling** - Scanline effects and pixel borders
- **Progress Bars** - Visual HP-style progress tracking
- **Difficulty Indicators** - Color-coded challenge levels
- **Loot Display** - Show XP and Gold rewards upfront

### 🔔 Push Notifications

#### Firebase Cloud Messaging
- **Native FCM Tokens** - Direct Firebase integration
- **Smart Reminders** - Daily health check-ins
- **Quest Alerts** - Notifications for incomplete quests
- **Achievement Unlocks** - Instant notifications on milestones

#### Notification Handlers
- **Foreground Display** - In-app notifications
- **Background Processing** - Wake app from background
- **Tap Navigation** - Deep linking to specific quests/achievements

### 🌐 Social Features

#### Chronicles (Activity Sharing)
- **Post Creation** - Share your achievements
- **Activity Feed** - See friends' progress
- **Motivational System** - Like and encourage others
- **Social Proof** - Display character level and avatar

---

## 📸 Demo

### Screenshots

> **Note:** Add your screenshots here

```
[Hero Screen] [Quest Dashboard] [Character Progression]
[Health Dashboard] [Achievement Gallery] [Social Feed]
```

### Video Demo

> **Coming Soon:** Link to demo video

📹 [Watch Full Demo](https://your-demo-link.com)

---

## 🔮 Future Enhancements

### Short-term (v2.0)
- [ ] **Multiplayer Quests** - Team up with friends for group challenges
- [ ] **Boss Battles** - Epic challenges that require multiple days to complete
- [ ] **Equipment System** - Unlock gear that provides health bonuses
- [ ] **Leaderboards** - Global and friend-based rankings
- [ ] **iOS Support** - Apple HealthKit integration

### Medium-term (v3.0)
- [ ] **AI Health Coach** - Personalized recommendations based on data patterns
- [ ] **Workout Library** - Pre-built exercise routines with video guides
- [ ] **Nutrition Tracking** - Meal logging with gamified food battles
- [ ] **Meditation Modes** - Guided sessions with in-game rewards
- [ ] **Guild System** - Join health-focused communities

### Long-term (v4.0+)
- [ ] **AR Integration** - Augmented reality workout challenges
- [ ] **Wearable Integration** - Direct sync with smartwatches
- [ ] **Marketplace** - Trade items and cosmetics with other players
- [ ] **Story Mode** - Narrative-driven health journey
- [ ] **Cross-platform Sync** - Web and mobile synchronization

### Backend Infrastructure (Ready for Integration)
- [ ] **User Authentication** - Firebase Auth with Google/Email sign-in
- [ ] **Cloud Database** - Firestore for user profiles and progress
- [ ] **Social Backend** - Friend system and activity feed API
- [ ] **Push Notifications** - Backend service for scheduled reminders
- [ ] **Analytics Dashboard** - User engagement and retention metrics

---

## 🏗️ Project Architecture

### Design Patterns
- **Zustand Store Pattern** - Centralized state management
- **Service Layer** - Separation of business logic from UI
- **Component Composition** - Reusable, modular components
- **Type Safety** - Full TypeScript coverage

### Performance Optimizations
- ✅ **Lazy Loading** - Code splitting for faster initial load
- ✅ **Memoization** - Prevent unnecessary re-renders
- ✅ **Animated Driver** - Native driver for 60fps animations
- ✅ **AsyncStorage** - Persistent state across app restarts

### Code Quality
- TypeScript for type safety
- Modular component structure
- Comprehensive error handling
- Console logging for debugging

---

## 📝 API Integration Guide

### Backend Endpoints (To Implement)

```typescript
// User Management
POST   /api/auth/register
POST   /api/auth/login
GET    /api/user/profile

// Health Data
POST   /api/health/sync
GET    /api/health/summary/:userId

// Quest System
GET    /api/quests/daily
POST   /api/quests/complete
GET    /api/quests/history

// Social Features
POST   /api/social/post
GET    /api/social/feed
POST   /api/social/like

// Push Notifications
POST   /api/fcm/register
POST   /api/fcm/send
```

### FCM Token Registration

```typescript
// Already implemented in services/fcm.ts
const { token } = await getFCMToken();
await registerFCMTokenWithBackend(token, userId);
```

---

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Expo Team** - For the amazing development framework
- **React Native Community** - For extensive libraries and support
- **Firebase** - For cloud infrastructure
- **Health Connect** - For health data integration
- **Material Design** - For icon library

---

## 📧 Contact

**Team Binary Bandits**
- GitHub: [@BinaryBandits](https://github.com/BinaryBandits)
- Email: contact@binarybandits.dev

---

<div align="center">

**Built with ❤️ by Binary Bandits**

*Turning Health into an Adventure*

[![Made with Expo](https://img.shields.io/badge/Made%20with-Expo-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev)
[![React Native](https://img.shields.io/badge/React%20Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactnative.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Firebase](https://img.shields.io/badge/Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)

</div>
