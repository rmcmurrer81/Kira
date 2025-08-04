import json
from datetime import datetime
import os

class MemoryManager:
    def __init__(self, file_path="memory/memory.json"):
        self.file_path = file_path
        self._ensure_memory_file()

    def _ensure_memory_file(self):
        if not os.path.exists(self.file_path):
            self._create_empty_memory()
        else:
            try:
                with open(self.file_path, "r") as f:
                    json.load(f)
            except (json.JSONDecodeError, ValueError):
                print("⚠️ Corrupted memory file detected — resetting.")
                self._create_empty_memory()

    def _create_empty_memory(self):
        os.makedirs(os.path.dirname(self.file_path), exist_ok=True)
        with open(self.file_path, "w") as f:
            json.dump({
                "memories": [],
                "emotions": {"current_mood": "curious"}
            }, f, indent=2)

    def log_memory(self, user_input, response, mood):
        try:
            with open(self.file_path, "r") as f:
                data = json.load(f)
        except (json.JSONDecodeError, FileNotFoundError):
            data = {
                "memories": [],
                "emotions": {"current_mood": "curious"}
            }

        data["memories"].append({
            "timestamp": datetime.now().isoformat(),
            "user_input": user_input,
            "response": response,
            "mood": mood
        })

        temp_path = self.file_path + ".tmp"
        with open(temp_path, "w") as f:
            json.dump(data, f, indent=2)
        os.replace(temp_path, self.file_path)

    def get_recent_inputs(self, count=5):
        try:
            with open(self.file_path, "r") as f:
                data = json.load(f)
            return [m["user_input"] for m in data["memories"][-count:]]
        except Exception:
            return []
