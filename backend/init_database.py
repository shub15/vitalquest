#!/usr/bin/env python3
"""
MySQL Database Initialization Script
Creates the vital_quest database schema with all necessary tables
"""

import mysql.connector
from mysql.connector import Error
import os
import json
from datetime import date, timedelta

# Configuration
MYSQL_HOST = os.getenv("MYSQL_HOST", "127.0.0.1")
MYSQL_USER = os.getenv("MYSQL_USER", "root")
MYSQL_PASSWORD = os.getenv("MYSQL_PASSWORD", "")
MYSQL_DB = os.getenv("MYSQL_DB", "vital_quest")
MYSQL_PORT = int(os.getenv("MYSQL_PORT", 3306))

def create_connection():
    """Create a database connection to MySQL"""
    connection = None
    try:
        connection = mysql.connector.connect(
            host=MYSQL_HOST,
            port=MYSQL_PORT,
            user=MYSQL_USER,
            password=MYSQL_PASSWORD
        )
        return connection
    except Error as e:
        print(f"✗ Error connecting to MySQL: {e}")
        return None

def create_database(connection, db_name):
    """Create the database if it doesn't exist"""
    cursor = connection.cursor()
    try:
        cursor.execute(f"CREATE DATABASE IF NOT EXISTS {db_name}")
        print(f"✓ Database '{db_name}' created or already exists")
        connection.commit()
    except Error as e:
        print(f"✗ Error creating database: {e}")
    finally:
        cursor.close()

def create_tables(connection, db_name):
    """Create all necessary tables"""
    cursor = connection.cursor()
    cursor.execute(f"USE {db_name}")
    
    # Define all SQL statements for creating tables
    sql_statements = [
        # Users table
        """
        CREATE TABLE IF NOT EXISTS users (
            user_id VARCHAR(255) PRIMARY KEY,
            username VARCHAR(255),
            team_id VARCHAR(255),
            level INT DEFAULT 1,
            xp INT DEFAULT 0,
            strength FLOAT DEFAULT 0,
            vitality FLOAT DEFAULT 0,
            stamina FLOAT DEFAULT 0,
            rpg_class VARCHAR(100) DEFAULT 'Villager',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_team_id (team_id),
            INDEX idx_level (level),
            INDEX idx_xp (xp)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """,
        
        # Daily Logs table
        """
        CREATE TABLE IF NOT EXISTS daily_logs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            date DATE NOT NULL,
            data JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE KEY unique_user_date (user_id, date),
            INDEX idx_user_id (user_id),
            INDEX idx_date (date),
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """,
        
        # Teams table
        """
        CREATE TABLE IF NOT EXISTS teams (
            team_id VARCHAR(255) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """,
        
        # Battles table
        """
        CREATE TABLE IF NOT EXISTS battles (
            battle_id VARCHAR(255) PRIMARY KEY,
            team_a_id VARCHAR(255) NOT NULL,
            team_b_id VARCHAR(255) NOT NULL,
            start_date DATE NOT NULL,
            end_date DATE NOT NULL,
            status VARCHAR(50) DEFAULT 'active',
            scores JSON,
            winner VARCHAR(255),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            INDEX idx_status (status),
            INDEX idx_team_a (team_a_id),
            INDEX idx_team_b (team_b_id),
            FOREIGN KEY (team_a_id) REFERENCES teams(team_id) ON DELETE CASCADE,
            FOREIGN KEY (team_b_id) REFERENCES teams(team_id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """,
        
        # Social Feed table
        """
        CREATE TABLE IF NOT EXISTS social_feed (
            post_id VARCHAR(255) PRIMARY KEY,
            user_id VARCHAR(255) NOT NULL,
            type VARCHAR(100),
            timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
            content JSON,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_user_id (user_id),
            INDEX idx_timestamp (timestamp),
            FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """,
        
        # Meta table (for storing key-value pairs)
        """
        CREATE TABLE IF NOT EXISTS meta (
            key_name VARCHAR(255) PRIMARY KEY,
            value_data TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
        """
    ]
    
    try:
        for i, sql in enumerate(sql_statements, 1):
            cursor.execute(sql)
            table_names = ["users", "daily_logs", "teams", "battles", "social_feed", "meta"]
            print(f"✓ Table '{table_names[i-1]}' created or already exists")
        connection.commit()
        print(f"\n✓ All {len(sql_statements)} tables created successfully!")
    except Error as e:
        print(f"✗ Error creating tables: {e}")
        connection.rollback()
    finally:
        cursor.close()

def insert_dummy_data(connection, db_name):
    """Insert some dummy data for testing"""
    cursor = connection.cursor()
    cursor.execute(f"USE {db_name}")
    
    try:
        # Insert dummy team
        cursor.execute("""
            INSERT INTO teams (team_id, name) VALUES (%s, %s)
            ON DUPLICATE KEY UPDATE name = VALUES(name)
        """, ("team_alpha", "Alpha Team"))
        
        cursor.execute("""
            INSERT INTO teams (team_id, name) VALUES (%s, %s)
            ON DUPLICATE KEY UPDATE name = VALUES(name)
        """, ("team_beta", "Beta Team"))
        
        # Insert dummy users
        cursor.execute("""
            INSERT INTO users (user_id, username, team_id, level, xp, strength, vitality, stamina)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE username = VALUES(username), level = VALUES(level), xp = VALUES(xp)
        """, ("user_001", "HealthWarrior", "team_alpha", 5, 500, 15.5, 20.0, 18.5))
        
        cursor.execute("""
            INSERT INTO users (user_id, username, team_id, level, xp, strength, vitality, stamina)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE username = VALUES(username), level = VALUES(level), xp = VALUES(xp)
        """, ("user_002", "FitRunner", "team_alpha", 3, 200, 12.0, 18.5, 22.0))
        
        cursor.execute("""
            INSERT INTO users (user_id, username, team_id, level, xp, strength, vitality, stamina)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE username = VALUES(username), level = VALUES(level), xp = VALUES(xp)
        """, ("user_003", "YogaMaster", "team_beta", 4, 350, 10.0, 25.0, 20.5))

        cursor.execute("""
            INSERT INTO users (user_id, username, team_id, level, xp, strength, vitality, stamina)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE username = VALUES(username), level = VALUES(level), xp = VALUES(xp)
        """, ("user_004", "DataKnight", "team_beta", 2, 120, 11.0, 16.0, 14.0))

        # Insert a sample battle with scores
        cursor.execute("""
            INSERT INTO battles (battle_id, team_a_id, team_b_id, start_date, end_date, status, scores)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            ON DUPLICATE KEY UPDATE
                status = VALUES(status),
                scores = VALUES(scores)
        """, (
            "battle_demo_001",
            "team_alpha",
            "team_beta",
            date.today().isoformat(),
            (date.today() + timedelta(days=7)).isoformat(),
            "active",
            json.dumps({"team_alpha": 950.0, "team_beta": 870.0}),
        ))
        
        connection.commit()
        print(f"✓ Dummy data inserted successfully!")
        
    except Error as e:
        print(f"✗ Error inserting dummy data: {e}")
        connection.rollback()
    finally:
        cursor.close()

def main():
    print("\n" + "="*80)
    print("VITAL QUEST - DATABASE INITIALIZATION")
    print("="*80)
    print(f"\nConnecting to MySQL at {MYSQL_HOST}:{MYSQL_PORT}")
    print(f"Database: {MYSQL_DB}")
    print(f"User: {MYSQL_USER}\n")
    
    # Create connection
    connection = create_connection()
    if not connection:
        print("✗ Failed to connect to MySQL")
        return False
    
    print("✓ Connected to MySQL\n")
    
    # Create database
    create_database(connection, MYSQL_DB)
    
    # Create tables
    print("\nCreating tables...")
    create_tables(connection, MYSQL_DB)
    
    # Insert dummy data
    print("\nInserting dummy data...")
    insert_dummy_data(connection, MYSQL_DB)
    
    # Close connection
    connection.close()
    print("\n" + "="*80)
    print("✓ DATABASE INITIALIZATION COMPLETE")
    print("="*80 + "\n")
    
    return True

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)
