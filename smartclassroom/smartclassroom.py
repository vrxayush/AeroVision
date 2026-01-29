#!/usr/bin/env python3
"""
SMART CLASSROOM - With OpenCV Face Detection (No face_recognition needed)
Works with Python 3.11.9
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
            self.MIN_FACE_CONFIDENCE = config.get('min_face_confidence', 20)  # For LBP cascade
            
            print("Configuration loaded successfully")
            
        except FileNotFoundError:
            print("Using default configuration")
            self.set_defaults()
            
    def set_defaults(self):
        self.PHONE_IP = '10.90.24.29'
        self.PHONE_PORT = '8080'
        self.TIMEOUT_SECONDS = 30
        self.CHECK_INTERVAL = 2
        self.MAX_RETRIES = 3
        self.CONNECTION_TIMEOUT = 5
        self.DEBUG = True
        self.DETECTION_METHOD = 'single_frame'
        self.ADMIN_AUTO_INTERVAL = 10
        self.MIN_FACE_CONFIDENCE = 20
        
    def setup_directories(self):
        for dir_name in ['logs', 'debug', 'models', 'faces', 'admin_faces', 'database', 'auto_capture', 'registered_faces']:
            if not os.path.exists(dir_name):
                os.makedirs(dir_name)

# ================= SIMPLE FACE DATABASE =================
class SimpleFaceDatabase:
    def __init__(self):
        self.database_file = "database/faces_simple.dat"
        self.faces_dir = "registered_faces"
        self.auto_capture_dir = "auto_capture"
        self.known_faces = {}  # name: list of face images
        self.load_database()
        
    def load_database(self):
        """Load face database from file"""
        try:
            if os.path.exists(self.database_file):
                with open(self.database_file, 'rb') as f:
                    self.known_faces = pickle.load(f)
                print(f"✓ Loaded {len(self.known_faces)} known faces from database")
            else:
                print("ℹ️  No face database found. Starting fresh.")
        except Exception as e:
            print(f"✗ Error loading face database: {e}")
            self.known_faces = {}
    
    def save_database(self):
        """Save face database to file"""
        try:
            with open(self.database_file, 'wb') as f:
                pickle.dump(self.known_faces, f)
            print(f"✓ Saved {len(self.known_faces)} faces to database")
            return True
        except Exception as e:
            print(f"✗ Error saving face database: {e}")
            return False
    
    def add_face(self, name, face_image):
        """Add a new face to the database"""
        if name not in self.known_faces:
            self.known_faces[name] = []
        
        # Save face image
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"{self.faces_dir}/{name}_{timestamp}.jpg"
        cv2.imwrite(filename, face_image)
        
        # Add to database
        self.known_faces[name].append(filename)
        
        # Save database
        self.save_database()
        print(f"✓ Added face for: {name}")
        print(f"✓ Saved face image: {filename}")
        
        return True
    
    def recognize_face_simple(self, face_image):
        """Simple face recognition using template matching"""
        if not self.known_faces:
            return "Unknown", 0.0
        
        best_match = "Unknown"
        best_score = 0.0
        
        # Convert input face to grayscale
        gray_face = cv2.cvtColor(face_image, cv2.COLOR_BGR2GRAY)
        gray_face = cv2.resize(gray_face, (100, 100))
        
        for name, face_files in self.known_faces.items():
            for face_file in face_files:
                try:
                    # Load registered face
                    registered_face = cv2.imread(face_file)
                    if registered_face is None:
                        continue
                    
                    # Convert to grayscale and resize
                    gray_registered = cv2.cvtColor(registered_face, cv2.COLOR_BGR2GRAY)
                    gray_registered = cv2.resize(gray_registered, (100, 100))
                    
                    # Simple template matching
                    result = cv2.matchTemplate(gray_face, gray_registered, cv2.TM_CCOEFF_NORMED)
                    _, max_val, _, _ = cv2.minMaxLoc(result)
                    
                    if max_val > best_score and max_val > 0.6:  # Threshold
                        best_score = max_val
                        best_match = name
                        
                except Exception as e:
                    if self.DEBUG:
                        print(f"  Error comparing with {face_file}: {e}")
        
        return best_match, best_score
    
    def list_faces(self):
        """List all faces in database"""
        if not self.known_faces:
            return "No faces in database"
        
        result = f"\nRegistered Faces ({len(self.known_faces)}):\n"
        for i, (name, files) in enumerate(self.known_faces.items()):
            result += f"  {i+1}. {name} ({len(files)} images)\n"
        return result
    
    def delete_face(self, name):
        """Delete a face from database"""
        if name in self.known_faces:
            del self.known_faces[name]
            self.save_database()
            print(f"✓ Deleted face: {name}")
            return True
        else:
            print(f"✗ Face not found: {name}")
            return False

# ================= FACE DETECTOR (OpenCV only) =================
class FaceDetector:
    def __init__(self, config):
        self.config = config
        self.DEBUG = config.DEBUG
        
        # Load multiple cascade classifiers for better detection
        self.cascades = self.load_cascades()
        
        # For better face detection, we can use LBP cascade (works better in varying light)
        self.face_lbp = cv2.CascadeClassifier()
        if not self.face_lbp.load(cv2.data.haarcascades + 'lbpcascade_frontalface_improved.xml'):
            print("⚠️  LBP cascade not available, using Haar")
            self.face_lbp = None
        
        print(f"Loaded {len(self.cascades)} face detection cascades")
    
    def load_cascades(self):
        """Load multiple OpenCV cascade classifiers"""
        cascades = {}
        
        cascade_paths = {
            'face_frontal': cv2.data.haarcascades + 'haarcascade_frontalface_default.xml',
            'face_profile': cv2.data.haarcascades + 'haarcascade_profileface.xml',
            'face_alt': cv2.data.haarcascades + 'haarcascade_frontalface_alt.xml',
            'face_alt2': cv2.data.haarcascades + 'haarcascade_frontalface_alt2.xml',
            'face_alt_tree': cv2.data.haarcascades + 'haarcascade_frontalface_alt_tree.xml',
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
        """Detect faces using multiple OpenCV cascades"""
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
                    # Profile faces need different parameters
                    faces = cascade.detectMultiScale(
                        gray,
                        scaleFactor=1.1,
                        minNeighbors=5,
                        minSize=(30, 30)
                    )
                else:
                    # Frontal faces
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
        
        # Try LBP cascade if available (better performance)
        if self.face_lbp is not None:
            try:
                lbp_faces = self.face_lbp.detectMultiScale(
                    gray,
                    scaleFactor=1.1,
                    minNeighbors=5,
                    minSize=(30, 30)
                )
                if len(lbp_faces) > 0:
                    all_faces.extend(lbp_faces)
            except:
                pass
        
        # Remove duplicate faces (overlapping rectangles)
        if len(all_faces) > 0:
            # Simple non-maximum suppression
            filtered_faces = []
            for (x, y, w, h) in all_faces:
                overlap = False
                for (fx, fy, fw, fh) in filtered_faces:
                    # Calculate intersection
                    ix1 = max(x, fx)
                    iy1 = max(y, fy)
                    ix2 = min(x + w, fx + fw)
                    iy2 = min(y + h, fy + fh)
                    
                    if ix1 < ix2 and iy1 < iy2:
                        overlap = True
                        break
                
                if not overlap:
                    filtered_faces.append((x, y, w, h))
            
            return filtered_faces
        
        return []
    
    def draw_faces(self, frame, faces, recognized_names=None):
        """Draw faces on frame with labels"""
        if recognized_names is None:
            recognized_names = ["Unknown"] * len(faces)
        
        for i, (x, y, w, h) in enumerate(faces):
            # Draw rectangle
            color = (0, 255, 0)  # Green for detected
            
            if i < len(recognized_names) and recognized_names[i] != "Unknown":
                color = (255, 0, 0)  # Blue for recognized
            
            cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2)
            
            # Draw label
            label = recognized_names[i] if i < len(recognized_names) else "Face"
            cv2.putText(frame, label, (x, y - 10), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
        
        return frame

# ================= SIMPLE DETECTION ENGINE =================
class SimpleDetector:
    def __init__(self, config):
        self.config = config
        self.face_cascade = cv2.CascadeClassifier(
            cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
        )
        self.last_detection_time = 0
        self.detection_count = 0
        
    def check_person_single_frame(self, frame):
        """Check for person in a single frame"""
        if frame is None:
            return False, 0
            
        # Convert to grayscale
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Detect faces
        faces = self.face_cascade.detectMultiScale(
            gray,
            scaleFactor=1.1,
            minNeighbors=5,
            minSize=(30, 30)
        )
        
        if len(faces) > 0:
            self.detection_count += 1
            
            # Draw rectangles for debugging
            if self.config.DEBUG:
                for (x, y, w, h) in faces:
                    cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
            
            # Save debug image
            if self.config.DEBUG and self.detection_count % 5 == 0:
                timestamp = datetime.now().strftime("%H%M%S")
                cv2.imwrite(f"debug/detect_{timestamp}.jpg", frame)
            
            return True, len(faces)
        
        return False, 0

# ================= CAMERA MANAGER =================
class CameraManager:
    def __init__(self, config):
        self.config = config
        self.connection_retries = 0
        self.last_successful_connection = 0
        
    def get_single_frame(self, max_retries=3):
        """Get a single frame with retry logic"""
        for attempt in range(max_retries):
            try:
                url = f"http://{self.config.PHONE_IP}:{self.config.PHONE_PORT}/shot.jpg"
                
                # Set timeout
                socket.setdefaulttimeout(self.config.CONNECTION_TIMEOUT)
                
                # Get image
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
                    error_msg = str(e)
                    if len(error_msg) > 100:
                        error_msg = error_msg[:100] + "..."
                    print(f"  Camera attempt {attempt+1} failed: {error_msg}")
                
                self.connection_retries += 1
                time.sleep(1)  # Wait before retry
        
        return None
    
    def test_connection(self):
        """Test if camera is accessible"""
        print("Testing camera connection...")
        frame = self.get_single_frame(max_retries=2)
        
        if frame is not None:
            print(f"✓ Camera connected! Frame size: {frame.shape[1]}x{frame.shape[0]}")
            return True, frame
        else:
            print("✗ Camera connection failed!")
            return False, None

# ================= ADMIN MODE WITH OPENCV FACE DETECTION =================
class AdminMode:
    def __init__(self, camera, face_db, config):
        self.camera = camera
        self.face_db = face_db
        self.config = config
        self.face_detector = FaceDetector(config)
        self.active = False
        self.auto_capture_active = False
        self.auto_capture_thread = None
        self.capture_count = 0
        self.last_capture_time = 0
        
    def activate(self):
        """Activate admin mode"""
        self.active = True
        print("\n" + "=" * 60)
        print("ADMIN MODE ACTIVATED (OpenCV Face Detection)")
        print("=" * 60)
        print("Available Commands:")
        print("  scan      - Scan for faces")
        print("  register  - Register a new face")
        print("  list      - List registered faces")
        print("  delete    - Delete a face from database")
        print("  capture   - Capture face photo")
        print("  auto      - Start auto capture (detect every 10s)")
        print("  stopauto  - Stop auto capture")
        print("  stats     - Show auto capture statistics")
        print("  exit      - Exit admin mode")
        print("=" * 60)
        return True
    
    def deactivate(self):
        """Deactivate admin mode"""
        # Stop auto capture if running
        self.stop_auto_capture()
        
        self.active = False
        print("\n[ADMIN] Admin mode deactivated")
        return True
    
    def scan_faces(self):
        """Scan for faces using OpenCV"""
        print("\n[ADMIN] Scanning for faces...")
        frame = self.camera.get_single_frame()
        
        if frame is None:
            print("[ADMIN] ✗ Could not get camera frame")
            return
        
        # Detect faces
        faces = self.face_detector.detect_faces_opencv(frame)
        
        if len(faces) == 0:
            print("[ADMIN] ✗ No faces detected in frame")
            # Show frame anyway
            cv2.imshow("Camera View - NO FACES", frame)
            cv2.waitKey(3000)
            cv2.destroyAllWindows()
            return
        
        print(f"[ADMIN] ✓ Found {len(faces)} face(s)")
        
        # Try to recognize each face
        recognized_names = []
        for i, (x, y, w, h) in enumerate(faces):
            face_image = frame[y:y+h, x:x+w]
            
            # Simple recognition
            if face_image.size > 0:
                name, confidence = self.face_db.recognize_face_simple(face_image)
                if name != "Unknown":
                    print(f"[ADMIN] Face {i+1}: {name} (Confidence: {confidence:.2f})")
                else:
                    print(f"[ADMIN] Face {i+1}: Unknown")
                
                recognized_names.append(name)
            else:
                recognized_names.append("Unknown")
        
        # Draw faces on frame
        frame_with_faces = self.face_detector.draw_faces(frame, faces, recognized_names)
        
        # Save the frame
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"faces/scan_{timestamp}.jpg"
        cv2.imwrite(filename, frame_with_faces)
        print(f"[ADMIN] Saved scan image: {filename}")
        
        # Show result
        cv2.imshow("Face Detection Results", frame_with_faces)
        cv2.waitKey(5000)
        cv2.destroyAllWindows()
        
        return len(faces)
    
    def auto_capture_loop(self):
        """Auto capture loop - detects and captures faces every 10 seconds"""
        print(f"\n[ADMIN AUTO] Starting auto capture (every {self.config.ADMIN_AUTO_INTERVAL}s)")
        print("[ADMIN AUTO] Press Ctrl+C in admin mode to stop")
        
        while self.auto_capture_active:
            try:
                current_time = time.time()
                print(f"\n[ADMIN AUTO] Checking at {datetime.now().strftime('%H:%M:%S')}")
                
                # Get frame
                frame = self.camera.get_single_frame()
                
                if frame is None:
                    print("[ADMIN AUTO] ✗ Could not get camera frame")
                    time.sleep(5)
                    continue
                
                # Detect faces
                faces = self.face_detector.detect_faces_opencv(frame)
                
                if len(faces) > 0:
                    print(f"[ADMIN AUTO] ✓ Detected {len(faces)} face(s)")
                    
                    # Capture and save faces
                    self.capture_and_save_faces(frame, faces)
                    
                    # Show preview for 2 seconds
                    frame_with_faces = self.face_detector.draw_faces(frame.copy(), faces)
                    cv2.imshow("Auto Capture - DETECTED", frame_with_faces)
                    cv2.waitKey(2000)
                    cv2.destroyAllWindows()
                    
                else:
                    print("[ADMIN AUTO] ✗ No faces detected")
                    
                    # Still show empty frame for 1 second
                    cv2.imshow("Auto Capture - NO FACES", frame)
                    cv2.waitKey(1000)
                    cv2.destroyAllWindows()
                
                # Wait for next check
                for i in range(self.config.ADMIN_AUTO_INTERVAL):
                    if not self.auto_capture_active:
                        break
                    time.sleep(1)
                    
            except Exception as e:
                print(f"[ADMIN AUTO] Error: {e}")
                time.sleep(5)
        
        print("[ADMIN AUTO] Auto capture stopped")
    
    def capture_and_save_faces(self, frame, faces):
        """Capture and save detected faces"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        
        recognized_names = []
        
        for i, (x, y, w, h) in enumerate(faces):
            # Extract face
            face_image = frame[y:y+h, x:x+w]
            
            if face_image.size == 0:
                continue
            
            # Try to recognize
            name, confidence = self.face_db.recognize_face_simple(face_image)
            recognized_names.append(name)
            
            # Save individual face
            if name != "Unknown":
                face_filename = f"{self.face_db.auto_capture_dir}/face_{timestamp}_{i+1}_{name}.jpg"
            else:
                face_filename = f"{self.face_db.auto_capture_dir}/face_{timestamp}_{i+1}_Unknown.jpg"
            
            cv2.imwrite(face_filename, face_image)
            
            # Log the capture
            print(f"[ADMIN AUTO] Captured face {i+1}: {name} (conf: {confidence:.2f})")
            print(f"              Saved as: {face_filename}")
            
            self.capture_count += 1
        
        # Draw faces with recognition on frame
        frame_with_faces = self.face_detector.draw_faces(frame.copy(), faces, recognized_names)
        
        # Save full frame with detections
        full_filename = f"{self.face_db.auto_capture_dir}/full_{timestamp}.jpg"
        cv2.imwrite(full_filename, frame_with_faces)
        
        self.last_capture_time = time.time()
    
    def start_auto_capture(self):
        """Start auto capture mode"""
        if self.auto_capture_active:
            print("[ADMIN] Auto capture is already running!")
            return
        
        print("\n" + "=" * 50)
        print("ADMIN AUTO CAPTURE MODE")
        print("=" * 50)
        print(f"• Will detect faces every {self.config.ADMIN_AUTO_INTERVAL} seconds")
        print(f"• Photos saved to: {self.face_db.auto_capture_dir}/")
        print(f"• Uses OpenCV face detection (no face_recognition needed)")
        print(f"• Type 'stopauto' to stop")
        print("=" * 50)
        
        self.auto_capture_active = True
        self.auto_capture_thread = threading.Thread(target=self.auto_capture_loop, daemon=True)
        self.auto_capture_thread.start()
        
        print("[ADMIN] ✓ Auto capture started")
    
    def stop_auto_capture(self):
        """Stop auto capture mode"""
        if not self.auto_capture_active:
            print("[ADMIN] Auto capture is not running!")
            return
        
        print("\n[ADMIN] Stopping auto capture...")
        self.auto_capture_active = False
        
        if self.auto_capture_thread:
            self.auto_capture_thread.join(timeout=5)
        
        print(f"[ADMIN] Auto capture stopped. Total captures: {self.capture_count}")
    
    def show_auto_stats(self):
        """Show auto capture statistics"""
        print("\n" + "=" * 40)
        print("AUTO CAPTURE STATISTICS")
        print("=" * 40)
        
        if self.capture_count == 0:
            print("No captures yet")
        else:
            print(f"Total Captures: {self.capture_count}")
            
            if self.last_capture_time > 0:
                elapsed = time.time() - self.last_capture_time
                print(f"Last Capture: {elapsed:.1f} seconds ago")
            
            # Count files in auto_capture directory
            try:
                files = os.listdir(self.face_db.auto_capture_dir)
                face_files = [f for f in files if f.startswith('face_')]
                full_files = [f for f in files if f.startswith('full_')]
                print(f"Face Images: {len(face_files)}")
                print(f"Full Images: {len(full_files)}")
            except:
                pass
        
        print("=" * 40)
    
    def register_face(self):
        """Register a new face in the database"""
        print("\n[ADMIN] Registering new face...")
        print("Make sure your face is clearly visible to the camera")
        print("Press Enter when ready...")
        input()
        
        frame = self.camera.get_single_frame()
        if frame is None:
            print("[ADMIN] ✗ Could not get camera frame")
            return
        
        # Detect faces
        faces = self.face_detector.detect_faces_opencv(frame)
        
        if len(faces) == 0:
            print("[ADMIN] ✗ No face detected. Please face the camera.")
            
            # Show frame
            cv2.imshow("Register Face - NO FACE DETECTED", frame)
            cv2.waitKey(3000)
            cv2.destroyAllWindows()
            return
        
        if len(faces) > 1:
            print("[ADMIN] ✗ Multiple faces detected. Please have only one person in frame.")
            
            # Show frame with all faces marked
            frame_with_faces = self.face_detector.draw_faces(frame.copy(), faces)
            cv2.imshow("Register Face - MULTIPLE FACES", frame_with_faces)
            cv2.waitKey(3000)
            cv2.destroyAllWindows()
            return
        
        # Get the face
        x, y, w, h = faces[0]
        face_image = frame[y:y+h, x:x+w]
        
        # Show the detected face
        cv2.imshow("Detected Face - Press any key", face_image)
        cv2.waitKey(2000)
        cv2.destroyAllWindows()
        
        # Ask for name
        name = input("[ADMIN] Enter name for this face: ").strip()
        if not name:
            print("[ADMIN] ✗ Registration cancelled - no name provided")
            return
        
        # Add to database
        success = self.face_db.add_face(name, face_image)
        
        if success:
            print(f"[ADMIN] ✓ Face registered as: {name}")
        else:
            print("[ADMIN] ✗ Failed to register face")
    
    def capture_face_photo(self):
        """Capture face photo"""
        print("\n[ADMIN] Capturing face photo...")
        print("Face the camera. Photo will be saved to 'faces/' folder")
        
        frame = self.camera.get_single_frame()
        if frame is None:
            print("[ADMIN] ✗ Could not get camera frame")
            return
        
        # Detect faces
        faces = self.face_detector.detect_faces_opencv(frame)
        
        if len(faces) == 0:
            print("[ADMIN] ✗ No face detected in frame")
            # Still save the frame
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"faces/capture_no_face_{timestamp}.jpg"
            cv2.imwrite(filename, frame)
            print(f"[ADMIN] Saved photo (no face): {filename}")
            
            cv2.imshow("Capture - NO FACE", frame)
            cv2.waitKey(2000)
            cv2.destroyAllWindows()
            return
        
        # Mark faces on frame
        frame_with_faces = self.face_detector.draw_faces(frame.copy(), faces)
        
        # Save individual faces
        for i, (x, y, w, h) in enumerate(faces):
            face_image = frame[y:y+h, x:x+w]
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            face_filename = f"faces/face_{timestamp}_{i+1}.jpg"
            cv2.imwrite(face_filename, face_image)
            print(f"[ADMIN] Saved face {i+1}: {face_filename}")
        
        # Save full frame
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        full_filename = f"faces/full_capture_{timestamp}.jpg"
        cv2.imwrite(full_filename, frame_with_faces)
        print(f"[ADMIN] Saved full capture: {full_filename}")
        
        # Show result
        cv2.imshow("Captured Faces", frame_with_faces)
        cv2.waitKey(3000)
        cv2.destroyAllWindows()
        
        print(f"[ADMIN] ✓ Captured {len(faces)} face(s)")
    
    def list_faces(self):
        """List all registered faces"""
        print(self.face_db.list_faces())
    
    def delete_face(self):
        """Delete a face from database"""
        print("\n[ADMIN] Delete face from database")
        print(self.face_db.list_faces())
        
        if not self.face_db.known_faces:
            print("[ADMIN] No faces to delete")
            return
        
        try:
            choice = input("\nEnter face number to delete (or 'cancel'): ").strip()
            if choice.lower() == 'cancel':
                print("[ADMIN] Cancelled")
                return
            
            index = int(choice) - 1
            names = list(self.face_db.known_faces.keys())
            
            if 0 <= index < len(names):
                name = names[index]
                success = self.face_db.delete_face(name)
            else:
                print("[ADMIN] ✗ Invalid number")
        except ValueError:
            print("[ADMIN] ✗ Please enter a valid number")

# ================= COMMAND-BASED CLASSROOM =================
class CommandClassroom:
    def __init__(self, config):
        self.config = config
        self.camera = CameraManager(config)
        self.detector = SimpleDetector(config)
        self.face_db = SimpleFaceDatabase()
        self.admin_mode = AdminMode(self.camera, self.face_db, config)
        self.state = self.initialize_state()
        self.running = False
        self.detection_thread = None
        
    def initialize_state(self):
        return {
            'detection_active': False,
            'person_detected': False,
            'lights_on': False,
            'fan_on': False,
            'last_detection_time': None,
            'timer_start_time': None,
            'detection_count': 0,
            'camera_working': False,
            'admin_mode': False
        }
    
    def display_banner(self):
        """Display system banner"""
        print("\n" + "=" * 60)
        print("  SMART CLASSROOM (OpenCV Face Detection)")
        print("=" * 60)
        print(f"Phone Camera: {self.config.PHONE_IP}:{self.config.PHONE_PORT}")
        print(f"Mode: SINGLE-FRAME detection")
        print(f"Registered Faces: {len(self.face_db.known_faces)}")
        print(f"Timeout: {self.config.TIMEOUT_SECONDS} seconds")
        print(f"Auto Interval: {self.config.ADMIN_AUTO_INTERVAL}s")
        print("=" * 60)
        print("\nMAIN COMMANDS:")
        print("  detect     - Check for person (single check)")
        print("  start      - Start auto detection (every 30s)")
        print("  stop       - Stop auto detection")
        print("  status     - Show current status")
        print("  lights     - Toggle lights")
        print("  fan        - Toggle fan")
        print("  test       - Test camera")
        print("  manual     - Manual override (person yes/no)")
        print("  reset      - Reset all devices to OFF")
        print("  admin      - Enter ADMIN mode (face detection + auto)")
        print("  exit       - Exit program")
        print("=" * 60 + "\n")
    
    def single_detection(self):
        """Perform a single detection check"""
        print("\nPerforming single detection check...")
        
        # Get single frame
        frame = self.camera.get_single_frame()
        
        if frame is None:
            print("✗ Camera error: Could not get frame")
            return False
        
        # Detect person
        detected, count = self.detector.check_person_single_frame(frame)
        
        if detected:
            print(f"✓ Person detected! ({count} face(s) found)")
            self.update_state(True)
            return True
        else:
            print("✗ No person detected")
            self.update_state(False)
            return False
    
    def update_state(self, detected):
        """Update system state based on detection"""
        current_time = time.time()
        
        if detected != self.state['person_detected']:
            self.state['person_detected'] = detected
            
            if detected:
                # Person detected
                self.state['last_detection_time'] = current_time
                self.state['detection_count'] += 1
                self.turn_on_devices()
                print(f"[SYSTEM] Person entered - Devices: ON")
                self.log_event("PERSON_DETECTED", f"Faces: {self.detector.detection_count}")
            else:
                # Person left - start timer
                self.state['timer_start_time'] = current_time
                self.state['person_detected'] = False
                print(f"[SYSTEM] Person left - Timer started ({self.config.TIMEOUT_SECONDS}s)")
                self.log_event("PERSON_LEFT", "Timer started")
        
        # Check timer if no person but devices are on
        if not detected and self.state['lights_on']:
            if self.state['timer_start_time']:
                elapsed = current_time - self.state['timer_start_time']
                remaining = max(0, self.config.TIMEOUT_SECONDS - elapsed)
                
                if elapsed >= self.config.TIMEOUT_SECONDS:
                    self.turn_off_devices()
                    self.state['timer_start_time'] = None
                    print("[SYSTEM] Timeout reached - Devices: OFF")
                    self.log_event("TIMEOUT", "Devices OFF")
                elif int(elapsed) % 5 == 0:  # Show countdown every 5 seconds
                    print(f"  Time remaining: {remaining:.0f}s")
    
    def turn_on_devices(self):
        """Turn on lights and fan"""
        if not self.state['lights_on']:
            self.state['lights_on'] = True
            self.state['fan_on'] = True
            print("[DEVICES] Lights: ON, Fan: ON")
    
    def turn_off_devices(self):
        """Turn off lights and fan"""
        if self.state['lights_on']:
            self.state['lights_on'] = False
            self.state['fan_on'] = False
            print("[DEVICES] Lights: OFF, Fan: OFF")
    
    def toggle_lights(self):
        """Toggle lights"""
        self.state['lights_on'] = not self.state['lights_on']
        status = "ON" if self.state['lights_on'] else "OFF"
        print(f"[DEVICES] Lights: {status}")
        self.log_event(f"LIGHTS_{status}", "Manual control")
    
    def toggle_fan(self):
        """Toggle fan"""
        self.state['fan_on'] = not self.state['fan_on']
        status = "ON" if self.state['fan_on'] else "OFF"
        print(f"[DEVICES] Fan: {status}")
        self.log_event(f"FAN_{status}", "Manual control")
    
    def log_event(self, event_type, details=""):
        """Log event to file"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"{timestamp} | {event_type} | {details}\n"
        
        log_file = f"logs/classroom_{datetime.now().strftime('%Y%m%d')}.log"
        try:
            with open(log_file, 'a', encoding='utf-8') as f:
                f.write(log_entry)
        except:
            pass  # Skip if log fails
    
    def start_auto_detection(self):
        """Start auto detection"""
        if self.running:
            print("[SYSTEM] Auto detection is already running!")
            return
        
        # Test camera first
        success, frame = self.camera.test_connection()
        if not success:
            print("[SYSTEM] Cannot start - camera not connected!")
            return False
        
        print("\n" + "=" * 50)
        print("AUTO DETECTION STARTED")
        print("=" * 50)
        print("System will check for person every 30 seconds")
        print("Type 'stop' to stop auto detection")
        print("Type 'detect' for immediate check")
        print("=" * 50)
        
        self.running = True
        self.detection_thread = threading.Thread(target=self.auto_detection_loop, daemon=True)
        self.detection_thread.start()
        
        return True
    
    def auto_detection_loop(self):
        """Auto detection loop - checks every 30 seconds"""
        print("\n[Auto Detection] Starting... (checks every 30 seconds)")
        
        while self.running:
            try:
                print(f"\n[Auto Detection] Checking at {datetime.now().strftime('%H:%M:%S')}")
                
                # Perform single detection
                detected = self.single_detection()
                
                if not self.running:  # Check if we should stop
                    break
                
                # Wait before next check (30 seconds)
                for i in range(30):
                    if not self.running:
                        break
                    time.sleep(1)
                    
            except KeyboardInterrupt:
                break
            except Exception as e:
                print(f"[Auto Detection] Error: {e}")
                time.sleep(5)
        
        print("[Auto Detection] Stopped")
    
    def stop_auto_detection(self):
        """Stop auto detection"""
        if not self.running:
            print("[SYSTEM] Auto detection is not running!")
            return
        
        print("\nStopping auto detection...")
        self.running = False
        
        if self.detection_thread:
            self.detection_thread.join(timeout=5)
        
        print("[SYSTEM] Auto detection stopped")
        self.show_status()
    
    def show_status(self):
        """Show current status"""
        print("\n" + "=" * 50)
        print("CURRENT STATUS")
        print("=" * 50)
        
        # Auto detection status
        auto_status = "RUNNING" if self.running else "STOPPED"
        print(f"Auto Detection:   [{auto_status}]")
        
        # Admin mode status
        admin_status = "ACTIVE" if self.admin_mode.active else "INACTIVE"
        print(f"Admin Mode:       [{admin_status}]")
        
        # Admin auto capture status
        admin_auto_status = "RUNNING" if self.admin_mode.auto_capture_active else "STOPPED"
        print(f"Admin Auto:       [{admin_auto_status}]")
        
        # Person status
        if self.state['person_detected']:
            print(f"Person Detected:  [YES]")
        else:
            print(f"Person Detected:  [NO]")
        
        # Device status
        lights = "ON" if self.state['lights_on'] else "OFF"
        fan = "ON" if self.state['fan_on'] else "OFF"
        print(f"Lights:           [{lights}]")
        print(f"Fan:              [{fan}]")
        
        # Timer info
        if self.state['timer_start_time'] and not self.state['person_detected']:
            elapsed = time.time() - self.state['timer_start_time']
            remaining = max(0, self.config.TIMEOUT_SECONDS - elapsed)
            
            if remaining > 0:
                print(f"Timer:            [ACTIVE] - {remaining:.0f}s remaining")
            else:
                print(f"Timer:            [EXPIRED]")
        else:
            print(f"Timer:            [INACTIVE]")
        
        # Statistics
        print("\nSTATISTICS:")
        print(f"  Total Detections: {self.state['detection_count']}")
        print(f"  Registered Faces: {len(self.face_db.known_faces)}")
        print(f"  Auto Captures:    {self.admin_mode.capture_count}")
        
        if self.state['last_detection_time']:
            elapsed = time.time() - self.state['last_detection_time']
            print(f"  Last Detection:   {elapsed:.1f} seconds ago")
        
        print("=" * 50)
    
    def manual_override(self, state):
        """Manual override for testing"""
        if state == 'yes':
            print("[MANUAL] Setting: Person PRESENT")
            self.update_state(True)
        elif state == 'no':
            print("[MANUAL] Setting: Person ABSENT")
            self.update_state(False)
        else:
            print("Usage: manual [yes|no]")
    
    def reset_system(self):
        """Reset system to initial state"""
        print("\nResetting system...")
        self.state['lights_on'] = False
        self.state['fan_on'] = False
        self.state['person_detected'] = False
        self.state['timer_start_time'] = None
        print("[SYSTEM] All devices: OFF")
        print("[SYSTEM] Detection state: RESET")
    
    def handle_admin_mode(self):
        """Enter admin mode"""
        if self.admin_mode.active:
            print("[SYSTEM] Already in admin mode!")
            return
        
        # Activate admin mode
        self.admin_mode.activate()
        self.state['admin_mode'] = True
        
        # Admin command loop
        while self.admin_mode.active:
            try:
                cmd = input("\nAdmin Command > ").strip().lower()
                
                if cmd == 'exit':
                    self.admin_mode.deactivate()
                    self.state['admin_mode'] = False
                    break
                    
                elif cmd == 'scan':
                    self.admin_mode.scan_faces()
                    
                elif cmd == 'register':
                    self.admin_mode.register_face()
                    
                elif cmd == 'list':
                    self.admin_mode.list_faces()
                    
                elif cmd == 'delete':
                    self.admin_mode.delete_face()
                    
                elif cmd == 'capture':
                    self.admin_mode.capture_face_photo()
                    
                elif cmd == 'auto':
                    self.admin_mode.start_auto_capture()
                    
                elif cmd == 'stopauto':
                    self.admin_mode.stop_auto_capture()
                    
                elif cmd == 'stats':
                    self.admin_mode.show_auto_stats()
                    
                elif cmd == 'help':
                    print("\n[ADMIN] Available Commands:")
                    print("  scan      - Scan for faces (OpenCV)")
                    print("  register  - Register new face")
                    print("  list      - List registered faces")
                    print("  delete    - Delete a face")
                    print("  capture   - Capture face photo")
                    print("  auto      - Start auto capture (every 10s)")
                    print("  stopauto  - Stop auto capture")
                    print("  stats     - Show auto capture stats")
                    print("  exit      - Exit admin mode")
                    
                elif cmd == '':
                    continue
                    
                else:
                    print(f"[ADMIN] Unknown command: '{cmd}'")
                    print("Type 'help' for commands")
                    
            except KeyboardInterrupt:
                print("\n[ADMIN] Exiting admin mode...")
                self.admin_mode.deactivate()
                self.state['admin_mode'] = False
                break
            except Exception as e:
                print(f"[ADMIN] Error: {e}")
    
    def show_help(self):
        """Show help"""
        print("\n" + "=" * 70)
        print("QUICK COMMAND REFERENCE")
        print("=" * 70)
        print("detect     - Check for person right now")
        print("start      - Start auto-check every 30s")
        print("stop       - Stop auto-check")
        print("status     - Show current status")
        print("lights     - Toggle lights ON/OFF")
        print("fan        - Toggle fan ON/OFF")
        print("test       - Test camera connection")
        print("manual yes - Force 'person detected' state")
        print("manual no  - Force 'no person' state")
        print("reset      - Turn everything OFF")
        print("admin      - Enter ADMIN mode (OpenCV face detection + auto)")
        print("exit       - Exit program")
        print("\n[ADMIN MODE COMMANDS]:")
        print("scan       - Scan for faces (OpenCV Haar cascades)")
        print("register   - Register new face")
        print("list       - List registered faces")
        print("delete     - Delete a face")
        print("capture    - Capture face photo")
        print("auto       - Start AUTO capture (detect & save every 10s)")
        print("stopauto   - Stop auto capture")
        print("stats      - Show auto capture statistics")
        print("exit       - Exit admin mode")
        print("=" * 70)

# ================= MAIN INTERFACE =================
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
                classroom.stop_auto_detection()
                classroom.admin_mode.stop_auto_capture()
                break
            
            if cmd == 'exit' or cmd == 'quit':
                print("\nExiting program...")
                classroom.stop_auto_detection()
                classroom.admin_mode.stop_auto_capture()
                break
                
            elif cmd == 'detect':
                classroom.single_detection()
                
            elif cmd == 'start':
                classroom.start_auto_detection()
                
            elif cmd == 'stop':
                classroom.stop_auto_detection()
                
            elif cmd == 'status':
                classroom.show_status()
                
            elif cmd == 'lights':
                classroom.toggle_lights()
                
            elif cmd == 'fan':
                classroom.toggle_fan()
                
            elif cmd == 'test':
                success, frame = classroom.camera.test_connection()
                if success and frame is not None:
                    # Show preview
                    cv2.imshow("Camera Test", frame)
                    cv2.waitKey(3000)
                    cv2.destroyAllWindows()
                    
                    # Try detection on test frame
                    detected, count = classroom.detector.check_person_single_frame(frame)
                    if detected:
                        print(f"Test detection: PERSON DETECTED ({count} faces)")
                    else:
                        print("Test detection: NO PERSON")
                
            elif cmd.startswith('manual '):
                parts = cmd.split()
                if len(parts) == 2:
                    classroom.manual_override(parts[1])
                else:
                    print("Usage: manual [yes|no]")
                    
            elif cmd == 'reset':
                classroom.reset_system()
                
            elif cmd == 'admin':
                classroom.handle_admin_mode()
                
            elif cmd == 'help':
                classroom.show_help()
                
            elif cmd == '':
                continue
                
            else:
                print(f"Unknown command: '{cmd}'")
                print("Type 'help' for commands")
                
    except Exception as e:
        print(f"\nError: {e}")
    
    finally:
        # Final summary
        print("\n" + "=" * 60)
        print("SESSION SUMMARY")
        print("=" * 60)
        print(f"Total Detections: {classroom.state['detection_count']}")
        print(f"Registered Faces: {len(classroom.face_db.known_faces)}")
        print(f"Auto Captures: {classroom.admin_mode.capture_count}")
        print(f"Final State: Lights={'ON' if classroom.state['lights_on'] else 'OFF'}, "
              f"Fan={'ON' if classroom.state['fan_on'] else 'OFF'}")
        print("\nPhotos saved in:")
        print(f"  • auto_capture/     - Auto captured faces")
        print(f"  • faces/            - Manual captures")
        print(f"  • registered_faces/ - Registered faces")
        print("\nGoodbye!")
        print("=" * 60)

if __name__ == "__main__":
    main()
