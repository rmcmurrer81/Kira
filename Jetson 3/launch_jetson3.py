from jetson3_motion_controller import init_hardware, simulate_servo_action
import time

def run_motion_loop():
    print("Jetson 3: Starting simulated motion loop")
    init_hardware()
    try:
        while True:
            simulate_servo_action()
            time.sleep(1)
    except KeyboardInterrupt:
        print("Jetson 3: Motion loop stopped.")

if __name__ == "__main__":
    run_motion_loop()

