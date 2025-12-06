from typing import Dict, List
import math
import logging

logger = logging.getLogger("gamification")

def xp_required_for_level(level: int) -> int:
    return int(100 * (level ** 1.5))

def calculate_xp_from_activity(activity: Dict) -> float:
    steps = activity.get("steps", 0)
    calories = activity.get("calories_burned", 0)
    sleep_total = activity.get("sleep_total_minutes", 0)
    recovery_score = activity.get("recovery_score", 0)

    xp_from_steps = steps / 100.0
    xp_from_calories = calories / 50.0

    sleep_bonus = 1.2 if sleep_total >= 420 else 1.0
    recovery_bonus = 1.15 if recovery_score >= 70 else 1.0

    total_xp = (xp_from_steps + xp_from_calories) * sleep_bonus * recovery_bonus
    logger.info(f"XP calc steps:{xp_from_steps:.2f} cal:{xp_from_calories:.2f} sleep_bonus:{sleep_bonus} recovery:{recovery_bonus} -> total:{total_xp:.2f}")
    return total_xp

def map_attributes(base_stats: Dict, activity: Dict) -> Dict:
    calories = activity.get("calories_burned", 0)
    sleep_total = activity.get("sleep_total_minutes", 0)
    nutrition = activity.get("nutrition_score", 0)

    strength = base_stats.get("strength", 0) + (calories / 200.0)
    vitality = base_stats.get("vitality", 0) + nutrition
    stamina = base_stats.get("stamina", 0) + (sleep_total / 10.0)
    return {"strength": strength, "vitality": vitality, "stamina": stamina}

def apply_xp_and_level(user: Dict, xp_gain: float) -> Dict:
    """Apply xp to user dict and return updated info including level up flag."""
    current_xp = user.get("xp", 0)
    current_level = user.get("level", 1)
    new_xp_total = current_xp + int(math.floor(xp_gain))
    leveled_up = False
    new_level = current_level

    while new_xp_total >= xp_required_for_level(new_level):
        required = xp_required_for_level(new_level)
        new_xp_total -= required
        new_level += 1
        leveled_up = True

    result = {
        "user_id": user.get("user_id"),
        "xp_gained": int(math.floor(xp_gain)),
        "new_xp_total": new_xp_total,
        "leveled_up": leveled_up,
        "new_level": new_level,
    }
    logger.info(f"apply_xp result: {result}")
    return result


def determine_rpg_class_from_workouts(manual_workouts: List[Dict]) -> str:
    """Determine RPG class by counting activity_type frequency in manual_workouts.

    Rules:
      - Mostly 'Gym' or contains 'weights' -> 'Warrior'
      - Mostly 'Run' or 'Walk' -> 'Ranger'
      - Mostly 'Yoga' or 'Stretch' -> 'Monk'
      - Low activity -> 'Villager'
    """
    if not manual_workouts:
        return "Villager"

    freq = {}
    for w in manual_workouts:
        t = (w.get("activity_type") or "").lower()
        freq[t] = freq.get(t, 0) + 1

    # find most common
    most = max(freq.items(), key=lambda x: x[1])
    label = most[0]
    if any(k in label for k in ("gym", "weights", "strength", "lift")):
        return "Warrior"
    if any(k in label for k in ("run", "walk", "jog", "cycle")):
        return "Ranger"
    if any(k in label for k in ("yoga", "stretch", "pilates")):
        return "Monk"

    # fallback: if total workouts fairly low, villager
    total_count = sum(freq.values())
    if total_count <= 1:
        return "Villager"
    return "Adventurer"
