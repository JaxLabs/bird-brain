import lancedb

db = lancedb.connect("./lancedb")
print("LanceDB connected. Data will live in the ./lancedb folder.")