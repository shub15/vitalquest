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

    model = genai.GenerativeModel('gemini-2.0-flash')
    
    recovery_data = calculate_recovery_score(data)
    score = recovery_data["score"]
    true_rhr = recovery_data["rhr"]
    deep_sleep = recovery_data["deep_sleep_minutes"]
    status = recovery_data["status"]

    if context_type == "PLANNING":
        # Mode 1: Morning Plan
        # Extract recent history (workouts in the log)
        history_str = "None"
        if data.manual_workouts:
            history_str = "; ".join(
                [f"{w.activity_type} (RPE {w.intensity_rpe}, {w.duration_minutes}m)" for w in data.manual_workouts]
            )

        prompt = (
            f"Role: Concise Fitness Coach for Mobile App.\n"
            f"Stats:\n"
            f"- Sleep: {int(data.total_elements_sleep_minutes if hasattr(data, 'total_elements_sleep_minutes') else sum(s.duration_minutes for s in data.sleep_segments))}m (Deep: {deep_sleep}m)\n"
            f"- RHR: {true_rhr} bpm\n"
            f"- Recovery: {score}/100 ({status})\n"
            f"- Recent History: {history_str}\n\n"
            f"Task: Provide ultra-short feedback. No conversational filler.\n"
            f"Format:\n"
            f"**Sleep:** [1 sentence evaluation]\n"
            f"**Recovery:** [1 sentence analysis]\n"
            f"**Workout:** [Suggest 1 specific workout based on history/recovery]\n"
            f"**Tip:** [1 actionable bullet point]"
        )

    elif context_type == "ANALYSIS":
        # Mode 2: Post-Workout Analysis
        if not data.manual_workouts:
            return "No workouts found."
            
        last_workout = data.manual_workouts[-1]
        
        prompt = (
            f"Role: Concise Fitness Coach for Mobile App.\n"
            f"Workout: {last_workout.activity_type} ({last_workout.duration_minutes}m, RPE {last_workout.intensity_rpe}, {last_workout.calories_burnt}kcal)\n"
            f"Recovery Status: {score} ({status})\n\n"
            f"Task: Post-workout stats. Extremely concise. No 'Great job' intros.\n"
            f"Format:\n"
            f"**Analysis:** [1 sentence on load vs recovery]\n"
            f"**Sleep Need:** [1 sentence recommending duration]\n"
            f"**Recovery Tips:**\n"
            f"- [Tip 1]\n"
            f"- [Tip 2]\n"
            f"(Max 2 tips, 1 line each)"
        )
    else:
        return "Invalid context type."

    try:
        response = await model.generate_content_async(prompt)
        return response.text
    except Exception as e:
        return f"AI Generation Error: {str(e)}"
