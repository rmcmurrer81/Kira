# Jetson 2 Memory Link Script
import json
import os

def sync_memory_with_jetson1():
    print("Connecting to Jetson 1...")

    # Example shared memory file path
    shared_memory_file = "/home/jetson_shared/memory.json"

    if os.path.exists(shared_memory_file):
        with open(shared_memory_file, "r") as f:
            memory_data = json.load(f)
            print("Memory synced with Jetson 1.")
            print("Latest memory:", memory_data.get("memories", [])[-1] if memory_data.get("memories") else "No memories found.")
    else:
        print("Jetson 1 memory file not found.")

if __name__ == "__main__":
    sync_memory_with_jetson1()
