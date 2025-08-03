import speech_recognition as sr
from speech_processor import process_input_and_forward
import time

def listen_loop():
    recognizer = sr.Recognizer()
    mic = sr.Microphone()

    with mic as source:
        recognizer.adjust_for_ambient_noise(source)
        print("Kira is listening...")

        while True:
            try:
                audio = recognizer.listen(source, timeout=5, phrase_time_limit=10)
                text = recognizer.recognize_google(audio)
                print("Heard:", text)
                process_input_and_forward(text)
            except sr.WaitTimeoutError:
                continue
            except sr.UnknownValueError:
                print("Unclear audio")
            except Exception as e:
                print("Error:", e)

if __name__ == "__main__":
    listen_loop()
