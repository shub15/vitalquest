#!/usr/bin/env python3
"""
Seed MySQL database with 365 days of AI-ready daily logs for all users
This script generates realistic health data and stores it in the vital_quest database
"""

import asyncio
import json
import os
from datetime import datetime, timedelta
from backend.database.mysql_client import MySQLClient
from backend.app.dummy_data import generate_dummy_dailylogs
from backend.models.schemas import DailyLog

# Database configuration
MYSQL_HOST = os.getenv("MYSQL_HOST", "127.0.0.1")
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "Abhijit@2005")
MYSQL_DB = os.getenv("MYSQL_DB", "vital_quest")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", 3306))

# Test users
USERS = ["user_001", "user_002", "user_003", "user_004"]

async def seed_daily_logs():
    """Generate and seed daily logs for all users"""
    
    print("=" * 80)
    print("VITAL QUEST - DATABASE SEEDING WITH AI-READY DAILY LOGS")
    print("=" * 80)
    print()
    
    # Initialize database client
    db = MySQLClient(
        host=MYSQL_HOST,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DB,
        port=MYSQL_PORT
    )
    
    try:
        await db.init()
        print("[DATABASE] Connected to MySQL successfully")
        print(f"[DATABASE] Host: {MYSQL_HOST}, User: {MYSQL_USER}, DB: {MYSQL_DB}")
        print()
        
        # Generate dummy logs (single call for efficiency)
        print("[GENERATING] Creating 365 days of realistic health data...")
        logs = generate_dummy_dailylogs(365)
        print(f"[GENERATED] {len(logs)} DailyLog objects created")
        print()
        
        # Seed data for each user
        total_inserted = 0
        for user_id in USERS:
            print(f"[SEEDING] User: {user_id}")
            print("-" * 80)
            
            # Verify user exists
            user = await db.get_user(user_id)
            if not user:
                print(f"  [ERROR] User {user_id} not found in database!")
                continue
            
            print(f"  Username: {user['username']}, Level: {user['level']}, XP: {user['xp']}")
            
            # Insert all 365 logs for this user
            inserted_count = 0
            for i, log in enumerate(logs):
                try:
                    # Serialize log to JSON
                    log_json = log.model_dump_json() if hasattr(log, 'model_dump_json') else json.dumps(log)
                    
                    # Insert into database
                    await db.insert_daily_log(
                        user_id=user_id,
                        date=log.date.isoformat() if hasattr(log.date, 'isoformat') else str(log.date),
                        log_json=log_json
                    )
                    inserted_count += 1
                    
                    # Progress indicator
                    if (i + 1) % 50 == 0:
                        print(f"  [OK] Inserted {i + 1}/365 logs")
                
                except Exception as e:
                    print(f"  [ERROR] Failed to insert log for {log.date}: {str(e)}")
                    continue
            
            print(f"  [COMPLETE] Inserted {inserted_count}/365 logs for {user_id}")
            total_inserted += inserted_count
            print()
        
        # Verification
        print("[VERIFICATION] Checking seeded data...")
        print("-" * 80)
        
        for user_id in USERS:
            # Get today's date range
            today = datetime.now().date()
            start_date = (today - timedelta(days=365)).isoformat()
            end_date = today.isoformat()
            
            # Query database
            logs_in_db = await db.get_daily_logs_for_user_range(user_id, start_date, end_date)
            print(f"  {user_id}: {len(logs_in_db)} daily logs found in database")
            
            if logs_in_db:
                # Show sample of first log
                first_log = json.loads(logs_in_db[-1]) if isinstance(logs_in_db[-1], str) else logs_in_db[-1]
                print(f"    Sample Log Date: {first_log.get('date', 'N/A')}")
                print(f"    Steps: {first_log.get('steps', 0)}")
                print(f"    Sleep Duration: {first_log.get('sleep_duration_minutes', 0)} min")
        
        print()
        print("=" * 80)
        print(f"[SUCCESS] SEEDING COMPLETE - Total {total_inserted} logs inserted")
        print("=" * 80)
        print()
        print("NEXT STEPS:")
        print("  1. Start the FastAPI server: python run_server.py")
        print("  2. Access Swagger UI: http://127.0.0.1:8001/docs")
        print("  3. Test AI endpoints with the seeded data:")
        print("     - POST /ai/analyze/recovery")
        print("     - POST /ai/coach-morning")
        print("     - POST /ai/coach-postworkout")
        print("     - POST /ai/analyze/weekly")
        print()
        
    except Exception as e:
        print(f"[ERROR] Database seeding failed: {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        await db.close()
        print("[DATABASE] Connection closed")

if __name__ == "__main__":
    asyncio.run(seed_daily_logs())
