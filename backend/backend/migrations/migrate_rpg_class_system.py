#!/usr/bin/env python3
"""
Database Migration - RPG Class System Update
Updates users table with rpg_class field and adds demo users with classes
"""

import asyncio
import os
from backend.database.mysql_client import MySQLClient
from datetime import datetime

# Database configuration
MYSQL_HOST = os.getenv("MYSQL_HOST", "127.0.0.1")
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "Abhijit@2005")
MYSQL_DB = os.getenv("MYSQL_DB", "vital_quest")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", 3306))

async def migrate():
    """Update database with RPG class system"""
    
    print("="*80)
    print(" DATABASE MIGRATION - RPG Class System")
    print("="*80)
    print()
    
    db = MySQLClient(
        host=MYSQL_HOST,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DB,
        port=MYSQL_PORT
    )
    
    try:
        await db.init()
        print("[DATABASE] Connected to MySQL")
        
        # Check if rpg_class column already exists
        print("[CHECKING] Verifying if rpg_class column exists...")
        check_query = """
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'rpg_class'
        """
        result = await db.fetch_all(check_query)
        
        if not result:
            # Add column if it doesn't exist
            print("[MIGRATING] Adding rpg_class column to users table...")
            alter_query = """
            ALTER TABLE users ADD COLUMN rpg_class VARCHAR(50) DEFAULT 'Villager'
            """
            await db.execute(alter_query)
            print("[SUCCESS] rpg_class column added to users table")
        else:
            print("[INFO] rpg_class column already exists!")
        
        # Add demo users with different RPG classes
        print("\n[DEMO DATA] Adding demo users with RPG classes...")
        
        demo_users = [
            {
                "user_id": "warrior_001",
                "username": "IronFist",
                "level": 5,
                "xp": 250,
                "rpg_class": "Warrior",
                "strength": 18.5,
                "vitality": 12.0,
                "stamina": 14.0
            },
            {
                "user_id": "assassin_001",
                "username": "SwiftRunner",
                "level": 4,
                "xp": 180,
                "rpg_class": "Assassin",
                "strength": 10.0,
                "vitality": 14.5,
                "stamina": 16.0
            },
            {
                "user_id": "monk_001",
                "username": "ZenMaster",
                "level": 6,
                "xp": 320,
                "rpg_class": "Monk",
                "strength": 12.0,
                "vitality": 16.0,
                "stamina": 18.5
            },
            {
                "user_id": "villager_001",
                "username": "NewbieAdventurer",
                "level": 1,
                "xp": 0,
                "rpg_class": "Villager",
                "strength": 8.0,
                "vitality": 8.0,
                "stamina": 8.0
            },
        ]
        
        for user in demo_users:
            try:
                query = """
                INSERT INTO users (user_id, username, level, xp, rpg_class, strength, vitality, stamina)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    username = VALUES(username),
                    level = VALUES(level),
                    xp = VALUES(xp),
                    rpg_class = VALUES(rpg_class),
                    strength = VALUES(strength),
                    vitality = VALUES(vitality),
                    stamina = VALUES(stamina)
                """
                await db.execute(query, (
                    user["user_id"],
                    user["username"],
                    user["level"],
                    user["xp"],
                    user["rpg_class"],
                    user["strength"],
                    user["vitality"],
                    user["stamina"]
                ))
                print(f"  ✓ Added/Updated: {user['username']} ({user['rpg_class']})")
            except Exception as e:
                print(f"  ✗ Error adding {user['username']}: {str(e)}")
        
        # Verify users were created
        print("\n[VERIFICATION] Demo users in database:")
        verify_query = "SELECT user_id, username, rpg_class, level, xp FROM users WHERE rpg_class IN ('Warrior', 'Assassin', 'Monk', 'Villager')"
        users = await db.fetch_all(verify_query)
        for u in users:
            print(f"  • {u['username']:20} | Class: {u['rpg_class']:12} | Level: {u['level']} | XP: {u['xp']}")
        
        print("\n[MIGRATION COMPLETE]")
        print("\n✅ RPG Class System Ready:")
        print("   - Gym workouts → Warrior")
        print("   - Walk workouts → Assassin")
        print("   - Yoga workouts → Monk")
        print("   - No/Low workouts → Villager")
        print("\n   Demo users created and ready for testing!")
        
    except Exception as e:
        print(f"[ERROR] Migration failed: {str(e)}")
        raise
    finally:
        await db.close()

if __name__ == "__main__":
    asyncio.run(migrate())
