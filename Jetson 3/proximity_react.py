import board
import busio
import time
import os
import json
import adafruit_vl53l0x

# Paths
queue_path = "shared/reaction_queue.txt"
memory_path = "memory/memory.json"

# Initialize VL53L0X sensor
i2c = busio.I2C(board.SCL, board.SDA)
vl53 = adafruit_vl53l0x.VL53L0X(i2c)

# Setup folders
os.makedirs("shared", exist_ok=True)
os.makedirs("memory", exist_ok=True)

def log_memory(event, mood):
    timestamp = time.strftime("%Y-%m-%dT%H:%M:%S")
    if os.path.exists(memory_path):
        with open(memory_path, "r") as f:
            data = json.load(f)
    else:
        data = {
            "memories": [],
            "emotions": {
                "current_mood": mood,
                "mood_log": []
            }
        }

    data["memories"].append({
        "timestamp": timestamp,
        "event": event,
        "mood": mood
    })

    data["emotions"]["current_mood"] = mood
    data["emotions"]["mood_log"].append({
        "timestamp": timestamp,
        "mood": mood
    })

    with open(memory_path, "w") as f:
        json.dump(data, f, indent=2)

def write_reaction(mood):
    timestamp = time.strftime("%Y-%m-%dT%H:%M:%S")
    with open(queue_path, "a") as f:
        f.write(f"{timestamp}: {mood}\n")

print("🧠 Jetson 3 proximity monitor active...")

while True:
    distance = vl53.range
    print(f"Distance: {distance} mm")

    if distance < 300:
        mood = "curious"
        log_memory("someone got close", mood)
        write_reaction(mood)
        print("➡️ Mood triggered: curious")

    elif distance < 150:
        mood = "playful"
        log_memory("very close proximity", mood)
        write_reaction(mood)
        print("➡️ Mood triggered: playful")

    elif distance > 1000:
        mood = "sad"
        log_memory("lonely", mood)
        write_reaction(mood)
        print("➡️ Mood triggered: sad")

    time.sleep(2)
