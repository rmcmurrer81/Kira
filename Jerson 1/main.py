import speech_recognition as sr
import pyttsx3
import os
import time
from Kira_Emotion import EmotionEngine
from Kira_Memory import MemoryManager
from Kira_Response import get_response

# Initialize folders
for folder in ["memory", "logs"]:
    os.makedirs(folder, exist_ok=True)

# Setup voice and systems
recognizer = sr.Recognizer()
speaker = pyttsx3.init()
speaker.setProperty("rate", 165)
speaker.setProperty("volume", 1.0)

emotion_engine = EmotionEngine()
memory = MemoryManager()

print("🟢 Kira is listening...")

while True:
    try:
        with sr.Microphone() as source:
            print("🎤 Speak now:")
            audio = recognizer.listen(source)

        text = recognizer.recognize_google(audio).strip()
        print(f"You said: {text}")

        memory.log_event(text)
        emotion_engine.update_mood(text)
        mood = emotion_engine.get_current_mood()

        response = get_response(text, mood)
        print(f"Kira [{mood}]: {response}")

        speaker.say(response)
        speaker.runAndWait()

        time.sleep(0.5)

    except sr.UnknownValueError:
        print("Kira didn’t catch that.")
    except Exception as e:
        print(f"[ERROR] {e}")
        speaker.say("Something went wrong.")
        speaker.runAndWait()
