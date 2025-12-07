<<<<<<< HEAD
# Vital Quest Backend (SQLite PoC)

Quick local backend implementing gamification, battle scoring, leaderboards and social feed.

Run (Windows PowerShell):

```powershell
python -m pip install -r requirements.txt
uvicorn backend.main:app --reload --port 8000
```

Endpoints to try (after server is running):

- Health: `GET http://localhost:8000/health`
- Calculate XP: `POST http://localhost:8000/api/rpg/calculate-xp` body JSON (see example below)
- Global leaderboard: `GET http://localhost:8000/api/leaderboard/global`
- Team leaderboard: `GET http://localhost:8000/api/leaderboard/team/{team_id}`
- Create battle: `POST http://localhost:8000/api/battles/create`
- Generate daily post: `POST http://localhost:8000/api/feed/generate-daily-post` (body: `daily_log` JSON, pass `user_id` and `username` as query params)

Example calculate-xp payload:

```json
{
  "user_id": "user_123",
  "date": "2025-12-06",
  "steps": 3101,
  "heart_rate_avg": 82,
  "sleep_total_minutes": 198,
  "sleep_deep_minutes": 76,
  "sleep_light_minutes": 122,
  "calories_burned": 1486
}
```

How to verify the XP flow (demo 1):

1. Start server.
2. POST the payload to `/api/rpg/calculate-xp`.
3. Observe returned XP, new level flag.
4. Check `GET /api/leaderboard/global` to see user xp.

Run tests:

```powershell
python -m pytest -q
```
=======
# periscope_hack-
>>>>>>> 2787551a1ca14fe126d5ccec9d233aedbfb19e6e
