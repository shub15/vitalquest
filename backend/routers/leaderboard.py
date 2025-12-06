from fastapi import APIRouter
from backend.database.sqlite_client import SQLiteClient
import aiosqlite

router = APIRouter()
db = SQLiteClient()


@router.on_event("startup")
async def startup():
    await db.init()


@router.get("/global")
async def global_leaderboard(period: str = "weekly"):
    # simple global top 10 by xp
    async with aiosqlite.connect(db.db_path) as conn:
        conn.row_factory = aiosqlite.Row
        cur = await conn.execute("SELECT user_id, username, level, xp FROM users ORDER BY xp DESC LIMIT 10")
        rows = await cur.fetchall()
        rankings = [dict(r) for r in rows]
        return {"period": period, "rankings": rankings}


@router.get("/team/{team_id}")
async def team_leaderboard(team_id: str, period: str = "monthly"):
    async with aiosqlite.connect(db.db_path) as conn:
        conn.row_factory = aiosqlite.Row
        cur = await conn.execute("SELECT user_id, username, level, xp FROM users WHERE team_id = ? ORDER BY xp DESC, level DESC LIMIT 50", (team_id,))
        rows = await cur.fetchall()
        return {"period": period, "team_id": team_id, "rankings": [dict(r) for r in rows]}
