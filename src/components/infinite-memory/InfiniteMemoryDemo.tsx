import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Calendar, Clock, CheckCircle, Circle, Brain, MessageSquare, Image, Loader2, Sparkles, Zap, Shield, Target, ArrowRight, Plus, Star, Eye, Edit, Trash2, Download, Share2, Settings, Search, Filter, RefreshCw, Lightbulb, Info, X, ChevronRight, ChevronDown, Play, Pause, RotateCcw, Heart, TrendingUp, AlertTriangle, CheckCircle2, Clock4, CalendarDays, BarChart3, Users, FileText, Send, Upload, BrainCircuit, Memory, Cpu, Network, Globe, Lock, Unlock, Key, Fingerprint, Scan, QrCode, Radio, Signal, Wifi2, Bluetooth, Smartphone, Tablet, Monitor, Laptop, Server, Cloud, HardDrive, Usb, Cable, Power, Battery, BatteryCharging, PowerOff, PowerOn, Lightning, Thunder, Storm, Rain, Snow, Sun, History } from 'lucide-react';
import { format } from 'date-fns';

// Mock data for demonstration
const mockConversationHistory = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    type: 'user' as const,
    content: 'I need to remember to take my medication at 9 AM tomorrow',
    analysis: {
      importance_score: 0.9,
      summary: 'High priority medication reminder identified',
      sentiment: 'neutral',
      topics: ['medication', 'health', 'reminder'],
      entities: ['medication', '9 AM', 'tomorrow']
    }
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 1000 * 60 * 25), // 25 minutes ago
    type: 'ai' as const,
    content: 'I\'ve recorded your medication reminder for tomorrow at 9 AM. This is marked as high priority due to its importance for your health.',
    analysis: {
      importance_score: 0.9,
      summary: 'Confirmed medication reminder creation',
      sentiment: 'positive',
      topics: ['medication', 'health', 'reminder'],
      entities: ['medication', '9 AM', 'tomorrow']
    }
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 1000 * 60 * 20), // 20 minutes ago
    type: 'user' as const,
    content: 'My daughter Sarah is coming to visit this weekend',
    analysis: {
      importance_score: 0.7,
      summary: 'Family visit information recorded',
      sentiment: 'positive',
      topics: ['family', 'visit', 'weekend'],
      entities: ['Sarah', 'daughter', 'weekend']
    }
  },
  {
    id: '4',
    timestamp: new Date(Date.now() - 1000 * 60 * 15), // 15 minutes ago
    type: 'ai' as const,
    content: 'That\'s wonderful! I\'ve noted that Sarah, your daughter, is visiting this weekend. I\'ll remind you about this when the weekend approaches.',
    analysis: {
      importance_score: 0.7,
      summary: 'Acknowledged family visit reminder',
      sentiment: 'positive',
      topics: ['family', 'visit', 'weekend'],
      entities: ['Sarah', 'daughter', 'weekend']
    }
  }
];

const mockTasks = [
  {
    task_id: '1',
    patient_id: 'demo-user-1',
    summary: 'Take medication',
    description: 'Blood pressure medication - 1 tablet',
    start_date: '2024-01-15',
    end_date: '2024-01-15',
    completed: false,
    created_at: '2024-01-14T10:00:00Z'
  },
  {
    task_id: '2',
    patient_id: 'demo-user-1',
    summary: 'Doctor appointment',
    description: 'Annual checkup with Dr. Smith',
    start_date: '2024-01-16',
    end_date: '2024-01-16',
    completed: false,
    created_at: '2024-01-14T11:00:00Z'
  },
  {
    task_id: '3',
    patient_id: 'demo-user-1',
    summary: 'Call pharmacy',
    description: 'Refill prescription for diabetes medication',
    start_date: '2024-01-14',
    end_date: '2024-01-14',
    completed: true,
    created_at: '2024-01-13T09:00:00Z'
  }
];

const mockMemoryReport = {
  patient_id: 'demo-user-1',
  days: 7,
  total_interactions: 24,
  average_importance: 0.75,
  memory_trends: [
    { date: '2024-01-08', score: 0.6 },
    { date: '2024-01-09', score: 0.7 },
    { date: '2024-01-10', score: 0.8 },
    { date: '2024-01-11', score: 0.75 },
    { date: '2024-01-12', score: 0.85 },
    { date: '2024-01-13', score: 0.9 },
    { date: '2024-01-14', score: 0.8 }
  ],
  recent_activities: [
    'Medication reminder created',
    'Family visit noted',
    'Doctor appointment scheduled'
  ]
};

export function InfiniteMemoryDemo() {
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
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversationHistory, setConversationHistory] = useState(mockConversationHistory);
  const [tasks, setTasks] = useState(mockTasks);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleProcessText = async () => {
    if (!inputText.trim()) return;
    
    setIsProcessing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Add user message
    const userMessage = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type: 'user' as const,
      content: inputText,
      analysis: {
        importance_score: Math.random() * 0.5 + 0.3, // Random importance between 0.3-0.8
        summary: 'Processed user input',
        sentiment: 'neutral',
        topics: ['general'],
        entities: []
      }
    };
    
    // Add AI response
    const aiResponse = {
      id: (Date.now() + 1).toString(),
      timestamp: new Date(),
      type: 'ai' as const,
      content: `I've processed your message: "${inputText}". This information has been stored in your memory for future reference.`,
      analysis: {
        importance_score: userMessage.analysis.importance_score,
        summary: 'Acknowledged user input',
        sentiment: 'positive',
        topics: ['general'],
        entities: []
      }
    };
    
    setConversationHistory(prev => [...prev, userMessage, aiResponse]);
    setInputText('');
    setIsProcessing(false);
  };

  const handleQueryMemory = async () => {
    if (!queryText.trim()) return;
    
    setIsProcessing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Add user query
    const userQuery = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type: 'user' as const,
      content: queryText,
    };
    
    // Add AI response
    const aiResponse = {
      id: (Date.now() + 1).toString(),
      timestamp: new Date(),
      type: 'ai' as const,
      content: `Based on your stored memories, here's what I found about "${queryText}": This appears to be a new query. I'll search through your memory database for relevant information.`,
    };
    
    setConversationHistory(prev => [...prev, userQuery, aiResponse]);
    setQueryText('');
    setIsProcessing(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
    }
  };

  const handleProcessImage = async () => {
    if (!selectedImage) return;
    
    setIsProcessing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const aiResponse = {
      id: Date.now().toString(),
      timestamp: new Date(),
      type: 'ai' as const,
      content: `I've processed the image "${selectedImage.name}"${imageCaption ? ` with caption: "${imageCaption}"` : ''}. The image has been analyzed and stored in your memory.`,
      analysis: {
        importance_score: 0.6,
        summary: 'Image processed and stored',
        sentiment: 'neutral',
        topics: ['image', 'memory'],
        entities: []
      }
    };
    
    setConversationHistory(prev => [...prev, aiResponse]);
    setSelectedImage(null);
    setImageCaption('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    setIsProcessing(false);
  };

  const handleCreateTask = async () => {
    if (!newTask.summary || !newTask.start_date || !newTask.end_date) return;
    
    setIsProcessing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const newTaskItem = {
      task_id: Date.now().toString(),
      patient_id: 'demo-user-1',
      summary: newTask.summary,
      description: newTask.description,
      start_date: newTask.start_date,
      end_date: newTask.end_date,
      completed: false,
      created_at: new Date().toISOString()
    };
    
    setTasks(prev => [...prev, newTaskItem]);
    setNewTask({
      summary: '',
      description: '',
      start_date: '',
      end_date: '',
    });
    setIsProcessing(false);
  };

  const handleCompleteTask = async (taskId: string) => {
    setIsProcessing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    setTasks(prev => prev.map(task =>
      task.task_id === taskId ? { ...task, completed: true } : task
    ));
    setIsProcessing(false);
  };

  const getImportanceColor = (score: number) => {
    if (score >= 0.8) return 'bg-red-500';
    if (score >= 0.6) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      <div className="container mx-auto p-6 space-y-6">
        {/* Enhanced Header */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 p-8 text-white shadow-2xl">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
                <Brain className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold tracking-tight">Infinite Memory</h1>
                <p className="text-blue-100">AI Cognitive Companion (Demo Mode)</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                <Sparkles className="h-3 w-3 mr-1" />
                Demo Mode
              </Badge>
              <div className="flex items-center space-x-2">
                <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse"></div>
                <span className="text-sm">Mock Data</span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Alert */}
        <Alert className="border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/20">
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            This is a demonstration of the Infinite Memory integration. The backend is not connected, so all data is simulated.
            Follow the setup guide to connect the real backend.
          </AlertDescription>
        </Alert>

        {/* Enhanced Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <TabsTrigger value="conversation" className="flex items-center space-x-2">
              <MessageSquare className="h-4 w-4" />
              <span>Conversation</span>
            </TabsTrigger>
            <TabsTrigger value="memory" className="flex items-center space-x-2">
              <Brain className="h-4 w-4" />
              <span>Memory Query</span>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center space-x-2">
              <Calendar className="h-4 w-4" />
              <span>Tasks</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center space-x-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="conversation" className="space-y-6">
            {/* Enhanced Process Card */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-blue-50/30 dark:from-slate-800 dark:to-slate-700">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <span>Process New Information</span>
                </CardTitle>
                <CardDescription className="text-blue-100">
                  Share information with your AI companion to build your memory (Demo)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex space-x-3">
                  <Input
                    placeholder="Type your message here..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleProcessText()}
                    disabled={isProcessing}
                    className="flex-1 border-2 focus:border-blue-500"
                  />
                  <Button 
                    onClick={handleProcessText} 
                    disabled={isProcessing || !inputText.trim()}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                  >
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                    <span className="ml-2">Process</span>
                  </Button>
                </div>

                <div className="flex items-center space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="border-2 hover:border-blue-500"
                  >
                    <Image className="h-4 w-4 mr-2" />
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
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <span className="text-sm text-blue-700 dark:text-blue-300">
                        {selectedImage.name}
                      </span>
                      <Input
                        placeholder="Image caption (optional)"
                        value={imageCaption}
                        onChange={(e) => setImageCaption(e.target.value)}
                        className="w-48 border-2 focus:border-blue-500"
                      />
                      <Button 
                        onClick={handleProcessImage} 
                        disabled={isProcessing}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                      >
                        Process
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Conversation History */}
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-purple-50/30 dark:from-slate-800 dark:to-slate-700">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                    <History className="h-5 w-5" />
                  </div>
                  <span>Conversation History</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ScrollArea className="h-96">
                  <div className="space-y-4">
                    {conversationHistory.map((entry) => (
                      <div key={entry.id} className="flex space-x-4 p-4 rounded-xl bg-gradient-to-r from-slate-50 to-blue-50/50 dark:from-slate-700 dark:to-slate-600 border border-slate-200 dark:border-slate-600">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className={entry.type === 'user' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}>
                            {entry.type === 'user' ? 'U' : 'AI'}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 space-y-3">
                          <div className="flex items-center space-x-3">
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {entry.type === 'user' ? 'You' : 'AI Assistant'}
                            </span>
                            <span className="text-sm text-slate-500 dark:text-slate-400">
                              {format(entry.timestamp, 'HH:mm')}
                            </span>
                            {entry.analysis && (
                              <Badge className={`${getImportanceColor(entry.analysis.importance_score)} text-white`}>
                                {Math.round(entry.analysis.importance_score * 100)}% Important
                              </Badge>
                            )}
                          </div>
                          <p className="text-slate-700 dark:text-slate-300">{entry.content}</p>
                          {entry.analysis && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 space-y-1 bg-slate-100 dark:bg-slate-800 p-3 rounded-lg">
                              <div>Sentiment: <span className="font-medium">{entry.analysis.sentiment}</span></div>
                              <div>Topics: <span className="font-medium">{entry.analysis.topics.join(', ')}</span></div>
                              {entry.analysis.entities.length > 0 && (
                                <div>Entities: <span className="font-medium">{entry.analysis.entities.join(', ')}</span></div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="memory" className="space-y-6">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-indigo-50/30 dark:from-slate-800 dark:to-slate-700">
              <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                    <Brain className="h-5 w-5" />
                  </div>
                  <span>Query Your Memory</span>
                </CardTitle>
                <CardDescription className="text-indigo-100">
                  Ask questions about your stored memories and get AI-powered answers (Demo)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex space-x-3">
                  <Input
                    placeholder="Ask about your memories..."
                    value={queryText}
                    onChange={(e) => setQueryText(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleQueryMemory()}
                    disabled={isProcessing}
                    className="flex-1 border-2 focus:border-indigo-500"
                  />
                  <Button 
                    onClick={handleQueryMemory} 
                    disabled={isProcessing || !queryText.trim()}
                    className="bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700"
                  >
                    {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                    <span className="ml-2">Query</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tasks" className="space-y-6">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-green-50/30 dark:from-slate-800 dark:to-slate-700">
              <CardHeader className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                    <Calendar className="h-5 w-5" />
                  </div>
                  <span>Create New Task</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    placeholder="Task summary"
                    value={newTask.summary}
                    onChange={(e) => setNewTask({ ...newTask, summary: e.target.value })}
                    className="border-2 focus:border-green-500"
                  />
                  <Input
                    type="date"
                    value={newTask.start_date}
                    onChange={(e) => setNewTask({ ...newTask, start_date: e.target.value })}
                    className="border-2 focus:border-green-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Textarea
                    placeholder="Task description (optional)"
                    value={newTask.description}
                    onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                    className="border-2 focus:border-green-500"
                  />
                  <Input
                    type="date"
                    value={newTask.end_date}
                    onChange={(e) => setNewTask({ ...newTask, end_date: e.target.value })}
                    className="border-2 focus:border-green-500"
                  />
                </div>
                <Button 
                  onClick={handleCreateTask} 
                  disabled={!newTask.summary || !newTask.start_date || !newTask.end_date || isProcessing}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700"
                >
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Plus className="h-4 w-4 mr-2" />}
                  Create Task
                </Button>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-orange-50/30 dark:from-slate-800 dark:to-slate-700">
              <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                    <CheckCircle className="h-5 w-5" />
                  </div>
                  <span>Your Tasks</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  {tasks.map((task) => (
                    <div key={task.task_id} className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-slate-50 to-orange-50/50 dark:from-slate-700 dark:to-slate-600 border border-slate-200 dark:border-slate-600">
                      <div className="flex items-center space-x-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCompleteTask(task.task_id)}
                          disabled={task.completed || isProcessing}
                          className="hover:bg-green-100 dark:hover:bg-green-900/20"
                        >
                          {task.completed ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Circle className="h-5 w-5" />
                          )}
                        </Button>
                        <div>
                          <p className={`font-semibold ${task.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'}`}>
                            {task.summary}
                          </p>
                          {task.description && (
                            <p className="text-sm text-slate-600 dark:text-slate-400">{task.description}</p>
                          )}
                          <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-slate-400 mt-1">
                            <Clock className="h-3 w-3" />
                            <span>{task.start_date} - {task.end_date}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant={task.completed ? "secondary" : "default"} className={task.completed ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400" : "bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400"}>
                        {task.completed ? 'Completed' : 'Pending'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="border-0 shadow-xl bg-gradient-to-br from-white to-purple-50/30 dark:from-slate-800 dark:to-slate-700">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
                <CardTitle className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                    <BarChart3 className="h-5 w-5" />
                  </div>
                  <span>Memory Analytics</span>
                </CardTitle>
                <CardDescription className="text-purple-100">
                  Track your memory patterns and cognitive health (Demo Data)
                </CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-6">
                  <div className="grid grid-cols-3 gap-6">
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20">
                      <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{mockMemoryReport.total_interactions}</p>
                      <p className="text-sm text-blue-700 dark:text-blue-300">Total Interactions</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20">
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                        {Math.round(mockMemoryReport.average_importance * 100)}%
                      </p>
                      <p className="text-sm text-green-700 dark:text-green-300">Avg Importance</p>
                    </div>
                    <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20">
                      <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{mockMemoryReport.days}</p>
                      <p className="text-sm text-purple-700 dark:text-purple-300">Days Tracked</p>
                    </div>
                  </div>
                  
                  <Separator className="bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-600" />
                  
                  <div>
                    <h4 className="font-semibold mb-4 text-slate-900 dark:text-slate-100">Memory Trends</h4>
                    <div className="space-y-3">
                      {mockMemoryReport.memory_trends.map((trend, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800">
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{trend.date}</span>
                          <div className="flex items-center space-x-3">
                            <Progress value={trend.score * 100} className="w-32" />
                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                              {Math.round(trend.score * 100)}%
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
} 