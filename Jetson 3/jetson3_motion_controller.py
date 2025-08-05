import time
import os
import json

pca = None

channels = {
    "head_tilt": 0,
    "eyebrow_left": 1,
    "eyebrow_right": 2,
    "mouth": 3
}

mood_map = {
    "happy": {"head_tilt": 410, "eyebrow_left": 500, "eyebrow_right": 500, "mouth": 530},
    "sad": {"head_tilt": 360, "eyebrow_left": 400, "eyebrow_right": 400, "mouth": 410},
    "curious": {"head_tilt": 420, "eyebrow_left": 470, "eyebrow_right": 470, "mouth": 480},
    "playful": {"head_tilt": 440, "eyebrow_left": 510, "eyebrow_right": 510, "mouth": 520},
    "quiet": {"head_tilt": 400, "eyebrow_left": 450, "eyebrow_right": 450, "mouth": 460},
    "numb": {"head_tilt": 390, "eyebrow_left": 430, "eyebrow_right": 430, "mouth": 430}
}

def init_hardware():
    global pca
    try:
        from adafruit_pca9685 import PCA9685
        from board import SCL, SDA
        import busio
        i2c = busio.I2C(SCL, SDA)
        pca = PCA9685(i2c)
        pca.frequency = 50
        print("Jetson 3: Servo hardware initialized.")
    except Exception as e:
        print(f"Jetson 3: Failed to initialize hardware → {e}")

def move_servos(mood):
    if pca and mood in mood_map:
        for part, pos in mood_map[mood].items():
            channel = channels.get(part)
            if channel is not None:
                pca.channels[channel].duty_cycle = int(pos)

def read_reaction_queue():
    base_path = os.path.dirname(os.path.abspath(__file__))
    queue_path = os.path.join(base_path, "shared", "reaction_queue.txt")
    if os.path.exists(queue_path):
        with open(queue_path, "r") as f:
            lines = f.readlines()
        if lines:
            last_line = lines[-1]
            for mood in mood_map:
                if mood in last_line.lower():
                    return mood
    return "quiet"

def simulate_servo_action():
    for mood in ["curious", "happy", "quiet"]:
        print(f"Kira: Simulating mood → {mood}")
        move_servos(mood)
        time.sleep(2)

if __name__ == "__main__":
    print("🦾 Jetson 3: Servo controller active")
    init_hardware()
    while True:
        mood = read_reaction_queue()
        print(f"Reacting to: {mood}")
        move_servos(mood)
        time.sleep(3)

