from typing import Dict, List, Any
import json


def workout_score_from_workouts(manual_workouts: List[Dict[str, Any]]) -> float:
    """Compute WorkoutScore = sum(Duration×Intensity) + sum(CaloriesBurnt×0.2)"""
    dur_int_sum = 0.0
    cal_sum = 0.0
    for w in manual_workouts:
        dur = float(w.get("duration_minutes", 0))
        intensity = float(w.get("intensity_rpe", 0))
        calories = float(w.get("calories_burnt", 0))
        dur_int_sum += dur * intensity
        cal_sum += calories * 0.2
    return dur_int_sum + cal_sum


def user_battle_score_from_dailylog(daily_log: Dict[str, Any]) -> float:
    """Compute BattleScore = (Steps×0.05) + (DeepSleepMins×5) + WorkoutScore"""
    steps = float(daily_log.get("total_steps", daily_log.get("steps", 0)))
    # deep sleep minutes: check sleep_segments or sleep_deep_minutes
    deep_minutes = 0
    if "sleep_segments" in daily_log and isinstance(daily_log["sleep_segments"], list):
        for seg in daily_log["sleep_segments"]:
            # seg either dict or object with 'stage' and 'duration_minutes'
            stage = seg.get("stage") if isinstance(seg, dict) else getattr(seg, "stage", None)
            dur = seg.get("duration_minutes") if isinstance(seg, dict) else getattr(seg, "duration_minutes", 0)
            if stage == "deep" or stage == "SleepStage.deep":
                deep_minutes += int(dur or 0)
    else:
        deep_minutes = int(daily_log.get("sleep_deep_minutes", 0) or 0)

    workout_score = workout_score_from_workouts(daily_log.get("manual_workouts", []))

    score = (steps * 0.05) + (deep_minutes * 5.0) + workout_score
    return float(score)


def compute_team_score_from_user_logs(user_logs: List[Dict[str, Any]]) -> float:
    """Aggregate multiple user daily logs into a single team score (sum of user scores)."""
    total = 0.0
    for log in user_logs:
        total += user_battle_score_from_dailylog(log)
    return total


def compute_battle_scores(team_stats: Dict[str, Dict]) -> Dict[str, float]:
    """team_stats: {team_id: {"user_logs": [...]}} -> returns team scores"""
    scores = {}
    for team_id, s in team_stats.items():
        user_logs = s.get("user_logs", [])
        scores[team_id] = compute_team_score_from_user_logs(user_logs)
    return scores
