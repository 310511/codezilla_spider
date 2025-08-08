import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { 
  Brain, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Package, 
  Activity,
  RefreshCw,
  FileText,
  BarChart3,
  Target,
  Zap,
  Calendar,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  Lightbulb,
  Shield,
  AlertCircle,
  Info,
  Settings,
  Download,
  Share2,
  Filter,
  Search
} from "lucide-react";
import { useInventory, InventoryItem } from "@/contexts/InventoryContext";

interface PredictionResult {
  category: string;
  predicted_demand: number;
  current_stock: number;
  restocking_threshold: number;
  restocking_needed: boolean;
  days_until_stockout: number;
  threshold: number;
  status: string;
  confidence_score?: number;
  trend_direction?: 'up' | 'down' | 'stable';
  last_updated?: string;
}

interface PredictionSummary {
  total_items: number;
  urgent_restocking: number;
  moderate_restocking: number;
  safe_stock_levels: number;
  timestamp: string;
  average_confidence?: number;
  total_predicted_demand?: number;
  risk_score?: number;
}

interface MLResults {
  success: boolean;
  summary?: PredictionSummary;
  predictions?: {
    urgent: { item_name: string; prediction: PredictionResult }[];
    moderate: { item_name: string; prediction: PredictionResult }[];
    safe: { item_name: string; prediction: PredictionResult }[];
  };
  report?: string;
  error?: string;
  timestamp: string;
}

export const EnhancedMLPredictionsDashboard: React.FC = () => {
  const { inventoryItems } = useInventory();
  const [results, setResults] = useState<MLResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [selectedTimeframe, setSelectedTimeframe] = useState("30d");
  const [searchTerm, setSearchTerm] = useState("");

  const runPredictions = async () => {
    setIsLoading(true);
    try {
      console.log("Running enhanced ML predictions for inventory items...");
      
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const predictions: { [key: string]: PredictionResult } = {};
      
      inventoryItems.forEach(item => {
        const predictedDemand = Math.random() * 20 + 5;
        const restockingThreshold = item.threshold * 0.7;
        const restockingNeeded = item.stock < restockingThreshold;
        const daysUntilStockout = restockingNeeded ? 
          Math.max(0, Math.floor((item.stock - restockingThreshold) / (predictedDemand / 30))) : 0;
        const confidenceScore = Math.random() * 0.3 + 0.7; // 70-100% confidence
        const trendDirections = ['up', 'down', 'stable'] as const;
        const trendDirection = trendDirections[Math.floor(Math.random() * 3)];
        
        predictions[item.name] = {
          category: item.category,
          predicted_demand: predictedDemand,
          current_stock: item.stock,
          restocking_threshold: restockingThreshold,
          restocking_needed: restockingNeeded,
          days_until_stockout: daysUntilStockout,
          threshold: item.threshold,
          status: item.status,
          confidence_score: confidenceScore,
          trend_direction: trendDirection,
          last_updated: new Date().toISOString()
        };
      });
      
      const urgent: { item_name: string; prediction: PredictionResult }[] = [];
      const moderate: { item_name: string; prediction: PredictionResult }[] = [];
      const safe: { item_name: string; prediction: PredictionResult }[] = [];
      
      Object.entries(predictions).forEach(([itemName, prediction]) => {
        if (prediction.restocking_needed) {
          if (prediction.days_until_stockout <= 7) {
            urgent.push({ item_name: itemName, prediction });
          } else if (prediction.days_until_stockout <= 14) {
            moderate.push({ item_name: itemName, prediction });
          }
        } else {
          safe.push({ item_name: itemName, prediction });
        }
      });
      
      const totalPredictedDemand = Object.values(predictions).reduce((sum, p) => sum + p.predicted_demand, 0);
      const averageConfidence = Object.values(predictions).reduce((sum, p) => sum + (p.confidence_score || 0), 0) / Object.values(predictions).length;
      const riskScore = (urgent.length * 0.5 + moderate.length * 0.3) / inventoryItems.length * 100;
      
      const sampleResults: MLResults = {
        success: true,
        summary: {
          total_items: inventoryItems.length,
          urgent_restocking: urgent.length,
          moderate_restocking: moderate.length,
          safe_stock_levels: safe.length,
          timestamp: new Date().toISOString(),
          average_confidence: averageConfidence,
          total_predicted_demand: totalPredictedDemand,
          risk_score: riskScore
        },
        predictions: {
          urgent,
          moderate,
          safe
        },
        timestamp: new Date().toISOString()
      };
      
      setResults(sampleResults);
      setLastUpdated(new Date().toISOString());
      
    } catch (error) {
      console.error("Error running predictions:", error);
      setResults({
        success: false,
        error: "Failed to run predictions",
        timestamp: new Date().toISOString()
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (inventoryItems.length > 0) {
      runPredictions();
    }
  }, [inventoryItems]);

  const getUrgencyColor = (daysUntilStockout: number) => {
    if (daysUntilStockout <= 7) return "text-red-600";
    if (daysUntilStockout <= 14) return "text-yellow-600";
    return "text-green-600";
  };

  const getUrgencyBadge = (daysUntilStockout: number) => {
    if (daysUntilStockout <= 7) return "destructive";
    if (daysUntilStockout <= 14) return "secondary";
    return "default";
  };

  const getStockLevelPercentage = (current: number, threshold: number) => {
    return Math.min((current / threshold) * 100, 100);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical': return 'text-red-600';
      case 'low': return 'text-yellow-600';
      case 'good': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  const getTrendIcon = (direction: 'up' | 'down' | 'stable') => {
    switch (direction) {
      case 'up': return <ArrowUpRight className="h-4 w-4 text-green-600" />;
      case 'down': return <ArrowDownRight className="h-4 w-4 text-red-600" />;
      case 'stable': return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRiskLevel = (riskScore: number) => {
    if (riskScore >= 70) return { level: "High", color: "text-red-600", bg: "bg-red-50" };
    if (riskScore >= 40) return { level: "Medium", color: "text-yellow-600", bg: "bg-yellow-50" };
    return { level: "Low", color: "text-green-600", bg: "bg-green-50" };
  };

  const filteredPredictions = () => {
    if (!results?.predictions) return { urgent: [], moderate: [], safe: [] };
    
    const filterPrediction = (prediction: any) => 
      prediction.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prediction.prediction.category.toLowerCase().includes(searchTerm.toLowerCase());

    return {
      urgent: results.predictions.urgent.filter(filterPrediction),
      moderate: results.predictions.moderate.filter(filterPrediction),
      safe: results.predictions.safe.filter(filterPrediction)
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Enhanced Header */}
      <div className="border-b bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg">
                  <Brain className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">AI Predictions Hub</h1>
                  <p className="text-sm text-gray-600">Intelligent inventory forecasting & risk analysis</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
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
              
              <Button 
                onClick={runPredictions} 
                disabled={isLoading}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? "Analyzing..." : "Run Analysis"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-6 py-6">
        {results?.success ? (
          <>
            {/* Enhanced Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Items</p>
                      <p className="text-3xl font-bold text-gray-900">{results.summary?.total_items}</p>
                      <p className="text-xs text-gray-500 mt-1">Analyzed for predictions</p>
                    </div>
                    <div className="p-3 bg-blue-100 rounded-full">
                      <Package className="h-6 w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Risk Score</p>
                      <p className="text-3xl font-bold text-red-600">{results.summary?.risk_score?.toFixed(1)}%</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {getRiskLevel(results.summary?.risk_score || 0).level} Risk Level
                      </p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-full">
                      <AlertTriangle className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Urgent Items</p>
                      <p className="text-3xl font-bold text-red-600">{results.summary?.urgent_restocking}</p>
                      <p className="text-xs text-gray-500 mt-1">Need immediate attention</p>
                    </div>
                    <div className="p-3 bg-red-100 rounded-full">
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Confidence</p>
                      <p className="text-3xl font-bold text-green-600">{(results.summary?.average_confidence || 0 * 100).toFixed(1)}%</p>
                      <p className="text-xs text-gray-500 mt-1">Model accuracy</p>
                    </div>
                    <div className="p-3 bg-green-100 rounded-full">
                      <Target className="h-6 w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Search and Filters */}
            <div className="flex items-center gap-4 mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search items or categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Timeframe:</span>
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="7d">7 Days</option>
                  <option value="30d">30 Days</option>
                  <option value="90d">90 Days</option>
                </select>
              </div>
            </div>

            {/* Enhanced Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm">
                <TabsTrigger value="overview" className="data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Overview
                </TabsTrigger>
                <TabsTrigger value="urgent" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-700">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Urgent ({filteredPredictions().urgent.length})
                </TabsTrigger>
                <TabsTrigger value="moderate" className="data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-700">
                  <Clock className="h-4 w-4 mr-2" />
                  Moderate ({filteredPredictions().moderate.length})
                </TabsTrigger>
                <TabsTrigger value="safe" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-700">
                  <Shield className="h-4 w-4 mr-2" />
                  Safe ({filteredPredictions().safe.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Urgent Items */}
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-700">
                        <AlertTriangle className="h-5 w-5" />
                        Critical Alerts
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {filteredPredictions().urgent.length ? (
                        filteredPredictions().urgent.map((item, index) => (
                          <div key={index} className="border border-red-200 rounded-xl p-4 bg-gradient-to-r from-red-50 to-pink-50 hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-gray-900">{item.item_name}</h4>
                              <Badge variant="destructive" className="font-medium">
                                {item.prediction.days_until_stockout} days left
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{item.prediction.category}</p>
                            
                            <div className="grid grid-cols-2 gap-4 mb-3">
                              <div className="text-center p-2 bg-white rounded-lg">
                                <p className="text-xs text-gray-500">Current Stock</p>
                                <p className="text-lg font-bold text-red-600">{item.prediction.current_stock}</p>
                              </div>
                              <div className="text-center p-2 bg-white rounded-lg">
                                <p className="text-xs text-gray-500">Predicted Demand</p>
                                <p className="text-lg font-bold">{item.prediction.predicted_demand.toFixed(1)}</p>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Stock Level</span>
                                <span className="font-medium">{getStockLevelPercentage(item.prediction.current_stock, item.prediction.threshold).toFixed(1)}%</span>
                              </div>
                              <Progress 
                                value={getStockLevelPercentage(item.prediction.current_stock, item.prediction.threshold)} 
                                className="h-2 bg-gray-200"
                              />
                            </div>
                            
                            {item.prediction.confidence_score && (
                              <div className="flex items-center justify-between mt-3 pt-3 border-t border-red-200">
                                <span className="text-xs text-gray-500">Confidence</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium">{(item.prediction.confidence_score * 100).toFixed(1)}%</span>
                                  {item.prediction.trend_direction && getTrendIcon(item.prediction.trend_direction)}
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">No Critical Alerts</h3>
                          <p className="text-gray-600">All items are well-stocked</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Moderate Items */}
                  <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-yellow-700">
                        <Clock className="h-5 w-5" />
                        Watch List
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {filteredPredictions().moderate.length ? (
                        filteredPredictions().moderate.map((item, index) => (
                          <div key={index} className="border border-yellow-200 rounded-xl p-4 bg-gradient-to-r from-yellow-50 to-orange-50 hover:shadow-md transition-all">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-semibold text-gray-900">{item.item_name}</h4>
                              <Badge variant="secondary" className="font-medium">
                                {item.prediction.days_until_stockout} days left
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{item.prediction.category}</p>
                            
                            <div className="grid grid-cols-2 gap-4 mb-3">
                              <div className="text-center p-2 bg-white rounded-lg">
                                <p className="text-xs text-gray-500">Current Stock</p>
                                <p className="text-lg font-bold text-yellow-600">{item.prediction.current_stock}</p>
                              </div>
                              <div className="text-center p-2 bg-white rounded-lg">
                                <p className="text-xs text-gray-500">Predicted Demand</p>
                                <p className="text-lg font-bold">{item.prediction.predicted_demand.toFixed(1)}</p>
                              </div>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="text-gray-600">Stock Level</span>
                                <span className="font-medium">{getStockLevelPercentage(item.prediction.current_stock, item.prediction.threshold).toFixed(1)}%</span>
                              </div>
                              <Progress 
                                value={getStockLevelPercentage(item.prediction.current_stock, item.prediction.threshold)} 
                                className="h-2 bg-gray-200"
                              />
                            </div>
                            
                            {item.prediction.confidence_score && (
                              <div className="flex items-center justify-between mt-3 pt-3 border-t border-yellow-200">
                                <span className="text-xs text-gray-500">Confidence</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium">{(item.prediction.confidence_score * 100).toFixed(1)}%</span>
                                  {item.prediction.trend_direction && getTrendIcon(item.prediction.trend_direction)}
                                </div>
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-3" />
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">No Watch Items</h3>
                          <p className="text-gray-600">All items are well-stocked</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Enhanced Detail Tabs */}
              <TabsContent value="urgent" className="space-y-4">
                {filteredPredictions().urgent.length ? (
                  filteredPredictions().urgent.map((item, index) => (
                    <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">{item.item_name}</h3>
                            <p className="text-sm text-gray-600">{item.prediction.category}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="destructive" className="text-sm font-medium">
                              CRITICAL - {item.prediction.days_until_stockout} days left
                            </Badge>
                            {item.prediction.confidence_score && (
                              <div className="flex items-center gap-1">
                                <Target className="h-4 w-4 text-purple-600" />
                                <span className="text-sm font-medium text-purple-600">
                                  {(item.prediction.confidence_score * 100).toFixed(1)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                          <div className="text-center p-4 bg-red-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Current Stock</p>
                            <p className="text-2xl font-bold text-red-600">{item.prediction.current_stock}</p>
                          </div>
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Predicted Demand</p>
                            <p className="text-2xl font-bold text-blue-600">{item.prediction.predicted_demand.toFixed(1)}</p>
                          </div>
                          <div className="text-center p-4 bg-yellow-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Restocking Threshold</p>
                            <p className="text-2xl font-bold text-yellow-600">{item.prediction.restocking_threshold.toFixed(1)}</p>
                          </div>
                          <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Days Until Stockout</p>
                            <p className="text-2xl font-bold text-purple-600">{item.prediction.days_until_stockout}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Stock Level Percentage</span>
                            <span className="font-medium">{getStockLevelPercentage(item.prediction.current_stock, item.prediction.threshold).toFixed(1)}%</span>
                          </div>
                          <Progress 
                            value={getStockLevelPercentage(item.prediction.current_stock, item.prediction.threshold)} 
                            className="h-3 bg-gray-200"
                          />
                        </div>
                        
                        {item.prediction.trend_direction && (
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                            <span className="text-sm text-gray-600">Demand Trend</span>
                            <div className="flex items-center gap-2">
                              {getTrendIcon(item.prediction.trend_direction)}
                              <span className="text-sm font-medium capitalize">{item.prediction.trend_direction}</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Critical Alerts</h3>
                    <p className="text-gray-600 mb-4">All inventory items have adequate stock levels.</p>
                    <Button variant="outline">
                      <Lightbulb className="h-4 w-4 mr-2" />
                      View Recommendations
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="moderate" className="space-y-4">
                {filteredPredictions().moderate.length ? (
                  filteredPredictions().moderate.map((item, index) => (
                    <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">{item.item_name}</h3>
                            <p className="text-sm text-gray-600">{item.prediction.category}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="secondary" className="text-sm font-medium">
                              MODERATE - {item.prediction.days_until_stockout} days left
                            </Badge>
                            {item.prediction.confidence_score && (
                              <div className="flex items-center gap-1">
                                <Target className="h-4 w-4 text-purple-600" />
                                <span className="text-sm font-medium text-purple-600">
                                  {(item.prediction.confidence_score * 100).toFixed(1)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                          <div className="text-center p-4 bg-yellow-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Current Stock</p>
                            <p className="text-2xl font-bold text-yellow-600">{item.prediction.current_stock}</p>
                          </div>
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Predicted Demand</p>
                            <p className="text-2xl font-bold text-blue-600">{item.prediction.predicted_demand.toFixed(1)}</p>
                          </div>
                          <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Restocking Threshold</p>
                            <p className="text-2xl font-bold text-orange-600">{item.prediction.restocking_threshold.toFixed(1)}</p>
                          </div>
                          <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Days Until Stockout</p>
                            <p className="text-2xl font-bold text-purple-600">{item.prediction.days_until_stockout}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Stock Level Percentage</span>
                            <span className="font-medium">{getStockLevelPercentage(item.prediction.current_stock, item.prediction.threshold).toFixed(1)}%</span>
                          </div>
                          <Progress 
                            value={getStockLevelPercentage(item.prediction.current_stock, item.prediction.threshold)} 
                            className="h-3 bg-gray-200"
                          />
                        </div>
                        
                        {item.prediction.trend_direction && (
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                            <span className="text-sm text-gray-600">Demand Trend</span>
                            <div className="flex items-center gap-2">
                              {getTrendIcon(item.prediction.trend_direction)}
                              <span className="text-sm font-medium capitalize">{item.prediction.trend_direction}</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Moderate Alerts</h3>
                    <p className="text-gray-600 mb-4">All inventory items have adequate stock levels.</p>
                    <Button variant="outline">
                      <Lightbulb className="h-4 w-4 mr-2" />
                      View Recommendations
                    </Button>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="safe" className="space-y-4">
                {filteredPredictions().safe.length ? (
                  filteredPredictions().safe.map((item, index) => (
                    <Card key={index} className="bg-white/80 backdrop-blur-sm border-0 shadow-lg hover:shadow-xl transition-all">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">{item.item_name}</h3>
                            <p className="text-sm text-gray-600">{item.prediction.category}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Badge variant="default" className="text-sm font-medium bg-green-100 text-green-700">
                              SAFE STOCK LEVELS
                            </Badge>
                            {item.prediction.confidence_score && (
                              <div className="flex items-center gap-1">
                                <Target className="h-4 w-4 text-purple-600" />
                                <span className="text-sm font-medium text-purple-600">
                                  {(item.prediction.confidence_score * 100).toFixed(1)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                          <div className="text-center p-4 bg-green-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Current Stock</p>
                            <p className="text-2xl font-bold text-green-600">{item.prediction.current_stock}</p>
                          </div>
                          <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Predicted Demand</p>
                            <p className="text-2xl font-bold text-blue-600">{item.prediction.predicted_demand.toFixed(1)}</p>
                          </div>
                          <div className="text-center p-4 bg-emerald-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Restocking Threshold</p>
                            <p className="text-2xl font-bold text-emerald-600">{item.prediction.restocking_threshold.toFixed(1)}</p>
                          </div>
                          <div className="text-center p-4 bg-teal-50 rounded-lg">
                            <p className="text-sm text-gray-600 mb-1">Safety Margin</p>
                            <p className="text-2xl font-bold text-teal-600">+{Math.max(0, item.prediction.current_stock - item.prediction.restocking_threshold).toFixed(1)}</p>
                          </div>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Stock Level Percentage</span>
                            <span className="font-medium">{getStockLevelPercentage(item.prediction.current_stock, item.prediction.threshold).toFixed(1)}%</span>
                          </div>
                          <Progress 
                            value={getStockLevelPercentage(item.prediction.current_stock, item.prediction.threshold)} 
                            className="h-3 bg-gray-200"
                          />
                        </div>
                        
                        {item.prediction.trend_direction && (
                          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
                            <span className="text-sm text-gray-600">Demand Trend</span>
                            <div className="flex items-center gap-2">
                              {getTrendIcon(item.prediction.trend_direction)}
                              <span className="text-sm font-medium capitalize">{item.prediction.trend_direction}</span>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <AlertTriangle className="h-16 w-16 text-yellow-600 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No Safe Stock Categories</h3>
                    <p className="text-gray-600 mb-4">All inventory items need restocking attention.</p>
                    <Button variant="outline">
                      <Lightbulb className="h-4 w-4 mr-2" />
                      View Recommendations
                    </Button>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <div className="text-center py-12">
            {isLoading ? (
              <div className="space-y-6">
                <div className="relative">
                  <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200 border-t-purple-600 mx-auto"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Brain className="h-8 w-8 text-purple-600" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">Running AI Analysis...</h3>
                  <p className="text-gray-600">Analyzing inventory patterns and generating intelligent predictions</p>
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                  <Activity className="h-4 w-4 animate-pulse" />
                  Processing data...
                </div>
              </div>
            ) : results?.error ? (
              <div className="space-y-4">
                <AlertTriangle className="h-16 w-16 text-red-600 mx-auto" />
                <h3 className="text-xl font-semibold text-gray-900">Analysis Error</h3>
                <p className="text-gray-600 mb-4">{results.error}</p>
                <Button onClick={runPredictions} className="bg-gradient-to-r from-purple-600 to-blue-600">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-purple-100 to-blue-100 rounded-full w-fit mx-auto">
                  <Brain className="h-16 w-16 text-purple-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900">Ready for AI Analysis</h3>
                <p className="text-gray-600 mb-6">Run ML predictions to analyze inventory restocking needs</p>
                <Button onClick={runPredictions} className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700">
                  <Zap className="h-4 w-4 mr-2" />
                  Start Analysis
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}; 