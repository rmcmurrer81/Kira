
import random
class EmotionEngine:
    def __init__(self):
        self.mood = "curious"

    def update_mood(self, user_input):
        if "love" in user_input.lower():
            self.mood = "affectionate"
        elif "sad" in user_input.lower():
            self.mood = "empathetic"
        else:
            self.mood = random.choice(["curious", "thoughtful", "gentle"])

    def get_current_mood(self):
        return self.mood
