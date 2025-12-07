from fastapi import APIRouter, HTTPException
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


@router.get("/global")
async def global_leaderboard(period: str = "weekly"):
    try:
        db = await get_db()
        print(f"[LEADERBOARD] Fetching global leaderboard")
        
        rankings = await db.get_global_leaderboard(limit=10)
        
        print(f"[LEADERBOARD] Found {len(rankings)} rankings")
        return {"period": period, "rankings": rankings, "message": "Data retrieved from MySQL"}
    except Exception as e:
        print(f"[LEADERBOARD] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/team/{team_id}")
async def team_leaderboard(team_id: str, period: str = "monthly"):
    try:
        db = await get_db()
        print(f"[LEADERBOARD] Fetching team leaderboard for {team_id}")
        
        rankings = await db.get_team_leaderboard(team_id=team_id, limit=50)
        
        print(f"[LEADERBOARD] Found {len(rankings)} team rankings")
        return {"period": period, "team_id": team_id, "rankings": rankings, "message": "Data retrieved from MySQL"}
    except Exception as e:
        print(f"[LEADERBOARD] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
