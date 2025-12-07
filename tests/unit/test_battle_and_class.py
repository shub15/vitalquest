from backend.services import battle_system, gamification_engine


def test_workout_score():
    workouts = [
        {"activity_type": "Gym", "duration_minutes": 60, "intensity_rpe": 7, "calories_burnt": 300}
    ]
    ws = battle_system.workout_score_from_workouts(workouts)
    # (60*7) + (300*0.2) = 420 + 60 = 480
    assert abs(ws - 480) < 1e-6


def test_user_battle_score():
    daily = {"total_steps": 10000, "sleep_segments": [{"stage": "deep", "duration_minutes": 60}], "manual_workouts": [{"activity_type": "Run", "duration_minutes": 30, "intensity_rpe": 6, "calories_burnt": 250}]}
    score = battle_system.user_battle_score_from_dailylog(daily)
    # steps 10000*0.05=500, deep 60*5=300, workout (30*6)+(250*0.2)=180+50=230 => total 1030
    assert abs(score - 1030) < 2


def test_rpg_class_detection():
    workouts = [{"activity_type": "Gym"}, {"activity_type": "Weights"}, {"activity_type": "Run"}]
    c = gamification_engine.determine_rpg_class_from_workouts(workouts)
    assert c in ("Warrior", "Ranger", "Monk", "Villager", "Adventurer")
