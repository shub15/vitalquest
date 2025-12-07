#!/usr/bin/env python3
"""
Automated Chatbot Demo - Shows personalized AI chatbot in action
"""

import asyncio
import os
from datetime import datetime, timedelta
from backend.database.mysql_client import MySQLClient
from backend.services.personalized_chatbot import PersonalizedChatbot

# Database configuration
MYSQL_HOST = os.getenv("MYSQL_HOST", "127.0.0.1")
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "Abhijit@2005")
MYSQL_DB = os.getenv("MYSQL_DB", "vital_quest")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", 3306))

# Sample questions to demonstrate
DEMO_QUESTIONS = [
    "How is my overall health based on my recent data?",
    "Am I sleeping enough? What's my average sleep duration?",
    "How many steps do I take on average per day?",
    "What's my favorite workout activity and how often do I exercise?",
    "Give me 3 specific tips to improve my fitness based on my data"
]

async def demo_chatbot(user_id: str = "user_001"):
    """Run automated chatbot demo"""
    
    print("="*80)
    print(" VITAL QUEST - PERSONALIZED AI CHATBOT DEMO")
    print("="*80)
    print()
    
    # Initialize database
    db = MySQLClient(
        host=MYSQL_HOST,
        user=MYSQL_USER,
        password=MYSQL_PASSWORD,
        database=MYSQL_DB,
        port=MYSQL_PORT
    )
    
    try:
        await db.init()
        print("[DATABASE] Connected successfully")
        print()
        
        # Get user
        user = await db.get_user(user_id)
        if not user:
            print(f"[ERROR] User {user_id} not found")
            return
        
        username = user['username']
        
        print(f"[USER] Demo user: {username} (Level {user['level']}, {user['xp']} XP)")
        print()
        
        # Load health data
        print(f"[LOADING] Fetching 365 days of health history...")
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=365)
        
        daily_logs = await db.get_daily_logs_for_user_range(
            user_id,
            start_date.isoformat(),
            end_date.isoformat()
        )
        
        print(f"[LOADED] {len(daily_logs)} days of health data")
        print()
        
        # Initialize chatbot
        print(f"[CHATBOT] Initializing AI chatbot for {username}...")
        chatbot = PersonalizedChatbot(user_id=user_id, username=username)
        chatbot.load_user_context(daily_logs, user_profile=user)
        
        print()
        print("="*80)
        print(f" PERSONALIZED HEALTH CHAT - {username}")
        print("="*80)
        print()
        print(f"The AI chatbot has loaded {len(daily_logs)} days of health data for {username}")
        print("It knows:")
        print(f"  - Average daily steps: {chatbot.user_context['last_30_days']['avg_steps_per_day']}")
        print(f"  - Average sleep: {chatbot.user_context['last_30_days']['avg_sleep_hours']} hours/night")
        print(f"  - Total workouts (last 30 days): {chatbot.user_context['last_30_days']['total_workouts']}")
        print(f"  - Favorite activity: {chatbot.user_context['last_30_days']['favorite_workout']}")
        print()
        print("-"*80)
        print()
        
        # Ask demo questions
        for i, question in enumerate(DEMO_QUESTIONS, 1):
            print(f"\n[QUESTION {i}/{len(DEMO_QUESTIONS)}]")
            print("="*80)
            print(f"{username}: {question}")
            print("-"*80)
            
            # Get AI response
            print("AI Coach: [Analyzing your health data...]")
            print()
            
            response = await chatbot.chat(question)
            
            if response['status'] == 'success':
                print(f"AI Coach Response:")
                print("-"*80)
                print(response['response'])
                print("-"*80)
            else:
                print(f"[ERROR] {response['response']}")
            
            print()
            
            # Small delay between questions
            await asyncio.sleep(1)
        
        # Show conversation history
        print()
        print("="*80)
        print(" CONVERSATION SUMMARY")
        print("="*80)
        history = chatbot.get_conversation_history()
        print(f"Total exchanges: {len(history)}")
        print(f"User: {username}")
        print(f"Health data analyzed: {chatbot.user_context['total_days_tracked']} days")
        print()
        
        print("="*80)
        print(" DEMO COMPLETE")
        print("="*80)
        print()
        print("To use the interactive chatbot, run:")
        print("  python chat_terminal.py")
        print()
        print("Or test via API:")
        print("  1. Start server: python run_server.py")
        print("  2. Access: http://127.0.0.1:8001/docs")
        print("  3. Use endpoints:")
        print("     - POST /api/chatbot/init")
        print("     - POST /api/chatbot/chat")
        print("     - GET /api/chatbot/history/{user_id}")
        print()
        
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        await db.close()
        print("[DATABASE] Connection closed")

if __name__ == "__main__":
    # Set UTF-8 encoding
    if os.name == 'nt':
        os.system('chcp 65001 >nul 2>&1')
    
    asyncio.run(demo_chatbot())
