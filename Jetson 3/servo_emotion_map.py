# Maps moods to servo angles or movement styles
servo_emotion_map = {
    "happy": {"head_tilt": 15, "posture": "upright", "blink_rate": 2},
    "sad": {"head_tilt": -10, "posture": "slouched", "blink_rate": 0.5},
    "curious": {"head_tilt": 5, "posture": "forward", "blink_rate": 1.5},
    "playful": {"head_tilt": 20, "posture": "bounce", "blink_rate": 3},
    "quiet": {"head_tilt": 0, "posture": "still", "blink_rate": 0.3}
}