import sqlite3

conn = sqlite3.connect("events.db")
cursor = conn.cursor()

cursor.execute("""
    CREATE TABLE IF NOT EXISTS events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        timestamp TEXT,
        source TEXT,
        entity_id TEXT,
        location TEXT,
        event_type TEXT,
        flagged INTEGER DEFAULT 0
    )
""")

cursor.execute("""
    CREATE TABLE IF NOT EXISTS incidents (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        entity_id TEXT,
        confidence REAL,
        summary TEXT,
        predicted_next TEXT,
        created_at TEXT
    )
""")

conn.commit()
print("Database ready")