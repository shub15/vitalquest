#!/usr/bin/env python3
"""
Direct server runner to catch all errors
"""

import os
import logging

logging.basicConfig(level=logging.DEBUG)

# Set environment variables
os.environ['MYSQL_HOST'] = '127.0.0.1'
os.environ['MYSQL_USER'] = 'root'
os.environ['MYSQL_PASSWORD'] = 'Abhijit@2005'
os.environ['MYSQL_DB'] = 'vital_quest'
os.environ['MYSQL_PORT'] = '3306'

from backend.main import app
import uvicorn

if __name__ == "__main__":
    print("\n" + "="*80)
    print("VITAL QUEST SERVER - DIRECT RUNNER")
    print("="*80 + "\n")
    
    try:
        uvicorn.run(
            app,
            host="127.0.0.1",
            port=8001,
            log_level="info"
        )
    except KeyboardInterrupt:
        print("\n\nServer stopped by user")
    except Exception as e:
        print(f"\n\n✗ Server error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
