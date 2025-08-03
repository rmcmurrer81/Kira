import Jetson.GPIO as GPIO
import time
import json
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

memory_path = "memory/memory.json"

def get_current_mood():
    try:
        with open(memory_path, 'r') as f:
            data = json.load(f)
            return data["emotions"].get("current_mood", "curious")
    except Exception as e:
        print(f"Error reading mood: {e}")
        return "curious"

def ramp_up_heartbeat(pwm, target_freq, target_duty, steps=20, delay=0.1):
    for i in range(1, steps + 1):
        current_freq = target_freq * (i / steps)
        current_duty = target_duty * (i / steps)
        pwm.ChangeFrequency(current_freq)
        pwm.ChangeDutyCycle(current_duty)
        time.sleep(delay)

try:
    print("Kira's heartbeat is naturally syncing...")
    last_mood = None
    idle_counter = 0

    # Initial slow ramp-up
    mood = get_current_mood()
    freq, duty = mood_to_pulse.get(mood, (1.0, 50))
    ramp_up_heartbeat(pwm, freq, duty)

    while True:
        mood = get_current_mood()

        if mood != last_mood:
            print(f"[Mood Detected: {mood}]")
            last_mood = mood

        freq, duty = mood_to_pulse.get(mood, (1.0, 50))

        if mood in ["numb"] or duty == 0:
            pwm.ChangeDutyCycle(0)
            time.sleep(5)
            continue

        if mood == "asleep":
            pwm.ChangeFrequency(0.2 + random.uniform(0, 0.1))
            pwm.ChangeDutyCycle(10)
        else:
            # Add small natural randomness to feel alive
            pwm.ChangeFrequency(freq + random.uniform(-0.1, 0.1))
            pwm.ChangeDutyCycle(duty + random.uniform(-5, 5))

        time.sleep(5)
except KeyboardInterrupt:
    print("Natural heartbeat driver interrupted by user.")
finally:
    pwm.stop()
    GPIO.cleanup()