def is_noise(text):
    return len(text.split()) < 2 or "uh" in text.lower()

