import os
from datetime import datetime

def log_visual_event(scene_description):
    base_path = os.path.dirname(os.path.abspath(__file__))
    log_path = os.path.join(base_path, "kira_visual_log.txt")

    entry = f"[{datetime.now().isoformat()}] {scene_description}\n"

    with open(log_path, "a") as f:
        f.write(entry)

if __name__ == "__main__":
    log_visual_event("Scene detected: glowing lights and soft shadows.")
    print("Jetson 3: Visual memory logged.")
