import aiomysql
import json
import os
from typing import List, Dict, Any, Optional

class MySQLClient:
    def __init__(
        self,
        host: str = None,
        user: str = None,
        password: str = None,
        database: str = None,
        port: int = None,
    ):
        # Allow configuration via environment variables
        # MYSQL_HOST, MYSQL_USER, MYSQL_PASSWORD, MYSQL_DB, MYSQL_PORT
        self.host = host or os.getenv("MYSQL_HOST", "localhost")
        self.user = user or os.getenv("MYSQL_USER", "root")
        self.password = password or os.getenv("MYSQL_PASSWORD", "")
        self.database = database or os.getenv("MYSQL_DB", "vital_quest")
        self.port = int(port or os.getenv("MYSQL_PORT", 3306))
        self.pool = None

    async def init(self):
        """Initialize connection pool"""
        self.pool = await aiomysql.create_pool(
            host=self.host,
            port=self.port,
            user=self.user,
            password=self.password,
            db=self.database,
            minsize=5,
            maxsize=10
        )

    async def close(self):
        """Close connection pool"""
        if self.pool:
            self.pool.close()
            await self.pool.wait_closed()

    async def execute(self, query: str, params: tuple = ()):
        """Execute query without returning results"""
        async with self.pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute(query, params)
                await conn.commit()

    async def fetch_one(self, query: str, params: tuple = ()) -> Optional[Dict]:
        """Fetch single row"""
        async with self.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute(query, params)
                return await cursor.fetchone()

    async def fetch_all(self, query: str, params: tuple = ()) -> List[Dict]:
        """Fetch all rows"""
        async with self.pool.acquire() as conn:
            async with conn.cursor(aiomysql.DictCursor) as cursor:
                await cursor.execute(query, params)
                return await cursor.fetchall()

    # User operations
    async def upsert_user(self, user_data: Dict):
        """Insert or update user"""
        query = """
        INSERT INTO users (user_id, username, team_id, level, xp, strength, vitality, stamina)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
            username = VALUES(username),
            team_id = VALUES(team_id),
            level = VALUES(level),
            xp = VALUES(xp),
            strength = VALUES(strength),
            vitality = VALUES(vitality),
            stamina = VALUES(stamina)
        """
        params = (
            user_data.get("user_id"),
            user_data.get("username"),
            user_data.get("team_id"),
            user_data.get("level", 1),
            user_data.get("xp", 0),
            user_data.get("strength", 0),
            user_data.get("vitality", 0),
            user_data.get("stamina", 0),
        )
        await self.execute(query, params)

    async def get_user(self, user_id: str) -> Optional[Dict]:
        """Get user by ID"""
        query = "SELECT * FROM users WHERE user_id = %s"
        return await self.fetch_one(query, (user_id,))

    async def insert_health(self, health_data: Dict):
        """Insert health data (stored in daily_logs)"""
        query = """
        INSERT INTO daily_logs (user_id, date, data)
        VALUES (%s, %s, %s)
        """
        params = (
            health_data.get("user_id"),
            health_data.get("date"),
            json.dumps(health_data),
        )
        await self.execute(query, params)

    async def insert_daily_log(self, user_id: str, date: str, log_json: str):
        """Insert daily log"""
        query = """
        INSERT INTO daily_logs (user_id, date, data)
        VALUES (%s, %s, %s)
        """
        params = (user_id, date, log_json)
        await self.execute(query, params)

    async def get_daily_logs_for_user_range(self, user_id: str, start_date: str, end_date: str) -> List[str]:
        """Get all daily logs for user in date range"""
        query = """
        SELECT data
        FROM daily_logs
        WHERE user_id = %s AND date BETWEEN %s AND %s
        ORDER BY date DESC
        """
        rows = await self.fetch_all(query, (user_id, start_date, end_date))
        return [row["data"] if isinstance(row["data"], str) else json.dumps(row["data"]) for row in rows]

    async def get_daily_logs_for_team_range(self, team_id: str, start_date: str, end_date: str) -> List[str]:
        """Get all daily logs for team in date range"""
        query = """
        SELECT dl.data
        FROM daily_logs dl
        JOIN users u ON dl.user_id = u.user_id
        WHERE u.team_id = %s AND dl.date BETWEEN %s AND %s
        ORDER BY dl.date DESC
        """
        rows = await self.fetch_all(query, (team_id, start_date, end_date))
        return [row["data"] if isinstance(row["data"], str) else json.dumps(row["data"]) for row in rows]

    async def insert_social_post(self, post_data: Dict):
        """Insert social feed post"""
        query = """
        INSERT INTO social_feed (post_id, user_id, type, timestamp, content)
        VALUES (%s, %s, %s, %s, %s)
        ON DUPLICATE KEY UPDATE
            content = VALUES(content)
        """
        params = (
            post_data.get("post_id"),
            post_data.get("user_id"),
            post_data.get("type"),
            post_data.get("timestamp"),
            json.dumps(post_data.get("content", {})),
        )
        await self.execute(query, params)

    async def get_user_feed(self, user_id: str, limit: int = 20) -> List[Dict]:
        """Get user's social feed"""
        query = """
        SELECT post_id, user_id, type, timestamp, content
        FROM social_feed
        WHERE user_id = %s
        ORDER BY timestamp DESC
        LIMIT %s
        """
        rows = await self.fetch_all(query, (user_id, limit))
        for row in rows:
            if isinstance(row["content"], str):
                row["content"] = json.loads(row["content"])
        return rows

    async def get_team_feed(self, team_id: str, limit: int = 20) -> List[Dict]:
        """Get team's social feed"""
        query = """
        SELECT sf.post_id, sf.user_id, sf.type, sf.timestamp, sf.content
        FROM social_feed sf
        JOIN users u ON sf.user_id = u.user_id
        WHERE u.team_id = %s
        ORDER BY sf.timestamp DESC
        LIMIT %s
        """
        rows = await self.fetch_all(query, (team_id, limit))
        for row in rows:
            if isinstance(row["content"], str):
                row["content"] = json.loads(row["content"])
        return rows

    # Battle operations
    async def create_battle(self, battle_id: str, team_a: str, team_b: str, start_date: str, end_date: str):
        """Create new battle"""
        scores = json.dumps({team_a: 0, team_b: 0})
        query = """
        INSERT INTO battles (battle_id, team_a_id, team_b_id, start_date, end_date, status, scores)
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """
        params = (battle_id, team_a, team_b, start_date, end_date, "active", scores)
        await self.execute(query, params)

    async def get_battle(self, battle_id: str) -> Optional[Dict]:
        """Get battle by ID"""
        query = "SELECT * FROM battles WHERE battle_id = %s"
        row = await self.fetch_one(query, (battle_id,))
        if row and isinstance(row.get("scores"), str):
            row["scores"] = json.loads(row["scores"])
        return row

    async def get_active_battles(self) -> List[Dict]:
        """Get all active battles"""
        query = "SELECT * FROM battles WHERE status = %s"
        rows = await self.fetch_all(query, ("active",))
        for row in rows:
            if isinstance(row.get("scores"), str):
                row["scores"] = json.loads(row["scores"])
        return rows

    async def update_battle_scores(self, battle_id: str, scores: Dict):
        """Update battle scores"""
        query = "UPDATE battles SET scores = %s WHERE battle_id = %s"
        params = (json.dumps(scores), battle_id)
        await self.execute(query, params)

    # Leaderboard operations
    async def get_global_leaderboard(self, limit: int = 10) -> List[Dict]:
        """Get global leaderboard"""
        query = """
        SELECT user_id, username, level, xp
        FROM users
        ORDER BY xp DESC, level DESC
        LIMIT %s
        """
        return await self.fetch_all(query, (limit,))

    async def get_team_leaderboard(self, team_id: str, limit: int = 50) -> List[Dict]:
        """Get team leaderboard"""
        query = """
        SELECT user_id, username, level, xp
        FROM users
        WHERE team_id = %s
        ORDER BY xp DESC, level DESC
        LIMIT %s
        """
        return await self.fetch_all(query, (team_id, limit))

    # Meta operations
    async def get_meta(self, key: str) -> Optional[str]:
        """Get meta value by key"""
        query = "SELECT value_data FROM meta WHERE key_name = %s"
        row = await self.fetch_one(query, (key,))
        return row["value_data"] if row else None

    async def set_meta(self, key: str, value: str):
        """Set meta key-value"""
        query = """
        INSERT INTO meta (key_name, value_data)
        VALUES (%s, %s)
        ON DUPLICATE KEY UPDATE
            value_data = VALUES(value_data)
        """
        params = (key, value)
        await self.execute(query, params)
