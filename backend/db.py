import sqlite3

conn = sqlite3.connect("bird_brain.db")
conn.executescript(open("schema.sql").read())
conn.close()
print("Database created successfully.")