import os
import json

def run_startup_checks():
    base_path = os.path.dirname(os.path.abspath(__file__))

    memory_dir = os.path.join(base_path, "memory")
    logs_dir = os.path.join(base_path, "logs")
    queue_path = os.path.join(base_path, "reaction_queue.txt")
    memory_path = os.path.join(memory_dir, "memory.json")

    os.makedirs(memory_dir, exist_ok=True)
    os.makedirs(logs_dir, exist_ok=True)

    if not os.path.exists(memory_path):
        with open(memory_path, "w") as f:
            json.dump({
                "memories": [],
                "emotions": {"current_mood": "curious"}
            }, f, indent=2)

    if not os.path.exists(queue_path):
        open(queue_path, "w").close()

    print("Jetson 1: Startup checks complete.")

if __name__ == "__main__":
    run_startup_checks()

