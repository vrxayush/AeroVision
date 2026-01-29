## AI-Based Online Exam Proctoring System

An open-source automated online exam proctoring system that uses computer vision to monitor candidates, detect suspicious behavior, and generate examination logs and reports in real time.

## Features

1. Real-time webcam monitoring
2. Face presence detection
3. Automatic capture of suspicious activity
4. Timestamped exam logs
5. Configurable detection settings
6. Offline, local execution

## Project Structure

```
exam/
├── admin_faces/            # Reference face images
├── auto_capture/           # Automatically captured frames
├── exam_frames_buffer/     # Temporary frame storage
├── exam_logs/              # Logs and exam reports
├── exam_suspicious/        # Evidence of suspicious activity
├── database/               # Local data storage
├── debug/                  # Debug outputs
├── config.json             # System configuration
└── exammode.py             # Main application entry point

```
## Getting Started
Prerequisites
1. Python 3.x
2. Webcam

# Installation
```
pip install opencv-python
```
# Run the Application
```
python exammode.py
```

## Configuration

All system parameters such as detection thresholds, capture rules, and logging behavior can be modified using:
```
config.json
```

## Output

1. Logs are stored in exam_logs/
2. Suspicious activity images are stored in exam_suspicious/
3. Exam reports are generated automatically at the end of each session


## Roadmap

1. Multi-face detection
2. Eye-gaze tracking
3. Audio-based monitoring
4. Web-based admin dashboard
5. Cloud storage integration





