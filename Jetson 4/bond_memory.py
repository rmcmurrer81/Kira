import json
import os
import time

bond_log_path = "Jetson 4/bond_memory.json"

# Ensure the bond log exists
if not os.path.exists("Jetson 4"):
    os.makedirs("Jetson 4")

if not os.path.exists(bond_log_path):
    with open(bond_log_path, "w") as f:
        json.dump({"bond_log": []}, f, indent=2)

def log_bond_event(event, description=None):
    timestamp = time.strftime("%Y-%m-%dT%H:%M:%S")
    entry = {
        "timestamp": timestamp,
        "event": event,
        "description": description or ""
    }

    with open(bond_log_path, "r") as f:
        data = json.load(f)

    data["bond_log"].append(entry)

    with open(bond_log_path, "w") as f:
        json.dump(data, f, indent=2)
