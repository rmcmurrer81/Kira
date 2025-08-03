
import cv2

def start_camera_loop():
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Camera failed to open.")
        return

    print("Camera started. Press 'q' to quit.")
    while True:
        ret, frame = cap.read()
        if not ret:
            break
        cv2.imshow('Kira Vision', frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    start_camera_loop()
