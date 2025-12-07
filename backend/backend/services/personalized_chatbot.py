#!/usr/bin/env python3
"""
Personalized AI Chatbot Service - Uses Gemini with user's complete health history
"""

import os
import json
from datetime import datetime, timedelta
from typing import List, Dict, Optional
import google.generativeai as genai
from backend.models.schemas import DailyLog

# Configure Gemini API
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", "AIzaSyDFkNzIPMJzT_TYCV0YAXI2yMsiWGfipx0")
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

class PersonalizedChatbot:
    """AI Chatbot with access to user's complete health history"""
    
    def __init__(self, user_id: str, username: str):
        self.user_id = user_id
        self.username = username
        self.model = genai.GenerativeModel('gemini-2.5-flash')
        self.conversation_history = []
        self.user_context = None
        
    def load_user_context(self, daily_logs: List[dict], user_profile: dict = None):
        """Load user's health history to provide personalized context"""
        
        if not daily_logs:
            self.user_context = {
                "status": "no_data",
                "message": "No health data available for this user"
            }
            return
        
        # Analyze user's data
        total_logs = len(daily_logs)
        
        # Calculate aggregated statistics
        total_steps = 0
        total_sleep = 0
        total_deep_sleep = 0
        total_workouts = 0
        workout_types = {}
        recent_recovery_scores = []
        
        for log_data in daily_logs[:30]:  # Last 30 days
            if isinstance(log_data, str):
                log_data = json.loads(log_data)
            
            # Use correct field names from DailyLog schema
            total_steps += log_data.get('total_steps', 0)
            
            # Calculate total sleep from sleep_segments
            sleep_segments = log_data.get('sleep_segments', [])
            daily_sleep = 0
            for segment in sleep_segments:
                segment_duration = segment.get('duration_minutes', 0)
                daily_sleep += segment_duration
                
                # Track deep sleep separately
                if segment.get('stage') == 'deep':
                    total_deep_sleep += segment_duration
            
            total_sleep += daily_sleep
            
            # Count workouts
            workouts = log_data.get('manual_workouts', [])
            if workouts:
                total_workouts += len(workouts)
                for workout in workouts:
                    w_type = workout.get('activity_type', 'Unknown')
                    workout_types[w_type] = workout_types.get(w_type, 0) + 1
        
        avg_steps = total_steps / min(30, total_logs) if total_logs > 0 else 0
        avg_sleep = total_sleep / min(30, total_logs) if total_logs > 0 else 0
        avg_deep_sleep = total_deep_sleep / min(30, total_logs) if total_logs > 0 else 0
        
        favorite_workout = max(workout_types.items(), key=lambda x: x[1])[0] if workout_types else "None"
        
        # Build context summary
        self.user_context = {
            "user_id": self.user_id,
            "username": self.username,
            "total_days_tracked": total_logs,
            "last_30_days": {
                "avg_steps_per_day": round(avg_steps, 0),
                "avg_sleep_hours": round(avg_sleep / 60, 1),
                "avg_deep_sleep_min": round(avg_deep_sleep, 0),
                "total_workouts": total_workouts,
                "favorite_workout": favorite_workout,
                "workout_frequency": f"{total_workouts}/30 days"
            },
            "profile": user_profile or {}
        }
        
        print(f"\n[CHATBOT] Loaded context for {self.username}")
        print(f"  - {total_logs} days of health data")
        print(f"  - Last 30 days: {round(avg_steps, 0)} avg steps, {round(avg_sleep/60, 1)}h avg sleep")
        print(f"  - {total_workouts} workouts, favorite: {favorite_workout}")
    
    async def chat(self, user_message: str) -> dict:
        """
        Process user query with full context of their health history
        """
        
        if not GOOGLE_API_KEY:
            return {
                "response": "AI Chatbot unavailable: GOOGLE_API_KEY not set.",
                "timestamp": datetime.utcnow().isoformat(),
                "status": "error"
            }
        
        if not self.user_context:
            return {
                "response": "Please load user health data first before chatting.",
                "timestamp": datetime.utcnow().isoformat(),
                "status": "error"
            }
        
        try:
            # Build comprehensive prompt with user context
            context_summary = f"""You are a personalized health and fitness AI assistant for {self.username}.

USER HEALTH PROFILE:
- Total days tracked: {self.user_context.get('total_days_tracked', 0)} days
- User ID: {self.user_id}

LAST 30 DAYS STATISTICS:
- Average Steps: {self.user_context['last_30_days']['avg_steps_per_day']} steps/day
- Average Sleep: {self.user_context['last_30_days']['avg_sleep_hours']} hours/night
- Average Deep Sleep: {self.user_context['last_30_days']['avg_deep_sleep_min']} minutes/night
- Total Workouts: {self.user_context['last_30_days']['total_workouts']}
- Favorite Activity: {self.user_context['last_30_days']['favorite_workout']}
- Workout Frequency: {self.user_context['last_30_days']['workout_frequency']}

USER QUESTION:
{user_message}

Please provide a helpful, personalized response based on {self.username}'s health data. Be encouraging, specific, and reference their actual statistics when relevant."""

            print(f"\n[CHATBOT] Processing query: '{user_message}'")
            print(f"[CHATBOT] Context: {self.user_context['total_days_tracked']} days of data for {self.username}")
            
            # Generate AI response
            response = self.model.generate_content(context_summary)
            ai_response = response.text
            
            print(f"[CHATBOT] AI Response generated ({len(ai_response)} chars)")
            
            # Store in conversation history
            self.conversation_history.append({
                "user": user_message,
                "assistant": ai_response,
                "timestamp": datetime.utcnow().isoformat()
            })
            
            return {
                "response": ai_response,
                "timestamp": datetime.utcnow().isoformat(),
                "status": "success",
                "user_context": {
                    "username": self.username,
                    "days_tracked": self.user_context['total_days_tracked']
                }
            }
            
        except Exception as e:
            error_msg = f"Chatbot Error: {str(e)}"
            print(f"[CHATBOT] Error: {error_msg}")
            return {
                "response": error_msg,
                "timestamp": datetime.utcnow().isoformat(),
                "status": "error"
            }
    
    def get_conversation_history(self) -> List[dict]:
        """Get full conversation history"""
        return self.conversation_history
    
    def clear_history(self):
        """Clear conversation history"""
        self.conversation_history = []
        print(f"[CHATBOT] Conversation history cleared for {self.username}")
