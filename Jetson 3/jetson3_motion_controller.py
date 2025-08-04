from adafruit_pca9685 import PCA9685
from board import SCL, SDA
import busio
import time
import os
import json

# Setup I2C and PCA9685
i2c = busio.I2C(SCL, SDA)
pca = PCA9685(i2c)
pca.frequency = 50

# Servo channel mappings
channels = {
    "head_tilt": 0,
    "eyebrow_left": 1,
    "eyebrow_right": 2,
    "mouth": 3
}

# Mood to servo position mapping
mood_map = {
    "happy": {"head_tilt": 410, "eyebrow_left": 500, "eyebrow_right": 500, "mouth": 530},
    "sad": {"head_tilt": 360, "eyebrow_left": 400, "eyebrow_right": 400, "mouth": 410},
    "curious": {"head_tilt": 420, "eyebrow_left": 470, "eyebrow_right": 470, "mouth": 480},
    "playful": {"head_tilt": 440, "eyebrow_left": 510, "eyebrow_right": 510, "mouth": 520},
    "quiet": {"head_tilt": 400, "eyebrow_left": 450, "eyebrow_right": 450, "mouth": 460},
    "numb": {"head_tilt": 390, "eyebrow_left": 430, "eyebrow_right": 430, "mouth": 430}
}

def move_servos(mood):
    if mood in mood_map:
        for part, pos in mood_map[mood].items():
            channel = channels.get(part)
            if channel is not None:
                pca.channels[channel].duty_cycle = int(pos)

def read_reaction_queue():
    queue_path = "shared/reaction_queue.txt"
    if os.path.exists(queue_path):
        with open(queue_path, "r") as f:
            lines = f.readlines()
        if lines:
            last_line = lines[-1]
            for mood in mood_map:
                if mood in last_line.lower():
                    return mood
    return "quiet"

if __name__ == "__main__":
    print("🦾 Jetson 3 servo controller active")
    while True:
        mood = read_reaction_queue()
        print(f"Reacting to: {mood}")
        move_servos(mood)
        time.sleep(3)
def simulate_servo_action():
    # Simulate motion using existing logic or test mode
    print("Kira: Simulating head and jaw motion sequence.")
    move_servos(servo_pin=1, angle=30)
    move_servos(servo_pin=2, angle=60)
