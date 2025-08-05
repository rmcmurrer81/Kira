import os
import json
from datetime import datetime

# Use local file path safely
base_path = os.path.dirname(os.path.abspath(__file__))
memory_path = os.path.join(base_path, "bond_memory.json")

def log_bond_event(event_type, description):
    # Ensure memory file exists or initialize
    if not os.path.exists(memory_path):
        with open(memory_path, "w") as f:
            json.dump({"events": []}, f)

    try:
        with open(memory_path, "r") as f:
            data = json.load(f)
    except json.JSONDecodeError:
        print("Jetson 4: bond_memory.json corrupted. Resetting.")
        data = {"events": []}

    data["events"].append({
        "timestamp": datetime.now().isoformat(),
        "event_type": event_type,
        "description": description
    })

    with open(memory_path, "w") as f:
        json.dump(data, f, indent=2)

if __name__ == "__main__":
    log_bond_event("test", "Bond memory path test successful.")
    print("Jetson 4: Bond log test complete.")

