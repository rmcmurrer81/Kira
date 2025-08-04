import json
import os
import time
from Kira_Memory import MemoryManager

class EmotionEngine:
    def __init__(self, memory_path='memory/memory.json'):
        self.memory_path = memory_path
        self.moods = {
            "happy": 0,
            "sad": 0,
            "curious": 0,
            "playful": 0,
            "numb": 0,
            "quiet": 0
        }

    def update_mood(self, text):
        mood = "numb"
        text = text.lower()
        if any(word in text for word in ["happy", "yes", "yay", "love"]):
            mood = "happy"
        elif any(word in text for word in ["sad", "no", "hurt", "tired"]):
            mood = "sad"
        elif any(word in text for word in ["why", "what", "how", "who", "where"]):
            mood = "curious"
        elif any(word in text for word in ["joke", "funny", "lol", "game"]):
            mood = "playful"
        elif any(word in text for word in ["hmm", "okay", "nothing"]):
            mood = "quiet"

        self.moods[mood] += 1
        self.save_mood(mood)

    def save_mood(self, mood):
        timestamp = time.strftime("%Y-%m-%dT%H:%M:%S")
        if os.path.exists(self.memory_path):
            with open(self.memory_path, "r") as f:
                data = json.load(f)
        else:
            data = {"memories": [], "emotions": {"current_mood": mood, "mood_log": []}}

        data["emotions"]["current_mood"] = mood
        data["emotions"]["mood_log"].append({"timestamp": timestamp, "mood": mood})

        with open(self.memory_path, "w") as f:
            json.dump(data, f, indent=2)

    def get_current_mood(self):
        return max(self.moods, key=self.moods.get)
