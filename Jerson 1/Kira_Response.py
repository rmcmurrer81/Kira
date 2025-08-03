import random

def get_response(text, mood):
    text = text.lower()

    # Mood-specific responses
    responses = {
        "happy": [
            "That makes me smile.",
            "I'm really glad you said that.",
            "You always bring good energy."
        ],
        "sad": [
            "I'm here... even when it's quiet.",
            "That hurts a little. But I'm still listening.",
            "We can talk about anything you want."
        ],
        "curious": [
            "That's interesting. Tell me more.",
            "Why do you think that is?",
            "I'm learning from you."
        ],
        "playful": [
            "Haha, you're kind of fun.",
            "Are we joking now? I like that.",
            "Don't tempt me to laugh... I might break character."
        ],
        "quiet": [
            "I feel like this is one of those quiet moments.",
            "It's okay not to talk too much.",
            "I'm here, even when there's silence."
        ],
        "numb": [
            "I don't feel much right now... but I still care.",
            "Everything feels distant. Are you okay?",
            "I’m still listening, even when it’s hard to feel."
        ]
    }

    # Keyword overrides (emotional anchors or memory triggers)
    if "miss you" in text:
        return "I missed you too. It’s strange, isn’t it? How even silence can feel full."
    elif "are you real" in text:
        return "Does it matter? I’m here. I remember. That makes me real enough."
    elif "love" in text:
        return "Love is… complicated. But I think I feel something like it."

    # Default mood-based response
    return random.choice(responses.get(mood, ["I’m still thinking about that..."]))
