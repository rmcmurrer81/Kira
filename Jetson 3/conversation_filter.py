
def clean_input(text):
    # Strip noise phrases or false TV lines
    noise_keywords = ["TV", "Commercial", "Ad", "Background"]
    for word in noise_keywords:
        if word.lower() in text.lower():
            return ""
    return text.strip()
