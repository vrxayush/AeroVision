## Smart Classroom – Enhanced Face Recognition System

An smart classroom monitoring system that uses computer vision and face recognition to automatically detect, identify, and log classroom activity in real time.

## Overview

This project implements an AI-powered smart classroom solution that captures live camera input, detects faces, recognizes known individuals, and stores visual evidence and logs for classroom monitoring and analysis.

It is suitable for:

1. Smart classrooms
2. Reducing power consuption 
3. Classroom security and monitoring
4. Academic AI/computer vision projects

## Features

1. Real-time face detection and recognition
2. Automatic image capture (full frame + detected faces)
3. Known vs unknown face classification
4. Local database for face data
5. Debug image generation for analysis
6. Configurable system behavior
7. Offline execution

## Project Structure

```
smart_classroom_enhanced/
├── admin_faces/            # Reference images of known individuals
├── auto_capture/           # Auto-captured frames and face images
├── database/               # Stored face data
├── debug/                  # Debug and detection output images
├── config.json             # System configuration
├── enhanced_classroom.py   # Main application entry point
└── venv/                   # Virtual environment (optional)
```

## Getting Started
Prerequisites

1. Python 3.x
2. Webcam

# Installation
```
pip install opencv-python
```

(Additional libraries may be required depending on configuration)

# Run the Application
```
python enhanced_classroom.py
```

Ensure the webcam is connected before running the program.

# Configuration

System parameters such as detection thresholds, capture behavior, and recognition rules can be modified in:
```
config.json
```

## Output

1. Captured classroom images → `auto_capture/`
2. Detected face images → `auto_capture/face_*.jpg`
3. Debug detection frames → `debug/`
4. Each captured image includes timestamps and identity labels when available.

















