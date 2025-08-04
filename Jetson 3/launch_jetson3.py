from jetson3_motion_controller import simulate_servo_action
import time

print("Kira: Jetson 3 (Motion Control) is live.")

try:
    while True:
        simulate_servo_action()
        time.sleep(1)
except KeyboardInterrupt:
    print("Kira: Motion system paused.")
