# Vital Quest Backend - Quick Start Guide

## ✓ Setup Complete!

Your Vital Quest backend is now fully functional with:
- ✅ All business logic working (XP calculations, leveling, battles, RPG classes)
- ✅ MySQL database connected and initialized
- ✅ Test scripts created and verified
- ✅ API endpoints ready

## 🚀 Starting the Server

### Option 1: Using run_server.py (Recommended)
```powershell
cd d:\Code\periscope
.\.venv\Scripts\python.exe run_server.py
```

### Option 2: Using uvicorn directly
```powershell
$env:MYSQL_HOST="127.0.0.1"
$env:MYSQL_USER="root"
$env:MYSQL_PASSWORD="Abhijit@2005"
$env:MYSQL_DB="vital_quest"
$env:MYSQL_PORT="3306"
cd d:\Code\periscope
.\.venv\Scripts\Activate.ps1
uvicorn backend.main:app --host 127.0.0.1 --port 8001 --reload
```

## 📊 Accessing the API

Once the server is running:

- **Swagger UI (Interactive API docs):** http://127.0.0.1:8001/docs
- **ReDoc (Alternative docs):** http://127.0.0.1:8001/redoc
- **Health Check:** http://127.0.0.1:8001/health
- **Root Endpoint:** http://127.0.0.1:8001/

## 🧪 Testing Scripts

### 1. Backend Logic Test (No server required)
Tests all core calculations without needing MySQL or API server:
```powershell
.\.venv\Scripts\python.exe test_backend_logic.py
```
**Tests:**
- XP calculation from activities
- Level-up system
- Attribute mapping
- RPG class determination
- Battle score calculations

### 2. Comprehensive Test (Includes MySQL)
Tests backend logic + MySQL database integration:
```powershell
.\.venv\Scripts\python.exe test_comprehensive.py
```
**Tests:**
- Everything from test 1
- MySQL connection
- Database queries
- Data retrieval

### 3. API Integration Test (Uses TestClient)
Tests all API endpoints directly:
```powershell
.\.venv\Scripts\python.exe test_final_api.py
```
**Tests:**
- All API endpoints
- Request/response handling
- Database storage via API

## 📡 Available API Endpoints

### Gamification
- `POST /gamification/calculate-xp` - Calculate XP from health data
- `GET /gamification/user/{user_id}/class` - Get RPG class

### Battles
- `POST /battles/create` - Create new battle
- `GET /battles/{battle_id}/leaderboard` - Battle leaderboard

### Leaderboard
- `GET /leaderboard/global` - Global rankings
- `GET /leaderboard/team/{team_id}` - Team rankings

### Social Feed
- `GET /social/user/{user_id}` - User's social feed
- `GET /social/team/{team_id}` - Team's social feed
- `POST /social/post` - Create post

### Admin
- `POST /admin/aggregate-now` - Trigger data aggregation

## 📝 Example API Calls

### Calculate XP
```bash
curl -X POST http://127.0.0.1:8001/gamification/calculate-xp \
  -H "Content-Type: application/json" \
  -d '{
    "user_id": "user_001",
    "date": "2025-12-06",
    "steps": 10000,
    "heart_rate_avg": 75.0,
    "sleep_total_minutes": 480,
    "sleep_deep_minutes": 120,
    "sleep_light_minutes": 240,
    "calories_burned": 500
  }'
```

**Response:**
```json
{
  "user_id": "user_001",
  "xp_gained": 151,
  "new_xp_total": 651,
  "leveled_up": false,
  "new_level": 5
}
```

### Get Global Leaderboard
```bash
curl http://127.0.0.1:8001/leaderboard/global?limit=10
```

**Response:**
```json
{
  "period": "weekly",
  "rankings": [
    {"user_id": "user_001", "username": "HealthWarrior", "level": 5, "xp": 500},
    {"user_id": "user_003", "username": "YogaMaster", "level": 4, "xp": 350},
    {"user_id": "user_002", "username": "FitRunner", "level": 3, "xp": 200}
  ]
}
```

## 🗄️ Database Information

**Database:** vital_quest  
**Host:** 127.0.0.1:3306  
**Tables:**
- `users` - User profiles with XP, level, attributes
- `daily_logs` - Health data entries
- `teams` - Team information
- `battles` - Battle records
- `social_feed` - Social posts
- `meta` - Key-value configuration

**Dummy Data:** 3 test users already created (user_001, user_002, user_003)

## 🎮 How It Works

### XP Calculation Formula
```
XP = (steps/100 + calories/50) × sleep_bonus × recovery_bonus

sleep_bonus = 1.2 if sleep >= 7 hours, else 1.0
recovery_bonus = 1.15 if recovery_score >= 70, else 1.0
```

### Level Up System
- Level 1→2: 100 XP
- Level 2→3: 245 XP
- Level 3→4: 519 XP
- Formula: `100 × (level ^ 1.5)`

### RPG Classes
Determined by workout activity type frequency:
- **Warrior:** Gym/Weights focused
- **Ranger:** Running/Walking focused
- **Monk:** Yoga/Stretching focused
- **Villager:** Low activity
- **Adventurer:** Balanced/Mixed

### Battle Scoring
```
Battle Score = (steps × 0.05) + (deep_sleep_mins × 5) + workout_score
workout_score = Σ(duration × intensity) + Σ(calories × 0.2)
```

## 🔧 Troubleshooting

### Server won't start
1. Check if MySQL is running
2. Verify MySQL credentials in environment variables
3. Check if port 8001 is available

### Database connection failed
```powershell
# Test MySQL connection
.\.venv\Scripts\python.exe test_aiomysql.py
```

### Reinitialize database
```powershell
.\.venv\Scripts\python.exe init_database.py
```

## 🎯 Next Steps

1. ✅ Test endpoints in Swagger UI
2. ✅ Verify data storage in MySQL Workbench
3. ⬜ Connect frontend application
4. ⬜ Add authentication/authorization
5. ⬜ Deploy to production server

## 📞 Quick Reference Commands

```powershell
# Activate virtual environment
.\.venv\Scripts\Activate.ps1

# Start server
.\.venv\Scripts\python.exe run_server.py

# Run tests
.\.venv\Scripts\python.exe test_comprehensive.py

# Initialize database
.\.venv\Scripts\python.exe init_database.py

# Check MySQL connection
.\.venv\Scripts\python.exe test_aiomysql.py
```

---

**Status:** ✅ READY FOR USE  
**Last Updated:** December 6, 2025
