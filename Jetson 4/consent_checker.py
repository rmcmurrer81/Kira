import os
import json

base_path = os.path.dirname(os.path.abspath(__file__))
consent_path = os.path.join(base_path, "bond_config.json")

def has_consent(user_id):
    if not os.path.exists(consent_path):
        return False
    with open(consent_path, "r") as f:
        config = json.load(f)
    return user_id in config.get("approved_users", [])

if __name__ == "__main__":
    print("Jetson 4 consent check:", has_consent("default_user"))
