import os
import google.generativeai as genai
from schemas.vital_quest import DailyLog
from app.logic import calculate_recovery_score
from dotenv import load_dotenv

load_dotenv()

GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

async def get_coach_feedback(context_type: str, data: DailyLog) -> str:
    """
    Generates AI coach feedback based on context and data.
    context_type: "PLANNING" (Morning) or "ANALYSIS" (Post-Workout)
    """
    if not GOOGLE_API_KEY:
        return "AI Coach unavailable: GOOGLE_API_KEY not set."

    model = genai.GenerativeModel('gemini-pro')
    
    recovery_data = calculate_recovery_score(data)
    score = recovery_data["score"]
    true_rhr = recovery_data["rhr"]
    deep_sleep = recovery_data["deep_sleep_minutes"]
    status = recovery_data["status"]

    prompt = ""

    if context_type == "PLANNING":
        # Mode 1: Morning Plan
        # System Prompt: "Analyze Deep Sleep and True_RHR. If recovery is <50, suggest a lighter version of their usual workout."
        prompt = (
            f"You are a fitness coach. Analyze the following biometrics:\n"
            f"- Recovery Score: {score} ({status})\n"
            f"- Deep Sleep: {deep_sleep} minutes\n"
            f"- Resting Heart Rate: {true_rhr} bpm\n\n"
            f"If recovery is < 50, strictly suggest a lighter version of their usual workout. "
            f"If recovery is good, encourage them to train hard. Keep it brief and motivating."
        )

    elif context_type == "ANALYSIS":
        # Mode 2: Post-Workout Analysis
        # Trigger: User logs a ManualWorkout.
        # We need the LATEST manual workout or all of them? 
        # PRD says: "User burnt {calories_burnt} kcal in {activity_type}."
        # We'll summarize the workouts or take the last one.
        
        if not data.manual_workouts:
            return "No workouts found to analyze."
            
        # Let's analyze the most recent one or summarize total. 
        # Assuming we just want to comment on the aggregate or the "session".
        # Let's aggregate for simplicity or pick the last one.
        # PRD implies a single event "Trigger: User logs a ManualWorkout".
        # But DailyLog has a list. We will consider the SUM or the last added.
        # Let's use the last one in the list as the 'triggering' event.
        last_workout = data.manual_workouts[-1]
        
        prompt = (
            f"You are a fitness coach. The user just finished a workout:\n"
            f"- Activity: {last_workout.activity_type}\n"
            f"- Calories Burnt: {last_workout.calories_burnt} kcal\n"
            f"- Bio-Recovery Score: {score} ({status})\n\n"
            f"Logic to follow:\n"
            f"1. If Recovery was LOW (<50) but they burnt >500 kcal: Warn them about potential immune system suppression.\n"
            f"2. If Recovery was HIGH (>50) and they burnt >500 kcal: Praise them for utilizing their peak energy.\n"
            f"3. Otherwise, provide constructive feedback based on the effort."
        )
    else:
        return "Invalid context type."

    try:
        response = await model.generate_content_async(prompt)
        return response.text
    except Exception as e:
        return f"AI Generation Error: {str(e)}"
