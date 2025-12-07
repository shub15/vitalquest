#!/usr/bin/env python3
"""
Database Migration - Add FCM token support to users table
"""

import asyncio
import os
from backend.database.mysql_client import MySQLClient

# Database configuration
MYSQL_HOST = os.getenv("MYSQL_HOST", "127.0.0.1")
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "Abhijit@2005")
MYSQL_DB = os.getenv("MYSQL_DB", "vital_quest")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", 3306))

async def migrate_add_fcm_token():
    """Add fcm_token column to users table"""
    
    print("="*80)
    print(" DATABASE MIGRATION - Add FCM Token Support")
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
        
        # Check if column already exists
        print("[CHECKING] Verifying if fcm_token column exists...")
        check_query = """
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'users' AND COLUMN_NAME = 'fcm_token'
        """
        result = await db.fetch_all(check_query)
        
        if result:
            print("[INFO] fcm_token column already exists!")
            return
        
        # Add column if it doesn't exist
        print("[MIGRATING] Adding fcm_token column to users table...")
        alter_query = """
        ALTER TABLE users ADD COLUMN fcm_token VARCHAR(500) NULL DEFAULT NULL
        """
        await db.execute(alter_query)
        print("[SUCCESS] fcm_token column added to users table")
        
        # Verify migration
        result = await db.fetch_all(check_query)
        if result:
            print("[VERIFIED] Migration successful!")
        
        print()
        print("="*80)
        print(" MIGRATION COMPLETE")
        print("="*80)
        
    except Exception as e:
        print(f"[ERROR] Migration failed: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        await db.close()

if __name__ == "__main__":
    asyncio.run(migrate_add_fcm_token())
