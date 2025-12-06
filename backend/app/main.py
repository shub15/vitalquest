from fastapi import FastAPI, HTTPException, Body
from fastapi.staticfiles import StaticFiles
from schemas.vital_quest import DailyLog
from app.logic import calculate_recovery_score, calculate_battle_score
from app.ai_service import get_coach_feedback

app = FastAPI(title="Vital Quest Backend")

@app.post("/analyze/recovery")
def analyze_recovery(log: DailyLog):
    """
    Calculate Recovery Score and Status based on Daily Log.
    """
    try:
        result = calculate_recovery_score(log)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/battle")
def analyze_battle(log: DailyLog):
    """
    Calculate Battle Score based on Rebalanced Logic.
    """
    try:
        result = calculate_battle_score(log)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/analyze/coach")
async def analyze_coach(
    log: DailyLog = Body(...), 
    context: str = Body(..., embed=True) 
):
    """
    Get AI Coach Feedback.
    Context types: "PLANNING", "ANALYSIS"
    """
    try:
        feedback = await get_coach_feedback(context, log)
        return {"feedback": feedback}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Serve Static Files (UI)
# We handle 404s by falling back to index.html for SPA-like feel if needed, 
# but for now standard static serve is fine.
app.mount("/", StaticFiles(directory="static", html=True), name="static")
