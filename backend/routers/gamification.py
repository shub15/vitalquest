from fastapi import APIRouter, HTTPException
from backend.models.schemas import HealthData, XPResult
from backend.database.sqlite_client import SQLiteClient
from backend.services import gamification_engine, post_generator
import asyncio
import aiosqlite
from fastapi import Query
import json

router = APIRouter()
db = SQLiteClient()


@router.on_event("startup")
async def startup():
    await db.init()


@router.post("/calculate-xp", response_model=XPResult)
async def calculate_xp_endpoint(payload: HealthData):
    # store health
    await db.insert_health(payload.dict())

    # pretend to get recovery score from ML service (fallback 50)
    recovery_score = payload.__dict__.get("recovery_score", 50)

    activity = payload.dict()
    activity["recovery_score"] = recovery_score

    xp_gain = gamification_engine.calculate_xp_from_activity(activity)

    user = await db.get_user(payload.user_id) or {"user_id": payload.user_id, "xp": 0, "level": 1}

    result = gamification_engine.apply_xp_and_level(user, xp_gain)

    # update user record
    updated_user = {
        "user_id": payload.user_id,
        "username": user.get("username"),
        "team_id": user.get("team_id"),
        "level": result["new_level"],
        "xp": result["new_xp_total"],
        "strength": user.get("strength", 0),
        "vitality": user.get("vitality", 0),
        "stamina": user.get("stamina", 0),
    }
    await db.upsert_user(updated_user)

    # generate post if leveled up
    if result["leveled_up"]:
        post = post_generator.generate_level_up_post(payload.user_id, updated_user.get("username") or payload.user_id, result["new_level"], {})
        async with aiosqlite.connect(db.db_path) as conn:
            await conn.execute(
                "INSERT OR REPLACE INTO social_feed(post_id, user_id, type, timestamp, content) VALUES(?,?,?,?,?)",
                (post["post_id"], post["user_id"], post["type"], post["timestamp"], str(post["content"])),
            )
            await conn.commit()

    return {
        "user_id": result["user_id"],
        "xp_gained": result["xp_gained"],
        "new_xp_total": result["new_xp_total"],
        "leveled_up": result["leveled_up"],
        "new_level": result["new_level"],
    }


@router.get("/user/{user_id}/class")
async def get_user_class(user_id: str, days: int = Query(7, ge=1, le=30)):
    """Compute user's RPG class from recent daily_logs (last `days`)."""
    # find date range
    from datetime import date, timedelta

    end = date.today()
    start = end - timedelta(days=days)

    # fetch daily logs from db
    logs_json = await db.get_daily_logs_for_user_range(user_id, str(start), str(end))
    workouts = []
    for j in logs_json:
        try:
            d = json.loads(j)
        except Exception:
            d = j if isinstance(j, dict) else {}
        for w in d.get("manual_workouts", []) or []:
            workouts.append({
                "activity_type": w.get("activity_type"),
                "duration_minutes": w.get("duration_minutes"),
                "intensity_rpe": w.get("intensity_rpe"),
                "calories_burnt": w.get("calories_burnt"),
            })

    rpg_class = gamification_engine.determine_rpg_class_from_workouts(workouts)

    # avatar/category suggestions mapping
    avatar_map = {
        "Warrior": {"avatar": "https://picsum.photos/seed/warrior/200/200", "category": "Strength"},
        "Ranger": {"avatar": "https://picsum.photos/seed/ranger/200/200", "category": "Endurance"},
        "Monk": {"avatar": "https://picsum.photos/seed/monk/200/200", "category": "Flexibility"},
        "Villager": {"avatar": "https://picsum.photos/seed/villager/200/200", "category": "Casual"},
        "Adventurer": {"avatar": "https://picsum.photos/seed/adventurer/200/200", "category": "Balanced"},
    }

    suggestion = avatar_map.get(rpg_class, avatar_map["Adventurer"])
    return {"user_id": user_id, "rpg_class": rpg_class, "suggestion": suggestion}
