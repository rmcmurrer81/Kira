from jetson3_motion_controller import simulate_servo_action
import time

# Simulated emotional state loop
moods = ["happy", "sad", "curious", "playful", "quiet"]
for mood in moods:
    print(f"Simulating mood: {mood}")
    simulate_servo_action(mood)
    time.sleep(2)