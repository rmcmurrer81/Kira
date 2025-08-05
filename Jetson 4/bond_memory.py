import os
import json
from datetime import datetime

base_path = os.path.dirname(os.path.abspath(__file__))
memory_path = os.path.join(base_path, "bond_memory.json")

def log_bond_event(event_type, description):
    if not os.path.exists(memory_path):
        with open(memory_path, "w") as f:
            json.dump({"events": []}, f)

    try:
        with open(memory_path, "r") as f:
            data = json.load(f)
    except json.JSONDecodeError:
        print("Jetson 4: bond_memory.json corrupted, resetting.")
        data = {"events": []}

    data["events"].append({
        "timestamp": datetime.now().isoformat(),
        "event_type": event_type,
        "description": description
    })

    temp_path = memory_path + ".tmp"
    with open(temp_path, "w") as f:
        json.dump(data, f, indent=2)
    os.replace(temp_path, memory_path)

if __name__ == "__main__":
    log_bond_event("test", "Bond event test logged.")
    print("Jetson 4: Bond log write test complete.")
