#!/usr/bin/env python3
"""
Database Migration: Add step_milestones table
Tracks when users reach step milestones (10, 20, 30, etc.)
"""

import asyncio
import os
from backend.database.mysql_client import MySQLClient

# Set MySQL credentials
os.environ["MYSQL_HOST"] = "127.0.0.1"
os.environ["MYSQL_USER"] = "root"
os.environ["MYSQL_PASSWORD"] = "Abhijit@2005"
os.environ["MYSQL_DB"] = "vital_quest"
os.environ["MYSQL_PORT"] = "3306"

async def migrate():
    """Add step_milestones table to track milestone notifications"""
    db = MySQLClient()
    
    try:
        await db.init()
        print("[DATABASE] Connected to MySQL")
        
        # Check if table exists
        check_query = """
            SELECT COUNT(*) as count 
            FROM information_schema.tables 
            WHERE table_schema = 'vital_quest' 
            AND table_name = 'step_milestones'
        """
        
        result = await db.fetch_one(check_query)
        
        if result and result.get("count", 0) > 0:
            print("[INFO] step_milestones table already exists")
            print("[INFO] Skipping migration")
            return
        
        print("[MIGRATING] Creating step_milestones table...")
        
        create_table_query = """
            CREATE TABLE step_milestones (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id VARCHAR(50) NOT NULL,
                milestone_steps INT NOT NULL,
                notified_at DATETIME NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                INDEX idx_user_milestone (user_id, milestone_steps),
                INDEX idx_user_date (user_id, notified_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
        """
        
        await db.execute(create_table_query)
        print("[SUCCESS] step_milestones table created successfully")
        
        # Verify table creation
        verify_query = """
            SHOW CREATE TABLE step_milestones
        """
        result = await db.fetch_one(verify_query)
        print("[VERIFIED] Table structure confirmed")
        print("\n[MIGRATION COMPLETE] step_milestones table ready for use")
        
        print("\nTable Details:")
        print("  - Tracks step milestone notifications")
        print("  - Prevents duplicate notifications for same milestone")
        print("  - Indexed for fast lookups by user and date")
        
    except Exception as e:
        print(f"[ERROR] Migration failed: {str(e)}")
        import traceback
        traceback.print_exc()
        raise
        
    finally:
        await db.close()
        print("[DATABASE] Connection closed")

if __name__ == "__main__":
    print("="*80)
    print(" STEP MILESTONES TABLE MIGRATION")
    print("="*80)
    print()
    
    asyncio.run(migrate())
