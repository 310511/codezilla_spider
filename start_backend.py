#!/usr/bin/env python3
"""
Backend Startup Script for Spider1 Project
- Starts both Flask and FastAPI servers
- Handles process management
- Provides unified logging
"""

import os
import sys
import subprocess
import time
import signal
import threading
from pathlib import Path

# Add backend to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), 'backend')))

def start_fastapi_server():
    """Start the FastAPI server"""
    try:
        print("🚀 Starting FastAPI server on port 8000...")
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "main:app", 
            "--host", "0.0.0.0", 
            "--port", "8000",
            "--reload"
        ], cwd="backend")
    except KeyboardInterrupt:
        print("\n🛑 FastAPI server stopped")
    except Exception as e:
        print(f"❌ FastAPI server error: {e}")

def start_flask_server():
    """Start the Flask server"""
    try:
        print("🚀 Starting Flask server on port 5001...")
        subprocess.run([
            sys.executable, "flask_integration.py"
        ], cwd="backend")
    except KeyboardInterrupt:
        print("\n🛑 Flask server stopped")
    except Exception as e:
        print(f"❌ Flask server error: {e}")

def check_dependencies():
    """Check if required dependencies are installed"""
    required_packages = [
        'flask',
        'flask-cors',
        'fastapi',
        'uvicorn',
        'pillow',
        'opencv-python',
        'torch',
        'numpy'
    ]
    
    missing_packages = []
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
        except ImportError:
            missing_packages.append(package)
    
    if missing_packages:
        print(f"❌ Missing packages: {', '.join(missing_packages)}")
        print("📦 Installing missing packages...")
        
        # Install Flask requirements
        subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", "backend/flask_requirements.txt"
        ])
        
        # Install FastAPI requirements
        subprocess.run([
            sys.executable, "-m", "pip", "install", "-r", "backend/requirements.txt"
        ])
        
        print("✅ Dependencies installed successfully!")

def main():
    """Main function to start both servers"""
    print("🎯 Spider1 Backend Startup")
    print("=" * 50)
    
    # Check dependencies
    check_dependencies()
    
    # Create necessary directories
    os.makedirs("backend/uploads", exist_ok=True)
    
    # Start servers in separate threads
    fastapi_thread = threading.Thread(target=start_fastapi_server, daemon=True)
    flask_thread = threading.Thread(target=start_flask_server, daemon=True)
    
    try:
        # Start both servers
        fastapi_thread.start()
        time.sleep(2)  # Give FastAPI a moment to start
        flask_thread.start()
        
        print("\n✅ Both servers started successfully!")
        print("📊 FastAPI (Medicine AI): http://localhost:8000")
        print("📊 Flask (Skin Analysis): http://localhost:5001")
        print("🌐 Frontend: http://localhost:3006")
        print("\nPress Ctrl+C to stop all servers")
        
        # Keep main thread alive
        while True:
            time.sleep(1)
            
    except KeyboardInterrupt:
        print("\n🛑 Shutting down servers...")
        sys.exit(0)
    except Exception as e:
        print(f"❌ Startup error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main() 