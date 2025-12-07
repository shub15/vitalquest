#!/usr/bin/env python3
"""
Interactive Terminal Chatbot - Chat with AI about your health data
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

async def main():
    """Interactive chatbot session"""
    
    print("="*80)
    print(" VITAL QUEST - PERSONALIZED AI HEALTH CHATBOT")
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
        print("[✓] Connected to database")
        print()
        
        # Get available users
        print("Available Users:")
        print("-"*80)
        users = await db.fetch_all("SELECT user_id, username, level, xp FROM users")
        
        for i, user in enumerate(users, 1):
            print(f"  {i}. {user['username']} (ID: {user['user_id']}) - Level {user['level']}, {user['xp']} XP")
        
        print()
        
        # Select user
        while True:
            user_choice = input("Select user number (or 'q' to quit): ").strip()
            if user_choice.lower() == 'q':
                print("Goodbye!")
                return
            
            try:
                user_idx = int(user_choice) - 1
                if 0 <= user_idx < len(users):
                    selected_user = users[user_idx]
                    break
                else:
                    print("Invalid selection. Please try again.")
            except ValueError:
                print("Please enter a number.")
        
        user_id = selected_user['user_id']
        username = selected_user['username']
        
        print()
        print(f"[✓] Logged in as: {username}")
        print()
        
        # Load health data
        print(f"[Loading] Fetching health history for {username}...")
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=365)
        
        daily_logs = await db.get_daily_logs_for_user_range(
            user_id,
            start_date.isoformat(),
            end_date.isoformat()
        )
        
        print(f"[✓] Loaded {len(daily_logs)} days of health data")
        print()
        
        # Initialize chatbot
        chatbot = PersonalizedChatbot(user_id=user_id, username=username)
        chatbot.load_user_context(daily_logs, user_profile=selected_user)
        
        print()
        print("="*80)
        print(f" CHAT SESSION - {username}")
        print("="*80)
        print()
        print("You can now ask questions about your health, fitness, sleep, workouts, etc.")
        print("The AI knows your complete health history and will provide personalized advice.")
        print()
        print("Examples:")
        print("  - How is my sleep quality?")
        print("  - Am I getting enough steps?")
        print("  - What should I focus on to improve my fitness?")
        print("  - Compare my workout frequency to last month")
        print()
        print("Type 'quit' or 'exit' to end the conversation")
        print("Type 'history' to see conversation history")
        print("Type 'clear' to clear conversation history")
        print()
        print("-"*80)
        print()
        
        # Chat loop
        while True:
            # Get user input
            user_message = input(f"{username}: ").strip()
            
            if not user_message:
                continue
            
            # Commands
            if user_message.lower() in ['quit', 'exit', 'q']:
                print()
                print("="*80)
                print(" Chat session ended. Stay healthy!")
                print("="*80)
                break
            
            if user_message.lower() == 'history':
                history = chatbot.get_conversation_history()
                print()
                print("-"*80)
                print(f"Conversation History ({len(history)} messages)")
                print("-"*80)
                for i, msg in enumerate(history, 1):
                    print(f"\n[{i}] USER: {msg['user']}")
                    print(f"    AI: {msg['assistant'][:100]}...")
                print("-"*80)
                print()
                continue
            
            if user_message.lower() == 'clear':
                chatbot.clear_history()
                print("[✓] Conversation history cleared")
                print()
                continue
            
            # Get AI response
            print()
            print(f"AI Coach (thinking...)")
            response = await chatbot.chat(user_message)
            
            print()
            print("-"*80)
            print(f"AI Coach: {response['response']}")
            print("-"*80)
            print()
        
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        import traceback
        traceback.print_exc()
    finally:
        await db.close()
        print("\n[✓] Database connection closed")

if __name__ == "__main__":
    # Set UTF-8 encoding for terminal
    if os.name == 'nt':  # Windows
        os.system('chcp 65001 >nul 2>&1')
    
    asyncio.run(main())
