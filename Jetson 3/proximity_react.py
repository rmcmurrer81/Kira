import time
import board
import busio
import adafruit_vl53l0x
import pyttsx3
import random
from Kira_Emotion import EmotionEngine
from jetson3_motion_controller import simulate_servo_action

# Initialize I2C and VL53L0X sensor
i2c = busio.I2C(board.SCL, board.SDA)
sensor = adafruit_vl53l0x.VL53L0X(i2c)
sensor.measurement_timing_budget = 200000  # Microseconds

# Voice engine
engine = pyttsx3.init()
engine.setProperty('voice', 'mb-us3')
engine.setProperty('rate', 160)

# Load emotion memory
emotion_engine = EmotionEngine("memory/memory.json")

# Proximity threshold in mm
NEAR_THRESHOLD = 200

# Reaction lines
proximity_lines = [
    "Oh! I didn’t see you there.",
    "Hi there...",
    "You startled me... but I like that.",
    "You're really close now.",
    "Do you want to talk?",
    "That felt... nice."
]

last_spoken = 0
cooldown = 10  # seconds

print("[Proximity Sensor] Monitoring distance...")

try:
    while True:
        distance = sensor.range
        if distance < NEAR_THRESHOLD:
            now = time.time()
            if now - last_spoken > cooldown:
                response = random.choice(proximity_lines)
                engine.say(response)
                engine.runAndWait()
                mood = emotion_engine.get_mood()
                simulate_servo_action(mood)
                emotion_engine.log_memory("proximity_event", mood, f"Kira reacted to someone at {distance}mm saying: '{response}'")
                last_spoken = now
        time.sleep(0.25)
except KeyboardInterrupt:
    print("Proximity monitoring stopped.")
