# 🐍 Flask Integration for Spider1 Project

This document describes the successful integration of Flask-based skin lesion analysis and medical chatbot services into the Spider1 React application.

## 🚀 Overview

The Flask integration provides advanced AI-powered medical services that complement the existing FastAPI backend:

- **Skin Lesion Analysis**: Advanced computer vision for skin cancer detection
- **Medical Chatbot**: AI-powered medical consultation system
- **Enhanced AI Models**: State-of-the-art neural networks for medical analysis

## 🏗️ Architecture

### Backend Services

```
spider1/
├── backend/
│   ├── flask_integration.py          # Main Flask integration
│   ├── flask_requirements.txt        # Flask dependencies
│   ├── main.py                      # FastAPI server (existing)
│   └── start_backend.py             # Unified startup script
├── Flask/                           # Original Flask components
│   ├── basic_model.py              # Skin lesion classifier
│   ├── enhanced_skin_analysis.py   # Advanced skin analyzer
│   ├── medical_chatbot.py          # Medical AI chatbot
│   └── main.py                     # Original Flask app
└── src/
    └── components/
        └── flask-integration/
            └── SkinAnalysisDashboard.tsx  # React component
```

### Service Integration

- **FastAPI (Port 8000)**: Medicine recommendations, inventory management
- **Flask (Port 5001)**: Skin analysis, medical chatbot
- **React (Port 3006)**: Frontend application

## 🎯 Key Features

### 🧠 AI-Powered Skin Analysis

- **ABCDE Criteria**: Evaluates asymmetry, border, color, diameter, evolution
- **Fitzpatrick Skin Types**: Improved accuracy with skin type classification
- **Risk Assessment**: Provides confidence scores and risk categorization
- **Medical Guidelines**: Follows established dermatological protocols

### 💬 Medical Chatbot

- **Natural Language Processing**: Understands medical queries
- **Symptom Analysis**: Provides preliminary medical advice
- **Integration**: Connects with existing alert and notification systems

### 🔄 Unified API

- **CORS Support**: Cross-origin requests from React frontend
- **Error Handling**: Comprehensive error management
- **File Upload**: Secure image upload and processing
- **Real-time Processing**: Live analysis with progress indicators

## 🛠️ Installation & Setup

### 1. Install Dependencies

```bash
# Install Flask dependencies
pip install -r backend/flask_requirements.txt

# Install FastAPI dependencies
pip install -r backend/requirements.txt
```

### 2. Start Backend Services

```bash
# Start both servers
python start_backend.py
```

This will start:
- **FastAPI Server**: `http://localhost:8000`
- **Flask Server**: `http://localhost:5001`

### 3. Start Frontend

```bash
# In another terminal
npm run dev
```

Frontend will be available at: `http://localhost:3006`

## 📊 API Endpoints

### Flask Endpoints (Port 5001)

#### Skin Analysis
- `POST /api/skin-analysis` - Basic skin lesion analysis
- `POST /api/enhanced-skin-analysis` - Advanced AI analysis
- `GET /api/skin-types` - Available skin types
- `GET /api/body-parts` - Available body parts

#### Medical Chat
- `POST /api/medical-chat` - Medical chatbot interaction

#### File Management
- `POST /api/upload-image` - Upload image for analysis
- `GET /api/image/<filename>` - Serve uploaded images

#### Health Check
- `GET /health` - Service health status

### FastAPI Endpoints (Port 8000)

#### Medicine Recommendations
- `POST /medicine/recommend` - Get medicine recommendations
- `GET /medicine/all` - Get all medicines
- `GET /medicine/restocking-requests` - Get restocking requests

#### Memory System
- `POST /process-text` - Process text input
- `POST /query` - Query memory system
- `POST /process-image` - Process image input

## 🎨 Frontend Integration

### Skin Analysis Dashboard

The React component provides:

- **Modern UI**: Glass-morphism design with animations
- **Drag & Drop**: Easy image upload interface
- **Real-time Progress**: Live analysis progress indicators
- **Results Display**: Comprehensive analysis results
- **Parameter Selection**: Skin type, body location, evolution tracking

### Features

- **Image Preview**: Real-time image preview after upload
- **Analysis Parameters**: Fitzpatrick skin types, body locations
- **Risk Assessment**: Color-coded risk levels and confidence scores
- **ABCDE Analysis**: Detailed feature breakdown
- **Export Options**: Download analysis results

## 🔧 Configuration

### Environment Variables

```bash
# Flask Configuration
SESSION_SECRET=your-secret-key
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216  # 16MB

# CORS Origins
ALLOWED_ORIGINS=["http://localhost:3000", "http://localhost:3006", "http://localhost:5173"]
```

### File Upload Settings

- **Max File Size**: 16MB
- **Allowed Formats**: PNG, JPG, JPEG, GIF, BMP
- **Auto Cleanup**: Files older than 1 hour are automatically removed

## 🚨 Error Handling

### Common Issues

1. **Import Errors**: Ensure all Flask components are in the correct path
2. **Port Conflicts**: Check if ports 8000 or 5001 are already in use
3. **Dependency Issues**: Install all required packages
4. **CORS Errors**: Verify CORS configuration matches frontend URL

### Debug Mode

```bash
# Enable debug mode for Flask
export FLASK_DEBUG=1
python backend/flask_integration.py
```

## 📈 Performance

### Optimization Features

- **Lazy Loading**: Components load only when needed
- **Image Compression**: Automatic image optimization
- **Caching**: Analysis results cached for performance
- **Background Processing**: Non-blocking analysis operations

### Monitoring

- **Health Checks**: Regular service status monitoring
- **Error Logging**: Comprehensive error tracking
- **Performance Metrics**: Response time and accuracy tracking

## 🔒 Security

### Security Features

- **File Validation**: Strict file type and size validation
- **Secure Filenames**: Prevents path traversal attacks
- **CORS Protection**: Controlled cross-origin access
- **Input Sanitization**: All inputs are validated and sanitized

## 🧪 Testing

### Manual Testing

1. **Upload Test Image**: Use sample skin lesion images
2. **Test Parameters**: Try different skin types and body locations
3. **Verify Results**: Check analysis accuracy and confidence scores
4. **Test Chatbot**: Try medical queries and verify responses

### Automated Testing

```bash
# Run Flask tests
python -m pytest tests/test_flask_integration.py

# Run API tests
python -m pytest tests/test_api_endpoints.py
```

## 🚀 Deployment

### Production Setup

1. **Environment**: Set production environment variables
2. **Process Management**: Use Gunicorn for Flask, Uvicorn for FastAPI
3. **Load Balancing**: Configure reverse proxy (Nginx)
4. **Monitoring**: Set up health checks and logging

### Docker Deployment

```dockerfile
# Dockerfile for Flask integration
FROM python:3.11-slim

WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY . .
EXPOSE 5001

CMD ["python", "backend/flask_integration.py"]
```

## 🤝 Contributing

### Development Workflow

1. **Feature Branch**: Create feature branch from main
2. **Development**: Implement features with tests
3. **Testing**: Run comprehensive test suite
4. **Documentation**: Update documentation
5. **Pull Request**: Submit PR for review

### Code Standards

- **Python**: PEP 8 compliance
- **Type Hints**: Use type annotations
- **Docstrings**: Comprehensive documentation
- **Error Handling**: Proper exception management

## 📚 Additional Resources

- [Flask Documentation](https://flask.palletsprojects.com/)
- [OpenCV Documentation](https://docs.opencv.org/)
- [PyTorch Documentation](https://pytorch.org/docs/)
- [Medical AI Guidelines](https://www.who.int/health-topics/artificial-intelligence)

## 🎉 Success Metrics

- ✅ **Integration Complete**: Flask services successfully integrated
- ✅ **API Endpoints**: All endpoints functional and tested
- ✅ **Frontend Integration**: React components working
- ✅ **Error Handling**: Comprehensive error management
- ✅ **Documentation**: Complete setup and usage guides

The Flask integration is now fully operational and provides advanced AI-powered medical services to the Spider1 project! 🎊 