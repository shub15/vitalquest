# 🚀 Quick Start Guide - Testing Without MySQL

## ✅ **Simplified Testing (No Database Required)**

This guide helps you test Vital Quest without installing MySQL.

### **Step 1: Start the Simplified Server**

```powershell
# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Start the SQLite-mode server (no MySQL needed)
python run_server_sqlite.py
```

**Expected output:**
```
VITAL QUEST SERVER - SQLITE MODE (NO DATABASE REQUIRED)
Available endpoints:
  - POST /analyze/recovery  - Calculate recovery score
  - POST /analyze/battle    - Calculate battle score
  - POST /analyze/coach     - Get AI coach feedback
Starting server on http://127.0.0.1:8000
```

---

### **Step 2: Start the Streamlit UI**

Open a **second terminal**:

```powershell
# Activate virtual environment
.\venv\Scripts\Activate.ps1

# Start Streamlit UI
streamlit run backend/frontend.py
```

**Browser will open automatically at:** `http://localhost:8501`

---

### **Step 3: Test the Features**

In the Streamlit UI:

1. **Set Daily Inputs** (left sidebar):
   - Steps: 10,000
   - Active Calories: 500
   - Sleep: 8 hours
   - Deep Sleep: 60 minutes
   - Resting HR: 60 bpm
   - Workout: Gym, 60 mins, intensity 8, 400 calories

2. **Click Analysis Buttons**:
   - ❤️ **Analyze Recovery** → See recovery score
   - ⚔️ **Battle Score** → See battle points
   - ☀️ **Morning Coach** → Get AI planning advice
   - 🌙 **Post-Workout Coach** → Get AI analysis

---

### **⚠️ Limitations (SQLite Mode)**

This simplified mode does NOT support:
- ❌ Leaderboards (requires database)
- ❌ Social feed (requires database)
- ❌ User persistence (stateless)
- ❌ Battle creation (requires database)
- ❌ Vital Recap (requires historical data)

**Supported features:**
- ✅ Recovery score calculation
- ✅ Battle score calculation
- ✅ AI Coach feedback
- ✅ All core business logic

---

### **🔧 If You Want Full Features (MySQL Setup)**

1. **Install MySQL:**
   - Download: https://dev.mysql.com/downloads/installer/
   - Install MySQL Server 8.0+
   - Set root password

2. **Update credentials in `run_server.py`:**
   ```python
   os.environ['MYSQL_PASSWORD'] = 'your_password_here'
   ```

3. **Initialize database:**
   ```powershell
   python init_database.py
   ```

4. **Run full server:**
   ```powershell
   python run_server.py
   ```

---

### **📝 Quick Commands**

```powershell
# Terminal 1: Start backend
python run_server_sqlite.py

# Terminal 2: Start UI
streamlit run backend/frontend.py
```

---

### **🎯 What to Test**

1. **Recovery Analysis:**
   - Try different sleep amounts
   - See how deep sleep affects score
   - Check recovery status (READY_TO_TRAIN vs REST_MODE)

2. **Battle Scoring:**
   - Compare scores with different activities
   - See breakdown of points (steps, sleep, workouts)

3. **AI Coach:**
   - Morning advice for planning your day
   - Post-workout analysis and feedback

---

**Status:** ✅ Ready for testing (Stateless mode)  
**Last Updated:** December 7, 2025
