import os
from pathlib import Path
from dotenv import load_dotenv

print("Starting test...")

load_dotenv(Path(__file__).parent.parent / ".env")

print("API:", os.getenv("SUPERMEMORY_API_KEY"))
print("BASE:", os.getenv("SUPERMEMORY_BASE_URL"))

from supermemory import Supermemory

print("Creating client...")

client = Supermemory(
    api_key=os.getenv("SUPERMEMORY_API_KEY"),
    base_url=os.getenv("SUPERMEMORY_BASE_URL"),
)

print("Searching...")

try:
    results = client.search.documents(
        q="budget freeze",
        container_tags=["deal-padma-oracle"],
        limit=5,
    )

    print("RESULTS:")
    print(repr(results))

except Exception as e:
    print("ERROR:")
    print(type(e))
    print(e)

print("Finished")