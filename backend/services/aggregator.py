import asyncio
import json
import aiosqlite
from datetime import datetime, date
from backend.database.sqlite_client import SQLiteClient
from backend.services import battle_system

DB_POLL_INTERVAL_SECONDS = 60


async def aggregate_active_battles_loop(db: SQLiteClient):
    """Background loop: periodically scan active battles and update their scores from daily_logs."""
    while True:
        try:
            await aggregate_once(db)
        except Exception:
            # swallow errors to keep loop running
            pass
        await asyncio.sleep(DB_POLL_INTERVAL_SECONDS)


async def aggregate_once(db: SQLiteClient):
    async with aiosqlite.connect(db.db_path) as conn:
        conn.row_factory = aiosqlite.Row
        cur = await conn.execute("SELECT * FROM battles WHERE status = 'active'")
        rows = await cur.fetchall()
        for row in rows:
            battle_id = row["battle_id"]
            team_a = row["team_a_id"]
            team_b = row["team_b_id"]
            start_date = row["start_date"]
            end_date = row["end_date"]

            # fetch daily_logs for teams in range
            team_a_logs_json = await db.get_daily_logs_for_team_range(team_a, start_date, end_date)
            team_b_logs_json = await db.get_daily_logs_for_team_range(team_b, start_date, end_date)

            # parse logs
            def parse_logs(js_list):
                out = []
                for j in js_list:
                    try:
                        out.append(json.loads(j))
                    except Exception:
                        # if already dict
                        out.append(j if isinstance(j, dict) else {})
                return out

            a_logs = parse_logs(team_a_logs_json)
            b_logs = parse_logs(team_b_logs_json)

            team_stats = {team_a: {"user_logs": a_logs}, team_b: {"user_logs": b_logs}}
            scores = battle_system.compute_battle_scores(team_stats)

            # update battles table
            await conn.execute("UPDATE battles SET scores = ? WHERE battle_id = ?", (json.dumps(scores), battle_id))
        await conn.commit()

    # record last aggregation time in meta table
    try:
        await db.set_meta("last_aggregation", datetime.utcnow().isoformat() + "Z")
    except Exception:
        pass

if __name__ == "__main__":
    import sys
    from backend.database.sqlite_client import SQLiteClient

    db_path = sys.argv[1] if len(sys.argv) > 1 else "path_to_your_db.sqlite"

    db = SQLiteClient(db_path)

    loop = asyncio.get_event_loop()
    try:
        loop.run_until_complete(aggregate_active_battles_loop(db))
    except KeyboardInterrupt:
        pass
    finally:
        loop.run_until_complete(db.close())
        loop.close()


