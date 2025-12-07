# Vital Quest - Gamified Health Motivation Platform

**Team**: Binary Bandits  
**Hackathon Project**: Periscope Health Motivation Challenge

---

## 🎯 Problem Statement

**Health Motivation Platform**

A digital platform that promotes healthy habits such as regular exercise, mindful eating, and meditation, offering rewards, challenges, and social engagement to keep users consistently motivated.

---

## 💡 Solution Overview

Vital Quest transforms health tracking into an epic RPG adventure. Users earn XP, level up their character, complete quests, and unlock achievements by maintaining healthy habits. The platform combines:

- **Gamification Engine**: RPG-style progression system with levels, XP, quests, and achievements
- **AI-Powered Coaching**: Personalized feedback using Google Gemini API based on recovery metrics
- **Social Features**: Battles, leaderboards, and social feed to foster community engagement
- **Smart Health Analytics**: Bio-recovery scoring, battle points calculation, and vital recaps (Spotify Wrapped-style summaries)

---

## 🏗️ Architecture & Scalability

### Built for Scale
Vital Quest is architected with **modularity and scalability** at its core, designed to seamlessly scale from **10 users to thousands** without architectural changes:

- **Microservices-Ready**: Modular backend structure with separated routers, services, and data layers
- **Stateless API Design**: FastAPI endpoints enable horizontal scaling with load balancers
- **Database Flexibility**: SQLite for PoC, easy migration to MySQL/PostgreSQL for production
- **Async Processing**: Async/await patterns for AI calls and database operations
- **Caching Strategy**: Ready for Redis integration for session management and leaderboard caching
- **API Rate Limiting**: Built-in support for throttling and request queuing
- **Containerization Ready**: Docker-compatible structure for cloud deployment (AWS, GCP, Azure)

### Performance Optimizations
- **Efficient Data Models**: Pydantic validation ensures data integrity with minimal overhead
- **Batch Processing**: Aggregation services handle bulk data efficiently
- **Lazy Loading**: Frontend components load data on-demand
- **Connection Pooling**: Database connections managed efficiently for concurrent users

---

## 🏗️ Technical Architecture

### Frontend (React Native + Expo)
- **Mobile App**: Cross-platform iOS/Android app with fantasy RPG theme
- **Health Connect Integration**: Automatic sync from Android smartwatches
- **Real-time Gamification**: Instant XP rewards, quest tracking, and achievement unlocks

### Backend (FastAPI + Python)
- **RESTful API**: High-performance endpoints for health analytics and gamification
- **AI Services**: Google Gemini integration for personalized coaching
- **Database**: SQLite (PoC) with MySQL support for production
- **Battle System**: Fair scoring algorithm balancing steps, sleep, and workouts

---

## 🚀 Tech Stack

### Frontend
- **Framework**: React Native with Expo Router
- **State Management**: Zustand with AsyncStorage persistence
- **Animations**: React Native Reanimated
- **Health Data**: React Native Health Connect (Android)
- **Notifications**: Expo Notifications
- **Styling**: Expo Linear Gradient, custom fantasy theme

### Backend
- **Framework**: FastAPI (Python)
- **Server**: Uvicorn (ASGI)
- **AI**: Google Gemini API (`gemini-2.0-flash`)
- **Data Validation**: Pydantic
- **Database**: SQLite / MySQL
- **Testing**: Pytest
- **UI Dashboard**: Streamlit (for testing/admin)

### APIs & Services
- **Google Gemini API**: AI-powered coaching feedback
- **Health Connect API**: Biometric data integration (conceptual)

---

## 📦 Setup Instructions

### Prerequisites
- **Frontend**: Node.js 18+, Expo CLI
- **Backend**: Python 3.11+, pip
- **Optional**: Android device/emulator for Health Connect

### Backend Setup

```powershell
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Set up environment variables
# Create .env file with:
# GOOGLE_API_KEY=your_gemini_api_key_here

# Run the server
uvicorn backend.main:app --reload --port 8000

# Or use SQLite version
python run_server_sqlite.py
```

### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend/Vital-Quest

# Install dependencies
npm install

# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios
```

### Testing

```powershell
# Backend tests
python -m pytest tests/ -v

# Test coverage
python -m pytest tests/ --cov
```

---

## ✨ Features

### 🎮 Gamification
- **RPG Character System**: Level 1-30 progression with XP rewards
- **Quest System**: Daily, weekly, and custom quests with progress tracking
- **Achievement System**: Unlock badges across multiple tiers (common to legendary)
- **Streak Tracking**: Maintain daily streaks for bonus rewards
- **Battle System**: Compete with friends using fair scoring algorithm
- **Leaderboards**: Global and team rankings

### 🏥 Health Analytics
- **Bio-Recovery Score**: Dynamic RHR calculation from sleep data
- **Battle Points**: Rebalanced scoring (steps, deep sleep, workouts)
- **Vital Recap**: Weekly/Monthly/Yearly summaries (Spotify Wrapped style)
- **Sleep Analysis**: Deep sleep tracking and quality metrics

### 🤖 AI Coach
- **Morning Planning**: Workout recommendations based on recovery
- **Post-Workout Analysis**: Recovery tips and sleep advice
- **Personalized Feedback**: Context-aware coaching using Gemini API
- **Concise Mobile-Friendly**: Optimized for quick mobile consumption

### 📱 User Experience
- **Manual Logging**: Quick-add buttons for all activities
- **Animated UI**: Smooth transitions and breathing animations
- **Local Notifications**: Daily reminders and event alerts
- **Onboarding Flow**: Guided setup for new users

---

## 🎯 Key Endpoints

### Backend API

#### Health Analytics
- `POST /analyze/recovery` - Calculate bio-recovery score
- `POST /analyze/battle` - Calculate battle points
- `POST /analyze/coach` - Get AI coaching feedback
- `GET /recap/{timeframe}` - Get vital recap (daily/weekly/monthly/yearly)

#### Gamification
- `POST /api/rpg/calculate-xp` - Calculate XP from activities
- `GET /api/leaderboard/global` - Global leaderboard
- `GET /api/leaderboard/team/{team_id}` - Team leaderboard
- `POST /api/battles/create` - Create battle challenge

#### Social
- `POST /api/feed/generate-daily-post` - Generate social feed post
- `GET /api/feed/recent` - Get recent feed posts

---

## 🎬 Demo

### Quick Start Flow
1. **Onboarding**: Enter username, grant permissions
2. **Dashboard**: View character stats, active quests
3. **Log Activity**: Use quick action buttons (steps, water, exercise, etc.)
4. **Earn Rewards**: Watch XP bar fill, level up notifications
5. **Complete Quests**: Check off daily/weekly goals
6. **Battle Friends**: Challenge others, compare scores
7. **AI Coaching**: Get personalized morning plan or post-workout advice

### Example User Journey
```
Morning:
- Check recovery score (85/100 - READY_TO_TRAIN)
- AI suggests: "HIIT workout based on excellent sleep"
- Complete daily quest: 10,000 steps

Evening:
- Log workout: Gym, 60 mins, RPE 7, 300 kcal
- AI feedback: "Aim for 8-9h sleep tonight. Hydrate + protein."
- Earn 150 XP, level up to Level 5!
```

---

## 🔮 Future Enhancements

### Planned Features
- **Sleep Inference from HR**: Detect sleep periods from heart rate patterns when watch data is missing
- **Team Battles**: Group challenges and collaborative quests
- **Marketplace**: Spend gold on avatar customization
- **Advanced Analytics**: Trend graphs, predictive insights
- **Multi-platform**: iOS Health Kit integration
- **Social Expansion**: Friend system, direct challenges, chat
- **Wearable Support**: Fitbit, Garmin, Apple Watch integration

### Technical Improvements
- **Production Database**: MySQL/PostgreSQL migration
- **Caching Layer**: Redis for performance optimization
- **Real-time Updates**: WebSocket support for live battles
- **Cloud Deployment**: AWS/GCP hosting with CI/CD
- **Enhanced AI**: Fine-tuned models for better coaching

---

## 📁 Project Structure

```
BinaryBandits/
├── backend/
│   ├── backend/
│   │   ├── app/              # Core business logic
│   │   ├── database/         # DB clients (SQLite/MySQL)
│   │   ├── models/           # Pydantic schemas
│   │   ├── routers/          # API endpoints
│   │   └── services/         # AI, gamification, battle system
│   ├── tests/                # Unit & integration tests
│   ├── requirements.txt
│   └── run_server_sqlite.py
├── frontend/
│   └── Vital-Quest/
│       ├── app/              # Expo Router screens
│       ├── components/       # Reusable UI components
│       ├── services/         # Business logic
│       ├── store/            # Zustand state
│       └── constants/        # Theme & config
└── README.md
```

---

## 🧪 Testing

### Backend Tests
- **Unit Tests**: Logic validation (recovery scoring, battle points)
- **Integration Tests**: API endpoint testing
- **Coverage**: 8+ test scenarios for recovery algorithm

### Frontend Tests
- Manual testing on Android/iOS devices
- Health Connect integration validation
- Notification system verification

---

## 🤝 Team Binary Bandits

A passionate team of developers building innovative health tech solutions.

---

## 📄 License

MIT License - feel free to use this project for learning and development.

---

## 🎉 Acknowledgments

- Inspired by [Habitica](https://habitica.com)
- Built with ❤️ for the Periscope Health Motivation Challenge
- Powered by Google Gemini AI

---

**Happy questing! 🗡️✨**
