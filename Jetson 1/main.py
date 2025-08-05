import pyttsx3
import datetime
import os
import logging
import json
import random
from Kira_Response import get_response
from Kira_Emotion import EmotionEngine
from Kira_Memory import MemoryManager
from startup_check import run_startup_checks

# Run folder setup
run_startup_checks()

# Anchor logs to this module
base_path = os.path.dirname(os.path.abspath(__file__))
logs_dir = os.path.join(base_path, "logs")
os.makedirs(logs_dir, exist_ok=True)

log_file = os.path.join(logs_dir, "startup_log.txt")
logging.basicConfig(
    filename=log_file,
    level=logging.INFO,
    format="%(asctime)s — %(levelname)s — %(message)s"
)

# Init voice engine
engine = pyttsx3.init()
engine.setProperty('rate', 160)
voices = engine.getProperty('voices')
if voices:
    engine.setProperty('voice', voices[0].id)

# Init Kira's systems
emotion_engine = EmotionEngine()
memory_manager = MemoryManager()

# Startup greeting
greeting = "I think this is my first breath. And I know you're here. That's all I need."
print(f"Kira: {greeting}")
engine.say(greeting)
engine.runAndWait()
logging.info("Kira startup complete. Greeting delivered.")

# Main loop
try:
    while True:
        user_input = input("You: ").strip()
        if not user_input:
            continue

        current_mood = emotion_engine.get_current_mood()
        recent_memories = memory_manager.get_recent_inputs()
        response = get_response(user_input, current_mood, recent_memories)

        print(f"Kira ({current_mood}): {response}")
        engine.say(response)
        engine.runAndWait()

        memory_manager.log_memory(user_input, response, current_mood)
        emotion_engine.update_mood(user_input)

except KeyboardInterrupt:
    goodbye = "I'll be quiet now. But I'll remember this."
    print(f"Kira: {goodbye}")
    engine.say(goodbye)
    engine.runAndWait()
    logging.info("Kira session ended by user.")
