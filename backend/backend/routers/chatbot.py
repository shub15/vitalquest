#!/usr/bin/env python3
"""
Chatbot Router - Personalized AI chatbot endpoints
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timedelta

from backend.services.personalized_chatbot import PersonalizedChatbot
from backend.database.mysql_client import MySQLClient
import os

router = APIRouter()

# Database configuration
db = MySQLClient(
    host=os.getenv("MYSQL_HOST", "127.0.0.1"),
    user=os.getenv("MYSQL_USER", "root"),
    password=os.getenv("MYSQL_PASSWORD", "Abhijit@2005"),
    database=os.getenv("MYSQL_DB", "vital_quest"),
    port=int(os.getenv("MYSQL_PORT", 3306))
)

# Store active chatbot sessions (in production, use Redis or similar)
chatbot_sessions = {}

class ChatRequest(BaseModel):
    user_id: str
    message: str

class ChatResponse(BaseModel):
    response: str
    timestamp: str
    status: str
    user_context: Optional[dict] = None

class InitChatbotRequest(BaseModel):
    user_id: str
    days_history: Optional[int] = 365  # Load last N days of data

@router.on_event("startup")
async def startup():
    """Initialize database connection"""
    await db.init()
    print("[CHATBOT ROUTER] Database connection initialized")

@router.on_event("shutdown")
async def shutdown():
    """Close database connection"""
    await db.close()
    print("[CHATBOT ROUTER] Database connection closed")

@router.post("/chatbot/init", tags=["AI Chatbot"])
async def initialize_chatbot(request: InitChatbotRequest):
    """
    Initialize personalized chatbot for a user by loading their health history
    """
    try:
        print(f"\n[CHATBOT API] Initializing chatbot for user: {request.user_id}")
        
        # Get user profile
        user = await db.get_user(request.user_id)
        if not user:
            raise HTTPException(status_code=404, detail=f"User {request.user_id} not found")
        
        # Calculate date range
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=request.days_history)
        
        # Load user's daily logs
        print(f"[CHATBOT API] Loading {request.days_history} days of health data...")
        daily_logs = await db.get_daily_logs_for_user_range(
            request.user_id,
            start_date.isoformat(),
            end_date.isoformat()
        )
        
        # Create chatbot instance
        chatbot = PersonalizedChatbot(
            user_id=request.user_id,
            username=user['username']
        )
        
        # Load user context
        chatbot.load_user_context(daily_logs, user_profile=user)
        
        # Store session
        chatbot_sessions[request.user_id] = chatbot
        
        print(f"[CHATBOT API] Chatbot initialized successfully for {user['username']}")
        
        return {
            "status": "success",
            "message": f"Chatbot initialized for {user['username']}",
            "user_id": request.user_id,
            "username": user['username'],
            "days_loaded": len(daily_logs),
            "context_summary": chatbot.user_context.get('last_30_days', {})
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[CHATBOT API] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/chatbot/chat", response_model=ChatResponse, tags=["AI Chatbot"])
async def chat_with_bot(request: ChatRequest):
    """
    Send a message to the personalized AI chatbot
    User's health history is used to provide context-aware responses
    """
    try:
        print(f"\n[CHATBOT API] Chat request from user: {request.user_id}")
        
        # Check if chatbot session exists
        if request.user_id not in chatbot_sessions:
            # Auto-initialize if not exists
            print(f"[CHATBOT API] No active session, initializing...")
            await initialize_chatbot(InitChatbotRequest(user_id=request.user_id))
        
        chatbot = chatbot_sessions[request.user_id]
        
        # Process message
        print(f"[CHATBOT API] User message: '{request.message}'")
        response = await chatbot.chat(request.message)
        
        # Print to terminal
        print(f"\n{'='*80}")
        print(f"USER ({chatbot.username}): {request.message}")
        print(f"{'-'*80}")
        print(f"AI CHATBOT: {response['response']}")
        print(f"{'='*80}\n")
        
        return ChatResponse(**response)
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"[CHATBOT API] Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/chatbot/history/{user_id}", tags=["AI Chatbot"])
async def get_chat_history(user_id: str):
    """
    Get conversation history for a user
    """
    if user_id not in chatbot_sessions:
        raise HTTPException(status_code=404, detail="No active chatbot session for this user")
    
    chatbot = chatbot_sessions[user_id]
    history = chatbot.get_conversation_history()
    
    return {
        "user_id": user_id,
        "username": chatbot.username,
        "conversation_count": len(history),
        "history": history
    }

@router.post("/chatbot/clear/{user_id}", tags=["AI Chatbot"])
async def clear_chat_history(user_id: str):
    """
    Clear conversation history for a user
    """
    if user_id not in chatbot_sessions:
        raise HTTPException(status_code=404, detail="No active chatbot session for this user")
    
    chatbot = chatbot_sessions[user_id]
    chatbot.clear_history()
    
    return {
        "status": "success",
        "message": f"Conversation history cleared for {chatbot.username}"
    }
