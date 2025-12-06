import pytest
from datetime import date, datetime, timedelta
from app.logic import calculate_recovery_score, calculate_battle_score, calculate_rhr_from_sleep
from schemas.vital_quest import DailyLog, SleepSegment, HeartRateSample, ManualWorkout, SleepStage

def test_calculate_battle_score():
    # Setup Data
    # 10,000 steps * 0.05 = 500
    # 60 mins deep sleep * 5 = 300
    # Workout: 60 mins, intensity 7, 300 cal
    # (60*7) + (300*0.2) = 420 + 60 = 480
    # Total = 500 + 300 + 480 = 1280
    
    log = DailyLog(
        date=date(2025, 12, 6),
        total_steps=10000,
        total_calories_active=500,
        sleep_segments=[
            SleepSegment(
                start_time=datetime(2025, 12, 6, 23, 0),
                end_time=datetime(2025, 12, 7, 7, 0),
                stage=SleepStage.light,
                duration_minutes=420
            ),
            SleepSegment(
                start_time=datetime(2025, 12, 7, 1, 0),
                end_time=datetime(2025, 12, 7, 2, 0),
                stage=SleepStage.deep,
                duration_minutes=60
            )
        ],
        manual_workouts=[
            ManualWorkout(
                activity_type="Gym",
                duration_minutes=60,
                intensity_rpe=7,
                calories_burnt=300
            )
        ]
    )
    
    result = calculate_battle_score(log)
    assert result["total_score"] == 1280
    assert result["breakdown"]["steps_points"] == 500
    assert result["breakdown"]["deep_sleep_points"] == 300
    assert result["breakdown"]["workout_points"] == 480

def test_calculate_rhr_main_sleep():
    main_start = datetime(2025, 12, 6, 23, 0)
    main_end = datetime(2025, 12, 7, 7, 0) # 8 hours
    
    log = DailyLog(
        date=date(2025, 12, 6),
        total_steps=0, total_calories_active=0,
        sleep_segments=[
            SleepSegment(
                start_time=main_start,
                end_time=main_end,
                stage=SleepStage.light,
                duration_minutes=480
            )
        ],
        heart_rate_samples=[
            HeartRateSample(timestamp=main_start + timedelta(hours=1), bpm=60),
            HeartRateSample(timestamp=main_start + timedelta(hours=2), bpm=50),
            HeartRateSample(timestamp=main_start + timedelta(hours=3), bpm=70),
            # Out of bounds sample
            HeartRateSample(timestamp=main_start + timedelta(hours=9), bpm=100) 
        ]
    )
    
    # Average of 60, 50, 70 is 60.
    result = calculate_rhr_from_sleep(log)
    assert result["rhr"] == 60
    assert result["source"] == "main_sleep"

def test_recovery_score_logic():
    # Base 70
    # > 7 hrs sleep (+15)
    # Deep sleep < 45 (-15)
    # Workout intensity > 8 (-10)
    
    # Case 1: Perfect Sleep, No Strain
    # 8 hrs sleep (480 mins), 60 mins deep sleep. No high intensity workout.
    # Score = 70 + 15 (quantity) = 85. (Deep sleep ok, so no penalty).
    
    log = DailyLog(
        date=date(2025, 12, 6),
        total_steps=0, total_calories_active=0,
        sleep_segments=[
            SleepSegment(
                start_time=datetime(2025, 12, 6, 23, 0),
                end_time=datetime(2025, 12, 7, 7, 0),
                stage=SleepStage.light,
                duration_minutes=420 # 7h
            ),
             SleepSegment(
                start_time=datetime(2025, 12, 7, 2, 0),
                end_time=datetime(2025, 12, 7, 3, 0),
                stage=SleepStage.deep,
                duration_minutes=60 # 1h
            )
        ],
        # Total sleep = 480 mins > 420. +15.
        # Deep sleep = 60 > 45. No penalty.
        manual_workouts=[]
    )
    
    result = calculate_recovery_score(log)
    assert result["score"] == 85
    assert result["status"] == "READY_TO_TRAIN"

    # Case 2: Poor Sleep, High Strain
    # 6 hours sleep (360 mins). Deep sleep 30 mins. Workout intensity 9.
    # Base 70
    # Sleep Quantity <= 7h. (0)
    # Deep Sleep < 45. (-15) -> 55
    # Strain > 8. (-10) -> 45
    # Result 45. REST_MODE.
    
    log2 = DailyLog(
        date=date(2025, 12, 6),
        total_steps=0, total_calories_active=0,
        sleep_segments=[
            SleepSegment(
                start_time=datetime(2025, 12, 6, 23, 0),
                end_time=datetime(2025, 12, 7, 5, 0),
                stage=SleepStage.deep,
                duration_minutes=30 
            ),
             SleepSegment(
                start_time=datetime(2025, 12, 6, 23, 0),
                end_time=datetime(2025, 12, 7, 5, 0),
                stage=SleepStage.light,
                duration_minutes=330 
            )
        ],
        manual_workouts=[
            ManualWorkout(
                activity_type="Run", duration_minutes=30, intensity_rpe=9, calories_burnt=300
            )
        ]
    )
    
    result2 = calculate_recovery_score(log2)
    assert result2["score"] == 45
    assert result2["status"] == "REST_MODE"
