#!/usr/bin/env python3
"""
Notification Personalizer - Generates Gemini-crafted push notifications
for milestone achievements and next-day workout plans.
"""

import os
import json
from datetime import datetime
import google.generativeai as genai

DEFAULT_API_KEY = "AIzaSyBTbBOtKAl5fxzCeqa92oI4VKpR879_Zng"
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY", DEFAULT_API_KEY)
if GOOGLE_API_KEY:
    genai.configure(api_key=GOOGLE_API_KEY)

class NotificationPersonalizer:
    """Creates personalized notification copy using Gemini."""

    def __init__(self):
        self.model = genai.GenerativeModel('gemini-2.5-flash') if GOOGLE_API_KEY else None

    def _fallback_message(self, username: str, today_steps: int) -> dict:
        title = f"Great job, {username}!"
        body = f"You hit {today_steps:,} steps today. Let's plan a light yoga session and hydrate well tomorrow."
        return {"title": title, "body": body, "source": "fallback"}

    def generate_plan(self,
                      username: str,
                      today_steps: int,
                      streak_days: int = 0,
                      hydration_liters: float = 0.0,
                      sleep_hours: float = 0.0,
                      tomorrow_focus: str = "balanced") -> dict:
        """Generate a short push notification (title + body) personalized to the user."""
        if not GOOGLE_API_KEY or not self.model:
            return self._fallback_message(username, today_steps)

        prompt = f"""
You are a friendly fitness coach writing a PUSH NOTIFICATION.
Keep it uplifting, concise, and tailored to the user.

User context:
- Name: {username}
- Steps today: {today_steps}
- Streak days: {streak_days}
- Hydration today (L): {hydration_liters}
- Sleep last night (hours): {sleep_hours}
- Tomorrow focus: {tomorrow_focus}

Requirements:
1) Output JSON only. Format:
   {{"title": "<<=60 chars>>", "body": "<<=140 chars>>"}}
2) Tone: supportive, specific to their activity
3) Mention tomorrow plan briefly (activity + hydration)
4) If steps >= 10000, celebrate milestone
5) If hydration < 2L, nudge to drink water
6) If sleep < 7h, suggest lighter/yoga; else OK to suggest moderate cardio
7) DO NOT wrap in markdown or code fences.
"""
        try:
            result = self.model.generate_content(prompt)
            if not result or not result.text:
                return self._fallback_message(username, today_steps)

            text = result.text.strip()
            # Ensure it's JSON parsable; if not, wrap and retry
            try:
                parsed = json.loads(text)
                title = parsed.get("title")
                body = parsed.get("body")
            except Exception:
                # Try to extract JSON-like snippet
                start = text.find("{")
                end = text.rfind("}")
                if start != -1 and end != -1:
                    snippet = text[start:end+1]
                    parsed = json.loads(snippet)
                    title = parsed.get("title")
                    body = parsed.get("body")
                else:
                    return self._fallback_message(username, today_steps)

            if not title or not body:
                return self._fallback_message(username, today_steps)

            return {
                "title": title[:60],
                "body": body[:200],
                "source": "gemini"
            }
        except Exception:
            return self._fallback_message(username, today_steps)
