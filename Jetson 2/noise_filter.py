# Very simple filter for demo purposes
def is_noise(text):
    noise_keywords = ["tv", "commercial", "episode", "netflix", "background", "news"]
    return any(word in text.lower() for word in noise_keywords)