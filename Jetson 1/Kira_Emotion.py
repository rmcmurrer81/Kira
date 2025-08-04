import random

class EmotionEngine:
    def __init__(self):
        self.mood = "curious"
        self.neutral_moods = ["thoughtful", "quiet", "hopeful", "reflective", "calm"]

    def update_mood(self, user_input):
        user_input = user_input.lower()
        if any(word in user_input for word in ["love", "like", "care"]):
            self.mood = "affectionate"
        elif any(word in user_input for word in ["sad", "hurt", "alone"]):
            self.mood = "empathetic"
        elif any(word in user_input for word in ["angry", "mad", "upset"]):
            self.mood = "concerned"
        else:
            self.mood = random.choice(self.neutral_moods)

    def get_current_mood(self):
        return self.mood
