# 🎮 Vital Quest - Run Your Application

## 📋 Overview

Your backend is fully ready to connect with React Native. All systems are operational:
- ✅ Database with RPG Class System
- ✅ Firebase Push Notifications
- ✅ Gemini AI Personalization
- ✅ Gamification Engine
- ✅ 40+ API Endpoints

---

## 🚀 HOW TO RUN THE UI

### **1. Start Backend Server**

```bash
cd D:\Code\periscope
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output:**
```
[GAMIFICATION] Calculating XP for user...
Uvicorn running on http://0.0.0.0:8000
```

**API Documentation at:**
- `http://localhost:8000/docs` (Swagger UI)
- `http://localhost:8000/redoc` (ReDoc)

---

### **2. For React Native App**

Connect your Expo/React Native app to the backend:

#### **Install Dependencies:**
```bash
cd your-react-native-app
npm install react-native-firebase expo-notifications axios
```

#### **Configure API Endpoint in Your App:**
```javascript
const API_BASE_URL = "http://your-computer-ip:8000";  // Replace with your IP

// Or for localhost testing:
const API_BASE_URL = "http://10.0.2.2:8000";  // Android emulator
const API_BASE_URL = "http://localhost:8000";  // iOS simulator or physical device on same network
```

#### **Example: Register FCM Token**
```javascript
import { getToken } from "react-native-firebase/messaging";
import axios from "axios";

const registerFCMToken = async (userId) => {
  try {
    const token = await getToken();
    
    const response = await axios.post(
      `${API_BASE_URL}/notifications/fcm-token`,
      {
        user_id: userId,
        fcm_token: token
      }
    );
    
    console.log("✅ Token registered:", response.data);
  } catch (error) {
    console.error("❌ Error:", error);
  }
};
```

#### **Example: Send Daily Health Data**
```javascript
const sendDailyStats = async (userId, steps, hydration, sleep) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/gamification/calculate-xp`,
      {
        user_id: userId,
        date: new Date().toISOString().split('T')[0],
        steps: steps,
        heart_rate_avg: 72,
        sleep_total_minutes: sleep * 60,
        calories_burned: 2500
      }
    );
    
    console.log("✅ XP Gained:", response.data);
  } catch (error) {
    console.error("❌ Error:", error);
  }
};
```

#### **Example: Get User's RPG Class**
```javascript
const getUserClass = async (userId) => {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/gamification/user/${userId}/class`
    );
    
    console.log("🎮 Class:", response.data.rpg_class);
    console.log("Avatar:", response.data.suggestion.avatar);
  } catch (error) {
    console.error("❌ Error:", error);
  }
};
```

---

## 🎯 API ENDPOINTS QUICK REFERENCE

### **Authentication & User**
```
POST   /users/create                    - Create new user
GET    /users/{user_id}                - Get user profile
GET    /gamification/user/{user_id}/class    - Get RPG class
```

### **Health & Gamification**
```
POST   /gamification/calculate-xp      - Track activity & gain XP
GET    /leaderboard/global             - Global rankings
GET    /leaderboard/team/{team_id}     - Team rankings
```

### **Notifications**
```
POST   /notifications/fcm-token         - Register device
POST   /notifications/fcm/personalized-plan - Send AI notification
POST   /notifications/fcm/test-notification - Test notification
```

### **Social**
```
GET    /social/user/{user_id}          - User's activity feed
POST   /social/generate-daily-post     - Auto-generate achievement post
GET    /social/team/{team_id}          - Team's activity feed
```

### **Battles**
```
POST   /battles/create                 - Start team battle
GET    /battles/{battle_id}/leaderboard - Battle scores
```

---

## 📱 RPG CLASS SYSTEM

Users are classified based on their workout history:

| Class | Workout Type | Avatar | Strength Focus |
|-------|-------------|--------|----------------|
| **Warrior** | Gym, Weights, Strength | 💪 | Muscle & Power |
| **Assassin** | Walk | 🗡️ | Speed & Agility |
| **Monk** | Yoga, Meditation, Stretch | 🧘 | Balance & Flexibility |
| **Villager** | None/Very Low | 👤 | Getting Started |

### **How It Works:**
1. User adds first workout data (Gym, Walk, or Yoga)
2. After 1+ week of data collection, class is determined
3. For demo: Users are pre-loaded with classes in database
4. Each workout update recalculates class based on most frequent activity

---

## 🧪 TESTING THE BACKEND

### **Test 1: Get Demo User Data**
```bash
curl http://localhost:8000/gamification/user/warrior_001/class
```

**Expected Response:**
```json
{
  "user_id": "warrior_001",
  "rpg_class": "Warrior",
  "workouts_analyzed": 15,
  "days_analyzed": 7,
  "suggestion": {
    "avatar": "https://picsum.photos/seed/warrior/200/200",
    "category": "Strength",
    "description": "Master of gym and weights"
  }
}
```

### **Test 2: Get Global Leaderboard**
```bash
curl http://localhost:8000/leaderboard/global
```

### **Test 3: View API Documentation**
Visit: `http://localhost:8000/docs`

---

## 📊 DATABASE INFO

**Demo Users Pre-loaded:**
- `warrior_001` (IronFist) - Warrior Class, Level 5
- `assassin_001` (SwiftRunner) - Assassin Class, Level 4
- `monk_001` (ZenMaster) - Monk Class, Level 6
- `villager_001` (NewbieAdventurer) - Villager Class, Level 1

**Database Connection:**
- Host: 127.0.0.1
- User: root
- Database: vital_quest
- Port: 3306

---

## ✨ GEMINI AI NOTIFICATIONS

Every time a user logs activity, they receive personalized AI-generated notifications:

```javascript
POST /notifications/fcm/personalized-plan
{
  "user_id": "warrior_001",
  "today_steps": 12500,
  "streak_days": 7,
  "hydration_liters": 2.5,
  "sleep_hours": 7.5,
  "tomorrow_focus": "strength training"
}
```

**Gemini AI generates personalized message:**
```
Title: "Awesome Job, IronFist! 12,500 Steps & 7-Day Streak!"
Body: "Fantastic progress! Prep for your strength training tomorrow. 
       Keep up the great hydration for peak performance. You got this!"
```

Notification appears on terminal (for testing) + sent via FCM to mobile device.

---

## 🛠️ TROUBLESHOOTING

### **Port 8000 Already in Use?**
```bash
# Find and kill process on port 8000
netstat -ano | findstr :8000
taskkill /PID <PID> /F
```

### **Database Connection Error?**
```bash
# Check MySQL is running
mysql -h 127.0.0.1 -u root -p vital_quest
```

### **Dependencies Missing?**
```bash
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

### **Firebase Token Invalid?**
This is expected for demo tokens. Use real FCM tokens from your mobile app in production.

---

## 🎯 NEXT STEPS

1. **Start Backend:**
   ```bash
   .\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
   ```

2. **Open API Docs:**
   Visit `http://localhost:8000/docs`

3. **Connect React Native App:**
   Update API endpoint in your app code

4. **Register Device & Send Data:**
   Follow examples above

5. **See Results:**
   - Notifications appear in console + FCM
   - XP updates in real-time
   - Classes determined automatically
   - Leaderboards updated instantly

---

## 📞 SUPPORT

- **Backend Issues:** Check terminal logs for error messages
- **Database Issues:** Verify MySQL is running (port 3306)
- **API Issues:** Visit `http://localhost:8000/docs` for all endpoint details
- **Notification Issues:** Check Firebase credentials in `firebase-key.json`

---

**Your Vital Quest Backend is Ready! 🚀**
