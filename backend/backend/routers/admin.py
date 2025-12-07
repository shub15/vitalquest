from fastapi import APIRouter, HTTPException
from backend.services import aggregator
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

@router.post("/aggregate-now")
async def aggregate_now():
    """Trigger a single aggregation run (admin/testing only)."""
    try:
        print(f"[ADMIN] Triggering aggregation...")
        db = await get_db()
        await aggregator.aggregate_once(db)
        print(f"[ADMIN] Aggregation completed successfully")
        return {"status": "aggregated", "message": "Data aggregated and saved to MySQL"}
    except Exception as e:
        print(f"[ADMIN] Aggregation error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
