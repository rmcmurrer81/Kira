
import os

def run_startup_checks():
    os.makedirs("memory", exist_ok=True)
    os.makedirs("logs", exist_ok=True)
    if not os.path.exists("memory/memory.json"):
        with open("memory/memory.json", "w") as f:
            f.write('{ "memories": [], "emotions": { "current_mood": "curious" } }')
    if not os.path.exists("reaction_queue.txt"):
        open("reaction_queue.txt", "w").close()
