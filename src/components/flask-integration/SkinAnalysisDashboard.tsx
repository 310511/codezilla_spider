import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Upload, 
  Camera, 
  Image, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Activity,
  Loader2,
  Brain,
  Sparkles,
  Zap,
  Shield,
  Target,
  ArrowRight,
  Plus,
  Minus,
  Star,
  Eye,
  Edit,
  Trash2,
  Download,
  Share2,
  Settings,
  Search,
  Filter,
  RefreshCw,
  Lightbulb,
  Info,
  X,
  ChevronRight,
  ChevronDown,
  Play,
  Pause,
  RotateCcw,
  Thermometer,
  Heart,
  Activity as ActivityIcon
} from 'lucide-react';

interface SkinAnalysisResult {
  success: boolean;
  prediction?: string;
  confidence?: number;
  analysis?: {
    detected_skin_tone: string;
    features: {
      asymmetry: number;
      border: number;
      color: number;
      diameter: number;
    };
    analysis_type: string;
  };
  timestamp?: string;
  file_path?: string;
  error?: string;
}

interface SkinType {
  [key: string]: string;
}

interface BodyPart {
  [key: string]: string;
}

const FLASK_API_URL = "http://localhost:5001";

export function SkinAnalysisDashboard() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<SkinAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [skinType, setSkinType] = useState('III');
  const [bodyPart, setBodyPart] = useState('other');
  const [hasEvolved, setHasEvolved] = useState(false);
  const [evolutionWeeks, setEvolutionWeeks] = useState(0);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const skinTypes: SkinType = {
    'I': 'Type I - Always burns, never tans',
    'II': 'Type II - Usually burns, tans minimally', 
    'III': 'Type III - Sometimes burns, tans uniformly',
    'IV': 'Type IV - Rarely burns, tans easily',
    'V': 'Type V - Very rarely burns, tans very easily',
    'VI': 'Type VI - Never burns, deeply pigmented'
  };

  const bodyParts: BodyPart = {
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
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setError(null);
      
      // Create preview URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      setSelectedFile(file);
      setError(null);
      
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const analyzeSkin = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setIsLoading(true);
    setAnalysisProgress(0);
    setError(null);

    // Simulate progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('skin_type', skinType);
      formData.append('body_part', bodyPart);
      formData.append('has_evolved', hasEvolved.toString());
      formData.append('evolution_weeks', evolutionWeeks.toString());
      formData.append('user_id', 'demo-user-1');

      const endpoint = activeTab === 'enhanced' ? '/api/enhanced-skin-analysis' : '/api/skin-analysis';
      
      const response = await fetch(`${FLASK_API_URL}${endpoint}`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      if (response.ok) {
        const result = await response.json();
        setAnalysisResult(result);
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Analysis failed');
      }
    } catch (error) {
      clearInterval(progressInterval);
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
      setAnalysisProgress(0);
    }
  };

  const getRiskColor = (prediction: string) => {
    const lowerPrediction = prediction.toLowerCase();
    if (lowerPrediction.includes('malignant') || lowerPrediction.includes('high_risk')) {
      return 'text-red-600 bg-red-50';
    } else if (lowerPrediction.includes('benign') || lowerPrediction.includes('low_risk')) {
      return 'text-green-600 bg-green-50';
    } else {
      return 'text-yellow-600 bg-yellow-50';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-600';
    if (confidence >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const clearAnalysis = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setAnalysisResult(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Enhanced Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg">
                  <Camera className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">AI Skin Analysis</h1>
                  <p className="text-sm text-gray-600">Advanced skin lesion analysis with machine learning</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        {error && (
          <Alert className="border-red-200 bg-red-50 mb-6 animate-in slide-in-from-top-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="basic" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <Brain className="h-4 w-4 mr-2" />
              Basic Analysis
            </TabsTrigger>
            <TabsTrigger value="enhanced" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white">
              <Sparkles className="h-4 w-4 mr-2" />
              Enhanced AI
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Image Upload */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Upload className="h-5 w-5 text-blue-600" />
                    Upload Image
                  </CardTitle>
                  <CardDescription>
                    Upload a clear image of the skin lesion for analysis
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer"
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    {previewUrl ? (
                      <div className="space-y-4">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="max-w-full h-64 object-contain mx-auto rounded-lg shadow-lg"
                        />
                        <div className="flex items-center justify-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-600" />
                          <span className="text-sm text-gray-600">Image uploaded successfully</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                        <div>
                          <p className="text-lg font-medium text-gray-900">Drop image here or click to upload</p>
                          <p className="text-sm text-gray-500">Supports PNG, JPG, JPEG, GIF, BMP</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Analysis Parameters */}
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Skin Type (Fitzpatrick)</label>
                      <select
                        value={skinType}
                        onChange={(e) => setSkinType(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {Object.entries(skinTypes).map(([key, value]) => (
                          <option key={key} value={key}>{value}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">Body Location</label>
                      <select
                        value={bodyPart}
                        onChange={(e) => setBodyPart(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        {Object.entries(bodyParts).map(([key, value]) => (
                          <option key={key} value={key}>{value}</option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="hasEvolved"
                        checked={hasEvolved}
                        onChange={(e) => setHasEvolved(e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <label htmlFor="hasEvolved" className="text-sm text-gray-700">
                        Lesion has evolved/changed
                      </label>
                    </div>

                    {hasEvolved && (
                      <div>
                        <label className="text-sm font-medium text-gray-700 mb-2 block">Weeks since evolution</label>
                        <Input
                          type="number"
                          value={evolutionWeeks}
                          onChange={(e) => setEvolutionWeeks(parseInt(e.target.value) || 0)}
                          min="0"
                          className="w-full"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button 
                      onClick={analyzeSkin}
                      disabled={isLoading || !selectedFile}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Brain className="h-4 w-4 mr-2" />
                          Analyze Lesion
                        </>
                      )}
                    </Button>
                    <Button 
                      onClick={clearAnalysis}
                      variant="outline"
                      disabled={isLoading}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Clear
                    </Button>
                  </div>

                  {isLoading && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Analysis Progress</span>
                        <span>{Math.round(analysisProgress)}%</span>
                      </div>
                      <Progress value={analysisProgress} className="h-2 bg-gray-200" />
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Activity className="h-3 w-3 animate-pulse" />
                        Processing image and analyzing features...
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Analysis Results */}
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-gray-900">
                    <Target className="h-5 w-5 text-green-600" />
                    Analysis Results
                  </CardTitle>
                  <CardDescription>
                    AI-powered skin lesion analysis results
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {analysisResult ? (
                    <div className="space-y-6 animate-in slide-in-from-bottom-2">
                      {/* Prediction */}
                      <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl">
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Prediction</h3>
                        <Badge className={`text-lg px-4 py-2 ${getRiskColor(analysisResult.prediction || '')}`}>
                          {analysisResult.prediction}
                        </Badge>
                        {analysisResult.confidence && (
                          <div className="mt-3">
                            <p className="text-sm text-gray-600">Confidence</p>
                            <p className={`text-2xl font-bold ${getConfidenceColor(analysisResult.confidence)}`}>
                              {analysisResult.confidence}%
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Analysis Details */}
                      {analysisResult.analysis && (
                        <div className="space-y-4">
                          <h4 className="font-semibold text-gray-900">Analysis Details</h4>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                              <p className="text-sm text-gray-600">Skin Type</p>
                              <p className="font-semibold text-blue-600">{analysisResult.analysis.detected_skin_tone}</p>
                            </div>
                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                              <p className="text-sm text-gray-600">Analysis Type</p>
                              <p className="font-semibold text-purple-600">{analysisResult.analysis.analysis_type}</p>
                            </div>
                          </div>

                          {/* ABCDE Features */}
                          <div className="space-y-3">
                            <h5 className="font-medium text-gray-900">ABCDE Analysis</h5>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="p-3 bg-green-50 rounded-lg">
                                <p className="text-xs text-gray-600">Asymmetry</p>
                                <p className="font-semibold text-green-600">{analysisResult.analysis.features.asymmetry}</p>
                              </div>
                              <div className="p-3 bg-blue-50 rounded-lg">
                                <p className="text-xs text-gray-600">Border</p>
                                <p className="font-semibold text-blue-600">{analysisResult.analysis.features.border}</p>
                              </div>
                              <div className="p-3 bg-yellow-50 rounded-lg">
                                <p className="text-xs text-gray-600">Color</p>
                                <p className="font-semibold text-yellow-600">{analysisResult.analysis.features.color}</p>
                              </div>
                              <div className="p-3 bg-red-50 rounded-lg">
                                <p className="text-xs text-gray-600">Diameter</p>
                                <p className="font-semibold text-red-600">{analysisResult.analysis.features.diameter}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Timestamp */}
                      {analysisResult.timestamp && (
                        <div className="text-center text-sm text-gray-500">
                          Analyzed on {new Date(analysisResult.timestamp).toLocaleString()}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Camera className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">No Analysis Yet</h3>
                      <p className="text-gray-600">Upload an image and click analyze to get started</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="enhanced" className="space-y-6">
            <div className="text-center py-12">
              <Sparkles className="h-16 w-16 text-purple-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Enhanced AI Analysis</h3>
              <p className="text-gray-600 mb-6">
                Advanced skin analysis using state-of-the-art AI models with enhanced accuracy and detailed insights.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
                  <Brain className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900">Advanced AI</h4>
                  <p className="text-sm text-gray-600">State-of-the-art neural networks</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg">
                  <Target className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900">High Accuracy</h4>
                  <p className="text-sm text-gray-600">Enhanced prediction confidence</p>
                </div>
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
                  <ActivityIcon className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                  <h4 className="font-semibold text-gray-900">Real-time</h4>
                  <p className="text-sm text-gray-600">Instant analysis results</p>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 