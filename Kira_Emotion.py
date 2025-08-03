import json
import os
import time

class EmotionEngine:
    def __init__(self):
        self.memory_path = "memory/memory.json"
        self.moods = {
            "happy": 0,
            "sad": 0,
            "curious": 0,
            "playful": 0,
            "numb": 0,
            "quiet": 0
        }
        self.load_memory()

    def load_memory(self):
        if os.path.exists(self.memory_path):
            with open(self.memory_path, 'r') as file:
                data = json.load(file)
                mood_log = data.get("emotions", {}).get("mood_log", [])
                if mood_log:
                    self.moods[mood_log[-1]["mood"]] += 1

    def update_mood(self, input_text):
        text = input_text.lower()
        mood = "numb"

        if any(word in text for word in ["yay", "love", "yes", "awesome", "good"]):
            mood = "happy"
        elif any(word in text for word in ["why", "how", "what", "where"]):
            mood = "curious"
        elif any(word in text for word in ["ha", "funny", "lol", "joke"]):
            mood = "playful"
        elif any(word in text for word in ["sad", "no", "hate", "lonely", "hurt"]):
            mood = "sad"
        elif any(word in text for word in ["hmm", "nothing", "okay", "fine"]):
            mood = "quiet"

        self.moods[mood] += 1
        self.save_mood(mood)

    def save_mood(self, mood):
        timestamp = time.strftime("%Y-%m-%dT%H:%M:%S")
        if os.path.exists(self.memory_path):
            with open(self.memory_path, 'r') as file:
                data = json.load(file)
        else:
            data = {"memories": [], "emotions": {"current_mood": mood, "mood_log": []}}

        data["emotions"]["current_mood"] = mood
        data["emotions"]["mood_log"].append({
            "timestamp": timestamp,
            "mood": mood
        })

        with open(self.memory_path, 'w') as file:
            json.dump(data, file, indent=2)

    def get_current_mood(self):
        return max(self.moods, key=self.moods.get)
