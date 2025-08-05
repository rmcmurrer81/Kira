from datetime import datetime
from pathlib import Path

def log_visual_event(scene_description):
    base_path = Path(__file__).resolve().parent
    log_path = base_path / "kira_visual_log.txt"

    entry = f"[{datetime.now().isoformat()}] {scene_description}\n"

    with open(log_path, "a", encoding="utf-8") as f:
        f.write(entry)

if __name__ == "__main__":
    log_visual_event("Scene detected: glowing lights and soft shadows.")
    print("Jetson 3: Visual memory logged.")
