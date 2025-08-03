import json
import datetime
from noise_filter import is_noise

def process_input_and_forward(text):
    if is_noise(text):
        print("[Filtered as background noise]")
        return

    entry = {
        "timestamp": datetime.datetime.now().isoformat(),
        "heard": text
    }

    with open("logs/kira_heard.json", "a") as f:
        f.write(json.dumps(entry) + "\n")

    print("[Logged voice input]")

    # Save a reaction message for Jetson 3
    with open("shared/reaction_queue.txt", "w") as out:
        out.write(text)
