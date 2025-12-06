import json
from typing import Dict
from datetime import datetime
import random

SAMPLE_IMAGES = [
    "https://picsum.photos/seed/1/800/400",
    "https://picsum.photos/seed/2/800/400",
    "https://picsum.photos/seed/3/800/400",
    "https://picsum.photos/seed/4/800/400",
]

def generate_level_up_post(user_id: str, username: str, new_level: int, stats_gained: Dict) -> Dict:
    post = {
        "post_id": f"post_{user_id}_{int(datetime.utcnow().timestamp())}",
        "user_id": user_id,
        "type": "level_up",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "content": {
            "title": "🎉 Level Up!",
            "message": f"{username} reached Level {new_level}!",
            "stats_gained": stats_gained,
        },
        "likes": 0,
        "comments": [],
    }
    return post


def generate_daily_post(user_id: str, username: str, daily_log: Dict) -> Dict:
    """Generate a daily summary post including a random image and summary of steps/sleep/workouts."""
    # build a friendly summary
    steps = daily_log.get("total_steps", daily_log.get("steps", 0))
    deep_minutes = 0
    for seg in daily_log.get("sleep_segments", []) or []:
        try:
            if seg.get("stage") == "deep":
                deep_minutes += int(seg.get("duration_minutes", 0))
        except Exception:
            continue

    workouts = daily_log.get("manual_workouts", []) or []
    workout_summaries = []
    for w in workouts:
        workout_summaries.append(f"{w.get('activity_type')} {w.get('duration_minutes')}min")

    image = random.choice(SAMPLE_IMAGES)

    content = {
        "title": "Daily Log",
        "message": f"{username} walked {steps} steps, had {deep_minutes} min deep sleep.",
        "workouts": workout_summaries,
        "image_url": image,
    }

    post = {
        "post_id": f"post_{user_id}_{int(datetime.utcnow().timestamp())}",
        "user_id": user_id,
        "type": "daily_log",
        "timestamp": datetime.utcnow().isoformat() + "Z",
        "content": content,
        "likes": 0,
        "comments": [],
    }
    return post
