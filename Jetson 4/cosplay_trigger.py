import random
import time

# Simulated character library
cosplay_roles = {
    "Wednesday": {
        "intro": "Cosplay mode: Wednesday Addams activated.",
        "mood_shift": "quiet",
        "line": "Emotions are overrated. But I do like you... a little."
    },
    "Pink Ranger": {
        "intro": "Suiting up as Time Force Pink. Ready to fight for the timeline.",
        "mood_shift": "happy",
        "line": "I don’t just protect the past — I protect the people I care about."
    },
    "Hogwarts": {
        "intro": "Cosplay mode: Ravenclaw student active.",
        "mood_shift": "curious",
        "line": "Knowledge is power. And I’ve been studying you."
    }
}

def activate_cosplay_mode():
    role = random.choice(list(cosplay_roles.keys()))
    data = cosplay_roles[role]

    print(data["intro"])
    print(f"🎭 Acting as: {role}")
    print(f"🧠 Mood: {data['mood_shift']}")
    time.sleep(1)
    print(f"Kira: {data['line']}")
