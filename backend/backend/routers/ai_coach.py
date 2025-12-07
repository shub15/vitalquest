#!/usr/bin/env python3
"""
AI Coach Router - Endpoints for AI Feedback and Analysis
"""

from fastapi import APIRouter, HTTPException, Body
from datetime import date
from backend.models.schemas import DailyLog
from backend.app.logic import calculate_recovery_score, calculate_battle_score, calculate_weekly_stats
from backend.services.ai_service import get_coach_feedback
import asyncio

router = APIRouter()

@router.post("/analyze/recovery")
def analyze_recovery(log: DailyLog):
    """
    Analyze recovery score based on daily log data.
    
    Returns recovery metrics and status.
    """
    try:
        result = calculate_recovery_score(log)
        
        print(f"\n[RECOVERY ANALYSIS]")
        print(f"  Date: {log.date}")
        print(f"  Recovery Score: {result['score']}/100")
        print(f"  Status: {result['status']}")
        print(f"  Deep Sleep: {result['deep_sleep_minutes']} minutes")
        print(f"  RHR: {result['rhr']:.1f if result['rhr'] else 'N/A'} bpm")
        print(f"  Physical Recovery Low: {result['physical_recovery_low']}")
        print()
        
        return result
    except Exception as e:
        print(f"[RECOVERY ANALYSIS] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze/battle")
def analyze_battle(log: DailyLog):
    """
    Analyze battle score based on daily activity.
    
    Formula: BattleScore = (Steps * 0.05) + (DeepSleep * 5) + WorkoutScore
    """
    try:
        result = calculate_battle_score(log)
        
        print(f"\n[BATTLE ANALYSIS]")
        print(f"  Date: {log.date}")
        print(f"  Total Battle Score: {result['total_score']:.2f}")
        print(f"  Breakdown:")
        print(f"    - Steps ({result['breakdown']['steps_points']:.2f}): {result['total_steps']} steps")
        print(f"    - Deep Sleep ({result['breakdown']['deep_sleep_points']:.2f}): {result['deep_sleep_minutes']} min")
        print(f"    - Workouts ({result['breakdown']['workout_points']:.2f}): {result['workout_count']} sessions")
        print()
        
        return result
    except Exception as e:
        print(f"[BATTLE ANALYSIS] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai/coach-morning")
async def ai_coach_morning(log: DailyLog):
    """
    Get AI Coach feedback for morning workout planning.
    
    Based on recovery metrics from sleep, provides personalized workout recommendations.
    """
    try:
        recovery = calculate_recovery_score(log)
        
        print(f"\n[AI COACH - MORNING]")
        print(f"  Analyzing recovery for workout planning...")
        
        feedback = await get_coach_feedback(
            context_type="PLANNING",
            recovery_score=recovery["score"],
            deep_sleep=recovery["deep_sleep_minutes"],
            rhr=recovery["rhr"] or 65.0
        )
        
        return {
            "context": "MORNING_PLAN",
            "recovery_metrics": {
                "score": recovery["score"],
                "status": recovery["status"],
                "deep_sleep_minutes": recovery["deep_sleep_minutes"],
                "rhr": recovery["rhr"]
            },
            "ai_coach_feedback": feedback["feedback"],
            "timestamp": feedback["timestamp"]
        }
    except Exception as e:
        print(f"[AI COACH - MORNING] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/ai/coach-postworkout")
async def ai_coach_postworkout(log: DailyLog):
    """
    Get AI Coach feedback after a workout.
    
    Analyzes workout performance against recovery status and provides feedback.
    """
    try:
        if not log.manual_workouts:
            return {
                "error": "No workouts found in daily log",
                "timestamp": str(date.today())
            }
        
        recovery = calculate_recovery_score(log)
        last_workout = log.manual_workouts[-1]
        
        print(f"\n[AI COACH - POST-WORKOUT]")
        print(f"  Analyzing workout performance...")
        print(f"  Workout: {last_workout.activity_type} ({last_workout.calories_burnt} cal)")
        
        feedback = await get_coach_feedback(
            context_type="ANALYSIS",
            recovery_score=recovery["score"],
            deep_sleep=recovery["deep_sleep_minutes"],
            rhr=recovery["rhr"] or 65.0,
            activity_type=last_workout.activity_type,
            calories_burnt=last_workout.calories_burnt
        )
        
        return {
            "context": "POST_WORKOUT",
            "workout": {
                "activity": last_workout.activity_type,
                "duration_minutes": last_workout.duration_minutes,
                "intensity_rpe": last_workout.intensity_rpe,
                "calories_burnt": last_workout.calories_burnt
            },
            "recovery_metrics": {
                "score": recovery["score"],
                "status": recovery["status"],
                "physical_recovery_low": recovery["physical_recovery_low"]
            },
            "ai_coach_feedback": feedback["feedback"],
            "timestamp": feedback["timestamp"]
        }
    except Exception as e:
        print(f"[AI COACH - POST-WORKOUT] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/analyze/weekly")
def analyze_weekly(logs: list[DailyLog]):
    """
    Analyze weekly statistics from a list of daily logs.
    """
    try:
        result = calculate_weekly_stats(logs)
        
        print(f"\n[WEEKLY ANALYSIS]")
        print(f"  Period: {result['period_days']} days")
        print(f"  Total Steps: {result['total_steps']} (avg {result['avg_steps']})")
        print(f"  Total Sleep: {result['total_sleep_hours']}h (avg {result['avg_sleep_hours']}h)")
        print(f"  Deep Sleep: {result['deep_sleep_minutes']} min")
        print(f"  Workouts: {result['total_workouts']} (favorite: {result['favorite_activity']})")
        print(f"  Avg Recovery: {result['avg_recovery_score']}/100")
        print()
        
        return result
    except Exception as e:
        print(f"[WEEKLY ANALYSIS] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
