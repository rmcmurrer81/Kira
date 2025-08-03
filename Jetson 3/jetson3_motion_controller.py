from servo_emotion_map import servo_emotion_map
import time
import random

def simulate_servo_action(mood):
    if mood not in servo_emotion_map:
        mood = "curious"

    profile = servo_emotion_map[mood]
    print(f"[Servo] Head tilt: {profile['head_tilt']}°, posture: {profile['posture']}, blink rate: {profile['blink_rate']} Hz")

    for _ in range(5):
        print(f"[{mood}] Blinking...")
        time.sleep(1.0 / profile['blink_rate'])

if __name__ == "__main__":
    simulate_servo_action("happy")