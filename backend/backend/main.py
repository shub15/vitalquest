from fastapi import FastAPI
from backend.routers import gamification, battles, leaderboard, social_feed, admin, ai_coach, chatbot, notifications, step_milestones
from backend.database.mysql_client import MySQLClient
from backend.services import aggregator
import asyncio
import logging
from fastapi.responses import RedirectResponse, HTMLResponse

logger = logging.getLogger("backend")

app = FastAPI(title="Vital Quest Backend", version="2.0", description="Backend with AI Coach & Gamification")

app.include_router(gamification.router, prefix="/gamification", tags=["Gamification"])
app.include_router(battles.router, prefix="/battles", tags=["Battles"])
app.include_router(leaderboard.router, prefix="/leaderboard", tags=["Leaderboard"])
app.include_router(social_feed.router, prefix="/social", tags=["Social"])
app.include_router(admin.router, prefix="/admin", tags=["Admin"])
app.include_router(ai_coach.router, prefix="/ai", tags=["AI Coach"])
app.include_router(chatbot.router, prefix="/api", tags=["AI Chatbot"])
app.include_router(notifications.router, prefix="/notifications", tags=["Notifications"])
app.include_router(step_milestones.router, prefix="/step-milestones", tags=["Step Milestones"])


@app.on_event("startup")
async def startup_event():
    logger.info("✓ Backend startup complete")


@app.get("/health")
async def health():
    return {"status": "ok", "message": "vital_quest backend running"}


@app.get("/")
async def root():
    return {"message": "Vital Quest Backend", "status": "running", "db": "MySQL vital_quest", "api_docs": "/docs"}
