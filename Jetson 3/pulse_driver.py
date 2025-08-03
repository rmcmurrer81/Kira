import Jetson.GPIO as GPIO
import time
import json

# Pin Definitions
pulse_pin = 18  # You can change this depending on your Jetson board

# Setup
GPIO.setmode(GPIO.BOARD)
GPIO.setup(pulse_pin, GPIO.OUT)
pwm = GPIO.PWM(pulse_pin, 1)  # Start with 1 Hz
pwm.start(0)

# Mood-to-pulse frequency mapping
mood_to_pulse = {
    "happy": (2.0, 80),
    "playful": (2.5, 90),
    "curious": (1.2, 60),
    "sad": (0.6, 40),
    "quiet": (0.4, 30)
}

memory_path = "memory/memory.json"

def get_current_mood():
    try:
        with open(memory_path, 'r') as f:
            data = json.load(f)
            return data["emotions"].get("current_mood", "curious")
    except Exception as e:
        print(f"Error reading mood: {e}")
        return "curious"

try:
    print("Kira's heartbeat is syncing with emotion...")
    while True:
        mood = get_current_mood()
        freq, duty = mood_to_pulse.get(mood, (1.0, 50))
        pwm.ChangeFrequency(freq)
        pwm.ChangeDutyCycle(duty)
        time.sleep(5)  # Update every 5 seconds
except KeyboardInterrupt:
    print("Heartbeat driver interrupted by user.")
finally:
    pwm.stop()
    GPIO.cleanup()