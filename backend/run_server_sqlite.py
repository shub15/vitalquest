#!/usr/bin/env python3
"""
Standalone server for testing without MySQL - Analysis endpoints only
"""

import os
import logging

logging.basicConfig(level=logging.INFO)

from fastapi import FastAPI, HTTPException
from backend.models.schemas import DailyLog
import uvicorn

# Create a minimal FastAPI app with only analysis endpoints
app = FastAPI(
    title="Vital Quest Backend (Standalone Mode)",
    version="2.0-standalone",
    description="Analysis-only backend for testing without MySQL"
)

# Analysis endpoints that work without DB
@app.post("/analyze/recovery")
async def analyze_recovery(log: DailyLog):
    """Calculate recovery score from daily log"""
    try:
        from backend.app.logic import calculate_recovery_score
        return calculate_recovery_score(log)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/battle")
async def analyze_battle(log: DailyLog):
    """Calculate battle score from daily log"""
    try:
        from backend.app.logic import calculate_battle_score
        return calculate_battle_score(log)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/coach")
async def analyze_coach(request: dict):
    """Get AI coach feedback"""
    try:
        from backend.services.ai_service import get_coach_feedback
        from backend.app.logic import calculate_recovery_score
        
        log = DailyLog(**request["log"])
        context = request.get("context", "PLANNING")
        
        # Calculate recovery to get metrics for AI
        recovery = calculate_recovery_score(log)
        
        # Ensure RHR is not None (default to 65.0)
        rhr_value = recovery.get("rhr") or 65.0
        
        # Get AI feedback
        if context == "PLANNING":
            feedback_result = await get_coach_feedback(
                context_type="PLANNING",
                recovery_score=recovery["score"],
                deep_sleep=recovery["deep_sleep_minutes"],
                rhr=rhr_value
            )
        else:  # ANALYSIS
            if log.manual_workouts:
                last_workout = log.manual_workouts[-1]
                feedback_result = await get_coach_feedback(
                    context_type="ANALYSIS",
                    recovery_score=recovery["score"],
                    deep_sleep=recovery["deep_sleep_minutes"],
                    rhr=rhr_value,
                    activity_type=last_workout.activity_type,
                    calories_burnt=last_workout.calories_burnt
                )
            else:
                return {"feedback": "No workout data available for analysis"}
        
        return {"feedback": feedback_result.get("feedback", "No feedback available")}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Coach Error: {str(e)}")

@app.get("/recap/{timeframe}")
async def get_recap(timeframe: str):
    """Placeholder for recap endpoint - requires database"""
    return {
        "title": f"{timeframe.capitalize()} Recap (Database Required)",
        "period_days": 0,
        "total_steps": 0,
        "avg_steps": 0,
        "total_calories": 0,
        "avg_calories": 0,
        "total_sleep_hours": 0,
        "avg_sleep_hours": 0,
        "deep_sleep_minutes": 0,
        "total_workouts": 0,
        "favorite_activity": "N/A",
        "avg_recovery_score": 0,
        "error": "This feature requires MySQL database. Please use full server mode.",
        "timeframe": timeframe
    }

@app.get("/health")
async def health():
    return {"status": "ok", "message": "vital_quest backend running (Standalone mode)", "db": "None (stateless)"}

@app.get("/")
async def root():
    return {
        "message": "Vital Quest Backend - Standalone Mode",
        "status": "running",
        "mode": "stateless",
        "note": "Analysis endpoints only. No database persistence.",
        "api_docs": "/docs"
    }

if __name__ == "__main__":
    print("\n" + "="*80)
    print("VITAL QUEST SERVER - STANDALONE MODE (NO DATABASE REQUIRED)")
    print("="*80)
    print("\nAvailable endpoints:")
    print("  - POST /analyze/recovery  - Calculate recovery score")
    print("  - POST /analyze/battle    - Calculate battle score")
    print("  - POST /analyze/coach     - Get AI coach feedback")
    print("  - GET  /recap/{timeframe} - Placeholder (requires DB)")
    print("  - GET  /health            - Health check")
    print("  - GET  /docs              - API documentation")
    print("\nStarting server on http://127.0.0.1:8000")
    print("="*80 + "\n")
    
    try:
        uvicorn.run(
            app,
            host="127.0.0.1",
            port=8000,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n\nServer stopped by user")
    except Exception as e:
        print(f"\n\n✗ Server error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
