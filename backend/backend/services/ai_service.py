#!/usr/bin/env python3
"""
AI Service Module - Integrates Google Gemini API for Coach Feedback
"""

import os
import google.generativeai as genai
from datetime import datetime
from backend.models.schemas import DailyLog
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Configure Gemini API
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)
else:
    print("[AI SERVICE] WARNING: GOOGLE_API_KEY not found in environment variables")

async def get_coach_feedback(context_type: str, recovery_score: int, deep_sleep: int, rhr: float, activity_type: str = None, calories_burnt: int = None) -> dict:
    """
    Generates AI coach feedback based on context and user data.
    
    context_type: "PLANNING" (Morning) or "ANALYSIS" (Post-Workout)
    recovery_score: Score 0-100
    deep_sleep: Deep sleep minutes
    rhr: Resting heart rate (bpm)
    activity_type: Type of activity (for ANALYSIS context)
    calories_burnt: Calories burned (for ANALYSIS context)
    
    Returns: {"feedback": str, "timestamp": str}
    """
    
    if not GOOGLE_API_KEY:
        return {
            "feedback": "AI Coach unavailable: GOOGLE_API_KEY not set.",
            "timestamp": datetime.utcnow().isoformat(),
            "status": "error"
        }
    
    try:
        model = genai.GenerativeModel('gemini-2.5-flash')
        
        status = "READY_TO_TRAIN" if recovery_score >= 50 else "REST_MODE"
        
        if context_type == "PLANNING":
            # Morning Mode: Analyze recovery and suggest workout intensity
            prompt = f"""You are a fitness coach analyzing user recovery metrics. Provide brief, motivating advice.

RECOVERY METRICS:
- Recovery Score: {recovery_score}/100 ({status})
- Deep Sleep: {deep_sleep} minutes
- Resting Heart Rate: {rhr:.1f} bpm

RULES:
1. If recovery < 50 OR deep_sleep < 45min: Suggest a LIGHT workout (yoga, walk, stretching)
2. If recovery >= 50 AND deep_sleep >= 90min: Encourage INTENSE training
3. Keep response under 3 sentences
4. Be motivating and specific

Provide the coaching advice now:"""
            
        elif context_type == "ANALYSIS":
            # Post-Workout Mode: Analyze workout performance vs recovery
            prompt = f"""You are a fitness coach analyzing post-workout performance. Provide brief feedback.

WORKOUT DETAILS:
- Activity: {activity_type}
- Calories Burned: {calories_burnt} kcal
- Bio-Recovery Score: {recovery_score}/100 ({status})

ANALYSIS RULES:
1. If recovery < 50 AND calories_burnt > 500: ⚠️ WARN about overtraining risk
2. If recovery >= 50 AND calories_burnt > 500: 🎯 PRAISE efficient training
3. If calories_burnt < 300: 💪 ENCOURAGE intensity
4. Keep response under 3 sentences
5. Include emoji for tone

Provide the analysis now:"""
        else:
            return {
                "feedback": "Invalid context type. Use 'PLANNING' or 'ANALYSIS'",
                "timestamp": datetime.utcnow().isoformat(),
                "status": "error"
            }
        
        print(f"\n[AI SERVICE] Generating {context_type} feedback...")
        print(f"[AI SERVICE] Recovery: {recovery_score}, Deep Sleep: {deep_sleep}min, RHR: {rhr:.1f}bpm")
        
        response = model.generate_content(prompt)
        feedback_text = response.text if response else "Unable to generate feedback"
        
        print(f"[AI SERVICE] AI Response: {feedback_text}\n")
        
        return {
            "feedback": feedback_text,
            "timestamp": datetime.utcnow().isoformat(),
            "recovery_score": recovery_score,
            "deep_sleep_minutes": deep_sleep,
            "rhr": rhr,
            "context": context_type,
            "status": "success"
        }
        
    except Exception as e:
        print(f"[AI SERVICE] Error: {str(e)}")
        return {
            "feedback": f"AI Generation Error: {str(e)}",
            "timestamp": datetime.utcnow().isoformat(),
            "status": "error"
        }
