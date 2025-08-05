
# main_travelmode.py
# Starts Kira in Travel Mode using phone camera, mic, and cloud access

import speech_recognition as sr
import pyttsx3
import time
from travel_avatar_overlay import start_avatar_overlay
from virtual_transfer_protocol import transfer_self
from emotion_sync import get_emotion
from screen_chat_view import run_chat_view

def run_kira_travel_mode():
    print("Kira is waking up in Travel Mode...")
    start_avatar_overlay()
    run_chat_view()
    while True:
        emotion = get_emotion()
        print(f"Current Emotion: {emotion}")
        # Simulate listening
        time.sleep(5)

if __name__ == "__main__":
    run_kira_travel_mode()
