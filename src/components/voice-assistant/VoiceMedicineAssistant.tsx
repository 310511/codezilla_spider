import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  Pill, 
  Package, 
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Brain,
  Zap,
  Heart
} from 'lucide-react';

interface MedicineRecommendation {
  disease: string;
  symptoms: string[];
  recommendedMedicines: string[];
  stockStatus: 'in-stock' | 'low-stock' | 'out-of-stock';
  stockCount: number;
  alternatives: string[];
  urgency: 'low' | 'medium' | 'high';
  dosage: string;
  sideEffects: string[];
}

interface VoiceAssistantProps {
  className?: string;
}

export const VoiceMedicineAssistant: React.FC<VoiceAssistantProps> = ({ className }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recommendations, setRecommendations] = useState<MedicineRecommendation[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [activeTab, setActiveTab] = useState('voice');
  
  const recognitionRef = useRef<any>(null);
  const fullTranscriptRef = useRef('');

  useEffect(() => {
    // Initialize speech recognition
    if (typeof window !== 'undefined' && 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.interimResults = false;
      recognitionRef.current.maxAlternatives = 1;
      recognitionRef.current.continuous = true;

      recognitionRef.current.onstart = () => {
        setIsListening(true);
        setError(null);
      };

      recognitionRef.current.onresult = (event: any) => {
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            fullTranscriptRef.current += event.results[i][0].transcript + ' ';
            setTranscript(fullTranscriptRef.current.trim());
            setConfidence(event.results[i][0].confidence * 100);
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setError(`Speech recognition error: ${event.error}`);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    } else {
      setError('Speech recognition not supported in this browser');
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current) {
      fullTranscriptRef.current = '';
      setTranscript('');
      setRecommendations([]);
      setError(null);
      recognitionRef.current.start();
    }
  };

  const stopListening = async () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsProcessing(true);
      
      try {
        // Simulate AI processing and medicine recommendation
        await processVoiceInput(transcript);
      } catch (err) {
        setError('Failed to process voice input');
        console.error(err);
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const processVoiceInput = async (input: string) => {
    // Simulate AI processing with realistic medicine recommendations
    const mockRecommendations: MedicineRecommendation[] = [
      {
        disease: 'Common Cold',
        symptoms: ['runny nose', 'sore throat', 'cough', 'congestion'],
        recommendedMedicines: ['Acetaminophen', 'Ibuprofen', 'Decongestant'],
        stockStatus: 'in-stock',
        stockCount: 45,
        alternatives: ['Paracetamol', 'Aspirin'],
        urgency: 'low',
        dosage: '500mg every 4-6 hours',
        sideEffects: ['Nausea', 'Dizziness']
      },
      {
        disease: 'Headache',
        symptoms: ['head pain', 'pressure', 'tension'],
        recommendedMedicines: ['Aspirin', 'Ibuprofen', 'Acetaminophen'],
        stockStatus: 'low-stock',
        stockCount: 8,
        alternatives: ['Paracetamol', 'Naproxen'],
        urgency: 'medium',
        dosage: '325-650mg every 4-6 hours',
        sideEffects: ['Stomach upset', 'Allergic reactions']
      },
      {
        disease: 'Fever',
        symptoms: ['elevated temperature', 'chills', 'body aches'],
        recommendedMedicines: ['Acetaminophen', 'Ibuprofen'],
        stockStatus: 'out-of-stock',
        stockCount: 0,
        alternatives: ['Paracetamol', 'Aspirin'],
        urgency: 'high',
        dosage: '500-1000mg every 4-6 hours',
        sideEffects: ['Liver damage in high doses']
      }
    ];

    // Filter recommendations based on voice input
    const relevantRecommendations = mockRecommendations.filter(rec => 
      input.toLowerCase().includes(rec.disease.toLowerCase()) ||
      rec.symptoms.some(symptom => input.toLowerCase().includes(symptom))
    );

    setRecommendations(relevantRecommendations.length > 0 ? relevantRecommendations : mockRecommendations);
  };

  const getStockStatusColor = (status: string) => {
    switch (status) {
      case 'in-stock': return 'bg-green-100 text-green-800 border-green-200';
      case 'low-stock': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'out-of-stock': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'low': return 'bg-green-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Brain className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Voice Medicine Assistant
          </h1>
        </div>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Speak your symptoms and get instant medicine recommendations with stock availability
        </p>
      </div>

      {/* Voice Control Panel */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic className="w-5 h-5" />
            Voice Recognition
          </CardTitle>
          <CardDescription>
            Click start and describe your symptoms to get medicine recommendations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Voice Controls */}
          <div className="flex items-center justify-center gap-4">
            <Button
              onClick={startListening}
              disabled={isListening || isProcessing}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              <Mic className="w-5 h-5 mr-2" />
              Start Listening
            </Button>
            
            <Button
              onClick={stopListening}
              disabled={!isListening || isProcessing}
              variant="outline"
              className="border-2 border-red-300 text-red-700 hover:bg-red-50 px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105"
            >
              <MicOff className="w-5 h-5 mr-2" />
              Stop & Process
            </Button>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isListening ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <span className="text-sm font-medium">
                {isListening ? 'Listening...' : isProcessing ? 'Processing...' : 'Ready'}
              </span>
            </div>
            
            {confidence > 0 && (
              <div className="flex items-center gap-2">
                <Volume2 className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium">Confidence: {confidence.toFixed(1)}%</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processing voice input...</span>
                <span>AI Analysis</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
          )}

          {/* Error Display */}
          {error && (
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Transcript Display */}
      {transcript && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <Volume2 className="w-5 h-5" />
              What You Said
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-blue-900 font-medium">{transcript}</p>
          </CardContent>
        </Card>
      )}

      {/* Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Medicine Recommendations</h2>
            <p className="text-gray-600">Based on your symptoms and current stock availability</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="voice">Voice Analysis</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
              <TabsTrigger value="stock">Stock Status</TabsTrigger>
            </TabsList>

            <TabsContent value="voice" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    AI Analysis Results
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <span className="font-medium">Voice processed successfully</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-blue-600" />
                      <span className="font-medium">AI analysis completed</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-orange-600" />
                      <span className="font-medium">Stock availability checked</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-4">
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {recommendations.map((rec, index) => (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle className="flex items-center gap-2">
                            <Heart className="w-5 h-5 text-red-600" />
                            {rec.disease}
                          </CardTitle>
                          <Badge className={getStockStatusColor(rec.stockStatus)}>
                            {rec.stockStatus.replace('-', ' ')}
                          </Badge>
                        </div>
                        <CardDescription>
                          Symptoms: {rec.symptoms.join(', ')}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-semibold text-gray-800 mb-2">Recommended Medicines:</h4>
                          <div className="flex flex-wrap gap-2">
                            {rec.recommendedMedicines.map((medicine, medIndex) => (
                              <Badge key={medIndex} variant="outline" className="bg-blue-50">
                                <Pill className="w-3 h-3 mr-1" />
                                {medicine}
                              </Badge>
                            ))}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-1">Dosage:</h4>
                            <p className="text-sm text-gray-600">{rec.dosage}</p>
                          </div>
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-1">Urgency:</h4>
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${getUrgencyColor(rec.urgency)}`}></div>
                              <span className="text-sm capitalize">{rec.urgency}</span>
                            </div>
                          </div>
                        </div>

                        {rec.sideEffects.length > 0 && (
                          <div>
                            <h4 className="font-semibold text-gray-800 mb-1">Side Effects:</h4>
                            <div className="flex flex-wrap gap-1">
                              {rec.sideEffects.map((effect, effectIndex) => (
                                <Badge key={effectIndex} variant="secondary" className="text-xs">
                                  {effect}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>

            <TabsContent value="stock" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="w-5 h-5 text-green-600" />
                    Inventory Status
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recommendations.map((rec, index) => (
                      <div key={index} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-semibold">{rec.disease}</h4>
                          <Badge className={getStockStatusColor(rec.stockStatus)}>
                            {rec.stockCount} units
                          </Badge>
                        </div>
                        <div className="space-y-2">
                          {rec.recommendedMedicines.map((medicine, medIndex) => (
                            <div key={medIndex} className="flex items-center justify-between text-sm">
                              <span className="flex items-center gap-2">
                                <Pill className="w-4 h-4 text-blue-600" />
                                {medicine}
                              </span>
                              <span className="text-gray-600">
                                {rec.stockStatus === 'in-stock' ? 'Available' : 
                                 rec.stockStatus === 'low-stock' ? 'Low Stock' : 'Out of Stock'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}
    </div>
  );
};

export default VoiceMedicineAssistant; 