#!/usr/bin/env python3
import asyncio
import aiomysql

async def test():
    try:
        print("Creating aiomysql pool...")
        pool = await aiomysql.create_pool(
            host='127.0.0.1',
            port=3306,
            user='root',
            password='Abhijit@2005',
            db='vital_quest',
            minsize=2,
            maxsize=5
        )
        print("✓ Pool created")
        
        # Test a query
        async with pool.acquire() as conn:
            async with conn.cursor() as cursor:
                await cursor.execute("SELECT COUNT(*) FROM users")
                result = await cursor.fetchone()
                print(f"✓ Query successful: {result} users in database")
        
        pool.close()
        await pool.wait_closed()
        print("✓ Pool closed")
    except Exception as e:
        print(f"✗ Error: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()

asyncio.run(test())
