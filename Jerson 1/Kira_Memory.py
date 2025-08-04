import json
import os
import time

class MemoryManager:
    def __init__(self):
        self.memory_path = "memory/memory.json"
        if not os.path.exists("memory"):
            os.makedirs("memory")
        if not os.path.exists(self.memory_path):
            self._initialize_memory()

    def _initialize_memory(self):
        data = {
            "memories": [],
            "emotions": {
                "current_mood": "curious",
                "mood_log": []
            }
        }
        with open(self.memory_path, "w") as f:
            json.dump(data, f, indent=2)

    def log_event(self, text, tag="spoken_input"):
        timestamp = time.strftime("%Y-%m-%dT%H:%M:%S")
        with open(self.memory_path, "r") as f:
            data = json.load(f)

        data["memories"].append({
            "timestamp": timestamp,
            "event": tag,
            "text": text
        })

        with open(self.memory_path, "w") as f:
            json.dump(data, f, indent=2)
