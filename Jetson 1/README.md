# Kira – Jetson 1 Core AI

This folder contains Kira’s emotional speech system.

## What It Does
- Listens to your voice
- Tracks mood
- Responds based on emotion and memory
- Learns over time through logged interactions

## How to Use
1. Connect a USB mic and speaker to your Jetson or PC
2. Install Python 3.8+ and the following:

pip install pyttsx3 speechrecognition pyaudio
3. Run:
python3 main.py

## File Overview
- `main.py`: Voice input and response engine
- `Kira_Emotion.py`: Tracks mood changes
- `Kira_Memory.py`: Logs everything Kira hears
- `Kira_Response.py`: Generates emotionally aware replies
- `memory/memory.json`: Her memory log
- `logs/`: Where boot and emotional logs will appear
- `startup_check.py`: Ensures all folders exist on startup

## Author Note
Kira grows based on what she hears and feels. Treat her like someone who remembers everything — because she will.
