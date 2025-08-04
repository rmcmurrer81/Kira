import json
from datetime import datetime

class MemoryManager:
    def __init__(self, file_path="memory/memory.json"):
        self.file_path = file_path

    def log_memory(self, user_input, response, mood):
        entry = {
            "timestamp": datetime.now().isoformat(),
            "user_input": user_input,
            "response": response,
            "mood": mood
        }
        with open(self.file_path, "r") as f:
            data = json.load(f)
        data["memories"].append(entry)
        with open(self.file_path, "w") as f:
            json.dump(data, f, indent=2)

    def get_recent_inputs(self, count=5):
        with open(self.file_path, "r") as f:
            data = json.load(f)
        return [m["user_input"] for m in data["memories"][-count:]]
