from fastapi import APIRouter, HTTPException
from backend.models.schemas import BattleCreate
from backend.database.sqlite_client import SQLiteClient
from backend.services import battle_system
import json
import aiosqlite

router = APIRouter()
db = SQLiteClient()


@router.on_event("startup")
async def startup():
    await db.init()


@router.post("/create")
async def create_battle(battle: BattleCreate):
    # create simple battle record
    battle_id = f"battle_{battle.team_a_id}_{battle.team_b_id}_{battle.start_date}"
    scores = json.dumps({battle.team_a_id: 0, battle.team_b_id: 0})
    async with aiosqlite.connect(db.db_path) as conn:
        await conn.execute(
            "INSERT OR REPLACE INTO battles(battle_id, team_a_id, team_b_id, start_date, end_date, status, scores) VALUES(?,?,?,?,?,?,?)",
            (battle_id, battle.team_a_id, battle.team_b_id, battle.start_date, battle.end_date, "active", scores),
        )
        await conn.commit()
    return {"battle_id": battle_id, "status": "active"}


@router.get("/{battle_id}/leaderboard")
async def get_battle_leaderboard(battle_id: str):
    async with aiosqlite.connect(db.db_path) as conn:
        conn.row_factory = aiosqlite.Row
        cur = await conn.execute("SELECT * FROM battles WHERE battle_id = ?", (battle_id,))
        row = await cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Battle not found")
        scores = json.loads(row["scores"]) if row["scores"] else {}
        # return simple formatted leaderboard
        teams = []
        rank = 1
        for team_id, score in sorted(scores.items(), key=lambda x: x[1], reverse=True):
            teams.append({"team_id": team_id, "battle_score": score, "rank": rank})
            rank += 1
        return {"battle_id": battle_id, "teams": teams}
