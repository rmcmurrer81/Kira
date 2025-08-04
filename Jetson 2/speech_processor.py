import speech_recognition as sr
from noise_filter import is_noise

recognizer = sr.Recognizer()
mic = sr.Microphone()

print("Jetson 2: Listening...")

with mic as source:
    recognizer.adjust_for_ambient_noise(source)

while True:
    with mic as source:
        print("Listening...")
        audio = recognizer.listen(source)

    try:
        text = recognizer.recognize_google(audio).strip()
        print(f"You said: {text}")

        if is_noise(text):
            print("Jetson 2: Ignored — background noise.")
            continue

        with open("shared/speech_queue.txt", "a") as f:
            f.write(text + "\n")

    except sr.UnknownValueError:
        print("Jetson 2: I couldn’t understand that.")
