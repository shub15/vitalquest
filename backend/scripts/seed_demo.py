import asyncio
import json
from backend.database.sqlite_client import SQLiteClient
import aiosqlite
from backend.services import aggregator


async def seed_and_run():
    db = SQLiteClient()
    await db.init()

    # upsert two users in different teams
    await db.upsert_user({
        "user_id": "user_a",
        "username": "alice",
        "team_id": "team_alpha",
        "level": 5,
        "xp": 1200,
    })

    await db.upsert_user({
        "user_id": "user_b",
        "username": "bob",
        "team_id": "team_beta",
        "level": 4,
        "xp": 900,
    })

    # insert daily logs for both users covering the battle window
    daily_a = {
        "date": "2025-12-05",
        "total_steps": 10000,
        "total_calories_active": 600,
        "sleep_segments": [{"stage": "deep", "duration_minutes": 60}],
        "manual_workouts": [{"activity_type": "Run", "duration_minutes": 30, "intensity_rpe": 6, "calories_burnt": 250}],
    }

    daily_b = {
        "date": "2025-12-05",
        "total_steps": 3000,
        "total_calories_active": 400,
        "sleep_segments": [{"stage": "deep", "duration_minutes": 90}],
        "manual_workouts": [{"activity_type": "Gym", "duration_minutes": 60, "intensity_rpe": 7, "calories_burnt": 500}],
    }

    await db.insert_daily_log("user_a", daily_a["date"], json.dumps(daily_a))
    await db.insert_daily_log("user_b", daily_b["date"], json.dumps(daily_b))

    # create a battle between teams for that date range
    battle_id = "battle_demo"
    async with aiosqlite.connect(db.db_path) as conn:
        await conn.execute(
            "INSERT OR REPLACE INTO battles(battle_id, team_a_id, team_b_id, start_date, end_date, status, scores) VALUES(?,?,?,?,?,?,?)",
            (battle_id, "team_alpha", "team_beta", "2025-12-05", "2025-12-05", "active", json.dumps({})),
        )
        await conn.commit()

    # run aggregation once
    await aggregator.aggregate_once(db)

    # read back battle
    async with aiosqlite.connect(db.db_path) as conn:
        conn.row_factory = aiosqlite.Row
        cur = await conn.execute("SELECT * FROM battles WHERE battle_id = ?", (battle_id,))
        row = await cur.fetchone()
        print("Battle row:")
        print(dict(row))


if __name__ == "__main__":
    # support optional args: number of users to generate for demo
    import sys
    n = 2
    if len(sys.argv) > 1:
        try:
            n = int(sys.argv[1])
        except Exception:
            pass

    async def run_many():
        # initialize local DB client for generating many users
        from backend.database.sqlite_client import SQLiteClient
        db_local = SQLiteClient()
        await db_local.init()

        # if n > 2, generate more users and random logs
        if n > 2:
            import random
            for i in range(3, n+1):
                uid = f"user_{i}"
                team = "team_alpha" if i % 2 == 0 else "team_beta"
                await db_local.upsert_user({"user_id": uid, "username": f"user{i}", "team_id": team, "level": 1, "xp": 0})
                # create a random daily log
                daily = {
                    "date": "2025-12-05",
                    "total_steps": random.randint(1000, 15000),
                    "total_calories_active": random.randint(200, 800),
                    "sleep_segments": [{"stage": "deep", "duration_minutes": random.randint(20, 120)}],
                    "manual_workouts": [{"activity_type": random.choice(["Run","Gym","Yoga"]), "duration_minutes": random.randint(10,90), "intensity_rpe": random.randint(3,9), "calories_burnt": random.randint(50,600)}]
                }
                await db_local.insert_daily_log(uid, daily["date"], json.dumps(daily))

        # run base seeding and aggregation
        await seed_and_run()

    asyncio.run(run_many())
