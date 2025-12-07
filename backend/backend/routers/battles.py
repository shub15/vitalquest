from fastapi import APIRouter, HTTPException
from backend.models.schemas import BattleCreate
from backend.database.mysql_client import MySQLClient

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


@router.post("/create")
async def create_battle(battle: BattleCreate):
    try:
        db = await get_db()
        battle_id = f"battle_{battle.team_a_id}_{battle.team_b_id}_{battle.start_date}"
        
        print(f"[BATTLES] Creating battle: {battle_id}")
        
        await db.create_battle(
            battle_id,
            battle.team_a_id,
            battle.team_b_id,
            battle.start_date,
            battle.end_date,
        )
        
        print(f"[BATTLES] Battle created successfully: {battle_id}")
        return {"battle_id": battle_id, "status": "active", "message": "Battle saved to MySQL"}
    except Exception as e:
        print(f"[BATTLES] Error creating battle: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{battle_id}/leaderboard")
async def get_battle_leaderboard(battle_id: str):
    try:
        db = await get_db()
        print(f"[BATTLES] Fetching battle: {battle_id}")
        
        battle = await db.get_battle(battle_id)
        if not battle:
            raise HTTPException(status_code=404, detail="Battle not found")

        print(f"[BATTLES] Battle found: {battle}")
        
        scores = battle.get("scores") or {}
        teams = []
        rank = 1
        for team_id, score in sorted(scores.items(), key=lambda x: x[1], reverse=True):
            teams.append({"team_id": team_id, "battle_score": score, "rank": rank})
            rank += 1

        return {"battle_id": battle_id, "teams": teams, "message": "Data retrieved from MySQL"}
    except Exception as e:
        print(f"[BATTLES] Error fetching leaderboard: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
