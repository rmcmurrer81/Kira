import RPi.GPIO as GPIO
import time
import json
import os
import random

# Pin Definitions
pulse_pin = 18

# Setup
GPIO.setmode(GPIO.BOARD)
GPIO.setup(pulse_pin, GPIO.OUT)
pwm = GPIO.PWM(pulse_pin, 1)
pwm.start(0)

# Mood-to-pulse frequency mapping
mood_to_pulse = {
    "happy": (2.0, 80),
    "playful": (2.5, 85),
    "curious": (1.2, 60),
    "sad": (0.6, 40),
    "quiet": (0.4, 30),
    "asleep": (0.2, 10),
    "numb": (0.0, 0)
}

# Get mood from memory
def get_current_mood():
    try:
        base_path = os.path.dirname(os.path.abspath(__file__))
        memory_path = os.path.join(base_path, "memory", "memory.json")
        with open(memory_path, "r") as f:
            data = json.load(f)
            return data["emotions"].get("current_mood", "quiet")
    except Exception:
        return "quiet"

# Loop
if __name__ == "__main__":
    print("Jetson 3: Heartbeat driver active")
    try:
        while True:
            mood = get_current_mood()
            freq, duty = mood_to_pulse.get(mood, (0.5, 30))
            pwm.ChangeFrequency(freq)
            pwm.ChangeDutyCycle(duty)
            time.sleep(2)
    except KeyboardInterrupt:
        print("Jetson 3: Heartbeat driver shutting down")
        pwm.stop()
        GPIO.cleanup()

