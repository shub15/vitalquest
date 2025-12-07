#!/usr/bin/env python3
"""
Notification Scheduler - Checks for inactivity and sends reminders
"""

import asyncio
from datetime import datetime, timedelta
from typing import List, Dict
from backend.database.mysql_client import MySQLClient
from backend.services.fcm_service import FCMService

class NotificationScheduler:
    """Handles scheduled notification tasks"""
    
    def __init__(self, db: MySQLClient, fcm_service: FCMService):
        """
        Initialize scheduler
        
        Args:
            db: MySQL client
            fcm_service: FCM service instance
        """
        self.db = db
        self.fcm_service = fcm_service
    
    async def check_inactivity_and_notify(self, inactivity_threshold_days: int = 2) -> dict:
        """
        Check for inactive users and send reminder notifications
        
        Args:
            inactivity_threshold_days: Days without activity to trigger notification
            
        Returns:
            dict with notification results
        """
        print("\n" + "="*80)
        print(" INACTIVITY CHECK & NOTIFICATIONS")
        print("="*80)
        print(f"[SCHEDULER] Starting inactivity check (threshold: {inactivity_threshold_days} days)")
        print()
        
        try:
            # Get all users
            users = await self.db.fetch_all("SELECT user_id, username, fcm_token FROM users")
            print(f"[SCHEDULER] Checking {len(users)} users")
            print()
            
            inactive_users = []
            notification_results = []
            
            # Check each user for inactivity
            for user in users:
                user_id = user["user_id"]
                username = user["username"]
                fcm_token = user.get("fcm_token")
                
                # Get most recent daily log
                query = """
                SELECT MAX(date) as last_log_date FROM daily_logs 
                WHERE user_id = %s
                """
                result = await self.db.fetch_one(query, (user_id,))
                
                if not result or not result.get("last_log_date"):
                    print(f"[SCHEDULER] {username} ({user_id}): No activity history")
                    # User has never logged - mark as inactive
                    inactive_users.append({
                        "user_id": user_id,
                        "username": username,
                        "last_log": None,
                        "days_inactive": "Never logged",
                        "reason": "No activity history"
                    })
                    continue
                
                last_log_date = result["last_log_date"]
                # Convert string date to datetime.date if needed
                if isinstance(last_log_date, str):
                    from datetime import datetime as dt
                    last_log_date = dt.strptime(last_log_date, "%Y-%m-%d").date()
                days_inactive = (datetime.now().date() - last_log_date).days
                
                print(f"[SCHEDULER] {username} ({user_id}): Last log {days_inactive} days ago ({last_log_date})")
                
                # Check if inactive
                if days_inactive >= inactivity_threshold_days:
                    inactive_users.append({
                        "user_id": user_id,
                        "username": username,
                        "last_log": str(last_log_date),
                        "days_inactive": days_inactive,
                        "reason": "Inactive"
                    })
            
            print()
            print(f"[SCHEDULER] Found {len(inactive_users)} inactive users")
            print()
            
            # Send notifications to inactive users
            if inactive_users:
                print("="*80)
                print(" SENDING INACTIVITY REMINDERS")
                print("="*80)
                print()
                
                for user_info in inactive_users:
                    user_id = user_info["user_id"]
                    username = user_info["username"]
                    days = user_info["days_inactive"]
                    
                    # Customize message based on days inactive
                    if isinstance(days, str):
                        title = "🚨 Your Quest Awaits!"
                        body = f"Hi {username}! We haven't seen you in a while. Don't lose your progress! Start training today!"
                    elif days == 2:
                        title = "📢 Time to Get Back!"
                        body = f"Hi {username}! It's been {days} days since your last workout. Your team is counting on you!"
                    elif days > 7:
                        title = "⚠️ Long Time No See!"
                        body = f"Hi {username}! It's been {days} days! Come back and show what you're made of!"
                    else:
                        title = "💪 Ready to Continue?"
                        body = f"Hi {username}! You've been away for {days} days. Let's get back to crushing those goals!"
                    
                    # Send notification
                    notification_data = {
                        "type": "inactivity_reminder",
                        "days_inactive": str(days)
                    }
                    
                    result = await self.fcm_service.send_notification(
                        user_id=user_id,
                        title=title,
                        body=body,
                        data=notification_data,
                        notification_type="inactivity_reminder"
                    )
                    
                    notification_results.append(result)
                    print()
            
            # Summary
            print("\n" + "="*80)
            print(" SCHEDULER SUMMARY")
            print("="*80)
            print(f"Total users checked: {len(users)}")
            print(f"Inactive users found: {len(inactive_users)}")
            print(f"Notifications sent: {len(notification_results)}")
            
            if notification_results:
                success = sum(1 for r in notification_results if r["status"] == "success")
                failed = sum(1 for r in notification_results if r["status"] == "error")
                pending = sum(1 for r in notification_results if r["status"] == "pending")
                print(f"  - Success: {success}")
                print(f"  - Failed: {failed}")
                print(f"  - Pending (no token): {pending}")
            
            print("="*80 + "\n")
            
            return {
                "status": "complete",
                "total_users": len(users),
                "inactive_users": len(inactive_users),
                "notifications_sent": len(notification_results),
                "inactive_users_list": inactive_users,
                "notification_results": notification_results
            }
            
        except Exception as e:
            print(f"[SCHEDULER] Error during inactivity check: {str(e)}")
            import traceback
            traceback.print_exc()
            return {
                "status": "error",
                "message": str(e),
                "total_users": 0,
                "inactive_users": 0,
                "notifications_sent": 0
            }
    
    async def send_achievement_notification(
        self,
        user_id: str,
        achievement: str,
        xp_gained: int
    ) -> dict:
        """
        Send achievement notification
        
        Args:
            user_id: User ID
            achievement: Achievement description
            xp_gained: XP gained
            
        Returns:
            Notification result
        """
        title = "🏆 Achievement Unlocked!"
        body = f"You earned '{achievement}' and gained {xp_gained} XP!"
        data = {
            "type": "achievement",
            "achievement": achievement,
            "xp": str(xp_gained)
        }
        
        return await self.fcm_service.send_notification(
            user_id=user_id,
            title=title,
            body=body,
            data=data,
            notification_type="achievement"
        )
    
    async def send_level_up_notification(self, user_id: str, new_level: int) -> dict:
        """
        Send level up notification
        
        Args:
            user_id: User ID
            new_level: New user level
            
        Returns:
            Notification result
        """
        title = "⭐ Level Up!"
        body = f"Congratulations! You've reached Level {new_level}!"
        data = {
            "type": "level_up",
            "new_level": str(new_level)
        }
        
        return await self.fcm_service.send_notification(
            user_id=user_id,
            title=title,
            body=body,
            data=data,
            notification_type="level_up"
        )
    
    async def send_battle_update_notification(
        self,
        user_id: str,
        team_name: str,
        message: str
    ) -> dict:
        """
        Send battle update notification
        
        Args:
            user_id: User ID
            team_name: Team name
            message: Battle update message
            
        Returns:
            Notification result
        """
        title = f"⚔️ {team_name} Battle Update"
        body = message
        data = {
            "type": "battle_update",
            "team": team_name
        }
        
        return await self.fcm_service.send_notification(
            user_id=user_id,
            title=title,
            body=body,
            data=data,
            notification_type="battle_update"
        )
