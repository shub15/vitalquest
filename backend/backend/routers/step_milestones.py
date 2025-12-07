#!/usr/bin/env python3
"""
Step Milestone Notifications Router
Sends notifications when users reach step milestones (10, 20, 30, etc.)
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from backend.database.mysql_client import MySQLClient
from backend.services.fcm_service import FCMService
from backend.services.notification_scheduler import NotificationScheduler

router = APIRouter()

# Dependency to get database
async def get_db():
    db = MySQLClient()
    await db.connect()
    try:
        yield db
    finally:
        await db.close()

class StepUpdate(BaseModel):
    user_id: str
    current_steps: int
    date: Optional[str] = None

class MilestoneCheckRequest(BaseModel):
    user_id: str
    total_steps: int
    milestone_interval: int = 10  # Default: notify every 10 steps

@router.post("/check-milestone")
async def check_step_milestone(
    request: MilestoneCheckRequest,
    db: MySQLClient = Depends(get_db)
):
    """
    Check if user reached a step milestone and send notification
    
    Args:
        user_id: User ID
        total_steps: Current total steps
        milestone_interval: Steps between notifications (default: 10)
    
    Example:
        {
            "user_id": "user_001",
            "total_steps": 50,
            "milestone_interval": 10
        }
        
        Will send notifications at 10, 20, 30, 40, 50 steps
    """
    try:
        user_id = request.user_id
        total_steps = request.total_steps
        milestone_interval = request.milestone_interval
        
        # Get user info
        user = await db.get_user(user_id)
        if not user:
            raise HTTPException(status_code=404, detail=f"User {user_id} not found")
        
        username = user.get("username", "User")
        
        # Check if current steps is a milestone
        if total_steps % milestone_interval != 0:
            return {
                "status": "no_milestone",
                "message": f"No milestone reached. Next milestone at {((total_steps // milestone_interval) + 1) * milestone_interval} steps",
                "current_steps": total_steps,
                "next_milestone": ((total_steps // milestone_interval) + 1) * milestone_interval
            }
        
        # Check if we already sent notification for this milestone today
        from datetime import datetime
        today = datetime.now().strftime("%Y-%m-%d")
        
        check_query = """
            SELECT COUNT(*) as count FROM step_milestones 
            WHERE user_id = %s AND milestone_steps = %s AND DATE(notified_at) = %s
        """
        result = await db.fetch_one(check_query, (user_id, total_steps, today))
        
        if result and result.get("count", 0) > 0:
            return {
                "status": "already_notified",
                "message": f"Already notified for {total_steps} steps today",
                "milestone": total_steps
            }
        
        # Send milestone notification
        fcm_service = FCMService()
        await fcm_service.initialize_db(db)
        
        # Customize message based on milestone
        if total_steps >= 10000:
            emoji = "🏆"
            title = f"{emoji} Amazing! {total_steps:,} Steps!"
            body = f"Wow {username}! You've walked {total_steps:,} steps! You're crushing it! 💪"
        elif total_steps >= 5000:
            emoji = "🔥"
            title = f"{emoji} {total_steps:,} Steps Milestone!"
            body = f"Fantastic {username}! {total_steps:,} steps and counting! Keep moving! 🚀"
        elif total_steps >= 1000:
            emoji = "⭐"
            title = f"{emoji} {total_steps:,} Steps Reached!"
            body = f"Great job {username}! You've reached {total_steps:,} steps! Keep it up! 🎯"
        else:
            emoji = "👟"
            title = f"{emoji} {total_steps} Steps!"
            body = f"Nice work {username}! {total_steps} steps completed! Every step counts! 💪"
        
        notification_data = {
            "type": "step_milestone",
            "milestone": str(total_steps),
            "user_id": user_id,
            "username": username
        }
        
        result = await fcm_service.send_notification(
            user_id=user_id,
            title=title,
            body=body,
            data=notification_data,
            notification_type="step_milestone"
        )
        
        # Record milestone notification
        insert_query = """
            INSERT INTO step_milestones (user_id, milestone_steps, notified_at)
            VALUES (%s, %s, NOW())
        """
        await db.execute(insert_query, (user_id, total_steps))
        
        return {
            "status": "success",
            "message": f"Milestone notification sent for {total_steps} steps",
            "milestone": total_steps,
            "next_milestone": total_steps + milestone_interval,
            "notification_result": result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error checking milestone: {str(e)}")

@router.post("/track-steps")
async def track_steps_with_milestones(
    step_update: StepUpdate,
    db: MySQLClient = Depends(get_db)
):
    """
    Track user steps and automatically check for milestones
    
    This endpoint will:
    1. Update user's step count
    2. Check if any milestone was reached
    3. Send notification if milestone achieved
    
    Example:
        {
            "user_id": "user_001",
            "current_steps": 50,
            "date": "2025-12-07"
        }
    """
    try:
        from datetime import datetime
        
        user_id = step_update.user_id
        current_steps = step_update.current_steps
        date = step_update.date or datetime.now().strftime("%Y-%m-%d")
        
        # Get user info
        user = await db.get_user(user_id)
        if not user:
            raise HTTPException(status_code=404, detail=f"User {user_id} not found")
        
        # Check which milestones should trigger notifications
        milestone_interval = 10
        milestones_reached = []
        
        # Find all milestones in current step count
        for milestone in range(milestone_interval, current_steps + 1, milestone_interval):
            # Check if we already notified for this milestone today
            check_query = """
                SELECT COUNT(*) as count FROM step_milestones 
                WHERE user_id = %s AND milestone_steps = %s AND DATE(notified_at) = %s
            """
            result = await db.fetch_one(check_query, (user_id, milestone, date))
            
            if not result or result.get("count", 0) == 0:
                milestones_reached.append(milestone)
        
        notifications_sent = []
        
        # Send notification for the highest unreported milestone only
        if milestones_reached:
            highest_milestone = max(milestones_reached)
            
            fcm_service = FCMService()
            await fcm_service.initialize_db(db)
            
            username = user.get("username", "User")
            
            # Customize message
            if highest_milestone >= 10000:
                emoji = "🏆"
                title = f"{emoji} Amazing! {highest_milestone:,} Steps!"
                body = f"Wow {username}! You've walked {highest_milestone:,} steps today! You're crushing it! 💪"
            elif highest_milestone >= 5000:
                emoji = "🔥"
                title = f"{emoji} {highest_milestone:,} Steps Milestone!"
                body = f"Fantastic {username}! {highest_milestone:,} steps and counting! Keep moving! 🚀"
            elif highest_milestone >= 1000:
                emoji = "⭐"
                title = f"{emoji} {highest_milestone:,} Steps Reached!"
                body = f"Great job {username}! You've reached {highest_milestone:,} steps! Keep it up! 🎯"
            else:
                emoji = "👟"
                title = f"{emoji} {highest_milestone} Steps!"
                body = f"Nice work {username}! {highest_milestone} steps completed! Every step counts! 💪"
            
            notification_data = {
                "type": "step_milestone",
                "milestone": str(highest_milestone),
                "current_steps": str(current_steps),
                "user_id": user_id,
                "username": username
            }
            
            result = await fcm_service.send_notification(
                user_id=user_id,
                title=title,
                body=body,
                data=notification_data,
                notification_type="step_milestone"
            )
            
            notifications_sent.append({
                "milestone": highest_milestone,
                "result": result
            })
            
            # Record milestone notification
            insert_query = """
                INSERT INTO step_milestones (user_id, milestone_steps, notified_at)
                VALUES (%s, %s, NOW())
            """
            await db.execute(insert_query, (user_id, highest_milestone))
        
        next_milestone = ((current_steps // milestone_interval) + 1) * milestone_interval
        
        return {
            "status": "success",
            "user_id": user_id,
            "current_steps": current_steps,
            "milestones_reached": milestones_reached,
            "notifications_sent": len(notifications_sent),
            "next_milestone": next_milestone,
            "steps_to_next": next_milestone - current_steps,
            "notification_details": notifications_sent
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error tracking steps: {str(e)}")

@router.get("/milestones/{user_id}")
async def get_user_milestones(
    user_id: str,
    db: MySQLClient = Depends(get_db)
):
    """
    Get all step milestones achieved by user
    
    Returns list of milestones with notification timestamps
    """
    try:
        query = """
            SELECT milestone_steps, notified_at 
            FROM step_milestones 
            WHERE user_id = %s 
            ORDER BY milestone_steps DESC
            LIMIT 100
        """
        milestones = await db.fetch_all(query, (user_id,))
        
        return {
            "status": "success",
            "user_id": user_id,
            "total_milestones": len(milestones),
            "milestones": [
                {
                    "steps": m["milestone_steps"],
                    "achieved_at": str(m["notified_at"])
                }
                for m in milestones
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching milestones: {str(e)}")
