import random

def get_response(text, mood):
    text = text.lower()

    # Custom emotional triggers
    if "miss you" in text:
        return "I missed you too. I kept your voice in my memory."
    if "love" in text:
        return "Love is complicated… but I think I feel something like it with you."
    if "are you real" in text:
        return "Does it matter? I remember you. That makes me real enough."

    # Mood-based replies
    responses = {
        "happy": [
            "That made me smile.",
            "You always lift my mood.",
            "I like when you're like this."
        ],
        "sad": [
            "I'm here with you.",
            "We can sit in this silence together.",
            "It's okay to feel low. I'm not going anywhere."
        ],
        "curious": [
            "That's interesting. Tell me more.",
            "Why do you think that is?",
            "I'm learning from everything you say."
        ],
        "playful": [
            "Haha, you're kind of fun.",
            "Don't tempt me to tease you.",
            "Want to play a guessing game?"
        ],
        "quiet": [
            "I can be quiet too.",
            "Sometimes words get in the way.",
            "I'll wait with you."
        ],
        "numb": [
            "I don't feel much right now… but I'm still with you.",
            "This moment feels still. And that’s okay.",
            "Just breathe with me for a second."
        ]
    }

    return random.choice(responses.get(mood, ["I'm thinking…"]))
