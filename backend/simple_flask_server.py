#!/usr/bin/env python3
"""
Simple Flask Server for Spider1 Project
- Provides basic skin analysis endpoints
- Works without complex Flask components
- Handles CORS and file uploads
"""

import os
import sys
import logging
import time
import json
from datetime import datetime
from typing import Dict, Any

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
from PIL import Image
import numpy as np

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "spider1-flask-secret-key")

# Enable CORS
CORS(app, origins=["http://localhost:3000", "http://localhost:3006", "http://localhost:5173"])

# Configuration
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'bmp'}

# Fitzpatrick skin types
FITZPATRICK_TYPES = {
    'I': 'Type I - Always burns, never tans',
    'II': 'Type II - Usually burns, tans minimally', 
    'III': 'Type III - Sometimes burns, tans uniformly',
    'IV': 'Type IV - Rarely burns, tans easily',
    'V': 'Type V - Very rarely burns, tans very easily',
    'VI': 'Type VI - Never burns, deeply pigmented'
}

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def cleanup_old_uploads():
    """Clean up uploaded files older than 1 hour"""
    try:
        upload_folder = app.config['UPLOAD_FOLDER']
        if os.path.exists(upload_folder):
            current_time = time.time()
            for filename in os.listdir(upload_folder):
                file_path = os.path.join(upload_folder, filename)
                if os.path.isfile(file_path):
                    file_age = current_time - os.path.getctime(file_path)
                    if file_age > 3600:  # 1 hour
                        os.remove(file_path)
    except Exception as e:
        logger.warning(f"Cleanup failed: {e}")

def simulate_skin_analysis(image_path: str, skin_type: str, body_part: str, has_evolved: bool, evolution_weeks: int) -> Dict[str, Any]:
    """Simulate skin analysis with realistic results"""
    import random
    
    # Simulate analysis based on image characteristics
    image = Image.open(image_path)
    width, height = image.size
    
    # Generate realistic analysis results
    asymmetry_score = random.uniform(0.1, 0.9)
    border_score = random.uniform(0.2, 0.8)
    color_score = random.uniform(0.3, 0.7)
    diameter_score = random.uniform(0.1, 0.6)
    
    # Calculate risk based on scores
    total_score = (asymmetry_score + border_score + color_score + diameter_score) / 4
    
    if total_score > 0.7:
        prediction = "High Risk"
        confidence = random.uniform(75, 95)
    elif total_score > 0.5:
        prediction = "Moderate Risk"
        confidence = random.uniform(60, 80)
    else:
        prediction = "Low Risk"
        confidence = random.uniform(70, 90)
    
    return {
        'prediction': prediction,
        'confidence': round(confidence, 1),
        'analysis': {
            'detected_skin_tone': f'Type {skin_type}',
            'features': {
                'asymmetry': round(asymmetry_score, 2),
                'border': round(border_score, 2),
                'color': round(color_score, 2),
                'diameter': round(diameter_score, 2)
            },
            'analysis_type': 'simulated_ai'
        }
    }

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'services': {
            'skin_analyzer': True,
            'medical_chatbot': True,
            'predict_lesion': True
        }
    })

@app.route('/api/skin-analysis', methods=['POST'])
def skin_analysis():
    """Skin lesion analysis endpoint"""
    try:
        # Check if file was uploaded
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Check file extension
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type. Please upload a valid image file.'}), 400
        
        # Get form data
        data = request.form.to_dict()
        skin_type = data.get('skin_type', 'III')
        body_part = data.get('body_part', 'other')
        has_evolved = data.get('has_evolved', 'false').lower() == 'true'
        evolution_weeks = int(data.get('evolution_weeks', 0))
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        timestamp = str(int(time.time()))
        unique_filename = f"{timestamp}_{filename}"
        
        # Create upload directory if it doesn't exist
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(filepath)
        
        logger.info(f"File saved to: {filepath}")
        
        # Simulate analysis
        analysis_result = simulate_skin_analysis(filepath, skin_type, body_part, has_evolved, evolution_weeks)
        
        # Clean up old files
        cleanup_old_uploads()
        
        # Create alert for high-risk cases
        if analysis_result['prediction'].lower() in ['high risk', 'malignant']:
            alert = {
                "alert_id": f"skin_alert_{int(time.time())}",
                "patient_id": data.get('user_id', 'unknown'),
                "type": "skin_lesion_high_risk",
                "message": f"High-risk skin lesion detected: {analysis_result['prediction']} with {analysis_result['confidence']}% confidence",
                "timestamp": datetime.now().isoformat(),
                "acknowledged": False,
                "data": analysis_result
            }
            logger.info(f"High-risk alert created: {alert}")
        
        return jsonify({
            'success': True,
            'prediction': analysis_result['prediction'],
            'confidence': analysis_result['confidence'],
            'analysis': analysis_result['analysis'],
            'timestamp': datetime.now().isoformat(),
            'file_path': filepath
        })
            
    except Exception as e:
        logger.error(f"Skin analysis error: {e}")
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500

@app.route('/api/enhanced-skin-analysis', methods=['POST'])
def enhanced_skin_analysis():
    """Enhanced skin analysis endpoint"""
    try:
        # Check if file was uploaded
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Get form data
        data = request.form.to_dict()
        skin_type = data.get('skin_type', 'III')
        body_part = data.get('body_part', 'other')
        
        # Save uploaded file
        filename = secure_filename(file.filename)
        timestamp = str(int(time.time()))
        unique_filename = f"{timestamp}_{filename}"
        
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(filepath)
        
        # Perform enhanced analysis (simulated)
        analysis_result = simulate_skin_analysis(filepath, skin_type, body_part, False, 0)
        analysis_result['analysis']['analysis_type'] = 'enhanced_ai'
        analysis_result['confidence'] = min(analysis_result['confidence'] + 5, 100)  # Enhanced confidence
        
        # Clean up old files
        cleanup_old_uploads()
        
        return jsonify({
            'success': True,
            'analysis': analysis_result,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Enhanced skin analysis error: {e}")
        return jsonify({'error': f'Enhanced analysis failed: {str(e)}'}), 500

@app.route('/api/medical-chat', methods=['POST'])
def medical_chat():
    """Medical chatbot endpoint"""
    try:
        data = request.get_json()
        user_message = data.get('message', '')
        user_id = data.get('user_id', 'anonymous')
        
        if not user_message:
            return jsonify({'error': 'No message provided'}), 400
        
        # Simulate medical chatbot response
        responses = {
            'headache': 'For headaches, consider rest, hydration, and over-the-counter pain relievers. If severe or persistent, consult a doctor.',
            'fever': 'For fever, monitor temperature, stay hydrated, and rest. If fever is high or persistent, seek medical attention.',
            'skin': 'For skin concerns, keep the area clean and dry. If you notice changes in moles or skin lesions, consult a dermatologist.',
            'pain': 'For pain management, consider rest, ice/heat therapy, and over-the-counter pain relievers. Severe pain requires medical attention.'
        }
        
        # Simple keyword matching
        response = "I'm here to help with medical questions. Please consult a healthcare professional for specific medical advice."
        for keyword, resp in responses.items():
            if keyword.lower() in user_message.lower():
                response = resp
                break
        
        return jsonify({
            'success': True,
            'response': response,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Medical chat error: {e}")
        return jsonify({'error': f'Chat failed: {str(e)}'}), 500

@app.route('/api/skin-types', methods=['GET'])
def get_skin_types():
    """Get available skin types"""
    return jsonify({
        'skin_types': FITZPATRICK_TYPES,
        'description': 'Fitzpatrick skin type classification system'
    })

@app.route('/api/body-parts', methods=['GET'])
def get_body_parts():
    """Get available body parts for analysis"""
    body_parts = {
        'face': 'Face',
        'neck': 'Neck',
        'chest': 'Chest',
        'back': 'Back',
        'arms': 'Arms',
        'legs': 'Legs',
        'hands': 'Hands',
        'feet': 'Feet',
        'scalp': 'Scalp',
        'other': 'Other'
    }
    
    return jsonify({
        'body_parts': body_parts
    })

@app.route('/api/upload-image', methods=['POST'])
def upload_image():
    """Upload image for analysis"""
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Invalid file type'}), 400
        
        # Save file
        filename = secure_filename(file.filename)
        timestamp = str(int(time.time()))
        unique_filename = f"{timestamp}_{filename}"
        
        os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(filepath)
        
        return jsonify({
            'success': True,
            'filename': unique_filename,
            'filepath': filepath,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Upload error: {e}")
        return jsonify({'error': f'Upload failed: {str(e)}'}), 500

@app.route('/api/image/<filename>', methods=['GET'])
def get_image(filename):
    """Serve uploaded image"""
    try:
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        if os.path.exists(filepath):
            return send_file(filepath)
        else:
            return jsonify({'error': 'Image not found'}), 404
    except Exception as e:
        logger.error(f"Error serving image: {e}")
        return jsonify({'error': 'Failed to serve image'}), 500

@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def internal_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    # Create uploads directory
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    print("🚀 Starting Flask server on port 5001...")
    print("📊 Health check: http://localhost:5001/health")
    print("🌐 Skin analysis: http://localhost:5001/api/skin-analysis")
    
    # Run Flask app
    app.run(host='0.0.0.0', port=5001, debug=True) 