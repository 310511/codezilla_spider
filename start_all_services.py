#!/usr/bin/env python3
"""
Unified Backend Services Startup Script
- Starts FastAPI server (port 8000)
- Starts Flask server (port 5001) 
- Starts Voice Medicine Assistant (port 5002)
- Handles dependencies and health checks
"""

import os
import sys
import time
import subprocess
import threading
import requests
from pathlib import Path

def check_dependencies():
    """Check and install required dependencies"""
    print("🔍 Checking dependencies...")
    
    # Check if required packages are installed
    required_packages = [
        "fastapi",
        "uvicorn", 
        "flask",
        "flask-cors",
        "requests",
        "pydantic"
    ]
    
    for package in required_packages:
        try:
            __import__(package.replace("-", "_"))
            print(f"✅ {package} is installed")
        except ImportError:
            print(f"❌ {package} not found, installing...")
            subprocess.run([sys.executable, "-m", "pip", "install", package])

def start_fastapi_server():
    """Start the main FastAPI server"""
    print("🚀 Starting FastAPI server on port 8000...")
    try:
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "backend.main:app", 
            "--host", "0.0.0.0", 
            "--port", "8000",
            "--reload"
        ], check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ FastAPI server failed to start: {e}")
    except KeyboardInterrupt:
        print("🛑 FastAPI server stopped")

def start_flask_server():
    """Start the Flask server for skin analysis"""
    print("🚀 Starting Flask server on port 5001...")
    try:
        subprocess.run([
            sys.executable, "backend/simple_flask_server.py"
        ], check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Flask server failed to start: {e}")
    except KeyboardInterrupt:
        print("🛑 Flask server stopped")

def start_voice_medicine_service():
    """Start the Voice Medicine Assistant service"""
    print("🚀 Starting Voice Medicine Assistant on port 5002...")
    try:
        subprocess.run([
            sys.executable, "backend/voice_medicine_service.py"
        ], check=True)
    except subprocess.CalledProcessError as e:
        print(f"❌ Voice Medicine Assistant failed to start: {e}")
    except KeyboardInterrupt:
        print("🛑 Voice Medicine Assistant stopped")

def health_check():
    """Check if all services are running"""
    services = [
        {"name": "FastAPI", "url": "http://localhost:8000/health"},
        {"name": "Flask", "url": "http://localhost:5001/health"},
        {"name": "Voice Medicine", "url": "http://localhost:5002/health"}
    ]
    
    print("\n🏥 Health Check Results:")
    print("=" * 50)
    
    for service in services:
        try:
            response = requests.get(service["url"], timeout=5)
            if response.status_code == 200:
                print(f"✅ {service['name']}: Healthy")
            else:
                print(f"⚠️  {service['name']}: Status {response.status_code}")
        except requests.exceptions.RequestException:
            print(f"❌ {service['name']}: Not responding")

def main():
    """Main function to start all services"""
    print("🏥 MedChain - Unified Backend Services")
    print("=" * 50)
    
    # Check dependencies
    check_dependencies()
    
    # Change to the correct directory
    os.chdir(Path(__file__).parent)
    
    # Start services in separate threads
    threads = []
    
    # FastAPI server
    fastapi_thread = threading.Thread(target=start_fastapi_server, daemon=True)
    threads.append(fastapi_thread)
    
    # Flask server
    flask_thread = threading.Thread(target=start_flask_server, daemon=True)
    threads.append(flask_thread)
    
    # Voice Medicine Assistant
    voice_thread = threading.Thread(target=start_voice_medicine_service, daemon=True)
    threads.append(voice_thread)
    
    # Start all threads
    for thread in threads:
        thread.start()
    
    print("\n🎯 All services starting...")
    print("📊 FastAPI: http://localhost:8000")
    print("🌐 Flask: http://localhost:5001")
    print("🎤 Voice Medicine: http://localhost:5002")
    print("🏥 React Frontend: http://localhost:3006")
    
    # Wait a moment for services to start
    time.sleep(3)
    
    # Perform health check
    health_check()
    
    print("\n🎉 All services are running!")
    print("Press Ctrl+C to stop all services")
    
    try:
        # Keep the main thread alive
        while True:
            time.sleep(10)
            # Periodic health check
            health_check()
    except KeyboardInterrupt:
        print("\n🛑 Shutting down all services...")
        sys.exit(0)

if __name__ == "__main__":
    main() 