#!/usr/bin/env python3
"""
Logic Module - Recovery Score, Battle Score, and AI Coach Integration
"""

from datetime import datetime
from typing import List, Optional, Dict, Any
from backend.models.schemas import DailyLog, SleepSegment

def calculate_rhr_from_sleep(log: DailyLog) -> dict:
    """
    Calculates the 'True Resting Heart Rate' based on the longest continuous sleep block.
    Returns a dict with 'rhr' and 'main_sleep_segment'.
    """
    if not log.heart_rate_samples:
        # Fallback: Use middle of sleep period average
        if log.sleep_segments:
            # Average of first 30 samples or available samples
            estimated_rhr = 60.0  # Default estimate
            return {"rhr": estimated_rhr, "source": "estimate", "note": "No HR data available"}
        return {"rhr": None, "note": "No HR or sleep data"}
    
    if not log.sleep_segments:
        # Use 2 AM - 6 AM window
        from datetime import datetime as dt
        start_fallback = dt.combine(log.date, dt.min.time()).replace(hour=2)
        end_fallback = dt.combine(log.date, dt.min.time()).replace(hour=6)
        
        relevant_samples = [
            s.bpm for s in log.heart_rate_samples
            if start_fallback <= s.timestamp <= end_fallback
        ]
        
        if not relevant_samples:
            return {"rhr": None, "note": "No HR data in fallback window"}
        return {"rhr": sum(relevant_samples) / len(relevant_samples), "source": "fallback_2am_6am"}
    
    # Find longest sleep segment
    main_sleep = max(log.sleep_segments, key=lambda x: x.duration_minutes)
    
    # Filter HR samples during main sleep
    relevant_samples = [
        s.bpm for s in log.heart_rate_samples
        if main_sleep.start_time <= s.timestamp <= main_sleep.end_time
    ]
    
    if not relevant_samples:
        return {"rhr": None, "note": "No HR data during main sleep"}
    
    true_rhr = sum(relevant_samples) / len(relevant_samples)
    return {"rhr": true_rhr, "source": "main_sleep", "sleep_segment": main_sleep}

def calculate_recovery_score(log: DailyLog) -> dict:
    """
    Calculates Recovery Score (0-100) and Status.
    
    Factors:
    - Deep Sleep Quality (45+ min = good)
    - Total Sleep Duration (420+ min = 7 hrs)
    - Resting Heart Rate (lower is better)
    - Previous Workout Strain
    """
    
    # Dynamic RHR Calculation
    rhr_data = calculate_rhr_from_sleep(log)
    true_rhr = rhr_data.get("rhr", 60.0)
    
    # Deep Sleep Calculation
    deep_sleep_minutes = sum(
        s.duration_minutes for s in log.sleep_segments 
        if s.stage.value == "deep" or s.stage == "deep"
    )
    
    # Total Sleep
    total_sleep_minutes = sum(s.duration_minutes for s in log.sleep_segments)
    
    # Scoring Formula (0-100)
    score = 70  # Base score
    
    # Sleep Quantity: +15 if total_sleep > 7 hrs (420 mins)
    if total_sleep_minutes > 420:
        score += 15
    
    # Sleep Quality: -15 if deep_sleep < 45 mins
    physical_recovery_low = deep_sleep_minutes < 45
    if physical_recovery_low:
        score -= 15
    
    # Strain: -10 if max workout intensity > 8
    max_intensity = 0
    if log.manual_workouts:
        max_intensity = max(w.intensity_rpe for w in log.manual_workouts)
    
    if max_intensity > 8:
        score -= 10
    
    # RHR Factor: -5 if RHR > 75 (elevated)
    if true_rhr and true_rhr > 75:
        score -= 5
    
    # Clamp score 0-100
    score = max(0, min(100, score))
    
    status = "READY_TO_TRAIN" if score >= 50 else "REST_MODE"
    
    return {
        "score": score,
        "status": status,
        "rhr": true_rhr,
        "deep_sleep_minutes": deep_sleep_minutes,
        "total_sleep_minutes": total_sleep_minutes,
        "physical_recovery_low": physical_recovery_low,
        "max_workout_intensity": max_intensity
    }

def calculate_battle_score(log: DailyLog) -> dict:
    """
    Calculates Battle Score using Rebalanced Logic.
    
    Formula:
    BattleScore = (Steps * 0.05) + (DeepSleepMins * 5) + WorkoutScore
    WorkoutScore = Σ[(Duration * Intensity) + (CaloriesBurnt * 0.2)]
    """
    
    # Steps contribution
    steps_score = log.total_steps * 0.05
    
    # Deep Sleep contribution
    deep_sleep_minutes = sum(
        s.duration_minutes for s in log.sleep_segments 
        if s.stage.value == "deep" or s.stage == "deep"
    )
    deep_sleep_score = deep_sleep_minutes * 5
    
    # Workout Score
    workout_score_total = 0
    for w in log.manual_workouts:
        w_score = (w.duration_minutes * w.intensity_rpe) + (w.calories_burnt * 0.2)
        workout_score_total += w_score
    
    total_battle_score = steps_score + deep_sleep_score + workout_score_total
    
    return {
        "total_score": round(total_battle_score, 2),
        "breakdown": {
            "steps_points": round(steps_score, 2),
            "deep_sleep_points": round(deep_sleep_score, 2),
            "workout_points": round(workout_score_total, 2)
        },
        "total_steps": log.total_steps,
        "workout_count": len(log.manual_workouts),
        "deep_sleep_minutes": deep_sleep_minutes
    }

def calculate_weekly_stats(logs: List[DailyLog]) -> dict:
    """
    Calculate aggregated weekly statistics from a list of DailyLogs.
    """
    if not logs:
        return {}
    
    total_steps = sum(l.total_steps for l in logs)
    total_calories = sum(l.total_calories_active for l in logs)
    
    total_sleep_mins = sum(
        sum(s.duration_minutes for s in l.sleep_segments) for l in logs
    )
    avg_sleep_hours = total_sleep_mins / (60 * len(logs))
    
    deep_sleep_mins = sum(
        sum(s.duration_minutes for s in l.sleep_segments if s.stage.value == "deep" or s.stage == "deep")
        for l in logs
    )
    
    workout_count = sum(len(l.manual_workouts) for l in logs)
    
    all_workouts = [w for l in logs for w in l.manual_workouts]
    top_activity = "None"
    if all_workouts:
        counts = {}
        for w in all_workouts:
            counts[w.activity_type] = counts.get(w.activity_type, 0) + 1
        top_activity = max(counts, key=counts.get)
    
    avg_recovery = sum(calculate_recovery_score(l)["score"] for l in logs) / len(logs)
    
    return {
        "period_days": len(logs),
        "total_steps": total_steps,
        "avg_steps": int(total_steps / len(logs)),
        "total_calories": int(total_calories),
        "avg_calories": int(total_calories / len(logs)),
        "total_sleep_hours": round(total_sleep_mins / 60, 1),
        "avg_sleep_hours": round(avg_sleep_hours, 1),
        "deep_sleep_minutes": deep_sleep_mins,
        "total_workouts": workout_count,
        "favorite_activity": top_activity,
        "avg_recovery_score": round(avg_recovery, 1)
    }
