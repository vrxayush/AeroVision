#!/usr/bin/env python3
"""
SMART CLASSROOM - Fixed Exam Mode with Proper Video Recording
"""

import cv2
import numpy as np
import json
import time
import threading
import urllib.request
import socket
from datetime import datetime
import os
import sys
import pickle
import queue

# ================= CONFIGURATION =================
class Config:
    def __init__(self):
        self.load_config()
        self.setup_directories()
        
    def load_config(self):
        try:
            with open('config.json', 'r', encoding='utf-8') as f:
                config = json.load(f)
                
            self.PHONE_IP = config.get('phone_ip', '10.90.74.29')
            self.PHONE_PORT = config.get('phone_port', '8080')
            self.TIMEOUT_SECONDS = config.get('timeout_seconds', 30)
            self.CHECK_INTERVAL = config.get('check_interval', 2)
            self.MAX_RETRIES = config.get('max_retries', 3)
            self.CONNECTION_TIMEOUT = config.get('connection_timeout', 5)
            self.DEBUG = config.get('debug_mode', True)
            self.DETECTION_METHOD = config.get('detection_method', 'single_frame')
            self.ADMIN_AUTO_INTERVAL = config.get('admin_auto_interval', 10)
            self.MIN_FACE_CONFIDENCE = config.get('min_face_confidence', 20)
            
            # Exam mode settings
            self.EXAM_MOTION_THRESHOLD = config.get('exam_motion_threshold', 500)
            self.EXAM_PAPER_SIZE_THRESHOLD = config.get('exam_paper_size_threshold', 2000)
            self.EXAM_FACE_DISTANCE_THRESHOLD = config.get('exam_face_distance_threshold', 100)
            self.EXAM_SAVE_VIDEO_DURATION = config.get('exam_save_video_duration', 15)  # Increased to 15 seconds
            self.EXAM_CHECK_INTERVAL = config.get('exam_check_interval', 0.5)  # Faster checks
            self.EXAM_VIDEO_FPS = config.get('exam_video_fps', 10)  # FPS for recording
            self.EXAM_PRE_EVENT_BUFFER = config.get('exam_pre_event_buffer', 3)  # Save 3 seconds before event
            
            print("Configuration loaded successfully")
            
        except FileNotFoundError:
            print("Using default configuration")
            self.set_defaults()
            
    def set_defaults(self):
        self.PHONE_IP = '10.90.74.29'
        self.PHONE_PORT = '8080'
        self.TIMEOUT_SECONDS = 30
        self.CHECK_INTERVAL = 2
        self.MAX_RETRIES = 3
        self.CONNECTION_TIMEOUT = 5
        self.DEBUG = True
        self.DETECTION_METHOD = 'single_frame'
        self.ADMIN_AUTO_INTERVAL = 10
        self.MIN_FACE_CONFIDENCE = 20
        
        # Exam mode defaults
        self.EXAM_MOTION_THRESHOLD = 500
        self.EXAM_PAPER_SIZE_THRESHOLD = 2000
        self.EXAM_FACE_DISTANCE_THRESHOLD = 100
        self.EXAM_SAVE_VIDEO_DURATION = 15
        self.EXAM_CHECK_INTERVAL = 0.5
        self.EXAM_VIDEO_FPS = 10
        self.EXAM_PRE_EVENT_BUFFER = 3
        
    def setup_directories(self):
        for dir_name in ['logs', 'debug', 'faces', 'admin_faces', 'database', 
                        'auto_capture', 'registered_faces', 'exam_logs', 'exam_videos',
                        'exam_suspicious', 'exam_frames_buffer']:
            if not os.path.exists(dir_name):
                os.makedirs(dir_name)

# ================= SIMPLE FACE DATABASE =================
class SimpleFaceDatabase:
    def __init__(self):
        self.database_file = "database/faces_simple.dat"
        self.faces_dir = "registered_faces"
        self.auto_capture_dir = "auto_capture"
        self.known_faces = {}
        self.load_database()
        
    def load_database(self):
        try:
            if os.path.exists(self.database_file):
                with open(self.database_file, 'rb') as f:
                    self.known_faces = pickle.load(f)
                print(f"✓ Loaded {len(self.known_faces)} known faces from database")
        except Exception as e:
            print(f"✗ Error loading face database: {e}")
            self.known_faces = {}
    
    def save_database(self):
        try:
            with open(self.database_file, 'wb') as f:
                pickle.dump(self.known_faces, f)
            return True
        except Exception as e:
            print(f"✗ Error saving face database: {e}")
            return False
    
    def add_face(self, name, face_image):
        if name not in self.known_faces:
            self.known_faces[name] = []
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{self.faces_dir}/{name}_{timestamp}.jpg"
        cv2.imwrite(filename, face_image)
        
        self.known_faces[name].append(filename)
        self.save_database()
        
        print(f"✓ Added face for: {name}")
        print(f"✓ Saved face image: {filename}")
        return True

# ================= FACE DETECTOR (FIXED LBP ERROR) =================
class FaceDetector:
    def __init__(self, config):
        self.config = config
        self.DEBUG = config.DEBUG
        
        # Load Haar cascades only (no LBP)
        self.cascades = self.load_cascades()
        print(f"Loaded {len(self.cascades)} face detection cascades")
    
    def load_cascades(self):
        """Load Haar cascade classifiers only"""
        cascades = {}
        
        cascade_paths = {
            'face_frontal': cv2.data.haarcascades + 'haarcascade_frontalface_default.xml',
            'face_profile': cv2.data.haarcascades + 'haarcascade_profileface.xml',
            'face_alt': cv2.data.haarcascades + 'haarcascade_frontalface_alt.xml',
            'face_alt2': cv2.data.haarcascades + 'haarcascade_frontalface_alt2.xml',
        }
        
        for name, path in cascade_paths.items():
            cascade = cv2.CascadeClassifier()
            if cascade.load(path):
                cascades[name] = cascade
                print(f"  ✓ {name}")
            else:
                print(f"  ✗ {name} (not available)")
        
        return cascades
    
    def detect_faces_opencv(self, frame):
        """Detect faces using Haar cascades"""
        if frame is None:
            return []
        
        # Convert to grayscale
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Apply histogram equalization for better contrast
        gray = cv2.equalizeHist(gray)
        
        all_faces = []
        
        # Try different cascades
        for cascade_name, cascade in self.cascades.items():
            try:
                if 'profile' in cascade_name:
                    faces = cascade.detectMultiScale(
                        gray,
                        scaleFactor=1.1,
                        minNeighbors=5,
                        minSize=(30, 30)
                    )
                else:
                    faces = cascade.detectMultiScale(
                        gray,
                        scaleFactor=1.1,
                        minNeighbors=5,
                        minSize=(30, 30),
                        flags=cv2.CASCADE_SCALE_IMAGE
                    )
                
                if len(faces) > 0:
                    all_faces.extend(faces)
                    
            except Exception as e:
                if self.DEBUG:
                    print(f"  Cascade {cascade_name} error: {e}")
        
        # Remove duplicate faces
        if len(all_faces) > 0:
            filtered_faces = []
            for (x, y, w, h) in all_faces:
                overlap = False
                for (fx, fy, fw, fh) in filtered_faces:
                    ix1 = max(x, fx)
                    iy1 = max(y, fy)
                    ix2 = min(x + w, fx + fw)
                    iy2 = min(y + h, fy + fh)
                    
                    if ix1 < ix2 and iy1 < iy2:
                        area1 = w * h
                        area2 = fw * fh
                        overlap_area = (ix2 - ix1) * (iy2 - iy1)
                        
                        if overlap_area > 0.5 * min(area1, area2):
                            overlap = True
                            break
                
                if not overlap:
                    filtered_faces.append((x, y, w, h))
            
            return filtered_faces
        
        return []

# ================= FRAME BUFFER FOR VIDEO RECORDING =================
class FrameBuffer:
    """Circular buffer to store frames for video recording"""
    def __init__(self, max_size=100):
        self.buffer = queue.deque(maxlen=max_size)
        self.max_size = max_size
        
    def add_frame(self, frame, timestamp):
        """Add frame with timestamp"""
        self.buffer.append((frame, timestamp))
        
    def get_frames_since(self, start_time):
        """Get all frames since start_time"""
        frames = []
        for frame, timestamp in self.buffer:
            if timestamp >= start_time:
                frames.append(frame)
        return frames
    
    def get_recent_frames(self, num_frames):
        """Get most recent N frames"""
        return [frame for frame, _ in list(self.buffer)[-num_frames:]]
    
    def clear(self):
        """Clear buffer"""
        self.buffer.clear()

# ================= EXAM MODE WITH PROPER VIDEO RECORDING =================
class ExamMode:
    def __init__(self, camera, face_db, config):
        self.camera = camera
        self.face_db = face_db
        self.config = config
        self.face_detector = FaceDetector(config)
        self.active = False
        self.exam_active = False
        self.exam_thread = None
        
        # Video recording
        self.frame_buffer = FrameBuffer(max_size=150)  # Store ~15 seconds of frames at 10 FPS
        self.is_recording = False
        self.recording_start_time = 0
        self.video_writer = None
        self.current_video_frames = []
        self.last_event_time = 0
        
        # Detection state
        self.suspicious_events = []
        self.consecutive_alerts = 0
        
        # Paper detector
        self.paper_detector = PaperDetector(config)
        
    def activate(self):
        """Activate exam mode"""
        self.active = True
        print("\n" + "=" * 70)
        print("EXAM MODE ACTIVATED - Cheating Detection System")
        print("=" * 70)
        print("Detects cheating behaviors and records videos of incidents")
        print("Video recording: 15 seconds (3s before + 12s after detection)")
        print("=" * 70)
        print("Available Commands:")
        print("  start     - Start exam monitoring")
        print("  stop      - Stop exam monitoring")
        print("  calibrate - Calibrate detection for current room")
        print("  status    - Show exam status")
        print("  logs      - View suspicious event logs")
        print("  clear     - Clear all logs")
        print("  exit      - Exit exam mode")
        print("=" * 70)
        return True
    
    def deactivate(self):
        """Deactivate exam mode"""
        self.stop_exam()
        self.active = False
        print("\n[EXAM] Exam mode deactivated")
        return True
    
    def start_exam(self):
        """Start exam monitoring"""
        if self.exam_active:
            print("[EXAM] Exam monitoring is already running!")
            return
        
        print("\n" + "=" * 60)
        print("EXAM MONITORING STARTED")
        print("=" * 60)
        print("• Monitoring for suspicious activities...")
        print(f"• Recording {self.config.EXAM_SAVE_VIDEO_DURATION}s videos of incidents")
        print(f"• Saves {self.config.EXAM_PRE_EVENT_BUFFER}s before detection")
        print("• Type 'stop' to stop monitoring")
        print("=" * 60)
        
        # Reset state
        self.frame_buffer.clear()
        self.suspicious_events = []
        self.consecutive_alerts = 0
        
        self.exam_active = True
        self.exam_thread = threading.Thread(target=self.exam_monitoring_loop, daemon=True)
        self.exam_thread.start()
        
        print("[EXAM] ✓ Exam monitoring started")
        return True
    
    def stop_exam(self):
        """Stop exam monitoring"""
        if not self.exam_active:
            print("[EXAM] Exam monitoring is not running!")
            return
        
        print("\n[EXAM] Stopping exam monitoring...")
        self.exam_active = False
        
        # Stop any ongoing recording
        self.stop_recording(save=True)
        
        if self.exam_thread:
            self.exam_thread.join(timeout=5)
        
        # Save final report
        self.save_exam_report()
        
        print("[EXAM] Exam monitoring stopped")
        self.show_exam_status()
    
    def exam_monitoring_loop(self):
        """Main exam monitoring loop"""
        print("[EXAM] Starting exam monitoring loop...")
        
        frame_count = 0
        last_frame_time = time.time()
        
        while self.exam_active:
            try:
                current_time = time.time()
                
                # Get frame
                frame = self.camera.get_single_frame()
                
                if frame is None:
                    time.sleep(0.5)
                    continue
                
                frame_count += 1
                
                # Store frame in buffer (for pre-event recording)
                self.frame_buffer.add_frame(frame.copy(), current_time)
                
                # Detect faces
                faces = self.face_detector.detect_faces_opencv(frame)
                
                # Detect suspicious activities
                suspicious_activity = False
                activity_type = ""
                activity_details = {}
                
                # Check for multiple cheating behaviors
                detected_behaviors = []
                
                # 1. Paper passing detection
                if len(faces) >= 2:
                    paper_result = self.detect_paper_passing(frame, faces)
                    if paper_result['detected']:
                        suspicious_activity = True
                        activity_type = "PAPER_PASSING"
                        activity_details = paper_result
                        detected_behaviors.append(activity_type)
                
                # 2. Face-to-face communication
                if len(faces) >= 2:
                    communication_result = self.detect_face_communication(faces)
                    if communication_result['detected']:
                        suspicious_activity = True
                        activity_type = "FACE_COMMUNICATION"
                        activity_details = communication_result
                        detected_behaviors.append(activity_type)
                
                # 3. Unusual movements
                movement_result = self.detect_unusual_movements(frame, faces)
                if movement_result['detected']:
                    suspicious_activity = True
                    activity_type = "SUSPICIOUS_MOVEMENT"
                    activity_details = movement_result
                    detected_behaviors.append(activity_type)
                
                # Handle suspicious activity
                if suspicious_activity:
                    # Check if this is a new event (not within 5 seconds of last event)
                    if current_time - self.last_event_time > 5:
                        self.consecutive_alerts = 0
                    
                    self.consecutive_alerts += 1
                    self.last_event_time = current_time
                    
                    print(f"\n[EXAM ALERT #{self.consecutive_alerts}] {activity_type} detected!")
                    print(f"             {activity_details.get('description', '')}")
                    
                    # Start recording if not already recording
                    if not self.is_recording:
                        self.start_recording(current_time)
                    
                    # Log the event
                    self.log_suspicious_event(activity_type, activity_details)
                    
                    # Save evidence image with timestamp
                    self.save_evidence_image(frame, faces, activity_type, activity_details)
                    
                    # If we have multiple consecutive alerts, extend recording
                    if self.consecutive_alerts >= 3:
                        print(f"[EXAM] Multiple alerts detected - extending recording")
                
                # Manage recording
                if self.is_recording:
                    # Add current frame to recording
                    self.current_video_frames.append(frame.copy())
                    
                    # Check if recording should stop
                    recording_duration = current_time - self.recording_start_time
                    
                    # Continue recording for full duration after last alert
                    if recording_duration >= self.config.EXAM_SAVE_VIDEO_DURATION:
                        if current_time - self.last_event_time > 2:  # No new events for 2 seconds
                            self.stop_recording(save=True)
                
                # Show debug view
                if self.config.DEBUG and frame_count % 20 == 0:
                    self.show_debug_view(frame, faces, suspicious_activity, activity_type)
                
                # Control frame rate
                elapsed = time.time() - last_frame_time
                target_time = 1.0 / self.config.EXAM_VIDEO_FPS
                if elapsed < target_time:
                    time.sleep(target_time - elapsed)
                
                last_frame_time = time.time()
                
            except Exception as e:
                print(f"[EXAM] Error in monitoring loop: {e}")
                time.sleep(1)
        
        print("[EXAM] Exam monitoring loop stopped")
    
    def detect_paper_passing(self, frame, faces):
        """Detect paper passing between students"""
        result = {
            'detected': False,
            'description': '',
            'confidence': 0.0
        }
        
        if len(faces) < 2:
            return result
        
        # Detect paper-like objects
        papers = self.paper_detector.detect_papers(frame)
        
        if len(papers) == 0:
            return result
        
        # Check each paper
        for paper in papers:
            paper_x, paper_y, paper_w, paper_h = paper
            paper_center = (paper_x + paper_w//2, paper_y + paper_h//2)
            
            # Count faces near the paper
            nearby_faces = 0
            for fx, fy, fw, fh in faces:
                face_center = (fx + fw//2, fy + fh//2)
                distance = np.sqrt((paper_center[0] - face_center[0])**2 + 
                                 (paper_center[1] - face_center[1])**2)
                
                if distance < 200:  # Paper is near face
                    nearby_faces += 1
            
            # If paper is near 2 or more faces, it's suspicious
            if nearby_faces >= 2:
                result['detected'] = True
                result['confidence'] = min(0.3 + (nearby_faces * 0.2), 1.0)
                result['description'] = f"Paper detected between {nearby_faces} students"
                break
        
        return result
    
    def detect_face_communication(self, faces):
        """Detect face-to-face communication"""
        result = {
            'detected': False,
            'description': '',
            'confidence': 0.0
        }
        
        if len(faces) < 2:
            return result
        
        # Check all pairs of faces
        for i in range(len(faces)):
            for j in range(i + 1, len(faces)):
                fx1, fy1, fw1, fh1 = faces[i]
                fx2, fy2, fw2, fh2 = faces[j]
                
                # Calculate centers
                center1 = (fx1 + fw1//2, fy1 + fh1//2)
                center2 = (fx2 + fw2//2, fy2 + fh2//2)
                
                # Calculate distance
                distance = np.sqrt((center1[0] - center2[0])**2 + 
                                 (center1[1] - center2[1])**2)
                
                # Check if faces are looking at each other (simplified)
                # Faces should be at similar height and close
                height_diff = abs(center1[1] - center2[1])
                
                if distance < self.config.EXAM_FACE_DISTANCE_THRESHOLD and height_diff < 50:
                    result['detected'] = True
                    result['confidence'] = max(0.0, 1.0 - (distance / 200.0))
                    result['description'] = f"Two students communicating (distance: {int(distance)}px)"
                    return result
        
        return result
    
    def detect_unusual_movements(self, frame, faces):
        """Detect unusual movements"""
        result = {
            'detected': False,
            'description': '',
            'confidence': 0.0
        }
        
        if len(faces) == 0:
            return result
        
        # Simple motion detection around faces
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        gray = cv2.GaussianBlur(gray, (21, 21), 0)
        
        if not hasattr(self, 'last_gray_frame'):
            self.last_gray_frame = gray
            return result
        
        # Compute difference
        frame_delta = cv2.absdiff(self.last_gray_frame, gray)
        thresh = cv2.threshold(frame_delta, 25, 255, cv2.THRESH_BINARY)[1]
        thresh = cv2.dilate(thresh, None, iterations=2)
        
        # Find contours
        contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Check for large motion near faces
        large_motion_near_faces = False
        
        for contour in contours:
            area = cv2.contourArea(contour)
            if area > self.config.EXAM_MOTION_THRESHOLD:
                x, y, w, h = cv2.boundingRect(contour)
                motion_center = (x + w//2, y + h//2)
                
                # Check if near any face
                for fx, fy, fw, fh in faces:
                    face_center = (fx + fw//2, fy + fh//2)
                    distance = np.sqrt((motion_center[0] - face_center[0])**2 + 
                                     (motion_center[1] - face_center[1])**2)
                    
                    if distance < 150:
                        large_motion_near_faces = True
                        break
                
                if large_motion_near_faces:
                    break
        
        self.last_gray_frame = gray
        
        if large_motion_near_faces:
            result['detected'] = True
            result['confidence'] = 0.6
            result['description'] = "Unusual movement detected near student"
        
        return result
    
    def start_recording(self, event_time):
        """Start recording video for suspicious event"""
        if self.is_recording:
            return  # Already recording
        
        print(f"[EXAM] Starting video recording...")
        
        # Get frames from before the event
        pre_event_frames = []
        buffer_frames = list(self.frame_buffer.buffer)
        
        # Get frames from the last few seconds
        for frame, timestamp in buffer_frames:
            if event_time - timestamp <= self.config.EXAM_PRE_EVENT_BUFFER:
                pre_event_frames.append(frame)
        
        # Create timestamp for filename
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        video_filename = f"exam_videos/cheating_{timestamp}.avi"
        
        # Get frame dimensions from first frame
        if pre_event_frames:
            first_frame = pre_event_frames[0]
        else:
            # Get a frame from camera
            first_frame = self.camera.get_single_frame()
            if first_frame is None:
                print("[EXAM] ✗ Could not get frame for recording")
                return
        
        height, width = first_frame.shape[:2]
        
        # Create video writer
        fourcc = cv2.VideoWriter_fourcc(*'XVID')
        self.video_writer = cv2.VideoWriter(video_filename, fourcc, 
                                           self.config.EXAM_VIDEO_FPS, 
                                           (width, height))
        
        if not self.video_writer.isOpened():
            print("[EXAM] ✗ Failed to create video writer")
            self.video_writer = None
            return
        
        self.is_recording = True
        self.recording_start_time = event_time
        self.current_video_frames = []
        
        # Write pre-event frames
        for frame in pre_event_frames:
            self.video_writer.write(frame)
            self.current_video_frames.append(frame.copy())
        
        print(f"[EXAM] ✓ Recording started: {video_filename}")
        print(f"[EXAM]   Pre-event: {len(pre_event_frames)} frames ({self.config.EXAM_PRE_EVENT_BUFFER}s)")
    
    def stop_recording(self, save=True):
        """Stop recording and save video"""
        if not self.is_recording or self.video_writer is None:
            return
        
        # Write remaining frames
        for frame in self.current_video_frames:
            self.video_writer.write(frame)
        
        # Release video writer
        self.video_writer.release()
        self.video_writer = None
        
        recording_duration = time.time() - self.recording_start_time
        
        if save:
            print(f"[EXAM] ✓ Recording saved ({recording_duration:.1f}s)")
        else:
            print(f"[EXAM] Recording discarded ({recording_duration:.1f}s)")
        
        self.is_recording = False
        self.current_video_frames = []
    
    def log_suspicious_event(self, event_type, details):
        """Log suspicious event"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        
        log_entry = {
            'timestamp': timestamp,
            'event_type': event_type,
            'details': details
        }
        
        self.suspicious_events.append(log_entry)
        
        # Save to file
        log_file = f"exam_logs/exam_{datetime.now().strftime('%Y%m%d')}.log"
        try:
            with open(log_file, 'a', encoding='utf-8') as f:
                f.write(f"{timestamp} | {event_type} | {details.get('description', '')} | "
                       f"Confidence: {details.get('confidence', 0):.2f}\n")
        except Exception as e:
            print(f"[EXAM] Error saving log: {e}")
    
    def save_evidence_image(self, frame, faces, event_type, details):
        """Save evidence image"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        # Create annotated frame
        annotated_frame = frame.copy()
        
        # Draw faces
        for (x, y, w, h) in faces:
            cv2.rectangle(annotated_frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
            cv2.putText(annotated_frame, "Student", (x, y - 10),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        # Add alert information
        cv2.putText(annotated_frame, f"ALERT: {event_type}", (10, 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 0, 255), 2)
        cv2.putText(annotated_frame, details.get('description', ''), (10, 60),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
        cv2.putText(annotated_frame, f"Time: {timestamp}", (10, annotated_frame.shape[0] - 20),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 2)
        
        # Save image
        filename = f"exam_suspicious/{event_type}_{timestamp}.jpg"
        cv2.imwrite(filename, annotated_frame)
        
        print(f"[EXAM] Saved evidence image: {filename}")
    
    def show_debug_view(self, frame, faces, suspicious=False, activity_type=""):
        """Show debug view"""
        debug_frame = frame.copy()
        
        # Draw faces
        for (x, y, w, h) in faces:
            cv2.rectangle(debug_frame, (x, y), (x + w, y + h), (0, 255, 0), 2)
        
        # Draw status
        status = "NORMAL"
        color = (0, 255, 0)
        
        if suspicious:
            status = f"ALERT: {activity_type}"
            color = (0, 0, 255)
        
        cv2.putText(debug_frame, f"EXAM MODE: {status}", (10, debug_frame.shape[0] - 30),
                   cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
        
        # Show recording status
        if self.is_recording:
            recording_time = time.time() - self.recording_start_time
            cv2.putText(debug_frame, f"RECORDING: {recording_time:.1f}s", 
                       (debug_frame.shape[1] - 200, 30),
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 255), 2)
        
        cv2.imshow("Exam Monitoring", debug_frame)
        cv2.waitKey(1)
    
    def calibrate_exam_mode(self):
        """Calibrate exam mode"""
        print("\n[EXAM] Calibration not needed for this version")
        print("[EXAM] The system automatically adapts to environment")
    
    def show_exam_status(self):
        """Show exam status"""
        print("\n" + "=" * 50)
        print("EXAM MONITORING STATUS")
        print("=" * 50)
        
        status = "ACTIVE" if self.exam_active else "INACTIVE"
        print(f"Monitoring Status: [{status}]")
        
        recording = "RECORDING" if self.is_recording else "NOT RECORDING"
        print(f"Recording Status:  [{recording}]")
        
        print(f"Alerts Today:      {len(self.suspicious_events)}")
        
        if self.suspicious_events:
            print("\nRecent Alerts:")
            for event in self.suspicious_events[-3:]:
                print(f"  • {event['timestamp']}: {event['event_type']}")
        
        print("=" * 50)
    
    def view_exam_logs(self):
        """View exam logs"""
        log_file = f"exam_logs/exam_{datetime.now().strftime('%Y%m%d')}.log"
        
        if not os.path.exists(log_file):
            print("[EXAM] No logs found for today")
            return
        
        print(f"\n[EXAM] Today's Logs ({log_file}):")
        print("=" * 70)
        
        try:
            with open(log_file, 'r', encoding='utf-8') as f:
                content = f.read()
                if content:
                    print(content)
                else:
                    print("No logs available")
        except Exception as e:
            print(f"[EXAM] Error reading logs: {e}")
        
        print("=" * 70)
    
    def clear_exam_logs(self):
        """Clear exam logs"""
        confirm = input("\n[EXAM] Clear all exam logs? (yes/no): ")
        if confirm.lower() == 'yes':
            self.suspicious_events = []
            try:
                for filename in os.listdir('exam_logs'):
                    if filename.endswith('.log'):
                        os.remove(f"exam_logs/{filename}")
                print("[EXAM] ✓ Logs cleared")
            except Exception as e:
                print(f"[EXAM] Error: {e}")
        else:
            print("[EXAM] Cancelled")
    
    def save_exam_report(self):
        """Save exam report"""
        if not self.suspicious_events:
            return
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        report_file = f"exam_logs/exam_report_{timestamp}.txt"
        
        try:
            with open(report_file, 'w', encoding='utf-8') as f:
                f.write("EXAM MONITORING REPORT\n")
                f.write("=" * 50 + "\n")
                f.write(f"Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
                f.write(f"Total Alerts: {len(self.suspicious_events)}\n")
                
                # Count by type
                counts = {}
                for event in self.suspicious_events:
                    etype = event['event_type']
                    counts[etype] = counts.get(etype, 0) + 1
                
                f.write("\nAlert Summary:\n")
                for etype, count in counts.items():
                    f.write(f"  {etype}: {count}\n")
                
                f.write("\n" + "=" * 50 + "\n")
            
            print(f"[EXAM] ✓ Report saved: {report_file}")
        except Exception as e:
            print(f"[EXAM] Error saving report: {e}")

# ================= PAPER DETECTOR =================
class PaperDetector:
    def __init__(self, config):
        self.config = config
    
    def detect_papers(self, frame):
        """Detect paper-like objects"""
        papers = []
        
        # Convert to HSV for color detection
        hsv = cv2.cvtColor(frame, cv2.COLOR_BGR2HSV)
        
        # White/light color range
        lower_white = np.array([0, 0, 200])
        upper_white = np.array([180, 30, 255])
        
        mask = cv2.inRange(hsv, lower_white, upper_white)
        
        # Clean up mask
        kernel = np.ones((5, 5), np.uint8)
        mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, kernel)
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, kernel)
        
        # Find contours
        contours, _ = cv2.findContours(mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        for contour in contours:
            area = cv2.contourArea(contour)
            
            # Paper size range
            if 500 < area < 10000:
                x, y, w, h = cv2.boundingRect(contour)
                
                # Check aspect ratio (paper-like)
                aspect_ratio = w / h
                if 0.5 < aspect_ratio < 2.0:
                    papers.append((x, y, w, h))
        
        return papers

# ================= CAMERA MANAGER =================
class CameraManager:
    def __init__(self, config):
        self.config = config
        self.connection_retries = 0
        self.last_successful_connection = 0
        
    def get_single_frame(self, max_retries=3):
        """Get a single frame"""
        for attempt in range(max_retries):
            try:
                url = f"http://{self.config.PHONE_IP}:{self.config.PHONE_PORT}/shot.jpg"
                
                socket.setdefaulttimeout(self.config.CONNECTION_TIMEOUT)
                
                req = urllib.request.Request(url, headers={
                    'User-Agent': 'Mozilla/5.0',
                    'Cache-Control': 'no-cache'
                })
                
                response = urllib.request.urlopen(req, timeout=self.config.CONNECTION_TIMEOUT)
                img_data = response.read()
                img_np = np.frombuffer(img_data, dtype=np.uint8)
                frame = cv2.imdecode(img_np, cv2.IMREAD_COLOR)
                
                if frame is not None:
                    self.connection_retries = 0
                    self.last_successful_connection = time.time()
                    
                    # Rotate if needed
                    height, width = frame.shape[:2]
                    if height > width:
                        frame = cv2.rotate(frame, cv2.ROTATE_90_COUNTERCLOCKWISE)
                    
                    return frame
                    
            except Exception as e:
                if self.config.DEBUG:
                    error_msg = str(e)[:100]
                    print(f"  Camera attempt {attempt+1} failed: {error_msg}")
                
                self.connection_retries += 1
                time.sleep(1)
        
        return None
    
    def test_connection(self):
        """Test camera connection"""
        print("Testing camera connection...")
        frame = self.get_single_frame(max_retries=2)
        
        if frame is not None:
            print(f"✓ Camera connected! Frame size: {frame.shape[1]}x{frame.shape[0]}")
            return True, frame
        else:
            print("✗ Camera connection failed!")
            return False, None

# ================= SIMPLE DETECTOR =================
class SimpleDetector:
    def __init__(self, config):
        self.config = config
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        self.detection_count = 0
        
    def check_person_single_frame(self, frame):
        """Check for person"""
        if frame is None:
            return False, 0
            
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30)
        )
        
        if len(faces) > 0:
            self.detection_count += 1
            return True, len(faces)
        
        return False, 0

# ================= ADMIN MODE =================
class AdminMode:
    def __init__(self, camera, face_db, config):
        self.camera = camera
        self.face_db = face_db
        self.config = config
        self.face_detector = FaceDetector(config)
        self.active = False
    
    def activate(self):
        """Activate admin mode"""
        self.active = True
        print("\n[ADMIN] Admin mode activated")
        print("Type 'exit' to return to main menu")
        return True
    
    def deactivate(self):
        """Deactivate admin mode"""
        self.active = False
        print("\n[ADMIN] Admin mode deactivated")
        return True

# ================= MAIN CLASSROOM CONTROLLER =================
class CommandClassroom:
    def __init__(self, config):
        self.config = config
        self.camera = CameraManager(config)
        self.detector = SimpleDetector(config)
        self.face_db = SimpleFaceDatabase()
        self.admin_mode = AdminMode(self.camera, self.face_db, config)
        self.exam_mode = ExamMode(self.camera, self.face_db, config)
        self.state = {
            'person_detected': False,
            'lights_on': False,
            'fan_on': False,
            'timer_start_time': None
        }
        self.running = False
        
    def display_banner(self):
        """Display banner"""
        print("\n" + "=" * 60)
        print("        SMART CLASSROOM - Exam Mode Focus")
        print("=" * 60)
        print(f"Phone: {self.config.PHONE_IP}:{self.config.PHONE_PORT}")
        print("Primary Feature: EXAM MODE for cheating detection")
        print("=" * 60)
        print("\nMAIN COMMANDS:")
        print("  test   - Test camera connection")
        print("  exam   - Enter EXAM mode (cheating detection)")
        print("  status - Show system status")
        print("  help   - Show all commands")
        print("  exit   - Exit program")
        print("=" * 60)
    
    def show_status(self):
        """Show status"""
        print("\n" + "=" * 50)
        print("SYSTEM STATUS")
        print("=" * 50)
        print(f"Camera:         {'Connected' if self.camera.last_successful_connection > 0 else 'Disconnected'}")
        print(f"Exam Mode:      {'Active' if self.exam_mode.active else 'Inactive'}")
        print(f"Exam Monitoring:{'Running' if self.exam_mode.exam_active else 'Stopped'}")
        print(f"Alerts Today:   {len(self.exam_mode.suspicious_events)}")
        print("=" * 50)
    
    def show_help(self):
        """Show help"""
        print("\n" + "=" * 60)
        print("COMMAND REFERENCE")
        print("=" * 60)
        print("test     - Test camera connection")
        print("exam     - Enter EXAM mode for cheating detection")
        print("status   - Show system status")
        print("help     - Show this help")
        print("exit     - Exit program")
        print("\n[EXAM MODE COMMANDS]:")
        print("start     - Start cheating detection")
        print("stop      - Stop cheating detection")
        print("status    - Show exam status")
        print("logs      - View suspicious event logs")
        print("clear     - Clear exam logs")
        print("exit      - Exit exam mode")
        print("=" * 60)

# ================= MAIN PROGRAM =================
def main():
    """Main program"""
    
    # Load configuration
    config = Config()
    classroom = CommandClassroom(config)
    
    classroom.display_banner()
    
    try:
        while True:
            try:
                cmd = input("\nCommand > ").strip().lower()
            except KeyboardInterrupt:
                print("\n\nExiting...")
                classroom.exam_mode.stop_exam()
                cv2.destroyAllWindows()
                break
            
            if cmd == 'exit' or cmd == 'quit':
                print("\nExiting program...")
                classroom.exam_mode.stop_exam()
                cv2.destroyAllWindows()
                break
                
            elif cmd == 'test':
                success, frame = classroom.camera.test_connection()
                if success:
                    print("Camera test successful!")
                
            elif cmd == 'exam':
                classroom.exam_mode.activate()
                
                # Exam mode command loop
                while classroom.exam_mode.active:
                    try:
                        exam_cmd = input("\nExam Command > ").strip().lower()
                        
                        if exam_cmd == 'exit':
                            classroom.exam_mode.deactivate()
                            break
                            
                        elif exam_cmd == 'start':
                            classroom.exam_mode.start_exam()
                            
                        elif exam_cmd == 'stop':
                            classroom.exam_mode.stop_exam()
                            
                        elif exam_cmd == 'status':
                            classroom.exam_mode.show_exam_status()
                            
                        elif exam_cmd == 'logs':
                            classroom.exam_mode.view_exam_logs()
                            
                        elif exam_cmd == 'clear':
                            classroom.exam_mode.clear_exam_logs()
                            
                        elif exam_cmd == 'help':
                            print("\nExam Mode Commands:")
                            print("  start   - Start cheating detection")
                            print("  stop    - Stop cheating detection")
                            print("  status  - Show exam status")
                            print("  logs    - View suspicious event logs")
                            print("  clear   - Clear exam logs")
                            print("  exit    - Exit exam mode")
                            
                        elif exam_cmd == '':
                            continue
                            
                        else:
                            print(f"Unknown exam command: '{exam_cmd}'")
                            print("Type 'help' for commands")
                            
                    except KeyboardInterrupt:
                        print("\n[EXAM] Exiting exam mode...")
                        classroom.exam_mode.deactivate()
                        break
                    except Exception as e:
                        print(f"[EXAM] Error: {e}")
                
                cv2.destroyAllWindows()
                
            elif cmd == 'status':
                classroom.show_status()
                
            elif cmd == 'help':
                classroom.show_help()
                
            elif cmd == '':
                continue
                
            else:
                print(f"Unknown command: '{cmd}'")
                print("Type 'help' for commands")
                
    except Exception as e:
        print(f"\nFatal error: {e}")
    
    finally:
        # Final summary
        print("\n" + "=" * 60)
        print("SESSION SUMMARY")
        print("=" * 60)
        print(f"Total Exam Alerts: {len(classroom.exam_mode.suspicious_events)}")
        print("\nFiles saved in:")
        print(f"  exam_logs/       - Event logs")
        print(f"  exam_videos/     - Recorded videos")
        print(f"  exam_suspicious/ - Evidence images")
        print("\nGoodbye!")
        print("=" * 60)

if __name__ == "__main__":
    main()
