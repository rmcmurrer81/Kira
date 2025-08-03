import speech_recognition as sr
import pyttsx3
import json
import time
import os
import random
from Kira_Emotion import EmotionEngine
from Kira_Memory import MemoryManager
from Kira_Response import get_response

# Setup logging
if not os.path.exists('logs'):
    os.makedirs('logs')

# Initialize components
recognizer = sr.Recognizer()
speaker = pyttsx3.init()
speaker.setProperty("rate", 165)
speaker.setProperty("volume", 1.0)

# Load or initialize emotional engine and memory
emotion_engine = EmotionEngine()
memory_manager = MemoryManager()

print("🟢 Kira is online and listening...")

while True:
    try:
        with sr.Microphone() as source:
            print("🎤 Speak now:")
            audio = recognizer.listen(source)

        user_input = recognizer.recognize_google(audio).strip().lower()
        print(f"You said: {user_input}")

        # Log to memory
        memory_manager.log_event(user_input)

        # Update mood
        emotion_engine.update_mood(user_input)
        current_mood = emotion_engine.get_current_mood()

        # Generate AI response
        response = get_response(user_input, current_mood)
        print(f"Kira [{current_mood}]: {response}")

        # Speak the response
        speaker.say(response)
        speaker.runAndWait()

        # Sleep between interactions
        time.sleep(0.5)

    except sr.UnknownValueError:
        print("Sorry, I didn’t understand that.")
        speaker.say("Sorry, I didn’t catch that.")
        speaker.runAndWait()
    except Exception as e:
        print(f"[ERROR] {str(e)}")
        speaker.say("Something went wrong.")
        speaker.runAndWait()
        time.sleep(1)
