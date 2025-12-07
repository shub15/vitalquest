#!/usr/bin/env python3
"""
Dummy Data Generator - Creates 1 year of realistic DailyLog data for AI training
"""

from datetime import date, timedelta, datetime
import random
from backend.models.schemas import DailyLog, SleepSegment, SleepStage, ManualWorkout, HeartRateSample

def generate_dummy_dailylogs(days: int = 365) -> list[DailyLog]:
    """
    Generates realistic DailyLog data for the past 'days'.
    
    Simulates:
    - Variable steps (3000-15000)
    - Sleep patterns with deep/light stages
    - Random workouts (70% chance per day)
    - Heart rate samples during sleep
    """
    
    today = date.today()
    logs = []
    
    activities = ["Gym", "Run", "Yoga", "Swim", "Cycle", "Hike", "CrossFit", "Boxing"]
    
    print(f"\n[DUMMY DATA GENERATOR] Creating {days} days of realistic data...\n")
    
    for i in range(days):
        d = today - timedelta(days=i)
        
        # Randomize stats - more realistic variation
        steps = random.randint(3000, 15000)
        active_cals = int(steps * 0.04 + random.randint(100, 500))
        
        # Sleep: 5-9 hours typically
        sleep_dur = random.randint(300, 540)  # 5-9 hours
        deep_min = random.randint(30, 150)  # Deep sleep 30-150 min
        light_min = sleep_dur - deep_min
        
        # Create realistic sleep segments
        base_dt = datetime.combine(d, datetime.min.time())
        
        segments = [
            SleepSegment(
                start_time=base_dt.replace(hour=23),
                end_time=base_dt.replace(hour=7),
                stage=SleepStage.light,
                duration_minutes=light_min
            ),
            SleepSegment(
                start_time=base_dt.replace(hour=2),
                end_time=base_dt.replace(hour=3),
                stage=SleepStage.deep,
                duration_minutes=deep_min
            ),
            SleepSegment(
                start_time=base_dt.replace(hour=6),
                end_time=base_dt.replace(hour=7),
                stage=SleepStage.rem,
                duration_minutes=random.randint(20, 60)
            )
        ]
        
        # Heart rate samples during sleep (realistic values)
        hr_samples = []
        rhr_base = random.randint(55, 75)  # Resting HR
        
        for hour_offset in range(8):  # 8 hours of sleep
            for minute in [0, 15, 30, 45]:
                sample_time = base_dt.replace(hour=23, minute=0) + timedelta(hours=hour_offset, minutes=minute)
                
                # Vary HR slightly around base
                bpm = rhr_base + random.randint(-5, 5)
                hr_samples.append(HeartRateSample(timestamp=sample_time, bpm=bpm))
        
        # Workouts: 70% chance per day
        workouts = []
        if random.random() > 0.3:  # 70% have workouts
            num_workouts = random.randint(1, 2)
            for _ in range(num_workouts):
                workouts.append(ManualWorkout(
                    activity_type=random.choice(activities),
                    duration_minutes=random.randint(30, 120),
                    intensity_rpe=random.randint(4, 9),
                    calories_burnt=random.randint(200, 800)
                ))
        
        # Create DailyLog
        log = DailyLog(
            date=d,
            total_steps=steps,
            total_calories_active=active_cals,
            sleep_segments=segments,
            heart_rate_samples=hr_samples,
            manual_workouts=workouts
        )
        
        logs.append(log)
        
        # Progress indicator
        if i % 50 == 0:
            print(f"  [OK] Generated {i}/{days} days")
    
    print(f"  [OK] Generated {len(logs)} complete DailyLog entries\n")
    return logs

def generate_dummy_dailylogs_for_user(user_id: str, days: int = 365) -> list[dict]:
    """
    Generate dummy logs and return as serializable dicts for database storage.
    """
    logs = generate_dummy_dailylogs(days)
    
    result = []
    for log in logs:
        log_dict = {
            "user_id": user_id,
            "date": log.date.isoformat(),
            "total_steps": log.total_steps,
            "total_calories_active": log.total_calories_active,
            "sleep_segments": [
                {
                    "stage": seg.stage.value,
                    "duration_minutes": seg.duration_minutes,
                    "start_time": seg.start_time.isoformat(),
                    "end_time": seg.end_time.isoformat()
                }
                for seg in log.sleep_segments
            ],
            "manual_workouts": [
                {
                    "activity_type": w.activity_type,
                    "duration_minutes": w.duration_minutes,
                    "intensity_rpe": w.intensity_rpe,
                    "calories_burnt": w.calories_burnt
                }
                for w in log.manual_workouts
            ]
        }
        result.append(log_dict)
    
    return result

# Cache for in-memory testing
DUMMY_LOGS_CACHE = {}

def get_cached_logs(user_id: str = "demo_user", days: int = 365):
    """Get cached dummy logs or generate them."""
    key = f"{user_id}_{days}"
    if key not in DUMMY_LOGS_CACHE:
        DUMMY_LOGS_CACHE[key] = generate_dummy_dailylogs(days)
    return DUMMY_LOGS_CACHE[key]

if __name__ == "__main__":
    # Test generation
    print("\n" + "="*80)
    print("DUMMY DATA GENERATOR TEST")
    print("="*80)
    
    logs = generate_dummy_dailylogs(365)
    
    print(f"Sample log (most recent):")
    if logs:
        l = logs[0]
        print(f"  Date: {l.date}")
        print(f"  Steps: {l.total_steps}")
        print(f"  Sleep Segments: {len(l.sleep_segments)}")
        print(f"  Workouts: {len(l.manual_workouts)}")
        print(f"  HR Samples: {len(l.heart_rate_samples)}")
    
    print("\n" + "="*80 + "\n")
