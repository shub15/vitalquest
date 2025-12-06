from datetime import datetime
from typing import List, Optional
from schemas.vital_quest import DailyLog, SleepSegment, HeartRateSample

def calculate_rhr_from_sleep(log: DailyLog) -> dict:
    """
    Calculates the 'True Resting Heart Rate' based on the longest continuous sleep block (Main Sleep).
    Returns a dict with 'rhr' and 'main_sleep_segment'.
    """
    if not log.sleep_segments:
        # Fallback: No sleep data, technically we can't calc RHR from sleep. 
        # But PRD says "Fallback: If no sleep data exists, use 2 AM - 6 AM as default."
        # Since we don't have raw HR stream for the whole day readily available in this context without 
        # iterating all samples, we will just filter samples between 2AM and 6AM on the log date.
        # Note: log.date is a date object. We need to construct datetimes.
        start_fallback = datetime.combine(log.date, datetime.min.time()).replace(hour=2)
        end_fallback = datetime.combine(log.date, datetime.min.time()).replace(hour=6)
        
        # We might need to handle day rollover if sleep is technicaly previous night? 
        # PRD implies "DailyLog" covers a logical day. Let's assume samples are present.
        
        # Correction: The log has a list of heart_rate_samples. We should filter those.
        relevant_samples = [
            s.bpm for s in log.heart_rate_samples
            if start_fallback <= s.timestamp <= end_fallback
        ]
        
        if not relevant_samples:
           return {"rhr": None, "note": "No HR data in fallback window"}

        return {"rhr": sum(relevant_samples) / len(relevant_samples), "source": "fallback_2am_6am"}

    # 1. Identify Sleep Window: Find longest continuous sleep block
    # Simple approach: The segment with max duration.
    # If segments are fragmented but contiguous, we might want to merge them, 
    # but PRD says "Find the SleepSegment ... representing the longest continuous sleep block".
    # We will assume SleepSegment is already a block.
    
    main_sleep = max(log.sleep_segments, key=lambda x: x.duration_minutes)
    
    # 2. Filter HR: Extract heart_rate_samples strictly within start/end of Main Sleep
    relevant_samples = [
        s.bpm for s in log.heart_rate_samples
        if main_sleep.start_time <= s.timestamp <= main_sleep.end_time
    ]
    
    # 3. Calculate Average
    if not relevant_samples:
        # Fallback if no HR data during sleep
        return {"rhr": None, "note": "No HR data during main sleep"}
        
    true_rhr = sum(relevant_samples) / len(relevant_samples)
    
    return {"rhr": true_rhr, "source": "main_sleep", "sleep_segment": main_sleep}

def calculate_recovery_score(log: DailyLog) -> dict:
    """
    Calculates Recovery Score (0-100) and Status.
    """
    # Dynamic RHR Calculation
    rhr_data = calculate_rhr_from_sleep(log)
    true_rhr = rhr_data.get("rhr")
    
    # Deep Sleep Calculation
    deep_sleep_minutes = sum(s.duration_minutes for s in log.sleep_segments if s.stage.value == "deep")
    
    # Logic: If Deep Sleep < 45 mins, flag PHYSICAL_RECOVERY_LOW
    physical_recovery_low = deep_sleep_minutes < 45
    
    # Scoring Formula
    score = 70 # Base
    
    # Sleep Quantity: +15 if total_sleep > 7 hrs (420 mins)
    total_sleep_minutes = sum(s.duration_minutes for s in log.sleep_segments)
    if total_sleep_minutes > 420:
        score += 15
        
    # Sleep Quality: -15 if deep_sleep < 45 mins
    if physical_recovery_low:
        score -= 15
        
    # Strain: -10 if yesterday's total workout intensity > 8.
    # Note: 'yesterday' implies we need history. But input is single DailyLog.
    # PRD says "Input: DailyLog object".
    # Maybe we check the MAX intensity in the current log as a proxy or assume the log CONTAINS yesterday's data?
    # Or, the DailyLog passed IS "Yesterday's" log being analyzed for "Today's" recovery?
    # "Objective: Calculate a 'Readiness Score' using actual sleep windows." - usually done in morning.
    # If we are doing morning plan, we look at the sleep we just had. The "workouts" in the log might be from the previous day?
    # Let's assume we check the manual_workouts in the CURRENT log object.
    # If any workout has intensity > 8, we deduct.
    
    max_intensity = 0
    if log.manual_workouts:
        max_intensity = max(w.intensity_rpe for w in log.manual_workouts)
        
    if max_intensity > 8:
        score -= 10
        
    # Clamp score 0-100
    score = max(0, min(100, score))
    
    status = "READY_TO_TRAIN"
    if score < 50 or physical_recovery_low: 
        # Enforce REST_MODE if score is low OR deep sleep is critical
        status = "REST_MODE"

    return {
        "score": score,
        "status": status,
        "rhr": true_rhr,
        "deep_sleep_minutes": deep_sleep_minutes,
        "total_sleep_minutes": total_sleep_minutes,
        "physical_recovery_low": physical_recovery_low
    }

def calculate_battle_score(log: DailyLog) -> dict:
    """
    Calculates Battle Score using Rebalanced Logic.
    BattleScore = (Steps * 0.05) + (DeepSleepMins * 5) + WorkoutScore
    WorkoutScore = (Duration * Intensity) + (CaloriesBurnt * 0.2)
    """
    # Steps
    steps_score = log.total_steps * 0.05
    
    # Deep Sleep
    deep_sleep_minutes = sum(s.duration_minutes for s in log.sleep_segments if s.stage.value == "deep")
    deep_sleep_score = deep_sleep_minutes * 5
    
    # Workout Score
    workout_score_total = 0
    for w in log.manual_workouts:
        # (Duration * Intensity) + (CaloriesBurnt * 0.2)
        w_score = (w.duration_minutes * w.intensity_rpe) + (w.calories_burnt * 0.2)
        workout_score_total += w_score
        
    total_battle_score = steps_score + deep_sleep_score + workout_score_total
    
    return {
        "total_score": total_battle_score,
        "breakdown": {
            "steps_points": steps_score,
            "deep_sleep_points": deep_sleep_score,
            "workout_points": workout_score_total
        }
    }
