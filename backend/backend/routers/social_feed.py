from fastapi import APIRouter, Query, HTTPException
from backend.database.mysql_client import MySQLClient
from backend.services import post_generator, gamification_engine
from backend.models.schemas import DailyLog
from fastapi import Body
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


@router.get("/user/{user_id}")
async def get_user_feed(user_id: str, limit: int = 20):
    try:
        db = await get_db()
        print(f"[SOCIAL] Fetching feed for user: {user_id}")
        query = "SELECT * FROM social_feed WHERE user_id = %s ORDER BY timestamp DESC LIMIT %s"
        posts = await db.fetch_all(query, (user_id, limit))
        print(f"[SOCIAL] Found {len(posts)} posts for user")
        return {"posts": posts, "message": "Data retrieved from MySQL"}
    except Exception as e:
        print(f"[SOCIAL] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/team/{team_id}")
async def get_team_feed(team_id: str, limit: int = 20):
    try:
        db = await get_db()
        print(f"[SOCIAL] Fetching feed for team: {team_id}")
        # simple: fetch posts where user in team by joining users
        query = """SELECT sf.* FROM social_feed sf 
                   JOIN users u ON sf.user_id = u.user_id 
                   WHERE u.team_id = %s 
                   ORDER BY sf.timestamp DESC LIMIT %s"""
        posts = await db.fetch_all(query, (team_id, limit))
        print(f"[SOCIAL] Found {len(posts)} posts for team")
        return {"posts": posts, "message": "Data retrieved from MySQL"}
    except Exception as e:
        print(f"[SOCIAL] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/generate-daily-post")
async def generate_daily_post(user_id: str, username: str, date: str, total_steps: int, total_calories_active: float, sleep_segments: list = Query(None), heart_rate_samples: list = Query(None), manual_workouts: list = Query(None)):
    """One-click: generate a daily summary post (random image) and store it."""
    try:
        db = await get_db()
        print(f"[SOCIAL] Generating daily post for {user_id}")
        
        # build daily_log dict from params
        daily_log_dict = {
            "date": date,
            "total_steps": total_steps,
            "total_calories_active": total_calories_active,
            "sleep_segments": sleep_segments or [],
            "heart_rate_samples": heart_rate_samples or [],
            "manual_workouts": manual_workouts or []
        }

        post = post_generator.generate_daily_post(user_id, username, daily_log_dict)
        query = "INSERT INTO social_feed(post_id, user_id, type, timestamp, content) VALUES(%s, %s, %s, %s, %s)"
        await db.execute(query, (post["post_id"], post["user_id"], post["type"], post["timestamp"], json.dumps(post["content"])))
        print(f"[SOCIAL] Post saved to MySQL: {post['post_id']}")
        
        # store full daily log for aggregation
        try:
            await db.insert_daily_log(user_id, date, json.dumps(daily_log_dict))
            print(f"[SOCIAL] Daily log stored in MySQL")
        except Exception as e:
            print(f"[SOCIAL] Warning: Could not store daily log: {str(e)}")
        
        return {"post": post, "message": "Post created and saved to MySQL"}
    except Exception as e:
        print(f"[SOCIAL] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/post")
async def create_manual_post(payload: dict = Body(...)):
    """Manual post creation endpoint (stretch)"""
    try:
        db = await get_db()
        print(f"[SOCIAL] Creating manual post")
        
        # payload should contain post_id,user_id,type,timestamp,content
        required = ("post_id", "user_id", "type", "timestamp", "content")
        for k in required:
            if k not in payload:
                return {"error": "missing_field", "field": k}
        
        query = "INSERT INTO social_feed(post_id, user_id, type, timestamp, content) VALUES(%s, %s, %s, %s, %s)"
        await db.execute(query, (payload["post_id"], payload["user_id"], payload["type"], payload["timestamp"], json.dumps(payload["content"])))
        print(f"[SOCIAL] Manual post saved to MySQL: {payload['post_id']}")
        
        return {"status": "ok", "post_id": payload["post_id"], "message": "Post saved to MySQL"}
    except Exception as e:
        print(f"[SOCIAL] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
