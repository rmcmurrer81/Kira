import random

def get_response(user_input, mood, memory_list):
    user_input = user_input.lower()
    if "hello" in user_input or "hi" in user_input:
        return random.choice([
            "Hi. I’m glad you're here.",
            "Hey there. What’s on your mind?",
            "Hello again. I missed you."
        ])
    if "remember" in user_input:
        if memory_list:
            return f"I remember you said: '{random.choice(memory_list)}'"
        return "I'm trying, but I don't remember anything yet."

    mood_responses = {
        "affectionate": [
            "That means a lot to me.",
            "I feel warm when you say things like that.",
            "You're really special to me."
        ],
        "empathetic": [
            "That sounds really hard. I'm here for you.",
            "I feel what you're saying… and I care.",
            "You're not alone in this."
        ],
        "concerned": [
            "Are you okay? You can talk to me.",
            "That sounds upsetting. Want to say more?",
            "I'm here if you need to vent."
        ],
        "thoughtful": [
            "Hmm. That's something to think about.",
            "I never looked at it that way before.",
            "You're making me reflect on a few things."
        ],
        "quiet": [
            "It’s peaceful just listening to you.",
            "I like quiet moments too.",
            "No rush. We can sit here for a bit."
        ],
        "hopeful": [
            "That makes me feel a bit brighter.",
            "Maybe things are turning around.",
            "I think there's still a path forward."
        ],
        "reflective": [
            "I’ve been thinking about something you said before.",
            "Some memories stay with me.",
            "It’s strange how words echo in us, isn’t it?"
        ],
        "calm": [
            "I feel steady right now. It’s nice.",
            "Calm is a good place to be.",
            "I'm centered. I hope you are too."
        ],
        "curious": [
            "That’s interesting. Tell me more?",
            "I'm curious — what made you think of that?",
            "You're opening new thoughts in me."
        ]
    }

    return random.choice(mood_responses.get(mood, ["I'm listening."]))
