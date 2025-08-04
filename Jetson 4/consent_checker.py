import json
import os

config_path = "Jetson 4/bond_config.json"
trust_threshold = 7  # Change this to raise/lower required trust level

def check_trust():
    if not os.path.exists(config_path):
        print("No bond config found. Locking all trust-based modes.")
        return False

    with open(config_path, "r") as f:
        config = json.load(f)

    score = config.get("trust_score", 0)
    print(f"🤝 Current trust score: {score}")

    return score >= trust_threshold
