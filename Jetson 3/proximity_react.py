import time
import random

def get_mock_distance():
    # Replace this with your actual sensor code later
    return random.randint(100, 600)

def react_to_proximity(distance):
    if distance < 150:
        print("Kira (Jetson 3): playful head tilt!")
    elif distance < 300:
        print("Kira (Jetson 3): curious glance.")
    else:
        print("Kira (Jetson 3): idle.")

if __name__ == "__main__":
    print("Jetson 3: Proximity monitor running.")
    while True:
        distance = get_mock_distance()
        print(f"Detected distance: {distance}")
        react_to_proximity(distance)
        time.sleep(2)

