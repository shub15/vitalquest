from fastapi import APIRouter, HTTPException
from backend.models.schemas import HealthData, XPResult
from backend.database.mysql_client import MySQLClient
from backend.services import gamification_engine, post_generator
from fastapi import Query
import json

router = APIRouter()

# Global db instance
_db_instance = None

async def get_db():
    """Get or create database client"""
    global _db_instance
    if _db_instance is None:
        _db_instance = MySQLClient()
        if _db_instance.pool is None:
            await _db_instance.init()
    return _db_instance


@router.post("/calculate-xp", response_model=XPResult)
async def calculate_xp_endpoint(payload: HealthData):
    try:
        db = await get_db()
        print(f"[GAMIFICATION] Calculating XP for user: {payload.user_id}")
        
        # store health
        await db.insert_health(payload.dict())
        print(f"[GAMIFICATION] Health data stored for {payload.user_id}")

        # pretend to get recovery score from ML service (fallback 50)
        recovery_score = payload.__dict__.get("recovery_score", 50)

        activity = payload.dict()
        activity["recovery_score"] = recovery_score

        xp_gain = gamification_engine.calculate_xp_from_activity(activity)
        print(f"[GAMIFICATION] XP Gained: {xp_gain}")

        user = await db.get_user(payload.user_id) or {"user_id": payload.user_id, "xp": 0, "level": 1}

        result = gamification_engine.apply_xp_and_level(user, xp_gain)
        print(f"[GAMIFICATION] New Level: {result['new_level']}, New XP: {result['new_xp_total']}")

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
        print(f"[GAMIFICATION] User record updated in MySQL")

        # generate post if leveled up
        if result["leveled_up"]:
            print(f"[GAMIFICATION] User leveled up! Generating post...")
            post = post_generator.generate_level_up_post(payload.user_id, updated_user.get("username") or payload.user_id, result["new_level"], {})
            query = "INSERT INTO social_feed(post_id, user_id, type, timestamp, content) VALUES(%s, %s, %s, %s, %s)"
            await db.execute(query, (post["post_id"], post["user_id"], post["type"], post["timestamp"], str(post["content"])))
            print(f"[GAMIFICATION] Post created and saved to MySQL")

        return {
            "user_id": result["user_id"],
            "xp_gained": result["xp_gained"],
            "new_xp_total": result["new_xp_total"],
            "leveled_up": result["leveled_up"],
            "new_level": result["new_level"],
        }
    except Exception as e:
        print(f"[GAMIFICATION] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/user/{user_id}/class")
async def get_user_class(user_id: str, days: int = Query(7, ge=1, le=30)):
    """Compute user's RPG class from recent daily_logs (last `days`)."""
    try:
        db = await get_db()
        print(f"[GAMIFICATION] Computing RPG class for {user_id}")
        
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
        print(f"[GAMIFICATION] RPG Class determined: {rpg_class}")

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
    except Exception as e:
        print(f"[GAMIFICATION] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
