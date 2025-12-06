from fastapi import FastAPI
from backend.routers import gamification, battles, leaderboard, social_feed, admin
from backend.database.sqlite_client import SQLiteClient
from backend.services import aggregator
import asyncio
import logging
from fastapi.responses import RedirectResponse, HTMLResponse

logger = logging.getLogger("backend")

app = FastAPI(title="Vital Quest Backend")

app.include_router(gamification.router, prefix="/api/rpg")
app.include_router(battles.router, prefix="/api/battles")
app.include_router(leaderboard.router, prefix="/api/leaderboard")
app.include_router(social_feed.router, prefix="/api/feed")
app.include_router(admin.router, prefix="/api/admin")


@app.on_event("startup")
async def startup_event():
    # start aggregator background task
    db = SQLiteClient()
    await db.init()
    loop = asyncio.get_event_loop()
    loop.create_task(aggregator.aggregate_active_battles_loop(db))


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/")
async def root():
        """Return a small HTML status page with counts and last aggregation time."""
        db = SQLiteClient()
        await db.init()
        users = await db.get_meta("users_count")
        battles = await db.get_meta("battles_count")
        last_agg = await db.get_meta("last_aggregation")
        html = f"""
        <html>
            <head><title>Vital Quest Status</title></head>
            <body>
                <h1>Vital Quest Backend</h1>
                <ul>
                    <li>Users (approx): {users or 'unknown'}</li>
                    <li>Battles (approx): {battles or 'unknown'}</li>
                    <li>Last aggregation: {last_agg or 'never'}</li>
                </ul>
                <p>See <a href='/docs'>API docs</a>.</p>
            </body>
        </html>
        """
        return HTMLResponse(content=html, status_code=200)
