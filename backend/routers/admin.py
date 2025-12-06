from fastapi import APIRouter, HTTPException
from backend.database.sqlite_client import SQLiteClient
from backend.services import aggregator

router = APIRouter()
db = SQLiteClient()


@router.post("/aggregate-now")
async def aggregate_now():
    """Trigger a single aggregation run (admin/testing only)."""
    try:
        await db.init()
        await aggregator.aggregate_once(db)
        return {"status": "aggregated"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
