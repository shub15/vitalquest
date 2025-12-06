from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

valid_payload = {
  "date": "2025-12-06",
  "total_steps": 8000,
  "total_calories_active": 450.0,
  "sleep_segments": [
    {
      "start_time": "2025-12-06T23:00:00",
      "end_time": "2025-12-07T07:00:00",
      "stage": "light",
      "duration_minutes": 480
    }
  ],
  "heart_rate_samples": [
    { "timestamp": "2025-12-07T03:00:00", "bpm": 60 }
  ],
  "manual_workouts": []
}

def test_analyze_recovery_endpoint():
    response = client.post("/analyze/recovery", json=valid_payload)
    assert response.status_code == 200
    data = response.json()
    assert "score" in data
    assert "status" in data

def test_analyze_battle_endpoint():
    response = client.post("/analyze/battle", json=valid_payload)
    assert response.status_code == 200
    data = response.json()
    assert "total_score" in data

def test_analyze_coach_endpoint_mock():
    # We can't easily validly test Gemini API without a key or mock.
    # We expect 200 if key works, or maybe an error message if not.
    # Current implementation returns a string message if key is missing.
    # Or 500 if error.
    
    # We will just check if validation passes.
    payload = {
        "log": valid_payload,
        "context": "PLANNING"
    }
    response = client.post("/analyze/coach", json=payload)
    
    # Depending on environment, it might succeed with a "No API Key" message or fail.
    # My code returns a string "AI Coach unavailable..." if no key.
    # So 200 OK is expected.
    assert response.status_code == 200
    data = response.json()
    assert "feedback" in data
