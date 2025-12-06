import streamlit as st
import json
import requests
from datetime import datetime, timedelta

# Page Config
st.set_page_config(
    page_title="Vital Quest Dashboard",
    page_icon="💪",
    layout="wide"
)

# Constants
API_URL = "http://127.0.0.1:8000"

# --- Session State Management ---
if 'recovery_result' not in st.session_state:
    st.session_state.recovery_result = None
if 'battle_result' not in st.session_state:
    st.session_state.battle_result = None
if 'coach_feedback_planning' not in st.session_state:
    st.session_state.coach_feedback_planning = None
if 'coach_feedback_analysis' not in st.session_state:
    st.session_state.coach_feedback_analysis = None

# --- UI Functions ---

def construct_payload(date_val, steps, active_cals, total_sleep_hrs, deep_sleep_mins, rhr, workout_type, workout_dur, workout_int, workout_cals):
    """Constructs the JSON payload from UI widgets to match DailyLog schema."""
    
    # Calculate sleep times roughly for valid segments
    now = datetime.combine(date_val, datetime.min.time())
    sleep_start = now.replace(hour=23) # 11 PM
    sleep_minutes = total_sleep_hrs * 60
    sleep_end = sleep_start + timedelta(minutes=sleep_minutes)
    
    # Deep sleep segment (arbitrarily placed in the middle)
    deep_start = sleep_start + timedelta(minutes=60)
    deep_end = deep_start + timedelta(minutes=deep_sleep_mins)
    
    # Remaining light sleep
    light_duration = sleep_minutes - deep_sleep_mins
    
    segments = [
        {
            "start_time": deep_start.isoformat(),
            "end_time": deep_end.isoformat(),
            "stage": "deep",
            "duration_minutes": deep_sleep_mins
        },
        {
             # Simplified: just one other segment for the rest
             "start_time": deep_end.isoformat(),
             "end_time": sleep_end.isoformat(),
             "stage": "light",
             "duration_minutes": light_duration
        }
    ]

    # Heart Rate Samples (Simulated around RHR input)
    # We need samples in sleep window for logic to work (Main Sleep)
    hr_samples = [
        {"timestamp": (sleep_start + timedelta(minutes=30)).isoformat(), "bpm": rhr},
        {"timestamp": (sleep_start + timedelta(minutes=40)).isoformat(), "bpm": rhr + 2},
        {"timestamp": (sleep_start + timedelta(minutes=50)).isoformat(), "bpm": rhr - 2}
    ]

    manual_workouts = []
    if workout_dur > 0:
        manual_workouts.append({
            "activity_type": workout_type,
            "duration_minutes": workout_dur,
            "intensity_rpe": workout_int,
            "calories_burnt": workout_cals,
            "notes": "Logged via UI"
        })

    return {
        "date": date_val.strftime("%Y-%m-%d"),
        "total_steps": steps,
        "total_calories_active": active_cals,
        "sleep_segments": segments,
        "heart_rate_samples": hr_samples,
        "manual_workouts": manual_workouts
    }

# --- Main Page ---

st.title("💪 Vital Quest Dashboard")

# Sidebar Inputs
st.sidebar.header("📝 Daily Inputs")

with st.sidebar.form("entry_form"):
    date_val = st.date_input("Date", datetime.now())
    steps = st.number_input("Steps", min_value=0, value=8000, step=500)
    active_cals = st.number_input("Active Calories (kcal)", min_value=0.0, value=450.0, step=50.0)
    
    st.divider()
    st.subheader("😴 Sleep & Health")
    total_sleep = st.slider("Total Sleep (Hours)", 0.0, 12.0, 8.0, 0.5)
    deep_sleep = st.slider("Deep Sleep (Minutes)", 0, 240, 60, 10)
    rhr = st.slider("Resting Heart Rate (BPM)", 40, 100, 60)
    
    st.divider()
    st.subheader("🏋️ Workout")
    w_type = st.selectbox("Activity", ["Gym", "Run", "Yoga", "Swim", "Cycle", "None"])
    w_dur = st.number_input("Duration (mins)", 0, 300, 60 if w_type != "None" else 0)
    w_int = st.slider("Intensity (RPE 1-10)", 1, 10, 7)
    w_cal = st.number_input("Calories Burnt", 0, 2000, 300 if w_type != "None" else 0)
    
    submitted = st.form_submit_button("Update Data")

# Construct Payload
payload = construct_payload(date_val, steps, active_cals, total_sleep, deep_sleep, rhr, w_type, w_dur, w_int, w_cal)

# --- Analysis Buttons ---
col_actions, col_blank = st.columns([2, 1])
with col_actions:
    c1, c2, c3, c4 = st.columns(4)
    if c1.button("❤️ Analyze Recovery"):
        try:
            res = requests.post(f"{API_URL}/analyze/recovery", json=payload)
            st.session_state.recovery_result = res.json() if res.status_code == 200 else {"error": res.text}
        except Exception as e:
            st.session_state.recovery_result = {"error": str(e)}

    if c2.button("⚔️ Battle Score"):
        try:
            res = requests.post(f"{API_URL}/analyze/battle", json=payload)
            st.session_state.battle_result = res.json() if res.status_code == 200 else {"error": res.text}
        except Exception as e:
            st.session_state.battle_result = {"error": str(e)}

    if c3.button("☀️ Morning Coach"):
        try:
            req = {"log": payload, "context": "PLANNING"}
            res = requests.post(f"{API_URL}/analyze/coach", json=req)
            st.session_state.coach_feedback_planning = res.json()['feedback'] if res.status_code == 200 else res.text
        except Exception as e:
            st.session_state.coach_feedback_planning = str(e)

    if c4.button("🌙 Post-Workout Coach"):
        try:
            req = {"log": payload, "context": "ANALYSIS"}
            res = requests.post(f"{API_URL}/analyze/coach", json=req)
            st.session_state.coach_feedback_analysis = res.json()['feedback'] if res.status_code == 200 else res.text
        except Exception as e:
            st.session_state.coach_feedback_analysis = str(e)

st.divider()

# --- Vital Recap Section ---
st.header("📅 Vital Recap")
recap_col1, recap_col2 = st.columns([1, 3])

with recap_col1:
    timeframe = st.selectbox("Select Timeframe", ["Weekly", "Monthly", "Yearly"], index=0)
    if st.button("Generate Recap"):
        try:
            res = requests.get(f"{API_URL}/recap/{timeframe.lower()}")
            if res.status_code == 200:
                st.session_state.recap_data = res.json()
            else:
                st.error(res.text)
        except Exception as e:
            st.error(str(e))

with recap_col2:
    if 'recap_data' in st.session_state and st.session_state.recap_data:
        data = st.session_state.recap_data
        st.subheader(data['title'])
        
        # Grid layout for stats
        rc1, rc2, rc3 = st.columns(3)
        rc1.metric("Total Steps", f"{data['total_steps']:,}")
        rc2.metric("Avg Sleep", f"{data['avg_sleep_hours']}h")
        rc3.metric("Workouts", data['total_workouts'])
        
        rc4, rc5, rc6 = st.columns(3)
        rc4.metric("Active Cals", f"{data['total_calories']:,}")
        rc5.metric("Avg Steps/Day", f"{data['avg_steps']:,}")
        rc6.metric("Top Activity", data['favorite_activity'])
        
        st.caption(f"Aggregated over last {data['period_days']} days.")

# --- Results Display (Grid Layout) ---
res_col1, res_col2 = st.columns(2)

with res_col1:
    # Recovery Section
    if st.session_state.recovery_result:
        data = st.session_state.recovery_result
        st.subheader("❤️ Recovery")
        if "error" in data:
            st.error(data["error"])
        else:
            m1, m2 = st.columns(2)
            m1.metric("Score", f"{data['score']}/100")
            m2.metric("Status", data['status'])
            st.caption(f"Based on {data['total_sleep_minutes']}m sleep ({data['deep_sleep_minutes']}m deep)")
    
    # Planning Feedback
    if st.session_state.coach_feedback_planning:
        st.info(f"**Morning Advice:**\n\n{st.session_state.coach_feedback_planning}")

with res_col2:
    # Battle Section
    if st.session_state.battle_result:
        data = st.session_state.battle_result
        st.subheader("⚔️ Battle Stats")
        if "error" in data:
            st.error(data["error"])
        else:
            st.metric("Total Points", f"{data['total_score']:.0f}")
            st.write("Breakdown:")
            st.json(data['breakdown']) # JSON is actually fine for breakdown stats, concise enough

    # Analysis Feedback
    if st.session_state.coach_feedback_analysis:
        st.success(f"**Post-Workout Analysis:**\n\n{st.session_state.coach_feedback_analysis}")
