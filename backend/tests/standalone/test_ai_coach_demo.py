#!/usr/bin/env python3
"""
AI Coach Demo - Tests AI Gemini integration with realistic data
"""

import os
import asyncio
from datetime import date, datetime, timedelta

# Set environment
os.environ['MYSQL_HOST'] = '127.0.0.1'
os.environ['MYSQL_USER'] = 'root'
os.environ['MYSQL_PASSWORD'] = 'Abhijit@2005'
os.environ['MYSQL_DB'] = 'vital_quest'
os.environ['MYSQL_PORT'] = '3306'
os.environ['GOOGLE_API_KEY'] = 'AIzaSyDFkNzIPMJzT_TYCV0YAXI2yMsiWGfipx0'

from backend.app.dummy_data import generate_dummy_dailylogs
from backend.app.logic import calculate_recovery_score, calculate_battle_score, calculate_weekly_stats
from backend.services.ai_service import get_coach_feedback

async def main():
    print("\n" + "="*80)
    print("VITAL QUEST - AI COACH DEMO")
    print("="*80)
    
    # Generate 365 days of dummy data
    print("\n[1] GENERATING 1 YEAR OF DUMMY DATA")
    print("-" * 80)
    logs = generate_dummy_dailylogs(365)
    
    # Test 1: Analyze recovery from a good day
    print("\n[2] TESTING RECOVERY ANALYSIS - Good Recovery Day")
    print("-" * 80)
    good_day = logs[0]  # Most recent
    recovery = calculate_recovery_score(good_day)
    print(f"Recovery Score: {recovery['score']}/100")
    print(f"Status: {recovery['status']}")
    print(f"Deep Sleep: {recovery['deep_sleep_minutes']} min")
    rhr_display = f"{recovery['rhr']:.1f}" if recovery['rhr'] else "N/A"
    print(f"RHR: {rhr_display} bpm")
    
    # Test 2: Analyze battle score
    print("\n[3] TESTING BATTLE SCORE ANALYSIS")
    print("-" * 80)
    battle = calculate_battle_score(good_day)
    print(f"Total Battle Score: {battle['total_score']:.2f}")
    print(f"  Steps ({battle['breakdown']['steps_points']:.2f}): {battle['total_steps']} steps")
    print(f"  Deep Sleep ({battle['breakdown']['deep_sleep_points']:.2f}): {battle['deep_sleep_minutes']} min")
    print(f"  Workouts ({battle['breakdown']['workout_points']:.2f}): {battle['workout_count']} sessions")
    
    # Test 3: AI Coach Morning Feedback
    print("\n[4] AI COACH - MORNING WORKOUT PLANNING")
    print("-" * 80)
    print("Asking Gemini AI for morning workout advice...")
    
    morning_feedback = await get_coach_feedback(
        context_type="PLANNING",
        recovery_score=recovery["score"],
        deep_sleep=recovery["deep_sleep_minutes"],
        rhr=recovery["rhr"] or 65.0
    )
    
    print(f"\n✓ AI Coach Response:")
    print(f"{morning_feedback['feedback']}")
    print(f"Timestamp: {morning_feedback['timestamp']}")
    
    # Test 4: AI Coach Post-Workout Feedback
    if good_day.manual_workouts:
        print("\n[5] AI COACH - POST-WORKOUT ANALYSIS")
        print("-" * 80)
        print("Asking Gemini AI for post-workout feedback...")
        
        last_workout = good_day.manual_workouts[-1]
        postworkout_feedback = await get_coach_feedback(
            context_type="ANALYSIS",
            recovery_score=recovery["score"],
            deep_sleep=recovery["deep_sleep_minutes"],
            rhr=recovery["rhr"] or 65.0,
            activity_type=last_workout.activity_type,
            calories_burnt=last_workout.calories_burnt
        )
        
        print(f"\n✓ AI Coach Response:")
        print(f"{postworkout_feedback['feedback']}")
        print(f"Timestamp: {postworkout_feedback['timestamp']}")
    
    # Test 5: Weekly stats
    print("\n[6] WEEKLY STATISTICS ANALYSIS")
    print("-" * 80)
    weekly_logs = logs[:7]  # Last 7 days
    weekly = calculate_weekly_stats(weekly_logs)
    
    print(f"Period: {weekly['period_days']} days")
    print(f"Total Steps: {weekly['total_steps']} (avg {weekly['avg_steps']}/day)")
    print(f"Sleep: {weekly['total_sleep_hours']}h total (avg {weekly['avg_sleep_hours']}/night)")
    print(f"Deep Sleep: {weekly['deep_sleep_minutes']} min")
    print(f"Workouts: {weekly['total_workouts']} (favorite: {weekly['favorite_activity']})")
    print(f"Avg Recovery: {weekly['avg_recovery_score']}/100")
    
    # Test 6: Multi-day analysis
    print("\n[7] MULTI-DAY TREND ANALYSIS")
    print("-" * 80)
    
    selected_logs = logs[::60]  # Every ~2 months for 6 samples
    print(f"Analyzing {len(selected_logs)} days across the year:\n")
    
    for i, log in enumerate(selected_logs[:3], 1):
        rec = calculate_recovery_score(log)
        bat = calculate_battle_score(log)
        print(f"  Day {i} ({log.date}):")
        print(f"    Recovery: {rec['score']}/100 ({rec['status']})")
        print(f"    Battle Score: {bat['total_score']:.0f}")
        print(f"    Workouts: {len(log.manual_workouts)}")
        print()
    
    # Summary
    print("="*80)
    print("✓ AI COACH DEMO COMPLETE")
    print("="*80)
    print("""
FEATURES DEMONSTRATED:
  ✓ 365 days of realistic dummy data generated
  ✓ Recovery Score calculation (0-100)
  ✓ Battle Score calculation with breakdown
  ✓ AI Gemini integration for morning planning advice
  ✓ AI Gemini integration for post-workout analysis
  ✓ Weekly statistics aggregation
  ✓ Multi-day trend tracking

ENDPOINTS AVAILABLE:
  POST /ai/analyze/recovery       - Analyze recovery metrics
  POST /ai/analyze/battle         - Calculate battle score
  POST /ai/coach-morning          - Get morning workout plan (AI)
  POST /ai/coach-postworkout      - Get post-workout feedback (AI)
  POST /ai/analyze/weekly         - Get weekly statistics

NEXT STEPS:
  1. Start server: python run_server.py
  2. Access API: http://127.0.0.1:8001/docs
  3. Test endpoints with sample DailyLog data
  4. View AI responses in terminal and API response
""")
    
    print("="*80 + "\n")

if __name__ == "__main__":
    asyncio.run(main())
