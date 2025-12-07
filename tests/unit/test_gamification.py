import asyncio
from backend.services import gamification_engine


def test_xp_calculation_basic():
    activity = {"steps": 1000, "calories_burned": 500, "sleep_total_minutes": 480, "recovery_score": 75}
    xp = gamification_engine.calculate_xp_from_activity(activity)
    # steps -> 10 xp, calories -> 10 xp, sleep bonus 1.2, recovery 1.15 => (20)*1.2*1.15 = 27.6
    assert xp > 27 and xp < 28


def test_level_up_threshold():
    user = {"user_id": "u1", "xp": 0, "level": 1}
    # give enough xp to level up couple times
    res = gamification_engine.apply_xp_and_level(user, 1000)
    assert res["new_level"] > 1
