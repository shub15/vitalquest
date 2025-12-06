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

@pytest.mark.parametrize("sleep_mins, deep_mins, max_intensity, expected_score, expected_status", [
    # 1. Base Case: Sleep <= 7h (0), Deep >= 45 (0), Strain <= 8 (0) -> 70
    (420, 45, 8, 70, "READY_TO_TRAIN"), 
    
    # 2. High Sleep (+15): Sleep > 7h (421), Deep >= 45 (0), Strain <= 8 (0) -> 85
    (421, 45, 8, 85, "READY_TO_TRAIN"),

    # 3. Low Deep Sleep (-15): Sleep <= 7h (0), Deep < 45 (-15), Strain <= 8 (0) -> 55
    # Enforced REST_MODE due to Low Deep Sleep flag
    (420, 44, 8, 55, "REST_MODE"),

    # 4. High Strain (-10): Sleep <= 7h (0), Deep >= 45 (0), Strain > 8 (-10) -> 60
    (420, 45, 9, 60, "READY_TO_TRAIN"),

    # 5. High Sleep (+15) & Low Deep (-15) -> 70
    # Enforced REST_MODE due to Low Deep Sleep
    (421, 44, 8, 70, "REST_MODE"),

    # 6. High Sleep (+15) & High Strain (-10) -> 75
    (421, 45, 9, 75, "READY_TO_TRAIN"),

    # 7. Low Deep (-15) & High Strain (-10) -> 45
    # Score 45 < 50, Status REST_MODE
    (420, 44, 9, 45, "REST_MODE"),

    # 8. All Triggers: High Sleep (+15), Low Deep (-15), High Strain (-10) -> 60
    # Enforced REST_MODE due to Low Deep Sleep
    (421, 44, 9, 60, "REST_MODE"),
])
def test_recovery_score_parametrized(sleep_mins, deep_mins, max_intensity, expected_score, expected_status):
    log = DailyLog(
        date=date(2025, 12, 6),
        total_steps=5000, 
        total_calories_active=200,
        sleep_segments=[
            SleepSegment(
                start_time=datetime(2025, 12, 6, 23, 0),
                end_time=datetime(2025, 12, 6, 23, 0) + timedelta(minutes=sleep_mins),
                stage=SleepStage.light,
                duration_minutes=sleep_mins - deep_mins
            ),
             SleepSegment(
                start_time=datetime(2025, 12, 6, 23, 0),
                end_time=datetime(2025, 12, 6, 23, 0) + timedelta(minutes=deep_mins),
                stage=SleepStage.deep,
                duration_minutes=deep_mins
            )
        ],
        manual_workouts=[
            ManualWorkout(
                activity_type="Test", 
                duration_minutes=30, 
                intensity_rpe=max_intensity, 
                calories_burnt=100
            )
        ]
    )
    
    result = calculate_recovery_score(log)
    assert result["score"] == expected_score, f"Failed for Sleep={sleep_mins}, Deep={deep_mins}, Strain={max_intensity}"
    assert result["status"] == expected_status, f"Status Mismatch for Score={result['score']}"
