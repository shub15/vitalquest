# 🎮 HOW TO RUN YOUR VITAL QUEST UI

## ⚡ QUICKEST WAY TO START (30 seconds)

### **Copy & Paste This Command:**

```bash
cd D:\Code\periscope
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload --host 0.0.0.0 --port 8000
```

**Then open your browser:**
- API Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

**That's it!** Your backend is running. ✅

---

## 📱 CONNECT YOUR REACT NATIVE APP

### **Step 1: Find Your Computer's IP**

**Windows:**
```bash
ipconfig
# Look for "IPv4 Address" (usually 192.168.x.x)
```

### **Step 2: Update React Native Code**

```javascript
// In your React Native app
const API_BASE_URL = "http://192.168.1.100:8000"; // Replace 192.168.1.100 with your IP

// For local testing:
const API_BASE_URL = "http://10.0.2.2:8000";      // Android emulator
const API_BASE_URL = "http://localhost:8000";     // iOS simulator
```

### **Step 3: Test Connection**

```javascript
// Test if backend is reachable
fetch(`${API_BASE_URL}/health`)
  .then(r => r.json())
  .then(data => console.log("✅ Connected:", data))
  .catch(err => console.error("❌ Connection error:", err));
```

---

## 🎮 WHAT USERS WILL EXPERIENCE

### **1. Register Device for Notifications**
```javascript
const registerDevice = async (userId) => {
  // Get FCM token from react-native-firebase
  const token = await getToken();
  
  fetch(`${API_BASE_URL}/notifications/fcm-token`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      user_id: userId,
      fcm_token: token
    })
  });
};
```

### **2. Log Workout Data**
```javascript
const logWorkout = async (userId) => {
  // User selects: Gym, Walk, or Yoga
  // Your app sends it to backend
  
  fetch(`${API_BASE_URL}/gamification/calculate-xp`, {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({
      user_id: userId,
      date: new Date().toISOString().split('T')[0],
      steps: 12500,
      heart_rate_avg: 72,
      sleep_total_minutes: 450,
      calories_burned: 2500
    })
  })
  .then(r => r.json())
  .then(data => {
    console.log("✅ XP Gained:", data.xp_gained);
    console.log("📈 New Level:", data.new_level);
    console.log("🎮 RPG Class auto-determined!");
  });
};
```

### **3. Automatically Get RPG Class**
```javascript
const getUserClass = async (userId) => {
  fetch(`${API_BASE_URL}/gamification/user/${userId}/class`)
    .then(r => r.json())
    .then(data => {
      console.log("🎮 Class:", data.rpg_class); // Warrior, Assassin, Monk, Villager
      console.log("🎨 Avatar:", data.suggestion.avatar);
      console.log("📝 Description:", data.suggestion.description);
    });
};
```

### **4. User Receives AI Notification**
```
✅ Automatic Gemini-powered notification sent to mobile:

Title: "Awesome Job, IronFist! 12,500 Steps & 7-Day Streak!"
Body:  "Fantastic progress! Prep for your strength training tomorrow.
        Keep up the great hydration for peak performance. You got this!"

Appears in notification tray + terminal (for testing)
```

---

## 🎯 RPG CLASS SYSTEM EXPLAINED

**Users Are Classified Based On Their Workouts:**

| Workout | Class | Emoji | Example |
|---------|-------|-------|---------|
| Gym/Weights | Warrior | 💪 | "IronFist" |
| Walk | Assassin | 🗡️ | "SwiftRunner" |
| Yoga/Meditation | Monk | 🧘 | "ZenMaster" |
| None/Very Low | Villager | 👤 | "NewbieAdventurer" |

**How It Works:**
1. ✅ User logs first workout (Gym, Walk, or Yoga)
2. ✅ After 1+ week of data, class is determined
3. ✅ For demo: Users pre-loaded with classes
4. ✅ Class updates when user logs new workouts

---

## 👥 Demo Users (Ready to Use)

Copy-paste these IDs to test:

```
warrior_001   → IronFist        (Warrior) 💪 Level 5
assassin_001  → SwiftRunner     (Assassin) 🗡️ Level 4
monk_001      → ZenMaster       (Monk) 🧘 Level 6
villager_001  → NewbieAdventurer (Villager) 👤 Level 1
```

### **Test with Demo User:**
```bash
# Get Warrior's details
curl http://localhost:8000/gamification/user/warrior_001/class

# Response will show:
# {
#   "rpg_class": "Warrior",
#   "suggestion": {
#     "avatar": "https://picsum.photos/seed/warrior/200/200",
#     "description": "Master of gym and weights"
#   }
# }
```

---

## 🚀 API ENDPOINTS FOR YOUR APP

### **User & Profile**
```
GET  /health                              (Test connection)
GET  /gamification/user/{user_id}/class   (Get RPG class)
```

### **Activity & Gamification**
```
POST /gamification/calculate-xp           (Log workout)
GET  /leaderboard/global                  (Global rankings)
GET  /leaderboard/team/{team_id}          (Team rankings)
```

### **Notifications**
```
POST /notifications/fcm-token             (Register device)
POST /notifications/fcm/personalized-plan (Send AI notification)
POST /notifications/fcm/test-notification (Test notification)
```

### **Social & Battles**
```
POST /battles/create                      (Start battle)
GET  /battles/{battle_id}/leaderboard     (Battle scores)
GET  /social/user/{user_id}               (User feed)
POST /social/generate-daily-post          (Create post)
```

---

## 🧪 TEST YOUR SETUP

### **Test 1: Backend is Running**
```bash
curl http://localhost:8000/health
# Expected: {"status":"ok","message":"vital_quest backend running"}
```

### **Test 2: Get Demo User**
```bash
curl http://localhost:8000/gamification/user/warrior_001/class
# Expected: User's class (Warrior), level, avatar URL
```

### **Test 3: Get Leaderboard**
```bash
curl http://localhost:8000/leaderboard/global
# Expected: Top 10 users with their levels and XP
```

### **Test 4: View Interactive API Docs**
```
Open in browser: http://localhost:8000/docs
Click on any endpoint to test it directly!
```

---

## 🐛 TROUBLESHOOTING

### **❌ "Port 8000 already in use"**
```bash
# Find what's using port 8000
netstat -ano | findstr :8000

# Kill it (replace 12345 with the PID)
taskkill /PID 12345 /F

# Try again
.\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload
```

### **❌ "Can't connect from mobile"**
1. Make sure both devices are on the same WiFi
2. Use your computer's IP (get from `ipconfig`)
3. Update API URL: `http://192.168.x.x:8000`
4. Check firewall isn't blocking port 8000

### **❌ "Database connection error"**
```bash
# Check MySQL is running
mysql -h 127.0.0.1 -u root -p vital_quest

# If it fails, start MySQL service
# Windows: Services → MySQL80 → Start
```

### **❌ "Module not found"**
```bash
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

---

## 📚 DOCUMENTATION

Created comprehensive docs for you:

1. **QUICK_START.md** ⚡
   - 30-second quick reference
   - Cheat sheet with all commands

2. **RUN_UI_GUIDE.md** 📖
   - Step-by-step setup guide
   - React Native examples
   - API reference

3. **RPG_CLASS_CHANGES.md** 📖
   - What changed details
   - Database schema
   - Class logic explained

4. **IMPLEMENTATION_COMPLETE.md** 📋
   - Full summary
   - Verification checklist
   - Next steps

5. **demo_rpg_class_system.py** 🎬
   - Run: `python demo_rpg_class_system.py`
   - Shows how class system works

---

## 🎁 What's Included

✅ **Backend API (40+ endpoints)**
- Gamification (XP, levels, classes)
- Push Notifications (FCM + Gemini AI)
- Social Features (feed, posts)
- Battles (team vs team)
- Leaderboards

✅ **Database**
- Users with RPG classes
- Health data tracking
- Workout history
- Social posts
- Battle scores

✅ **AI Features**
- Gemini AI personalized notifications
- Context-aware health recommendations
- Recovery analysis

✅ **Demo Data**
- 4 pre-loaded users with different classes
- Sample data for testing

---

## 💡 EXAMPLE WORKFLOW

### **User Flow:**
```
1. User installs React Native app
   ↓
2. App registers FCM token with backend
   ↓
3. User logs workout (Gym, Walk, or Yoga)
   ↓
4. App sends data to /gamification/calculate-xp
   ↓
5. Backend:
   • Stores workout data
   • Calculates XP
   • Determines RPG class (based on workout type)
   • Updates user level
   • Sends Gemini AI notification
   ↓
6. User receives:
   • XP confirmation in app
   • RPG class display (Warrior, Assassin, Monk, or Villager)
   • Push notification with personalized message
   • Profile updated on leaderboard
```

---

## 🎯 NEXT STEPS

1. **Run backend:**
   ```bash
   .\.venv\Scripts\python.exe -m uvicorn backend.main:app --reload
   ```

2. **Visit API docs:**
   http://localhost:8000/docs

3. **Create React Native app**

4. **Update API endpoint** in your app code

5. **Test endpoints** (see examples above)

6. **Deploy when ready!**

---

## 📞 SUPPORT

Need help? Check these files in order:

1. **QUICK_START.md** - Quick reference
2. **RUN_UI_GUIDE.md** - Detailed setup
3. **http://localhost:8000/docs** - Interactive API docs
4. Terminal output - Check for error messages

Still stuck? The demo shows everything:
```bash
.\.venv\Scripts\python.exe demo_rpg_class_system.py
```

---

## ✨ READY TO GO!

Your backend is fully configured with:
- ✅ RPG class system (Warrior, Assassin, Monk, Villager)
- ✅ Push notifications (FCM + Gemini AI)
- ✅ Gamification (XP, levels, classes)
- ✅ Social features (feed, posts, battles)
- ✅ Demo users (ready for testing)
- ✅ Full documentation

**Just run the backend command above and connect your React Native app!** 🚀

---

## 🎮 HAPPY BUILDING!

Your Vital Quest backend is ready for production! 🚀✨
