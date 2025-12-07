#!/usr/bin/env python
"""Comprehensive test of all core endpoints"""
import sys
sys.path.insert(0, "d:/Code/periscope")

import asyncio
import httpx
import json

async def test_all():
    async with httpx.AsyncClient(timeout=10.0) as client:
        
        print("\n" + "=" * 70)
        print("1. GAMIFICATION: Calculate XP")
        print("=" * 70)
        resp = await client.post("http://127.0.0.1:8000/api/rpg/calculate-xp", json={
            "user_id": "user_test",
            "date": "2025-12-06",
            "steps": 5000,
            "calories_burned": 800,
            "sleep_total_minutes": 480,
            "recovery_score": 75
        })
        data = resp.json()
        print(f"Input: 5000 steps, 800 cal, 480min sleep, 75% recovery")
        print(f"Output XP: {data.get('xp')}")
        print(f"New Level: {data.get('new_level')}")
        
        print("\n" + "=" * 70)
        print("2. RPG: Get User Class")
        print("=" * 70)
        resp = await client.get("http://127.0.0.1:8000/api/rpg/user/user_a/class?days=7")
        data = resp.json()
        print(f"User: user_a")
        print(f"Class: {data.get('rpg_class')}")
        print(f"Avatar: {data.get('avatar_url')}")
        
        print("\n" + "=" * 70)
        print("3. BATTLE: Get Leaderboard")
        print("=" * 70)
        resp = await client.get("http://127.0.0.1:8000/api/battles/battle_demo/leaderboard")
        data = resp.json()
        print(f"Battle: battle_demo")
        for team in data.get('teams', []):
            print(f"  Rank {team['rank']}: {team['team_id']} - Score: {team['battle_score']}")
        
        print("\n" + "=" * 70)
        print("4. LEADERBOARD: Global Top 5")
        print("=" * 70)
        resp = await client.get("http://127.0.0.1:8000/api/leaderboard/global?period=all")
        data = resp.json()
        rankings = data.get('rankings', [])
        print(f"Total users: {len(rankings)}")
        for i, user in enumerate(rankings[:5], 1):
            print(f"  {i}. {user.get('user_id'):15} Level {user.get('level'):2}  XP: {user.get('xp', 0):6.0f}")
        
        print("\n" + "=" * 70)
        print("5. SOCIAL FEED: Generate Daily Post")
        print("=" * 70)
        resp = await client.post("http://127.0.0.1:8000/api/feed/generate-daily-post", params={
            "user_id": "user_demo",
            "username": "demo_user",
            "date": "2025-12-06",
            "total_steps": 15000,
            "total_calories_active": 900,
        })
        data = resp.json()
        if resp.status_code == 200:
            post = data.get('post', {})
            print(f"Generated post for user_demo")
            print(f"  Type: {post.get('type')}")
            print(f"  Message: {post.get('content', {}).get('message')}")
            print(f"  Image: {post.get('content', {}).get('image_url')}")
        
        print("\n" + "=" * 70)
        print("6. SOCIAL FEED: Get User Feed")
        print("=" * 70)
        resp = await client.get("http://127.0.0.1:8000/api/feed/user/user_demo")
        data = resp.json()
        posts = data.get('posts', [])
        print(f"Posts for user_demo: {len(posts)}")
        if posts:
            p = posts[0]
            print(f"  Latest: {p.get('type')} at {p.get('timestamp')}")
        
        print("\n" + "=" * 70)
        print("7. ADMIN: Trigger Aggregation")
        print("=" * 70)
        resp = await client.post("http://127.0.0.1:8000/api/admin/aggregate-now")
        data = resp.json()
        print(f"Aggregation status: {data.get('status')}")
        print(f"Last run: {data.get('last_aggregation')}")
        print(f"Battle scores: {data.get('battle_scores')}")

asyncio.run(test_all())
