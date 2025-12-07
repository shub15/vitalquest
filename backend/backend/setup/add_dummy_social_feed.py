#!/usr/bin/env python3
"""
Social Feed Dummy Data Generator
Adds realistic social feed entries to the database
"""

import asyncio
import json
import os
from datetime import datetime, timedelta
from backend.database.mysql_client import MySQLClient

# Database configuration
MYSQL_HOST = os.getenv("MYSQL_HOST", "127.0.0.1")
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "Abhijit@2005")
MYSQL_DB = os.getenv("MYSQL_DB", "vital_quest")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", 3306))

async def add_dummy_social_feed():
    """Add dummy social feed entries"""
    
    print("\n" + "="*80)
    print(" 📱 SOCIAL FEED - DUMMY DATA GENERATOR")
    print("="*80 + "\n")
    
    db = MySQLClient(
        host=MYSQL_HOST,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DB,
        port=MYSQL_PORT
    )
    
    try:
        await db.init()
        print("✓ Connected to MySQL\n")
        
        # Social feed entries
        social_posts = [
            {
                "post_id": "post_warrior_001_20251207_levelup",
                "user_id": "warrior_001",
                "type": "level_up",
                "content": {
                    "username": "IronFist",
                    "level": 5,
                    "xp_gained": 250,
                    "achievement": "Reached Level 5!",
                    "emoji": "🎉",
                    "message": "IronFist just leveled up to Level 5! Crushing it in the gym! 💪",
                    "image": "https://picsum.photos/seed/warrior/400/300"
                }
            },
            {
                "post_id": "post_assassin_001_20251206_daily",
                "user_id": "assassin_001",
                "type": "daily_achievement",
                "content": {
                    "username": "SwiftRunner",
                    "steps": 8500,
                    "distance_km": 6.8,
                    "emoji": "🏃",
                    "message": "SwiftRunner walked 8,500 steps today! Keeping the momentum going! 🗡️",
                    "image": "https://picsum.photos/seed/running/400/300"
                }
            },
            {
                "post_id": "post_monk_001_20251205_streak",
                "user_id": "monk_001",
                "type": "streak_milestone",
                "content": {
                    "username": "ZenMaster",
                    "streak_days": 6,
                    "milestone": "6 Day Streak!",
                    "emoji": "🔥",
                    "message": "ZenMaster is on a 6-day wellness streak! Yoga and meditation every day! 🧘",
                    "image": "https://picsum.photos/seed/yoga/400/300"
                }
            },
            {
                "post_id": "post_warrior_001_20251204_battle",
                "user_id": "warrior_001",
                "type": "battle_victory",
                "content": {
                    "username": "IronFist",
                    "battle_name": "Team Strength vs Team Endurance",
                    "points": 1250,
                    "rank": "MVP",
                    "emoji": "⚔️",
                    "message": "IronFist won the battle against Team Endurance with 1,250 points! MVP of the match! 💪",
                    "image": "https://picsum.photos/seed/victory/400/300"
                }
            },
            {
                "post_id": "post_monk_001_20251203_milestone",
                "user_id": "monk_001",
                "type": "step_milestone",
                "content": {
                    "username": "ZenMaster",
                    "steps": 10000,
                    "milestone": "10,000 Steps!",
                    "emoji": "🎯",
                    "message": "ZenMaster reached 10,000 steps today! That's a perfect day! 🧘‍♂️",
                    "image": "https://picsum.photos/seed/meditation/400/300"
                }
            },
            {
                "post_id": "post_assassin_001_20251202_workout",
                "user_id": "assassin_001",
                "type": "workout_complete",
                "content": {
                    "username": "SwiftRunner",
                    "workout_type": "Walk",
                    "duration_minutes": 45,
                    "calories": 180,
                    "emoji": "🏅",
                    "message": "SwiftRunner completed a 45-min walk and burned 180 calories! 🗡️",
                    "image": "https://picsum.photos/seed/walking/400/300"
                }
            },
            {
                "post_id": "post_villager_001_20251201_start",
                "user_id": "villager_001",
                "type": "first_workout",
                "content": {
                    "username": "NewbieAdventurer",
                    "workout_type": "Yoga",
                    "message": "NewbieAdventurer just completed their first yoga session! Welcome to the adventure! 🎉",
                    "emoji": "🌟",
                    "encouragement": "Every great warrior started as a villager. Keep it up!",
                    "image": "https://picsum.photos/seed/beginner/400/300"
                }
            },
            {
                "post_id": "post_warrior_001_20251130_gym_session",
                "user_id": "warrior_001",
                "type": "workout_complete",
                "content": {
                    "username": "IronFist",
                    "workout_type": "Gym",
                    "duration_minutes": 60,
                    "calories": 600,
                    "intensity": 9,
                    "emoji": "💪",
                    "message": "IronFist crushed a 60-minute gym session at intensity level 9! Burning those gains! 🔥",
                    "image": "https://picsum.photos/seed/gym/400/300"
                }
            },
            {
                "post_id": "post_assassin_001_20251129_recovery",
                "user_id": "assassin_001",
                "type": "recovery_tips",
                "content": {
                    "username": "SwiftRunner",
                    "recovery_score": 85,
                    "sleep_hours": 7.5,
                    "hydration": "2.1L",
                    "emoji": "😴",
                    "message": "SwiftRunner had an excellent recovery day with 7.5 hours of sleep and great hydration! 💧",
                    "recovery_status": "Excellent",
                    "image": "https://picsum.photos/seed/sleep/400/300"
                }
            },
            {
                "post_id": "post_monk_001_20251128_meditation",
                "user_id": "monk_001",
                "type": "mindfulness",
                "content": {
                    "username": "ZenMaster",
                    "session_type": "Meditation",
                    "duration_minutes": 30,
                    "mindfulness_score": 95,
                    "emoji": "🧘",
                    "message": "ZenMaster completed a 30-minute meditation session with a perfect mindfulness score of 95! Inner peace achieved! ☮️",
                    "image": "https://picsum.photos/seed/mindfulness/400/300"
                }
            },
            {
                "post_id": "post_warrior_001_20251127_team_event",
                "user_id": "warrior_001",
                "type": "team_event",
                "content": {
                    "username": "IronFist",
                    "team": "Team Strength",
                    "event_name": "Weekly Gym Challenge",
                    "rank": 1,
                    "team_points": 5000,
                    "emoji": "🏆",
                    "message": "IronFist's team 'Team Strength' won the Weekly Gym Challenge with 5,000 points! Champions! 🏅",
                    "image": "https://picsum.photos/seed/trophy/400/300"
                }
            },
            {
                "post_id": "post_monk_001_20251126_progress",
                "user_id": "monk_001",
                "type": "weekly_progress",
                "content": {
                    "username": "ZenMaster",
                    "week": "Week 49",
                    "total_steps": 42000,
                    "avg_sleep": 8.2,
                    "workouts_completed": 7,
                    "emoji": "📈",
                    "message": "ZenMaster's weekly summary: 42,000 steps, 8.2 hrs avg sleep, 7 workouts! What a week! 🌟",
                    "image": "https://picsum.photos/seed/progress/400/300"
                }
            }
        ]
        
        print("📝 Adding Social Feed Entries...\n")
        
        for post in social_posts:
            try:
                query = """
                INSERT INTO social_feed (post_id, user_id, type, timestamp, content)
                VALUES (%s, %s, %s, %s, %s)
                ON DUPLICATE KEY UPDATE
                    content = VALUES(content),
                    timestamp = VALUES(timestamp)
                """
                
                timestamp = datetime.now().isoformat()
                content_json = json.dumps(post["content"])
                
                await db.execute(query, (
                    post["post_id"],
                    post["user_id"],
                    post["type"],
                    timestamp,
                    content_json
                ))
                
                print(f"✓ Added: {post['type']:20} | User: {post['user_id']:15} | ID: {post['post_id']}")
                
            except Exception as e:
                print(f"✗ Error adding post {post['post_id']}: {str(e)}")
        
        # Verify entries
        print("\n" + "="*80)
        print(" ✅ VERIFICATION - Social Feed Entries")
        print("="*80 + "\n")
        
        verify_query = "SELECT post_id, user_id, type, timestamp FROM social_feed ORDER BY timestamp DESC"
        posts = await db.fetch_all(verify_query)
        
        print(f"Total entries: {len(posts)}\n")
        
        for post in posts:
            print(f"📌 {post['type']:20} | User: {post['user_id']:15} | {post['timestamp']}")
        
        # Summary stats
        print("\n" + "="*80)
        print(" 📊 SOCIAL FEED SUMMARY")
        print("="*80 + "\n")
        
        type_query = "SELECT type, COUNT(*) as count FROM social_feed GROUP BY type ORDER BY count DESC"
        types = await db.fetch_all(type_query)
        
        print("Posts by Type:\n")
        for t in types:
            print(f"  • {t['type']:20} : {t['count']} posts")
        
        user_query = "SELECT user_id, COUNT(*) as count FROM social_feed GROUP BY user_id ORDER BY count DESC"
        users = await db.fetch_all(user_query)
        
        print("\nPosts by User:\n")
        for u in users:
            print(f"  • {u['user_id']:20} : {u['count']} posts")
        
        print("\n" + "="*80)
        print(" ✅ SOCIAL FEED DUMMY DATA COMPLETE!")
        print("="*80 + "\n")
        
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        raise
    finally:
        await db.close()

if __name__ == "__main__":
    asyncio.run(add_dummy_social_feed())
