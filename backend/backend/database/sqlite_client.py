import aiosqlite
import asyncio
from typing import Optional, Dict, Any

DB_PATH = "./vital_quest.db"

class SQLiteClient:
    def __init__(self, db_path: str = DB_PATH):
        self.db_path = db_path

    async def init(self):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("PRAGMA foreign_keys = ON;")
            await db.execute(
                """
                CREATE TABLE IF NOT EXISTS users (
                    user_id TEXT PRIMARY KEY,
                    username TEXT,
                    team_id TEXT,
                    level INTEGER DEFAULT 1,
                    xp INTEGER DEFAULT 0,
                    strength REAL DEFAULT 0,
                    vitality REAL DEFAULT 0,
                    stamina REAL DEFAULT 0
                )
                """
            )
            await db.execute(
                """
                CREATE TABLE IF NOT EXISTS health_data (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT,
                    date TEXT,
                    steps INTEGER,
                    heart_rate_avg REAL,
                    sleep_total_minutes INTEGER,
                    calories_burned REAL,
                    FOREIGN KEY(user_id) REFERENCES users(user_id)
                )
                """
            )
            await db.execute(
                """
                CREATE TABLE IF NOT EXISTS daily_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id TEXT,
                    date TEXT,
                    content TEXT,
                    FOREIGN KEY(user_id) REFERENCES users(user_id)
                )
                """
            )
            await db.execute(
                """
                CREATE TABLE IF NOT EXISTS meta (
                    key TEXT PRIMARY KEY,
                    value TEXT
                )
                """
            )
            await db.execute(
                """
                CREATE TABLE IF NOT EXISTS battles (
                    battle_id TEXT PRIMARY KEY,
                    team_a_id TEXT,
                    team_b_id TEXT,
                    start_date TEXT,
                    end_date TEXT,
                    status TEXT,
                    scores TEXT
                )
                """
            )
            await db.execute(
                """
                CREATE TABLE IF NOT EXISTS social_feed (
                    post_id TEXT PRIMARY KEY,
                    user_id TEXT,
                    type TEXT,
                    timestamp TEXT,
                    content TEXT
                )
                """
            )
            await db.commit()

    async def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cur = await db.execute("SELECT * FROM users WHERE user_id = ?", (user_id,))
            row = await cur.fetchone()
            return dict(row) if row else None

    async def upsert_user(self, user: Dict[str, Any]):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                "INSERT INTO users(user_id, username, team_id, level, xp, strength, vitality, stamina) VALUES(?,?,?,?,?,?,?,?)\n                ON CONFLICT(user_id) DO UPDATE SET username=excluded.username, team_id=excluded.team_id, level=excluded.level, xp=excluded.xp, strength=excluded.strength, vitality=excluded.vitality, stamina=excluded.stamina",
                (
                    user["user_id"],
                    user.get("username"),
                    user.get("team_id"),
                    user.get("level", 1),
                    user.get("xp", 0),
                    user.get("strength", 0),
                    user.get("vitality", 0),
                    user.get("stamina", 0),
                ),
            )
            await db.commit()

    async def insert_health(self, health: Dict[str, Any]):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                "INSERT INTO health_data(user_id, date, steps, heart_rate_avg, sleep_total_minutes, calories_burned) VALUES(?,?,?,?,?,?)",
                (
                    health["user_id"],
                    health["date"],
                    health.get("steps", 0),
                    health.get("heart_rate_avg", 0),
                    health.get("sleep_total_minutes", 0),
                    health.get("calories_burned", 0),
                ),
            )
            await db.commit()

    async def insert_daily_log(self, user_id: str, date: str, content: str):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute(
                "INSERT INTO daily_logs(user_id, date, content) VALUES(?,?,?)",
                (user_id, date, content),
            )
            await db.commit()

    async def get_daily_logs_for_team_range(self, team_id: str, start_date: str, end_date: str):
        """Return list of daily_log content dicts for all users in a team within inclusive date range."""
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cur = await db.execute(
                "SELECT dl.content FROM daily_logs dl JOIN users u ON dl.user_id = u.user_id WHERE u.team_id = ? AND dl.date >= ? AND dl.date <= ?",
                (team_id, start_date, end_date),
            )
            rows = await cur.fetchall()
            return [r["content"] for r in rows]

    async def get_daily_logs_for_user_range(self, user_id: str, start_date: str, end_date: str):
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cur = await db.execute(
                "SELECT content FROM daily_logs WHERE user_id = ? AND date >= ? AND date <= ?",
                (user_id, start_date, end_date),
            )
            rows = await cur.fetchall()
            return [r["content"] for r in rows]

    async def set_meta(self, key: str, value: str):
        async with aiosqlite.connect(self.db_path) as db:
            await db.execute("INSERT OR REPLACE INTO meta(key, value) VALUES(?,?)", (key, value))
            await db.commit()

    async def get_meta(self, key: str):
        async with aiosqlite.connect(self.db_path) as db:
            db.row_factory = aiosqlite.Row
            cur = await db.execute("SELECT value FROM meta WHERE key = ?", (key,))
            row = await cur.fetchone()
            return row["value"] if row else None
