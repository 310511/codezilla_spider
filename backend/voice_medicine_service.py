#!/usr/bin/env python3
"""
Voice Medicine Assistant Service
- Integrates voice recognition with LLM medicine recommendations
- Checks stock availability for recommended medicines
- Provides comprehensive medical guidance
"""

import os
import json
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime
import requests
from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Mock LLM service (replace with actual LLM API)
class MockLLMService:
    def __init__(self):
        self.medicine_database = {
            "headache": {
                "symptoms": ["head pain", "pressure", "tension", "migraine"],
                "medicines": ["Ibuprofen", "Acetaminophen", "Aspirin", "Naproxen"],
                "dosage": "400-800mg every 4-6 hours",
                "side_effects": ["Stomach upset", "Dizziness", "Allergic reactions"],
                "urgency": "medium"
            },
            "fever": {
                "symptoms": ["elevated temperature", "chills", "body aches", "sweating"],
                "medicines": ["Acetaminophen", "Ibuprofen", "Aspirin"],
                "dosage": "500-1000mg every 4-6 hours",
                "side_effects": ["Liver damage in high doses", "Stomach irritation"],
                "urgency": "high"
            },
            "cold": {
                "symptoms": ["runny nose", "sore throat", "cough", "congestion"],
                "medicines": ["Decongestant", "Cough syrup", "Acetaminophen"],
                "dosage": "As directed on package",
                "side_effects": ["Drowsiness", "Dry mouth", "Nervousness"],
                "urgency": "low"
            },
            "sore throat": {
                "symptoms": ["throat pain", "difficulty swallowing", "hoarseness"],
                "medicines": ["Throat lozenges", "Salt water gargle", "Acetaminophen"],
                "dosage": "Lozenges every 2-4 hours",
                "side_effects": ["Temporary numbness", "Allergic reactions"],
                "urgency": "medium"
            },
            "cough": {
                "symptoms": ["dry cough", "wet cough", "chest congestion"],
                "medicines": ["Cough suppressant", "Expectorant", "Honey"],
                "dosage": "As directed on package",
                "side_effects": ["Drowsiness", "Dizziness"],
                "urgency": "medium"
            }
        }
        
        self.stock_database = {
            "Ibuprofen": {"quantity": 45, "status": "in-stock"},
            "Acetaminophen": {"quantity": 32, "status": "in-stock"},
            "Aspirin": {"quantity": 8, "status": "low-stock"},
            "Naproxen": {"quantity": 0, "status": "out-of-stock"},
            "Decongestant": {"quantity": 23, "status": "in-stock"},
            "Cough syrup": {"quantity": 15, "status": "in-stock"},
            "Throat lozenges": {"quantity": 67, "status": "in-stock"},
            "Cough suppressant": {"quantity": 12, "status": "low-stock"},
            "Expectorant": {"quantity": 0, "status": "out-of-stock"}
        }

    async def analyze_symptoms(self, voice_input: str) -> Dict[str, Any]:
        """Analyze voice input and provide medicine recommendations"""
        voice_input_lower = voice_input.lower()
        
        # Find matching conditions
        matched_conditions = []
        for condition, data in self.medicine_database.items():
            if any(symptom in voice_input_lower for symptom in data["symptoms"]):
                matched_conditions.append({
                    "condition": condition,
                    "data": data
                })
        
        if not matched_conditions:
            # Default to general recommendations
            matched_conditions = [{
                "condition": "general",
                "data": {
                    "symptoms": ["general discomfort"],
                    "medicines": ["Acetaminophen", "Ibuprofen"],
                    "dosage": "As directed on package",
                    "side_effects": ["Consult doctor if symptoms persist"],
                    "urgency": "low"
                }
            }]
        
        # Get stock information for recommended medicines
        recommendations = []
        for match in matched_conditions:
            medicines_with_stock = []
            for medicine in match["data"]["medicines"]:
                stock_info = self.stock_database.get(medicine, {"quantity": 0, "status": "out-of-stock"})
                medicines_with_stock.append({
                    "name": medicine,
                    "stock_status": stock_info["status"],
                    "quantity": stock_info["quantity"]
                })
            
            recommendations.append({
                "disease": match["condition"].title(),
                "symptoms": match["data"]["symptoms"],
                "recommended_medicines": medicines_with_stock,
                "dosage": match["data"]["dosage"],
                "side_effects": match["data"]["side_effects"],
                "urgency": match["data"]["urgency"],
                "alternatives": self._get_alternatives(medicines_with_stock)
            })
        
        return {
            "voice_input": voice_input,
            "confidence": 0.85,
            "recommendations": recommendations,
            "timestamp": datetime.now().isoformat()
        }
    
    def _get_alternatives(self, medicines: List[Dict]) -> List[str]:
        """Get alternative medicines for out-of-stock items"""
        alternatives = []
        for medicine in medicines:
            if medicine["stock_status"] == "out-of-stock":
                # Find similar medicines in stock
                for name, stock_info in self.stock_database.items():
                    if stock_info["status"] == "in-stock" and name not in [m["name"] for m in medicines]:
                        alternatives.append(name)
                        break
        return alternatives[:3]  # Limit to 3 alternatives

# Pydantic models
class VoiceInput(BaseModel):
    text: str
    confidence: Optional[float] = None

class MedicineRecommendation(BaseModel):
    disease: str
    symptoms: List[str]
    recommended_medicines: List[Dict[str, Any]]
    dosage: str
    side_effects: List[str]
    urgency: str
    alternatives: List[str]

class VoiceAnalysisResponse(BaseModel):
    voice_input: str
    confidence: float
    recommendations: List[MedicineRecommendation]
    timestamp: str

# Initialize FastAPI app
app = FastAPI(
    title="Voice Medicine Assistant API",
    description="AI-powered voice medicine recommendations with stock checking",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3006", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize LLM service
llm_service = MockLLMService()

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "voice_medicine_assistant",
        "timestamp": datetime.now().isoformat(),
        "features": [
            "voice_symptom_analysis",
            "medicine_recommendations",
            "stock_availability_check",
            "llm_integration"
        ]
    }

@app.post("/api/voice-medicine-analysis", response_model=VoiceAnalysisResponse)
async def analyze_voice_medicine(input_data: VoiceInput):
    """Analyze voice input and provide medicine recommendations"""
    try:
        result = await llm_service.analyze_symptoms(input_data.text)
        return VoiceAnalysisResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.get("/api/stock-status/{medicine_name}")
async def get_stock_status(medicine_name: str):
    """Get stock status for a specific medicine"""
    stock_info = llm_service.stock_database.get(medicine_name, {"quantity": 0, "status": "out-of-stock"})
    return {
        "medicine": medicine_name,
        "stock_status": stock_info["status"],
        "quantity": stock_info["quantity"],
        "last_updated": datetime.now().isoformat()
    }

@app.get("/api/available-medicines")
async def get_available_medicines():
    """Get list of all available medicines with stock status"""
    return {
        "medicines": llm_service.stock_database,
        "total_medicines": len(llm_service.stock_database),
        "in_stock": len([m for m in llm_service.stock_database.values() if m["status"] == "in-stock"]),
        "low_stock": len([m for m in llm_service.stock_database.values() if m["status"] == "low-stock"]),
        "out_of_stock": len([m for m in llm_service.stock_database.values() if m["status"] == "out-of-stock"])
    }

@app.post("/api/simulate-voice-input")
async def simulate_voice_input(input_data: VoiceInput):
    """Simulate voice input processing for testing"""
    # Simulate processing delay
    await asyncio.sleep(1)
    
    result = await llm_service.analyze_symptoms(input_data.text)
    return {
        "message": "Voice input processed successfully",
        "result": result
    }

@app.get("/api/medicine-database")
async def get_medicine_database():
    """Get the complete medicine database"""
    return {
        "conditions": llm_service.medicine_database,
        "total_conditions": len(llm_service.medicine_database)
    }

if __name__ == "__main__":
    print("🚀 Starting Voice Medicine Assistant Service...")
    print("📊 Health check: http://localhost:5002/health")
    print("🎤 Voice analysis: http://localhost:5002/api/voice-medicine-analysis")
    print("💊 Stock status: http://localhost:5002/api/stock-status/{medicine_name}")
    
    uvicorn.run(
        "voice_medicine_service:app",
        host="0.0.0.0",
        port=5002,
        reload=True,
        log_level="info"
    ) 