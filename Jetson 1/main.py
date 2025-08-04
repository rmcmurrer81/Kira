
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

# Setup logging
os.makedirs("logs", exist_ok=True)
logging.basicConfig(
    filename="logs/startup_log.txt",
    level=logging.INFO,
    format="%(asctime)s — %(levelname)s — %(message)s"
)

# Startup checks
run_startup_checks()

# Init voice engine
engine = pyttsx3.init()
engine.setProperty('rate', 160)
voices = engine.getProperty('voices')
if voices:
    engine.setProperty('voice', voices[0].id)

# Init emotion and memory systems
emotion_engine = EmotionEngine()
memory_manager = MemoryManager()

# Greet on startup
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
        response = get_response(user_input, current_mood)
        print(f"Kira ({current_mood}): {response}")
        engine.say(response)
        engine.runAndWait()

        # Log memory and mood shift
        memory_manager.log_memory(user_input, response, current_mood)
        emotion_engine.update_mood(user_input)
except KeyboardInterrupt:
    goodbye = "Goodbye for now. I'll remember this moment."
    print(f"Kira: {goodbye}")
    engine.say(goodbye)
    engine.runAndWait()
    logging.info("Kira session ended by user.")
