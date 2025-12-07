#!/usr/bin/env python3
"""
FCM Token Management Router - API endpoints for device token registration
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
import os

from backend.database.mysql_client import MySQLClient
from backend.services.fcm_service import FCMService, get_fcm_service
from backend.services.notification_personalizer import NotificationPersonalizer

router = APIRouter()

# Initialize services
db = MySQLClient(
    host=os.getenv("MYSQL_HOST", "127.0.0.1"),
    user=os.getenv("MYSQL_USER", "root"),
    password=os.getenv("MYSQL_PASSWORD", "Abhijit@2005"),
    database=os.getenv("MYSQL_DB", "vital_quest"),
    port=int(os.getenv("MYSQL_PORT", 3306))
)

fcm_service = get_fcm_service()
personalizer = NotificationPersonalizer()

# Data Models
class FCMTokenUpdate(BaseModel):
    user_id: str
    fcm_token: str

class NotificationTestRequest(BaseModel):
    user_id: str
    title: str
    body: str
    notification_type: str = "test"

class PersonalizedPlanRequest(BaseModel):
    user_id: str
    today_steps: int
    streak_days: int = 0
    hydration_liters: float = 0.0
    sleep_hours: float = 0.0
    tomorrow_focus: str = "balanced"

class InactivityCheckRequest(BaseModel):
    inactivity_threshold_days: int = 2

@router.on_event("startup")
async def startup():
    """Initialize database connection"""
    await db.init()
    await fcm_service.initialize_db(db)
    print("[FCM ROUTER] Database connection initialized")

@router.on_event("shutdown")
async def shutdown():
    """Close database connection"""
    await db.close()
    print("[FCM ROUTER] Database connection closed")

@router.post("/fcm-token", tags=["Notifications"])
async def update_fcm_token(request: FCMTokenUpdate):
    """
    Update or register FCM device token for push notifications
    
    Args:
        user_id: User identifier
        fcm_token: Firebase registration token from mobile device
    
    Returns:
        Success/error status
    """
    try:
        print(f"\n[FCM API] Received FCM token update for user: {request.user_id}")
        
        # Validate inputs
        if not request.user_id or not request.fcm_token:
            raise HTTPException(status_code=400, detail="user_id and fcm_token required")
        
        # Verify user exists
        user = await db.get_user(request.user_id)
        if not user:
            raise HTTPException(status_code=404, detail=f"User {request.user_id} not found")
        
        # Update FCM token
        result = await fcm_service.update_user_fcm_token(request.user_id, request.fcm_token)
        
        if result["status"] == "success":
            print(f"[FCM API] Token updated successfully for {user['username']}")
            return {
                "status": "success",
                "message": f"FCM token registered for {user['username']}",
                "user_id": request.user_id,
                "username": user["username"]
            }
        else:
            raise HTTPException(status_code=500, detail=result["message"])
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[FCM API] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/fcm/test-notification", tags=["Notifications"])
async def test_notification(request: NotificationTestRequest):
    """
    Send a test notification to verify FCM setup
    
    Args:
        user_id: Target user
        title: Notification title
        body: Notification message
        notification_type: Type of notification
    
    Returns:
        Notification send result
    """
    try:
        print(f"\n[FCM API] Test notification request for user: {request.user_id}")
        
        # Verify user exists
        user = await db.get_user(request.user_id)
        if not user:
            raise HTTPException(status_code=404, detail=f"User {request.user_id} not found")
        
        # Send test notification
        result = await fcm_service.send_notification(
            user_id=request.user_id,
            title=request.title,
            body=request.body,
            data={"type": request.notification_type},
            notification_type=request.notification_type
        )
        
        return result
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[FCM API] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/fcm/personalized-plan", tags=["Notifications"])
async def send_personalized_plan(request: PersonalizedPlanRequest):
    """
    Generate a Gemini-crafted personalized notification (title + body) and send via FCM.
    Also prints to terminal and returns the composed message.
    """
    try:
        print(f"\n[FCM API] Personalized plan request for user: {request.user_id}")
        user = await db.get_user(request.user_id)
        if not user:
            raise HTTPException(status_code=404, detail=f"User {request.user_id} not found")

        username = user.get("username", "User")
        message = personalizer.generate_plan(
            username=username,
            today_steps=request.today_steps,
            streak_days=request.streak_days,
            hydration_liters=request.hydration_liters,
            sleep_hours=request.sleep_hours,
            tomorrow_focus=request.tomorrow_focus,
        )

        data = {
            "type": "personalized_plan",
            "today_steps": str(request.today_steps),
            "streak_days": str(request.streak_days),
            "hydration_liters": str(request.hydration_liters),
            "sleep_hours": str(request.sleep_hours),
            "tomorrow_focus": request.tomorrow_focus,
        }

        result = await fcm_service.send_notification(
            user_id=request.user_id,
            title=message.get("title", "Tomorrow's Plan"),
            body=message.get("body", "Let's keep the momentum going!"),
            data=data,
            notification_type="personalized_plan"
        )

        return {
            "status": "success",
            "user_id": request.user_id,
            "username": username,
            "notification": {
                "title": message.get("title"),
                "body": message.get("body"),
                "source": message.get("source", "gemini")
            },
            "fcm_result": result
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"[FCM API] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/fcm/check-inactivity", tags=["Notifications"])
async def check_inactivity_and_notify(request: InactivityCheckRequest):
    """
    Manually trigger inactivity check and send notifications
    
    Args:
        inactivity_threshold_days: Days without activity to consider as inactive
    
    Returns:
        Check results and notification statistics
    """
    try:
        print(f"\n[FCM API] Manual inactivity check triggered")
        
        # Import scheduler here to avoid circular imports
        from backend.services.notification_scheduler import NotificationScheduler
        
        scheduler = NotificationScheduler(db, fcm_service)
        result = await scheduler.check_inactivity_and_notify(
            inactivity_threshold_days=request.inactivity_threshold_days
        )
        
        return result
        
    except Exception as e:
        print(f"[FCM API] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/fcm/user-tokens", tags=["Notifications"])
async def get_user_fcm_status(user_id: str):
    """
    Get FCM token status for a user
    
    Args:
        user_id: User identifier
    
    Returns:
        FCM token status
    """
    try:
        user = await db.get_user(user_id)
        if not user:
            raise HTTPException(status_code=404, detail=f"User {user_id} not found")
        
        has_token = bool(user.get("fcm_token"))
        token_preview = (user.get("fcm_token", "")[:20] + "...") if has_token else None
        
        return {
            "user_id": user_id,
            "username": user["username"],
            "has_fcm_token": has_token,
            "token_preview": token_preview,
            "status": "ready_to_receive" if has_token else "no_device_registered"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[FCM API] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/fcm/send-test-batch", tags=["Notifications"])
async def send_test_batch_notification():
    """
    Send test notification to all registered users
    
    Returns:
        Batch notification results
    """
    try:
        print(f"\n[FCM API] Batch test notification requested")
        
        # Get all users with FCM tokens
        users = await db.fetch_all(
            "SELECT user_id, username FROM users WHERE fcm_token IS NOT NULL"
        )
        
        print(f"[FCM API] Found {len(users)} users with FCM tokens")
        
        if not users:
            return {
                "status": "info",
                "message": "No users with FCM tokens registered yet",
                "users_count": 0
            }
        
        # Send test notifications
        results = await fcm_service.send_batch_notifications(
            user_ids=[u["user_id"] for u in users],
            title="🧪 FCM Test Notification",
            body="This is a test notification to verify your device is receiving messages!",
            data={"type": "test"}
        )
        
        return results
        
    except Exception as e:
        print(f"[FCM API] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
