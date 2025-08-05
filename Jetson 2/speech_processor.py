import speech_recognition as sr
from noise_filter import is_noise
from pathlib import Path
import os

recognizer = sr.Recognizer()
mic = sr.Microphone()

# Point to Jetson 3's shared folder using relative path
base_path = Path(__file__).resolve().parents[1]  # One level up (../)
shared_path = base_path / "Jetson 3" / "shared"
queue_path = shared_path / "speech_queue.txt"
shared_path.mkdir(parents=True, exist_ok=True)

print("Jetson 2: Listening...")

with mic as source:
    recognizer.adjust_for_ambient_noise(source)

while True:
    with mic as source:
        print("Listening...")
        audio = recognizer.listen(source)

    try:
        text = recognizer.recognize_google(audio).strip()
        print(f"You said: {text}")

        if is_noise(text):
            print("Jetson 2: Ignored — background noise.")
            continue

        with open(queue_path, "a", encoding="utf-8") as f:
            f.write(text + "\n")

    except sr.UnknownValueError:
        print("Jetson 2: I couldn’t understand that.")
    except sr.RequestError:
        print("Jetson 2: Network or API error — check your connection.")

