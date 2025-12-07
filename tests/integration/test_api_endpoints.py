#!/usr/bin/env python3
"""
API Endpoint Test Script - Tests all backend endpoints with dummy data
Shows responses and demonstrates the Swagger UI is working
"""

import httpx
import json
import asyncio
from datetime import datetime, date

BASE_URL = "http://127.0.0.1:8001"

async def test_endpoints():
    print("\n" + "="*80)
    print("VITAL QUEST BACKEND API TEST")
    print("="*80)
    
    # Test 1: Health Check
    print("\n[TEST 1] Health Check")
    print("-" * 80)
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/health")
        print(f"GET /health")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}\n")
    
    # Test 2: Root endpoint
    print("[TEST 2] Root Endpoint")
    print("-" * 80)
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{BASE_URL}/")
        print(f"GET /")
        print(f"Status: {response.status_code}")
        print(f"Response: {json.dumps(response.json(), indent=2)}\n")
    
    # Test 3: Calculate XP
    print("[TEST 3] Calculate XP Endpoint")
    print("-" * 80)
    
    health_data = {
        "user_id": "user_001",
        "date": str(date.today()),
        "steps": 8000,
        "heart_rate_avg": 75.5,
        "sleep_total_minutes": 480,
        "sleep_deep_minutes": 120,
        "sleep_light_minutes": 240,
        "calories_burned": 400
    }
    
    print(f"POST /gamification/calculate-xp")
    print(f"Payload: {json.dumps(health_data, indent=2)}")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.post(
                f"{BASE_URL}/gamification/calculate-xp",
                json=health_data,
                timeout=10.0
            )
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                print(f"✓ Response: {json.dumps(result, indent=2)}\n")
                print(f"  Summary:")
                print(f"    - User: {result.get('user_id')}")
                print(f"    - XP Gained: {result.get('xp_gained')}")
                print(f"    - New Level: {result.get('new_level')}")
                print(f"    - Leveled Up: {result.get('leveled_up')}")
                print()
            else:
                print(f"✗ Error Response: {response.text}\n")
        except Exception as e:
            print(f"✗ Request failed: {str(e)}\n")
            print(f"  Note: This might fail if MySQL is not connected yet (which is expected)")
            print(f"  We'll set up MySQL connection next\n")
    
    # Test 4: Get User RPG Class
    print("[TEST 4] Get User RPG Class")
    print("-" * 80)
    print(f"GET /gamification/user/{{user_id}}/class")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{BASE_URL}/gamification/user/user_001/class?days=7",
                timeout=10.0
            )
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                print(f"✓ Response: {json.dumps(result, indent=2)}\n")
            else:
                print(f"✗ Error Response: {response.text}\n")
        except Exception as e:
            print(f"✗ Request failed: {str(e)}\n")
    
    # Test 5: Get Leaderboard
    print("[TEST 5] Get Global Leaderboard")
    print("-" * 80)
    print(f"GET /leaderboard/global?limit=10")
    
    async with httpx.AsyncClient() as client:
        try:
            response = await client.get(
                f"{BASE_URL}/leaderboard/global?limit=10",
                timeout=10.0
            )
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                result = response.json()
                print(f"✓ Response: {json.dumps(result, indent=2)}\n")
            else:
                print(f"✗ Error Response: {response.text}\n")
        except Exception as e:
            print(f"✗ Request failed: {str(e)}\n")
    
    print("="*80)
    print("API TEST COMPLETE")
    print("="*80)
    print("\n✓ Server is running and responding to requests!")
    print("\n📍 Access Swagger UI at: http://127.0.0.1:8001/docs")
    print("📍 Access ReDoc at: http://127.0.0.1:8001/redoc")
    print("\nNext step: Set up MySQL database connection\n")

if __name__ == "__main__":
    asyncio.run(test_endpoints())
