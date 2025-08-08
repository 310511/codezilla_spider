#!/usr/bin/env python3
"""
Flask Integration for Spider1 Project
- Integrates skin lesion classifier with main backend
- Provides unified API endpoints
- Handles CORS and authentication
- Connects with existing FastAPI services
"""

import os
import sys
import logging
import time
from datetime import datetime
from typing import Optional, Dict, Any, List
import json
import base64
from io import BytesIO

# Add Flask directory to path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '../Flask')))

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import numpy as np
from PIL import Image
import cv2

# Import Flask components
try:
    from basic_model import predict_lesion
    from enhanced_skin_analysis import EnhancedSkinAnalyzer
    from medical_chatbot import MedicalChatbot
except ImportError as e:
    print(f"Warning: Could not import Flask components: {e}")
    predict_lesion = None
    EnhancedSkinAnalyzer = None
    MedicalChatbot = None

# Import existing backend services
from services.alerts_service import alerts_service, AlertType, AlertStatus
from services.purchase_order_service import purchase_order_service, PurchaseOrderStatus

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

# Initialize components
skin_analyzer = None
medical_chatbot = None

def initialize_components():
    """Initialize Flask components if available"""
    global skin_analyzer, medical_chatbot
    
    try:
        if EnhancedSkinAnalyzer:
            skin_analyzer = EnhancedSkinAnalyzer()
            logger.info("Enhanced Skin Analyzer initialized")
    except Exception as e:
        logger.warning(f"Could not initialize Enhanced Skin Analyzer: {e}")
    
    try:
        if MedicalChatbot:
            medical_chatbot = MedicalChatbot()
            logger.info("Medical Chatbot initialized")
    except Exception as e:
        logger.warning(f"Could not initialize Medical Chatbot: {e}")

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

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'services': {
            'skin_analyzer': skin_analyzer is not None,
            'medical_chatbot': medical_chatbot is not None,
            'predict_lesion': predict_lesion is not None
        }
    })

@app.route('/api/skin-analysis', methods=['POST'])
def skin_analysis():
    """Enhanced skin lesion analysis endpoint"""
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
        
        # Make prediction
        if predict_lesion:
            prediction, confidence, analysis_data = predict_lesion(
                filepath, skin_type, body_part, has_evolved, evolution_weeks
            )
            
            logger.info(f"Prediction: {prediction}, Confidence: {confidence}%")
            
            # Generate analysis summary
            analysis_summary = None
            if analysis_data:
                analysis_summary = {
                    'detected_skin_tone': analysis_data.get('detected_skin_tone', f'Type {skin_type}'),
                    'features': {
                        'asymmetry': analysis_data.get('asymmetry', 0),
                        'border': analysis_data.get('border', 0),
                        'color': analysis_data.get('color', 0),
                        'diameter': analysis_data.get('diameter', 0)
                    },
                    'analysis_type': analysis_data.get('analysis_type', 'basic')
                }
            
            # Clean up old files
            cleanup_old_uploads()
            
            # Create alert for high-risk cases
            if prediction.lower() in ['malignant', 'high_risk']:
                alert = {
                    "alert_id": f"skin_alert_{int(time.time())}",
                    "patient_id": data.get('user_id', 'unknown'),
                    "type": "skin_lesion_high_risk",
                    "message": f"High-risk skin lesion detected: {prediction} with {confidence}% confidence",
                    "timestamp": datetime.now().isoformat(),
                    "acknowledged": False,
                    "data": {
                        "prediction": prediction,
                        "confidence": confidence,
                        "analysis": analysis_summary
                    }
                }
                # Add to alerts service if available
                try:
                    alerts_service.create_alert(alert)
                except:
                    pass
            
            return jsonify({
                'success': True,
                'prediction': prediction,
                'confidence': confidence,
                'analysis': analysis_summary,
                'timestamp': datetime.now().isoformat(),
                'file_path': filepath
            })
        else:
            return jsonify({'error': 'Skin analysis service not available'}), 503
            
    except Exception as e:
        logger.error(f"Skin analysis error: {e}")
        return jsonify({'error': f'Analysis failed: {str(e)}'}), 500

@app.route('/api/enhanced-skin-analysis', methods=['POST'])
def enhanced_skin_analysis():
    """Enhanced skin analysis using advanced AI models"""
    try:
        if not skin_analyzer:
            return jsonify({'error': 'Enhanced skin analyzer not available'}), 503
        
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
        
        # Perform enhanced analysis
        analysis_result = skin_analyzer.analyze_lesion(
            filepath, 
            skin_type=skin_type, 
            body_location=body_part
        )
        
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
        if not medical_chatbot:
            return jsonify({'error': 'Medical chatbot not available'}), 503
        
        data = request.get_json()
        user_message = data.get('message', '')
        user_id = data.get('user_id', 'anonymous')
        
        if not user_message:
            return jsonify({'error': 'No message provided'}), 400
        
        # Get response from chatbot
        response = medical_chatbot.get_response(user_message, user_id)
        
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

@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    """Get all alerts"""
    try:
        alerts = alerts_service.get_all_alerts()
        return jsonify({
            'success': True,
            'alerts': alerts
        })
    except Exception as e:
        logger.error(f"Error getting alerts: {e}")
        return jsonify({'error': 'Failed to get alerts'}), 500

@app.route('/api/alerts/<alert_id>/acknowledge', methods=['POST'])
def acknowledge_alert(alert_id):
    """Acknowledge an alert"""
    try:
        alerts_service.acknowledge_alert(alert_id)
        return jsonify({
            'success': True,
            'message': 'Alert acknowledged'
        })
    except Exception as e:
        logger.error(f"Error acknowledging alert: {e}")
        return jsonify({'error': 'Failed to acknowledge alert'}), 500

@app.route('/api/purchase-orders', methods=['GET'])
def get_purchase_orders():
    """Get all purchase orders"""
    try:
        orders = purchase_order_service.get_all_orders()
        return jsonify({
            'success': True,
            'orders': orders
        })
    except Exception as e:
        logger.error(f"Error getting purchase orders: {e}")
        return jsonify({'error': 'Failed to get purchase orders'}), 500

@app.route('/api/purchase-orders', methods=['POST'])
def create_purchase_order():
    """Create a new purchase order"""
    try:
        data = request.get_json()
        order = purchase_order_service.create_order(data)
        return jsonify({
            'success': True,
            'order': order
        })
    except Exception as e:
        logger.error(f"Error creating purchase order: {e}")
        return jsonify({'error': 'Failed to create purchase order'}), 500

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
    # Initialize components
    initialize_components()
    
    # Create uploads directory
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Run Flask app
    app.run(host='0.0.0.0', port=5001, debug=True) 