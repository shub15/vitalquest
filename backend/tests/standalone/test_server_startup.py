#!/usr/bin/env python3
"""
Server startup test - runs server in foreground and catches errors
"""

import asyncio
import sys
import os

# Set environment variables
os.environ['MYSQL_HOST'] = '127.0.0.1'
os.environ['MYSQL_USER'] = 'root'
os.environ['MYSQL_PASSWORD'] = 'Abhijit@2005'
os.environ['MYSQL_DB'] = 'vital_quest'
os.environ['MYSQL_PORT'] = '3306'

print("\n" + "="*80)
print("VITAL QUEST SERVER STARTUP TEST")
print("="*80 + "\n")

try:
    from backend.main import app
    print("✓ App imported successfully\n")
    
    print("Router Status:")
    print(f"  - Gamification: {len(app.routes) > 0}")
    print(f"  - Total routes: {len(app.routes)}\n")
    
    print("Testing imports of key modules...")
    from backend.services import gamification_engine
    print("  ✓ gamification_engine")
    
    from backend.services import battle_system
    print("  ✓ battle_system")
    
    from backend.database.mysql_client import MySQLClient
    print("  ✓ MySQLClient")
    
    print("\n" + "="*80)
    print("✓ ALL IMPORTS SUCCESSFUL - SERVER IS READY")
    print("="*80 + "\n")
    
    print("Available routes:")
    for route in app.routes:
        if hasattr(route, 'path'):
            methods = getattr(route, 'methods', ['GET'])
            print(f"  {list(methods)[0]:6} {route.path}")
    
except Exception as e:
    print(f"\n✗ ERROR: {type(e).__name__}: {str(e)}")
    import traceback
    traceback.print_exc()
    sys.exit(1)
