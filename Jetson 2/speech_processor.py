import speech_recognition as sr
import os
import json
import time

# Ensure folders exist
os.makedirs("logs", exist_ok=True)
os.makedirs("shared", exist_ok=True)

log_path = "logs/kira_heard.json"
queue_path = "shared/reaction_queue.txt"

# Initialize recognizer
recognizer = sr.Recognizer()
mic = sr.Microphone()

# Load or create log file
if not os.path.exists(log_path):
    with open(log_path, "w") as f:
        json.dump({"log": []}, f, indent=2)

print("🎤 Jetson 2 is listening and logging...")

while True:
    try:
        with mic as source:
            print("Listening...")
            audio = recognizer.listen(source)

        # Convert audio to text
        text = recognizer.recognize_google(audio).strip()
        timestamp = time.strftime("%Y-%m-%dT%H:%M:%S")

        print(f"Heard: {text}")

        # Append to kira_heard.json
        with open(log_path, "r") as f:
            data = json.load(f)

        data["log"].append({"timestamp": timestamp, "text": text})

        with open(log_path, "w") as f:
            json.dump(data, f, indent=2)

        # Write to reaction queue
        with open(queue_path, "a") as f:
            f.write(f"{timestamp}: {text}\n")

    except sr.UnknownValueError:
        print("Could not understand audio.")
    except Exception as e:
        print(f"Error: {e}")
