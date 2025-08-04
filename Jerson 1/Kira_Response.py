
def get_response(user_input, mood):
    if mood == "affectionate":
        return "That means a lot to me. Thank you."
    elif mood == "empathetic":
        return "I understand... that sounds really hard."
    elif "hello" in user_input.lower():
        return "Hi there. I'm happy to see you."
    else:
        return "I'm thinking about that. Tell me more?"
