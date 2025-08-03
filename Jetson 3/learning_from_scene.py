
import datetime

def log_visual_experience(description):
    timestamp = datetime.datetime.now().isoformat()
    with open("kira_visual_log.txt", "a") as log:
        log.write(f"{timestamp}: {description}\n")
