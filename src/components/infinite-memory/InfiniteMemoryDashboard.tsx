import React, { useState, useEffect, useRef } from 'react';
import { useInfiniteMemory } from '@/contexts/InfiniteMemoryContext';
import { infiniteMemoryAPI } from '@/services/infiniteMemoryApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  MessageSquare, 
  Image, 
  Mic, 
  Loader2, 
  Wifi, 
  WifiOff, 
  Calendar, 
  Clock, 
  CheckCircle, 
  Circle, 
  Activity,
  History,
  Sparkles,
  Zap,
  Shield,
  ArrowRight,
  Plus,
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
  Heart,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock4,
  CalendarDays,
  BarChart3,
  Users,
  FileText,
  Send,
  Upload,
  BrainCircuit,
  Memory,
  Cpu,
  Network,
  Globe,
  Lock,
  Unlock,
  Key,
  Fingerprint,
  Scan,
  QrCode,
  Radio,
  Signal,
  Wifi2,
  Bluetooth,
  Smartphone,
  Tablet,
  Monitor,
  Laptop,
  Server,
  Cloud,
  HardDrive,
  Usb,
  Cable,
  Power,
  Battery,
  BatteryCharging,
  PowerOff,
  PowerOn,
  Lightning,
  Thunder,
  Storm,
  Rain,
  Snow,
  Sun,
  Moon,
  CloudRain,
  CloudLightning,
  CloudSnow,
  CloudFog,
  Wind,
  Thermometer,
  Droplets,
  Umbrella,
  Sunglasses,
  MoonStar,
  SunDim,
  Cloudy,
  Haze,
  Mist,
  Tornado,
  Hurricane,
  Earthquake,
  Volcano,
  Fire,
  Flame,
} from 'lucide-react';
import { format } from 'date-fns';

export function InfiniteMemoryDashboard() {
  const { state, processText, queryMemory, processImage, createTask, completeTask, loadTasks, loadMemoryReport, setUserId, clearError } = useInfiniteMemory();
  const [inputText, setInputText] = useState('');
  const [queryText, setQueryText] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imageCaption, setImageCaption] = useState('');
  const [newTask, setNewTask] = useState({
    summary: '',
    description: '',
    start_date: '',
    end_date: '',
  });
  const [activeTab, setActiveTab] = useState('conversation');
  const [backendStatus, setBackendStatus] = useState<'connected' | 'disconnected' | 'testing'>('testing');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Set a default user ID for demo purposes
    if (!state.currentUserId) {
      setUserId('demo-user-1');
    }
    
    // Test backend connection
    testBackendConnection();
    
    // Load initial data
    loadTasks();
    loadMemoryReport();
  }, [state.currentUserId]);

  const testBackendConnection = async () => {
    setBackendStatus('testing');
    try {
      const isConnected = await infiniteMemoryAPI.testConnection();
      setBackendStatus(isConnected ? 'connected' : 'disconnected');
      console.log('🔗 Backend connection test result:', isConnected);
    } catch (error) {
      setBackendStatus('disconnected');
      console.error('❌ Backend connection test failed:', error);
    }
  };

  const handleProcessText = async () => {
    if (!inputText.trim()) return;
    
    console.log('📝 Processing text:', inputText);
    await processText(inputText);
    setInputText('');
  };

  const handleQueryMemory = async () => {
    if (!queryText.trim()) return;
    
    console.log('🔍 Querying memory:', queryText);
    await queryMemory(queryText);
    setQueryText('');
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleProcessImage = async () => {
    if (!selectedImage) return;
    await processImage(selectedImage, imageCaption);
    setSelectedImage(null);
    setImageCaption('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCreateTask = async () => {
    if (!newTask.summary || !newTask.start_date || !newTask.end_date) return;
    await createTask(newTask);
    setNewTask({
      summary: '',
      description: '',
      start_date: '',
      end_date: '',
    });
  };

  const handleCompleteTask = async (taskId: string) => {
    await completeTask(taskId);
  };

  const getImportanceColor = (score: number) => {
    if (score >= 0.8) return 'bg-gradient-to-r from-red-500 to-pink-500';
    if (score >= 0.6) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    return 'bg-gradient-to-r from-green-500 to-emerald-500';
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return 'text-green-600 bg-green-50';
      case 'negative': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getUrgencyColor = (level: string) => {
    switch (level) {
      case 'high': return 'bg-gradient-to-r from-red-500 to-pink-500';
      case 'medium': return 'bg-gradient-to-r from-yellow-500 to-orange-500';
      default: return 'bg-gradient-to-r from-green-500 to-emerald-500';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Enhanced Header */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl blur-lg opacity-30"></div>
                <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl">
                  <Brain className="h-8 w-8 text-white" />
                </div>
              </div>
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Infinite Memory
                </h1>
                <p className="text-slate-600 font-medium">AI Cognitive Companion</p>
              </div>
            </div>
            
            {/* Enhanced Backend Status */}
            <div className="flex items-center space-x-3">
              <div className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
                backendStatus === 'connected' 
                  ? 'bg-green-100 text-green-700 border border-green-200' 
                  : backendStatus === 'disconnected'
                  ? 'bg-red-100 text-red-700 border border-red-200'
                  : 'bg-yellow-100 text-yellow-700 border border-yellow-200'
              }`}>
                {backendStatus === 'connected' ? (
                  <Wifi className="h-4 w-4" />
                ) : backendStatus === 'disconnected' ? (
                  <WifiOff className="h-4 w-4" />
                ) : (
                  <Loader2 className="h-4 w-4 animate-spin" />
                )}
                <span className="text-sm font-medium">
                  {backendStatus === 'connected' ? 'Connected' : 
                   backendStatus === 'disconnected' ? 'Disconnected' : 'Testing'}
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={testBackendConnection}
                disabled={backendStatus === 'testing'}
                className="border-slate-200 hover:bg-slate-50"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Test Connection
              </Button>
            </div>
          </div>
        </div>

        {/* Error Alert */}
        {state.error && (
          <Alert className="border-red-200 bg-red-50/80 backdrop-blur-sm">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 font-medium">
              {state.error}
            </AlertDescription>
          </Alert>
        )}

        {/* Enhanced Tabs */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="p-6">
            <TabsList className="grid w-full grid-cols-4 bg-slate-100/50 p-1 rounded-xl">
              <TabsTrigger value="conversation" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
                <MessageSquare className="h-4 w-4 mr-2" />
                Conversation
              </TabsTrigger>
              <TabsTrigger value="memory-query" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
                <Search className="h-4 w-4 mr-2" />
                Memory Query
              </TabsTrigger>
              <TabsTrigger value="tasks" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
                <CheckCircle className="h-4 w-4 mr-2" />
                Tasks
              </TabsTrigger>
              <TabsTrigger value="analytics" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">
                <BarChart3 className="h-4 w-4 mr-2" />
                Analytics
              </TabsTrigger>
            </TabsList>

            {/* Enhanced Conversation Tab */}
            <TabsContent value="conversation" className="space-y-6 mt-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-blue-900">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <MessageSquare className="h-5 w-5 text-blue-600" />
                    </div>
                    <span>Process New Information</span>
                  </CardTitle>
                  <CardDescription className="text-blue-700">
                    Share information with your AI companion to build your memory
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-3">
                    <Textarea
                      placeholder="Type your message here..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="flex-1 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
                      rows={3}
                    />
                    <Button 
                      onClick={handleProcessText} 
                      disabled={state.isLoading || backendStatus !== 'connected'}
                      className="self-end bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                    >
                      {state.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Process
                        </>
                      )}
                    </Button>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Button
                      variant="outline"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={backendStatus !== 'connected'}
                      className="border-blue-200 text-blue-700 hover:bg-blue-50"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Image
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                    {selectedImage && (
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="Image caption..."
                          value={imageCaption}
                          onChange={(e) => setImageCaption(e.target.value)}
                          className="w-48 border-blue-200 focus:border-blue-400"
                        />
                        <Button onClick={handleProcessImage} size="sm" className="bg-gradient-to-r from-green-600 to-emerald-600 text-white">
                          <Image className="h-4 w-4 mr-2" />
                          Process
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Enhanced Conversation History */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <History className="h-5 w-5 text-slate-600" />
                    </div>
                    <span>Conversation History</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-96">
                    <div className="space-y-4">
                      {state.conversationHistory.length === 0 ? (
                        <div className="text-center py-12">
                          <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <MessageSquare className="h-8 w-8 text-slate-400" />
                          </div>
                          <p className="text-slate-500 font-medium">No conversation history yet</p>
                          <p className="text-slate-400 text-sm">Start by processing some information!</p>
                        </div>
                      ) : (
                        state.conversationHistory.map((entry) => (
                          <div key={entry.id} className="flex space-x-4 p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback className={entry.type === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}>
                                {entry.type === 'user' ? 'U' : 'AI'}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                  <span className="font-semibold text-slate-900">
                                    {entry.type === 'user' ? 'You' : 'AI Assistant'}
                                  </span>
                                  <span className="text-sm text-slate-500">
                                    {format(entry.timestamp, 'HH:mm')}
                                  </span>
                                </div>
                                {entry.analysis && (
                                  <Badge 
                                    className={`${getImportanceColor(entry.analysis.importance_score)} text-white font-medium`}
                                  >
                                    {Math.round(entry.analysis.importance_score * 100)}% Important
                                  </Badge>
                                )}
                              </div>
                              <p className="text-slate-700 leading-relaxed">{entry.content}</p>
                              {entry.analysis && (
                                <div className="space-y-2">
                                  <div className="flex items-center space-x-3 text-sm">
                                    <span className="text-slate-500">Sentiment:</span>
                                    <Badge className={`${getSentimentColor(entry.analysis.sentiment)} font-medium`}>
                                      {entry.analysis.sentiment}
                                    </Badge>
                                    {entry.analysis.urgency_level && entry.analysis.urgency_level !== 'normal' && (
                                      <Badge className={`${getUrgencyColor(entry.analysis.urgency_level)} text-white font-medium`}>
                                        {entry.analysis.urgency_level} urgency
                                      </Badge>
                                    )}
                                  </div>
                                  {entry.analysis.topics && entry.analysis.topics.length > 0 && (
                                    <div className="flex items-center space-x-2 text-sm">
                                      <span className="text-slate-500">Topics:</span>
                                      <div className="flex space-x-1">
                                        {entry.analysis.topics.map((topic, index) => (
                                          <Badge key={index} variant="secondary" className="text-xs">
                                            {topic}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                  {entry.analysis.action_items && entry.analysis.action_items.length > 0 && (
                                    <div className="flex items-center space-x-2 text-sm">
                                      <span className="text-slate-500">Actions:</span>
                                      <div className="flex space-x-1">
                                        {entry.analysis.action_items.map((action, index) => (
                                          <Badge key={index} variant="outline" className="text-xs border-blue-200 text-blue-700">
                                            {action}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Enhanced Memory Query Tab */}
            <TabsContent value="memory-query" className="space-y-6 mt-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-green-900">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Search className="h-5 w-5 text-green-600" />
                    </div>
                    <span>Query Memory</span>
                  </CardTitle>
                  <CardDescription className="text-green-700">
                    Ask questions about your stored information
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex space-x-3">
                    <Input
                      placeholder="Ask about your memory..."
                      value={queryText}
                      onChange={(e) => setQueryText(e.target.value)}
                      className="flex-1 border-green-200 focus:border-green-400 focus:ring-green-400"
                    />
                    <Button 
                      onClick={handleQueryMemory}
                      disabled={state.isLoading || backendStatus !== 'connected'}
                      className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                    >
                      {state.isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : (
                        <>
                          <Search className="h-4 w-4 mr-2" />
                          Query
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Enhanced Tasks Tab */}
            <TabsContent value="tasks" className="space-y-6 mt-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-amber-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-orange-900">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Plus className="h-5 w-5 text-orange-600" />
                    </div>
                    <span>Create New Task</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Input
                      placeholder="Task summary"
                      value={newTask.summary}
                      onChange={(e) => setNewTask({ ...newTask, summary: e.target.value })}
                      className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                    />
                    <Input
                      placeholder="Start date (YYYY-MM-DD)"
                      value={newTask.start_date}
                      onChange={(e) => setNewTask({ ...newTask, start_date: e.target.value })}
                      className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                    />
                  </div>
                  <Textarea
                    placeholder="Task description"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                  />
                  <div className="flex space-x-3">
                    <Input
                      placeholder="End date (YYYY-MM-DD)"
                      value={newTask.end_date}
                      onChange={(e) => setNewTask({ ...newTask, end_date: e.target.value })}
                      className="border-orange-200 focus:border-orange-400 focus:ring-orange-400"
                    />
                    <Button 
                      onClick={handleCreateTask}
                      disabled={state.isLoading || backendStatus !== 'connected'}
                      className="bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white shadow-lg"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Create Task
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-slate-600" />
                    </div>
                    <span>Your Tasks</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {state.tasks.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                          <CheckCircle className="h-8 w-8 text-slate-400" />
                        </div>
                        <p className="text-slate-500 font-medium">No tasks yet</p>
                        <p className="text-slate-400 text-sm">Create your first task!</p>
                      </div>
                    ) : (
                      state.tasks.map((task) => (
                        <div key={task.task_id} className="p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors border border-slate-200">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h3 className="font-semibold text-slate-900">{task.summary}</h3>
                                {task.priority && (
                                  <Badge className={`${
                                    task.priority === 'high' 
                                      ? 'bg-gradient-to-r from-red-500 to-pink-500' 
                                      : 'bg-gradient-to-r from-yellow-500 to-orange-500'
                                  } text-white font-medium`}>
                                    {task.priority}
                                  </Badge>
                                )}
                                {task.completed && (
                                  <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white font-medium">
                                    Completed
                                  </Badge>
                                )}
                              </div>
                              <p className="text-slate-600 mb-3">{task.description}</p>
                              <div className="flex items-center space-x-4 text-sm text-slate-500">
                                <div className="flex items-center space-x-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{task.start_date} - {task.end_date}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{task.completed ? 'Completed' : 'Pending'}</span>
                                </div>
                              </div>
                            </div>
                            {!task.completed && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCompleteTask(task.task_id)}
                                disabled={state.isLoading || backendStatus !== 'connected'}
                                className="border-green-200 text-green-700 hover:bg-green-50"
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Complete
                              </Button>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Enhanced Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6 mt-6">
              <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-indigo-50">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-purple-900">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <BarChart3 className="h-5 w-5 text-purple-600" />
                    </div>
                    <span>Memory Analytics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {state.memoryReport ? (
                    <div className="space-y-6">
                      <div className="grid grid-cols-3 gap-6">
                        <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-purple-100">
                          <div className="text-3xl font-bold text-purple-600 mb-2">
                            {state.memoryReport.total_interactions}
                          </div>
                          <div className="text-sm text-purple-600 font-medium">Total Interactions</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-purple-100">
                          <div className="text-3xl font-bold text-purple-600 mb-2">
                            {Math.round(state.memoryReport.average_importance * 100)}%
                          </div>
                          <div className="text-sm text-purple-600 font-medium">Avg Importance</div>
                        </div>
                        <div className="text-center p-4 bg-white rounded-xl shadow-sm border border-purple-100">
                          <div className="text-3xl font-bold text-purple-600 mb-2">
                            {state.memoryReport.days}
                          </div>
                          <div className="text-sm text-purple-600 font-medium">Days Analyzed</div>
                        </div>
                      </div>
                      
                      {state.memoryReport.sentiment_distribution && (
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-purple-100">
                          <h4 className="font-semibold text-purple-900 mb-4">Sentiment Distribution</h4>
                          <div className="grid grid-cols-4 gap-4">
                            {Object.entries(state.memoryReport.sentiment_distribution).map(([sentiment, count]) => (
                              <div key={sentiment} className="text-center p-3 bg-purple-50 rounded-lg">
                                <div className="text-2xl font-bold text-purple-600 mb-1">{count}</div>
                                <div className="text-sm text-purple-600 font-medium capitalize">{sentiment}</div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                        <BarChart3 className="h-8 w-8 text-slate-400" />
                      </div>
                      <p className="text-slate-500 font-medium">No analytics data available yet</p>
                      <p className="text-slate-400 text-sm">Start processing information to see analytics</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
} 