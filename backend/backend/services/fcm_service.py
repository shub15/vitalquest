#!/usr/bin/env python3
"""
Firebase Cloud Messaging (FCM) Service
Handles sending push notifications to mobile devices
"""

import os
import json
import firebase_admin
from firebase_admin import credentials, messaging
from datetime import datetime
from typing import Optional, Dict, Any
from backend.database.mysql_client import MySQLClient

class FCMService:
    """Firebase Cloud Messaging notification service"""
    
    def __init__(self):
        """Initialize Firebase Admin SDK"""
        self.db = None
        self._initialize_firebase()
    
    def _initialize_firebase(self):
        """Initialize Firebase Admin SDK with credentials"""
        try:
            # Get credentials path from environment or default
            creds_path = os.getenv("FIREBASE_CREDENTIALS_PATH", "./firebase-key.json")
            
            # Check if file exists
            if not os.path.exists(creds_path):
                print(f"[FCM] Firebase credentials file not found at {creds_path}")
                print("[FCM] Using development mode (terminal output only)")
                self.firebase_initialized = False
                return
            
            # Initialize Firebase only once
            if not firebase_admin._apps:
                creds = credentials.Certificate(creds_path)
                firebase_admin.initialize_app(creds)
                print(f"[FCM] Firebase Admin SDK initialized with {creds_path}")
                self.firebase_initialized = True
            else:
                print("[FCM] Firebase Admin SDK already initialized")
                self.firebase_initialized = True
                
        except Exception as e:
            print(f"[FCM] Firebase initialization warning: {str(e)}")
            print("[FCM] Will use terminal output mode for notifications")
            self.firebase_initialized = False
    
    async def initialize_db(self, db: MySQLClient):
        """Set database client for token lookups"""
        self.db = db
    
    async def update_user_fcm_token(self, user_id: str, fcm_token: str) -> dict:
        """
        Update or insert FCM token for a user
        
        Args:
            user_id: User ID
            fcm_token: Firebase device token
            
        Returns:
            dict with status and message
        """
        try:
            if not self.db:
                return {"status": "error", "message": "Database not initialized"}
            
            print(f"[FCM] Updating FCM token for user: {user_id}")
            
            # Update user with FCM token
            query = "UPDATE users SET fcm_token = %s WHERE user_id = %s"
            await self.db.execute(query, (fcm_token, user_id))
            
            print(f"[FCM] FCM token updated successfully for {user_id}")
            
            return {
                "status": "success",
                "message": f"FCM token updated for user {user_id}",
                "user_id": user_id
            }
            
        except Exception as e:
            error_msg = f"Failed to update FCM token: {str(e)}"
            print(f"[FCM] Error: {error_msg}")
            return {"status": "error", "message": error_msg}
    
    async def send_notification(
        self,
        user_id: str,
        title: str,
        body: str,
        data: Optional[Dict[str, str]] = None,
        notification_type: str = "general"
    ) -> dict:
        """
        Send push notification to a user
        
        Args:
            user_id: User ID
            title: Notification title
            body: Notification body/message
            data: Optional custom data fields
            notification_type: Type of notification (for logging)
            
        Returns:
            dict with status and message
        """
        try:
            if not self.db:
                return {"status": "error", "message": "Database not initialized"}
            
            print(f"\n[FCM] Processing notification for user: {user_id}")
            print(f"[FCM] Type: {notification_type}")
            print(f"[FCM] Title: {title}")
            print(f"[FCM] Body: {body}")
            
            # Get user and FCM token
            user = await self.db.get_user(user_id)
            if not user:
                return {"status": "error", "message": f"User {user_id} not found"}
            
            username = user.get("username", "User")
            fcm_token = user.get("fcm_token")
            
            # Check if FCM token exists
            if not fcm_token:
                print(f"[FCM] No FCM token for user {username} ({user_id})")
                print("[FCM] Note: User has not registered a device yet")
                return {
                    "status": "pending",
                    "message": f"No device registered for {username}",
                    "user_id": user_id
                }
            
            # Default data if not provided
            if data is None:
                data = {}
            
            data["type"] = notification_type
            data["user_id"] = user_id
            data["username"] = username
            
            # ALWAYS show terminal output for debugging
            print(f"\n{'='*80}")
            print(f"[FCM - TERMINAL OUTPUT]")
            print(f"{'='*80}")
            print(f"TO: {username} ({user_id})")
            print(f"NOTIFICATION TYPE: {notification_type}")
            print(f"TITLE: {title}")
            print(f"MESSAGE: {body}")
            print(f"DATA: {json.dumps(data, indent=2)}")
            print(f"TIMESTAMP: {datetime.now().isoformat()}")
            print(f"FCM TOKEN: {fcm_token[:20]}..." if fcm_token else "No token")
            print(f"{'='*80}\n")
            
            # If Firebase is initialized, ALSO send via FCM to real devices
            if self.firebase_initialized:
                try:
                    message = messaging.Message(
                        notification=messaging.Notification(
                            title=title,
                            body=body
                        ),
                        data=data,
                        token=fcm_token
                    )
                    
                    response = messaging.send(message)
                    
                    print(f"[FCM] ✅ Notification sent to device!")
                    print(f"[FCM] Message ID: {response}\n")
                    
                    return {
                        "status": "success",
                        "message": f"Notification sent to {username}",
                        "user_id": user_id,
                        "message_id": response,
                        "device_token": fcm_token[:20] + "...",
                        "mode": "production+terminal"
                    }
                    
                except firebase_admin.exceptions.InvalidArgumentError as e:
                    print(f"[FCM] ❌ Invalid FCM token (mock/expired): {str(e)}")
                    print(f"[FCM] Note: This is expected for demo tokens. Use real device tokens in production.\n")
                    return {
                        "status": "error",
                        "message": "Invalid FCM token (expected for demo)",
                        "user_id": user_id,
                        "note": "Terminal output shown above - real device tokens needed for actual delivery"
                    }
                except Exception as e:
                    print(f"[FCM] ⚠️  Firebase error: {str(e)}")
                    print(f"[FCM] Notification shown in terminal anyway\n")
                    return {
                        "status": "partial",
                        "message": f"Terminal output shown (Firebase error: {str(e)})",
                        "user_id": user_id
                    }
                    
            else:
                # Development mode only (no Firebase credentials)
                return {
                    "status": "success",
                    "message": f"Notification displayed in terminal for {username}",
                    "user_id": user_id,
                    "mode": "development_only",
                    "device_token": fcm_token[:20] + "..." if fcm_token else None
                }
                
        except Exception as e:
            error_msg = f"Failed to send notification: {str(e)}"
            print(f"[FCM] Error: {error_msg}")
            import traceback
            traceback.print_exc()
            return {"status": "error", "message": error_msg}
    
    async def send_batch_notifications(
        self,
        user_ids: list,
        title: str,
        body: str,
        data: Optional[Dict[str, str]] = None
    ) -> dict:
        """
        Send notification to multiple users
        
        Args:
            user_ids: List of user IDs
            title: Notification title
            body: Notification body
            data: Optional custom data
            
        Returns:
            dict with aggregate results
        """
        results = []
        success_count = 0
        failed_count = 0
        
        print(f"\n[FCM] Sending batch notification to {len(user_ids)} users")
        
        for user_id in user_ids:
            result = await self.send_notification(user_id, title, body, data)
            results.append(result)
            
            if result["status"] == "success":
                success_count += 1
            else:
                failed_count += 1
        
        return {
            "status": "complete",
            "total": len(user_ids),
            "success": success_count,
            "failed": failed_count,
            "results": results
        }


# Singleton instance
_fcm_service = None

def get_fcm_service() -> FCMService:
    """Get or create FCM service instance"""
    global _fcm_service
    if _fcm_service is None:
        _fcm_service = FCMService()
    return _fcm_service
