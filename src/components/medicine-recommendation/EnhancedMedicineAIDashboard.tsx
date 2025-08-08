import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Pill, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  Package, 
  Loader2,
  Stethoscope,
  Activity,
  TrendingUp,
  AlertCircle,
  Brain,
  Sparkles,
  Zap,
  Heart,
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
  RotateCcw
} from 'lucide-react';

interface MedicineRecommendation {
  medicine_id: string;
  medicine_name: string;
  category: string;
  description: string;
  dosage: string;
  confidence_score: number;
  reasoning: string;
  dosage_instructions: string;
  warnings: string[];
  stock_quantity: number;
  price: number;
  prescription_required: boolean;
  alternative_medicines: string[];
}

interface RestockingRequest {
  request_id: string;
  medicine_id: string;
  medicine_name: string;
  current_stock: number;
  requested_quantity: number;
  urgency_level: string;
  reason: string;
  created_at: string;
  status: string;
}

interface MedicineRecommendationResponse {
  symptoms_detected: { [key: string]: number };
  recommendations: MedicineRecommendation[];
  restocking_requests: RestockingRequest[];
  total_recommendations: number;
  total_restocking_requests: number;
}

  const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export function EnhancedMedicineAIDashboard() {
  const [symptoms, setSymptoms] = useState('');
  const [recommendations, setRecommendations] = useState<MedicineRecommendationResponse | null>(null);
  const [restockingRequests, setRestockingRequests] = useState<RestockingRequest[]>([]);
  const [allMedicines, setAllMedicines] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('recommendations');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [expandedRecommendation, setExpandedRecommendation] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');

  useEffect(() => {
    loadRestockingRequests();
    loadAllMedicines();
  }, []);

  useEffect(() => {
    if (isAnalyzing) {
      const interval = setInterval(() => {
        setAnalysisProgress(prev => {
          if (prev >= 100) {
            setIsAnalyzing(false);
            return 100;
          }
          return prev + Math.random() * 15;
        });
      }, 200);
      return () => clearInterval(interval);
    }
  }, [isAnalyzing]);

  const loadRestockingRequests = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/medicine/restocking-requests`);
      if (response.ok) {
        const data = await response.json();
        setRestockingRequests(data);
      }
    } catch (error) {
      console.error('Error loading restocking requests:', error);
    }
  };

  const loadAllMedicines = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/medicine/all`);
      if (response.ok) {
        const data = await response.json();
        setAllMedicines(data);
      }
    } catch (error) {
      console.error('Error loading medicines:', error);
    }
  };

  const handleRecommendMedicines = async () => {
    if (!symptoms.trim()) return;

    setIsLoading(true);
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setError(null);

    try {
      const response = await fetch(`${BACKEND_URL}/medicine/recommend`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: 'demo-user-1',
          symptoms: symptoms,
          include_restocking: true
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
        if (data.restocking_requests.length > 0) {
          setRestockingRequests(prev => [...prev, ...data.restocking_requests]);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to get recommendations');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
      setIsAnalyzing(false);
    }
  };

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (score >= 0.6) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    return 'bg-gradient-to-r from-red-500 to-pink-500';
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-gradient-to-r from-red-500 to-pink-500';
      case 'medium': return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      default: return 'bg-gradient-to-r from-green-500 to-emerald-500';
    }
  };

  const getStockColor = (quantity: number) => {
    if (quantity === 0) return 'text-red-600';
    if (quantity < 20) return 'text-yellow-600';
    return 'text-green-600';
  };

  const getStockProgressColor = (quantity: number) => {
    if (quantity === 0) return 'bg-red-500';
    if (quantity < 20) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const filteredMedicines = allMedicines.filter(medicine => {
    const matchesSearch = medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         medicine.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || medicine.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const toggleRecommendation = (medicineId: string) => {
    setExpandedRecommendation(expandedRecommendation === medicineId ? null : medicineId);
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
                  <Pill className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">AI Medicine Assistant</h1>
                  <p className="text-sm text-gray-600">Intelligent symptom analysis & medicine recommendations</p>
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
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-red-800">{error}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="recommendations" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <Stethoscope className="h-4 w-4 mr-2" />
              AI Recommendations
            </TabsTrigger>
            <TabsTrigger value="inventory" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-emerald-500 data-[state=active]:text-white">
              <Package className="h-4 w-4 mr-2" />
              Medicine Inventory
            </TabsTrigger>
            <TabsTrigger value="restocking" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white">
              <AlertTriangle className="h-4 w-4 mr-2" />
              Restocking Requests
            </TabsTrigger>
          </TabsList>

          {/* AI Recommendations Tab */}
          <TabsContent value="recommendations" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <span>AI Symptom Analysis</span>
                </CardTitle>
                <CardDescription>
                  Describe your symptoms and get intelligent medicine recommendations powered by AI
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Describe your symptoms:</label>
                  <Textarea
                    placeholder="e.g., I have a severe headache and fever, feeling very anxious and can't sleep..."
                    value={symptoms}
                    onChange={(e) => setSymptoms(e.target.value)}
                    rows={4}
                    className="border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
                
                <Button 
                  onClick={handleRecommendMedicines} 
                  disabled={isLoading || !symptoms.trim()}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Analyzing Symptoms...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Get AI Recommendations
                    </>
                  )}
                </Button>

                {isAnalyzing && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>AI Analysis Progress</span>
                      <span>{Math.round(analysisProgress)}%</span>
                    </div>
                    <Progress value={analysisProgress} className="h-2 bg-gray-200" />
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Activity className="h-3 w-3 animate-pulse" />
                      Analyzing symptoms and matching medicines...
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {recommendations && (
              <div className="space-y-6 animate-in slide-in-from-bottom-4">
                {/* Symptoms Detected */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <Target className="h-5 w-5 text-blue-600" />
                      Symptoms Detected
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {Object.entries(recommendations.symptoms_detected).map(([symptom, score], index) => (
                        <Badge 
                          key={symptom} 
                          variant="secondary"
                          className="animate-in slide-in-from-left-2"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          {symptom.replace('_', ' ')}: {Math.round(score * 100)}%
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Recommendations */}
                <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-gray-900">
                      <Heart className="h-5 w-5 text-red-600" />
                      Recommended Medicines
                    </CardTitle>
                    <CardDescription>
                      {recommendations.total_recommendations} AI-powered recommendations found
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {recommendations.recommendations.map((rec, index) => (
                        <div 
                          key={index} 
                          className="border border-gray-200 rounded-xl p-6 space-y-4 bg-white/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 animate-in slide-in-from-bottom-2"
                          style={{ animationDelay: `${index * 150}ms` }}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
                                <Pill className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-lg text-gray-900">{rec.medicine_name}</h3>
                                <p className="text-sm text-gray-600">{rec.category.replace('_', ' ')}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <Badge className={`${getConfidenceColor(rec.confidence_score)} text-white`}>
                                {Math.round(rec.confidence_score * 100)}% Match
                              </Badge>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => toggleRecommendation(rec.medicine_id)}
                                className="hover:bg-gray-100"
                              >
                                {expandedRecommendation === rec.medicine_id ? (
                                  <ChevronDown className="h-4 w-4" />
                                ) : (
                                  <ChevronRight className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                              <DollarSign className="h-4 w-4 text-blue-600" />
                              <div>
                                <p className="text-xs text-gray-600">Price</p>
                                <p className="font-semibold text-blue-600">${rec.price}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg">
                              <Package className="h-4 w-4 text-green-600" />
                              <div>
                                <p className="text-xs text-gray-600">Stock</p>
                                <p className={`font-semibold ${getStockColor(rec.stock_quantity)}`}>
                                  {rec.stock_quantity} units
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg">
                              <Shield className="h-4 w-4 text-purple-600" />
                              <div>
                                <p className="text-xs text-gray-600">Type</p>
                                <p className="font-semibold text-purple-600">
                                  {rec.prescription_required ? 'Prescription' : 'OTC'}
                                </p>
                              </div>
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-700">{rec.description}</p>
                          
                          {expandedRecommendation === rec.medicine_id && (
                            <div className="space-y-4 pt-4 border-t border-gray-200 animate-in slide-in-from-top-2">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <span className="font-medium text-sm text-gray-700">Dosage:</span>
                                  <p className="text-sm text-gray-600 mt-1">{rec.dosage}</p>
                                </div>
                                <div>
                                  <span className="font-medium text-sm text-gray-700">Instructions:</span>
                                  <p className="text-sm text-gray-600 mt-1">{rec.dosage_instructions}</p>
                                </div>
                              </div>
                              
                              <div>
                                <span className="font-medium text-sm text-gray-700">AI Reasoning:</span>
                                <p className="text-sm text-gray-600 mt-1">{rec.reasoning}</p>
                              </div>
                              
                              {rec.warnings.length > 0 && (
                                <Alert className="border-red-200 bg-red-50">
                                  <AlertTriangle className="h-4 w-4 text-red-600" />
                                  <AlertDescription className="text-red-800">
                                    <span className="font-medium">Warnings:</span>
                                    <ul className="mt-2 space-y-1">
                                      {rec.warnings.map((warning, idx) => (
                                        <li key={idx}>• {warning}</li>
                                      ))}
                                    </ul>
                                  </AlertDescription>
                                </Alert>
                              )}
                              
                              {rec.prescription_required && (
                                <Alert className="border-yellow-200 bg-yellow-50">
                                  <AlertTriangle className="h-4 w-4 text-yellow-600" />
                                  <AlertDescription className="text-yellow-800">
                                    This medicine requires a prescription. Please consult a doctor.
                                  </AlertDescription>
                                </Alert>
                              )}
                              
                              {rec.alternative_medicines.length > 0 && (
                                <div>
                                  <span className="font-medium text-sm text-gray-700">Alternatives:</span>
                                  <div className="flex flex-wrap gap-2 mt-2">
                                    {rec.alternative_medicines.map((alt, idx) => (
                                      <Badge key={idx} variant="outline" className="text-xs">
                                        {alt}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          {/* Inventory Management Tab */}
          <TabsContent value="inventory" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <Package className="h-5 w-5 text-green-600" />
                  Medicine Inventory
                </CardTitle>
                <CardDescription>
                  View all available medicines and their stock levels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Search and Filter */}
                <div className="flex gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search medicines..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 border-gray-200 focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="all">All Categories</option>
                    <option value="pain_relief">Pain Relief</option>
                    <option value="fever">Fever</option>
                    <option value="anxiety">Anxiety</option>
                    <option value="sleep">Sleep</option>
                  </select>
                </div>

                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {filteredMedicines.map((medicine, index) => (
                      <div 
                        key={medicine.id} 
                        className="border border-gray-200 rounded-xl p-4 bg-white/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 animate-in slide-in-from-bottom-2"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg">
                              <Pill className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{medicine.name}</h3>
                              <p className="text-sm text-gray-600">{medicine.description}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-medium text-gray-900">${medicine.price}</div>
                              <div className={`text-sm ${getStockColor(medicine.stock_quantity)}`}>
                                {medicine.stock_quantity} in stock
                              </div>
                            </div>
                            <Badge variant={medicine.prescription_required ? "destructive" : "secondary"}>
                              {medicine.prescription_required ? "Prescription" : "OTC"}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="mt-4">
                          <div className="flex justify-between text-xs text-gray-600 mb-2">
                            <span>Stock Level</span>
                            <span>{medicine.stock_quantity}/100</span>
                          </div>
                          <Progress 
                            value={Math.min(100, (medicine.stock_quantity / 100) * 100)} 
                            className={`h-2 bg-gray-200 ${getStockProgressColor(medicine.stock_quantity)}`}
                          />
                        </div>
                        
                        <div className="mt-3 flex flex-wrap gap-1">
                          {medicine.symptoms_treated?.slice(0, 3).map((symptom, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">
                              {symptom}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Restocking Requests Tab */}
          <TabsContent value="restocking" className="space-y-6">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gray-900">
                  <AlertTriangle className="h-5 w-5 text-orange-600" />
                  Restocking Requests
                </CardTitle>
                <CardDescription>
                  Automatic restocking requests for low stock medicines
                </CardDescription>
              </CardHeader>
              <CardContent>
                {restockingRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No Restocking Requests</h3>
                    <p className="text-gray-600">All medicines have adequate stock levels.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {restockingRequests.map((request, index) => (
                      <div 
                        key={request.request_id} 
                        className="border border-gray-200 rounded-xl p-4 bg-white/50 backdrop-blur-sm hover:shadow-lg transition-all duration-300 animate-in slide-in-from-bottom-2"
                        style={{ animationDelay: `${index * 100}ms` }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg">
                              <Package className="h-5 w-5 text-white" />
                            </div>
                            <div>
                              <h3 className="font-semibold text-gray-900">{request.medicine_name}</h3>
                              <p className="text-sm text-gray-600">{request.reason}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge className={`${getUrgencyColor(request.urgency_level)} text-white`}>
                              {request.urgency_level} urgency
                            </Badge>
                            <Badge variant="outline">{request.status}</Badge>
                          </div>
                        </div>
                        
                        <div className="mt-4 grid grid-cols-3 gap-4">
                          <div className="text-center p-3 bg-red-50 rounded-lg">
                            <p className="text-xs text-gray-600">Current Stock</p>
                            <p className="text-lg font-semibold text-red-600">{request.current_stock}</p>
                          </div>
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <p className="text-xs text-gray-600">Requested</p>
                            <p className="text-lg font-semibold text-blue-600">{request.requested_quantity}</p>
                          </div>
                          <div className="text-center p-3 bg-gray-50 rounded-lg">
                            <p className="text-xs text-gray-600">Created</p>
                            <p className="text-sm font-medium text-gray-700">
                              {new Date(request.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex space-x-2">
                          <Button size="sm" variant="outline" className="hover:bg-green-50 hover:text-green-700">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Mark Fulfilled
                          </Button>
                          <Button size="sm" variant="outline" className="hover:bg-blue-50 hover:text-blue-700">
                            <Clock className="h-4 w-4 mr-1" />
                            Schedule Order
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 