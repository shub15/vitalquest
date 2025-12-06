from fastapi import APIRouter, Query
from backend.database.sqlite_client import SQLiteClient
import aiosqlite
from backend.services import post_generator, gamification_engine
from backend.models.schemas import DailyLog
from fastapi import Body
import json

router = APIRouter()
db = SQLiteClient()


@router.on_event("startup")
async def startup():
    await db.init()


@router.get("/user/{user_id}")
async def get_user_feed(user_id: str, limit: int = 20):
    async with aiosqlite.connect(db.db_path) as conn:
        conn.row_factory = aiosqlite.Row
        cur = await conn.execute("SELECT * FROM social_feed WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?", (user_id, limit))
        rows = await cur.fetchall()
        return {"posts": [dict(r) for r in rows]}


@router.get("/team/{team_id}")
async def get_team_feed(team_id: str, limit: int = 20):
    # simple: fetch posts where user in team by joining users
    async with aiosqlite.connect(db.db_path) as conn:
        conn.row_factory = aiosqlite.Row
        cur = await conn.execute(
            "SELECT sf.* FROM social_feed sf JOIN users u ON sf.user_id = u.user_id WHERE u.team_id = ? ORDER BY sf.timestamp DESC LIMIT ?",
            (team_id, limit),
        )
        rows = await cur.fetchall()
        return {"posts": [dict(r) for r in rows]}


@router.post("/generate-daily-post")
async def generate_daily_post(user_id: str, username: str, date: str, total_steps: int, total_calories_active: float, sleep_segments: list = Query(None), heart_rate_samples: list = Query(None), manual_workouts: list = Query(None)):
    """One-click: generate a daily summary post (random image) and store it."""
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
    async with aiosqlite.connect(db.db_path) as conn:
        await conn.execute(
            "INSERT OR REPLACE INTO social_feed(post_id, user_id, type, timestamp, content) VALUES(?,?,?,?,?)",
            (post["post_id"], post["user_id"], post["type"], post["timestamp"], json.dumps(post["content"])),
        )
        await conn.commit()
    # store full daily log for aggregation
    try:
        await db.insert_daily_log(user_id, date, json.dumps(daily_log_dict))
    except Exception:
        pass
    return {"post": post}


@router.post("/post")
async def create_manual_post(payload: dict = Body(...)):
    """Manual post creation endpoint (stretch)"""
    # payload should contain post_id,user_id,type,timestamp,content
    required = ("post_id", "user_id", "type", "timestamp", "content")
    for k in required:
        if k not in payload:
            return {"error": "missing_field", "field": k}
    async with aiosqlite.connect(db.db_path) as conn:
        await conn.execute(
            "INSERT OR REPLACE INTO social_feed(post_id, user_id, type, timestamp, content) VALUES(?,?,?,?,?)",
            (payload["post_id"], payload["user_id"], payload["type"], payload["timestamp"], json.dumps(payload["content"])),
        )
        await conn.commit()
    return {"status": "ok", "post_id": payload["post_id"]}
