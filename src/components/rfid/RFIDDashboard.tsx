import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { API_ENDPOINTS } from "@/config/api";
import { 
  Radio, 
  Plus, 
  RefreshCw, 
  CheckCircle,
  XCircle,
  AlertTriangle,
  Download,
  Upload,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Shield,
  Activity,
  TrendingUp,
  Users,
  Package,
  Zap,
  Target,
  BarChart3,
  Clock,
  CheckSquare,
  XSquare,
  Wifi,
  WifiOff,
  Signal,
  SignalHigh,
  SignalMedium,
  SignalLow,
  X
} from "lucide-react";

interface RFIDTag {
  tag_id: string;
  item_id: string;
  item_name: string;
  generated_at: string;
  checksum: string;
  status: "active" | "inactive" | "lost" | "damaged";
  last_scan?: string;
  location?: string;
  battery_level?: number;
  signal_strength?: "high" | "medium" | "low" | "none";
}

interface MedicalSupply {
  id: string;
  name: string;
  current_stock: number;
  threshold_quantity: number;
  expiry_date: string | null;
  supplier_id: string;
  supplier_name: string;
  unit: string;
  status: "low_stock" | "normal";
  rfid_tag?: string;
}

const RFIDDashboard: React.FC = () => {
  const [rfidTags, setRfidTags] = useState<RFIDTag[]>([]);
  const [supplies, setSupplies] = useState<MedicalSupply[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  const [isAssigning, setIsAssigning] = useState(false);
  const [assignmentMessage, setAssignmentMessage] = useState("");
  const [selectedTag, setSelectedTag] = useState<RFIDTag | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(false);
  const [quickActionMessage, setQuickActionMessage] = useState("");
  const [isPerformingQuickAction, setIsPerformingQuickAction] = useState(false);

  useEffect(() => {
    fetchRFIDData();
    loadAnalyticsData();
  }, []);

  const fetchRFIDData = async () => {
    try {
      setLoading(true);
      
      // Fetch RFID tags and supplies data
      const [rfidRes, suppliesRes] = await Promise.all([
        fetch(API_ENDPOINTS.RFID_TAGS),
        fetch(API_ENDPOINTS.INVENTORY_SUPPLIES)
      ]);

      if (rfidRes.ok) {
        const rfidData = await rfidRes.json();
        setRfidTags(rfidData);
      }

      if (suppliesRes.ok) {
        const suppliesData = await suppliesRes.json();
        setSupplies(suppliesData);
      }
    } catch (error) {
      console.error("Error fetching RFID data:", error);
    } finally {
      setLoading(false);
    }
  };

  const assignRFIDTags = async () => {
    try {
      setIsAssigning(true);
      setAssignmentMessage("");
      const response = await fetch(API_ENDPOINTS.RFID_ASSIGN, {
        method: "POST"
      });
      
      if (response.ok) {
        const result = await response.json();
        setAssignmentMessage(`✅ Successfully assigned ${result.assigned} RFID tags!`);
        await fetchRFIDData(); // Refresh data
        
        // Clear message after 3 seconds
        setTimeout(() => setAssignmentMessage(""), 3000);
      } else {
        setAssignmentMessage("❌ Failed to assign RFID tags");
        setTimeout(() => setAssignmentMessage(""), 3000);
      }
    } catch (error) {
      console.error("Error assigning RFID tags:", error);
      setAssignmentMessage("❌ Error assigning RFID tags");
      setTimeout(() => setAssignmentMessage(""), 3000);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleViewTag = (tag: RFIDTag) => {
    setSelectedTag(tag);
    setIsViewModalOpen(true);
  };

  const handleEditTag = (tag: RFIDTag) => {
    setSelectedTag(tag);
    setIsEditModalOpen(true);
  };

  const handleUpdateTag = async (updatedTag: RFIDTag) => {
    try {
              const response = await fetch(API_ENDPOINTS.RFID_TAG_UPDATE(updatedTag.tag_id), {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTag),
      });
      
      if (response.ok) {
        await fetchRFIDData(); // Refresh data
        setIsEditModalOpen(false);
        setSelectedTag(null);
      } else {
        console.error("Failed to update RFID tag");
      }
    } catch (error) {
      console.error("Error updating RFID tag:", error);
    }
  };

  const exportRFIDData = async () => {
    try {
      setIsExporting(true);
      
      // Create PDF content using jsPDF
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text('RFID Management Report', 20, 20);
      
      // Add date
      doc.setFontSize(12);
      doc.text(`Generated on: ${new Date().toLocaleString()}`, 20, 30);
      
      // Add summary
      doc.setFontSize(14);
      doc.text('Summary', 20, 45);
      doc.setFontSize(10);
      doc.text(`Total RFID Tags: ${rfidTags.length}`, 20, 55);
      doc.text(`Active Tags: ${rfidTags.filter(t => t.status === 'active').length}`, 20, 65);
      doc.text(`Lost Tags: ${rfidTags.filter(t => t.status === 'lost').length}`, 20, 75);
      doc.text(`Damaged Tags: ${rfidTags.filter(t => t.status === 'damaged').length}`, 20, 85);
      doc.text(`Coverage Rate: ${((supplies.filter(s => s.rfid_tag).length / supplies.length) * 100).toFixed(1)}%`, 20, 95);
      
      // Add detailed table
      doc.setFontSize(14);
      doc.text('RFID Tags Details', 20, 115);
      
      let yPosition = 125;
      rfidTags.forEach((tag, index) => {
        if (yPosition > 250) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(10);
        doc.text(`${index + 1}. ${tag.item_name}`, 20, yPosition);
        doc.setFontSize(8);
        doc.text(`Tag ID: ${tag.tag_id}`, 25, yPosition + 5);
        doc.text(`Status: ${tag.status}`, 25, yPosition + 10);
        doc.text(`Generated: ${new Date(tag.generated_at).toLocaleDateString()}`, 25, yPosition + 15);
        
        yPosition += 25;
      });
      
      // Save PDF
      doc.save(`rfid_report_${new Date().toISOString().split('T')[0]}.pdf`);
      
    } catch (error) {
      console.error("Error exporting RFID data:", error);
    } finally {
      setIsExporting(false);
    }
  };

  const performQuickAction = async (action: string) => {
    try {
      setIsPerformingQuickAction(true);
      setQuickActionMessage("");
      
      switch (action) {
        case 'assign_all':
          const response = await fetch(API_ENDPOINTS.RFID_ASSIGN, {
            method: "POST"
          });
          if (response.ok) {
            const result = await response.json();
            setQuickActionMessage(`✅ Successfully assigned ${result.assigned} RFID tags!`);
            await fetchRFIDData();
          } else {
            setQuickActionMessage("❌ Failed to assign RFID tags");
          }
          break;
          
        case 'validate_all':
          const validateResponse = await fetch(API_ENDPOINTS.RFID_VALIDATE, {
            method: "POST"
          });
          if (validateResponse.ok) {
            const validateResult = await validateResponse.json();
            setQuickActionMessage(`✅ Validated ${validateResult.validated} RFID tags!`);
          } else {
            setQuickActionMessage("❌ Failed to validate RFID tags");
          }
          break;
          
        case 'refresh_all':
          await fetchRFIDData();
          await loadAnalyticsData();
          setQuickActionMessage("✅ All data refreshed successfully!");
          break;
          
        case 'export_report':
          await exportRFIDData();
          setQuickActionMessage("✅ Report exported successfully!");
          break;
          
        default:
          setQuickActionMessage("❌ Unknown action");
      }
      
      // Clear message after 3 seconds
      setTimeout(() => {
        setQuickActionMessage("");
      }, 3000);
      
    } catch (error) {
      console.error("Error performing quick action:", error);
      setQuickActionMessage("❌ Error performing action");
    } finally {
      setIsPerformingQuickAction(false);
    }
  };

  const loadAnalyticsData = async () => {
    try {
      setIsLoadingAnalytics(true);
      
      // Fetch analytics data from backend
      const response = await fetch(API_ENDPOINTS.RFID_STATISTICS);
      
      if (response.ok) {
        const data = await response.json();
        setAnalyticsData(data);
      } else {
        console.error("Failed to load analytics data");
      }
    } catch (error) {
      console.error("Error loading analytics data:", error);
    } finally {
      setIsLoadingAnalytics(false);
    }
  };

  const getAnalyticsInsights = () => {
    if (!analyticsData) return null;
    
    const totalTags = rfidTags.length;
    const activeTags = rfidTags.filter(t => t.status === 'active').length;
    const lostTags = rfidTags.filter(t => t.status === 'lost').length;
    const damagedTags = rfidTags.filter(t => t.status === 'damaged').length;
    const inactiveTags = rfidTags.filter(t => t.status === 'inactive').length;
    
    const coveragePercentage = supplies.length > 0 ? ((supplies.filter(s => s.rfid_tag).length / supplies.length) * 100).toFixed(1) : '0';
    
    return {
      totalTags,
      activeTags,
      lostTags,
      damagedTags,
      inactiveTags,
      coveragePercentage,
      totalSupplies: supplies.length,
      suppliesWithRFID: supplies.filter(s => s.rfid_tag).length,
      suppliesWithoutRFID: suppliesWithoutRFID.length
    };
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { color: "bg-green-100 text-green-800 border-green-200", icon: CheckCircle },
      inactive: { color: "bg-gray-100 text-gray-800 border-gray-200", icon: XCircle },
      lost: { color: "bg-red-100 text-red-800 border-red-200", icon: AlertTriangle },
      damaged: { color: "bg-orange-100 text-orange-800 border-orange-200", icon: AlertTriangle }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    const Icon = config.icon;

    return (
      <Badge className={`${config.color} border`}>
        <Icon className="w-3 h-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getSignalStrengthIcon = (strength: string) => {
    const iconConfig = {
      high: { icon: SignalHigh, color: "text-green-600" },
      medium: { icon: SignalMedium, color: "text-yellow-600" },
      low: { icon: SignalLow, color: "text-orange-600" },
      none: { icon: WifiOff, color: "text-red-600" }
    };

    const config = iconConfig[strength as keyof typeof iconConfig] || iconConfig.none;
    const Icon = config.icon;

    return <Icon className={`w-4 h-4 ${config.color}`} />;
  };

  const filteredRFIDTags = rfidTags.filter(tag =>
    tag.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tag.tag_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const suppliesWithoutRFID = supplies.filter(supply => !supply.rfid_tag);
  const activeRFIDTags = rfidTags.filter(tag => tag.status === "active");
  const lostRFIDTags = rfidTags.filter(tag => tag.status === "lost");

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center space-y-6">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/40 rounded-full blur-xl animate-pulse"></div>
            <RefreshCw className="w-16 h-16 animate-spin text-blue-600 relative z-10" />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-xl font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Loading RFID Data
            </h3>
            <p className="text-muted-foreground">Please wait while we fetch the latest RFID information...</p>
            <div className="flex space-x-1 justify-center mt-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8 space-y-8">
        {/* Header Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-3xl opacity-10"></div>
          <div className="relative bg-white/80 backdrop-blur-sm rounded-3xl p-8 border border-white/20 shadow-xl">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
                    <Radio className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      RFID Management
                    </h1>
                    <p className="text-lg text-muted-foreground">
                      Track and manage RFID tags for medical supplies
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                <Button 
                  onClick={fetchRFIDData} 
                  variant="outline" 
                  className="bg-white/50 backdrop-blur-sm border-blue-200 hover:bg-blue-50"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
                <Button 
                  onClick={assignRFIDTags} 
                  disabled={isAssigning}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg"
                >
                  {isAssigning ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Assign RFID Tags
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Assignment Message */}
        {assignmentMessage && (
          <div className="relative">
            <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-xl p-4 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-green-500 rounded-full">
                  <CheckCircle className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="text-green-800 font-medium">{assignmentMessage}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-xl hover:scale-105 transition-all duration-300 cursor-pointer group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200 rounded-full -translate-y-16 translate-x-16 opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <CardTitle className="text-blue-700 group-hover:text-blue-800 transition-colors">Total RFID Tags</CardTitle>
                <div className="p-3 bg-blue-500 rounded-xl group-hover:bg-blue-600 transition-colors">
                  <Radio className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-blue-800 group-hover:text-blue-900 transition-colors">{rfidTags.length}</div>
              <div className="flex items-center space-x-2 mt-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm text-blue-600 group-hover:text-blue-700 transition-colors">
                  {activeRFIDTags.length} active
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-green-200 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <CardTitle className="text-green-700">Active Tags</CardTitle>
                <div className="p-3 bg-green-500 rounded-xl">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-green-800">{activeRFIDTags.length}</div>
              <div className="flex items-center space-x-2 mt-2">
                <TrendingUp className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-green-600">
                  {((activeRFIDTags.length / rfidTags.length) * 100).toFixed(1)}% of total
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200 hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <CardTitle className="text-orange-700">Supplies Without RFID</CardTitle>
                <div className="p-3 bg-orange-500 rounded-xl">
                  <Package className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-orange-800">{suppliesWithoutRFID.length}</div>
              <div className="flex items-center space-x-2 mt-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-orange-600">
                  Need RFID assignment
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-lg transition-all duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-200 rounded-full -translate-y-16 translate-x-16 opacity-20"></div>
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <CardTitle className="text-red-700">Lost Tags</CardTitle>
                <div className="p-3 bg-red-500 rounded-xl">
                  <XCircle className="w-6 h-6 text-white" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              <div className="text-3xl font-bold text-red-800">{lostRFIDTags.length}</div>
              <div className="flex items-center space-x-2 mt-2">
                <Activity className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-red-600">
                  Require attention
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="px-6 py-4">
                <TabsList className="grid w-full grid-cols-4 bg-white/50 backdrop-blur-sm">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                    Overview
                  </TabsTrigger>
                  <TabsTrigger value="tags" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                    RFID Tags
                  </TabsTrigger>
                  <TabsTrigger value="supplies" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                    Supplies
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
                    Analytics
                  </TabsTrigger>
                </TabsList>
              </div>
            </div>

            <TabsContent value="overview" className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* RFID Status Overview */}
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-blue-700">
                      <Radio className="w-5 h-5" />
                      <span>RFID Status Overview</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                          <span className="font-medium">Active Tags</span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-green-600">{activeRFIDTags.length}</div>
                          <div className="text-sm text-muted-foreground">
                            {((activeRFIDTags.length / rfidTags.length) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <XCircle className="w-5 h-5 text-red-600" />
                          <span className="font-medium">Lost/Damaged</span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-red-600">{lostRFIDTags.length}</div>
                          <div className="text-sm text-muted-foreground">
                            {((lostRFIDTags.length / rfidTags.length) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <Package className="w-5 h-5 text-orange-600" />
                          <span className="font-medium">Unassigned Supplies</span>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-semibold text-orange-600">{suppliesWithoutRFID.length}</div>
                          <div className="text-sm text-muted-foreground">
                            {((suppliesWithoutRFID.length / supplies.length) * 100).toFixed(1)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Recent Activity */}
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-purple-700">
                      <Activity className="w-5 h-5" />
                      <span>Recent RFID Activity</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {rfidTags.slice(0, 5).map((tag) => (
                        <div key={tag.tag_id} className="flex items-center justify-between p-3 bg-white/50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-full ${
                              tag.status === 'active' ? 'bg-green-500' : 
                              tag.status === 'lost' ? 'bg-red-500' : 
                              tag.status === 'damaged' ? 'bg-orange-500' : 'bg-gray-500'
                            }`}></div>
                            <div>
                              <div className="font-medium">{tag.item_name}</div>
                              <div className="text-sm text-muted-foreground">{tag.tag_id}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{tag.status}</div>
                            <div className="text-xs text-muted-foreground">
                              {new Date(tag.generated_at).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-700">Quick Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Button 
                      onClick={assignRFIDTags}
                      disabled={isAssigning}
                      className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
                    >
                      {isAssigning ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Assigning...
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4 mr-2" />
                          Assign New RFID Tags
                        </>
                      )}
                    </Button>
                    <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-50">
                      <Download className="w-4 h-4 mr-2" />
                      Export RFID Report
                    </Button>
                    <Button variant="outline" className="border-purple-300 text-purple-700 hover:bg-purple-50">
                      <BarChart3 className="w-4 h-4 mr-2" />
                      View Analytics
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tags" className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search RFID tags..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <Button variant="outline" className="flex items-center space-x-2">
                    <Filter className="w-4 h-4" />
                    <span>Filter</span>
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={exportRFIDData} 
                    disabled={isExporting || rfidTags.length === 0}
                    variant="outline"
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                  >
                    {isExporting ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Export Data
                      </>
                    )}
                  </Button>
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Add RFID Tag
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRFIDTags.map((tag) => (
                  <Card key={tag.tag_id} className="hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{tag.item_name}</CardTitle>
                        {getStatusBadge(tag.status)}
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">RFID Tag</span>
                          <span className="font-mono text-xs">{tag.tag_id}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Item ID</span>
                          <span className="font-semibold">{tag.item_id}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Generated</span>
                          <span className="font-medium">{new Date(tag.generated_at).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className="pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Signal</span>
                          <div className="flex items-center space-x-1">
                            {getSignalStrengthIcon(tag.signal_strength || 'none')}
                            <span className="text-xs">{tag.signal_strength || 'none'}</span>
                          </div>
                        </div>
                        {tag.battery_level && (
                          <div className="flex items-center justify-between text-sm mt-1">
                            <span className="text-muted-foreground">Battery</span>
                            <div className="flex items-center space-x-2">
                              <Progress value={tag.battery_level} className="w-16 h-2" />
                              <span className="text-xs">{tag.battery_level}%</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2 pt-3">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 hover:bg-blue-50 hover:border-blue-300"
                          onClick={() => handleViewTag(tag)}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 hover:bg-green-50 hover:border-green-300"
                          onClick={() => handleEditTag(tag)}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="supplies" className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Medical Supplies</h3>
                  <p className="text-muted-foreground">Manage RFID assignments for medical supplies</p>
                </div>
                <Button onClick={assignRFIDTags} disabled={isAssigning} className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                  {isAssigning ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Assigning...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Assign RFID Tags
                    </>
                  )}
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {supplies.map((supply) => (
                  <Card key={supply.id} className="hover:shadow-lg transition-all duration-300">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">{supply.name}</CardTitle>
                        <Badge variant={supply.rfid_tag ? "default" : "destructive"}>
                          {supply.rfid_tag ? "Has RFID" : "No RFID"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Current Stock</span>
                          <span className="font-semibold">{supply.current_stock} {supply.unit}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Threshold</span>
                          <span className="font-semibold">{supply.threshold_quantity} {supply.unit}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Supplier</span>
                          <span className="font-medium">{supply.supplier_name}</span>
                        </div>
                      </div>
                      
                      {supply.rfid_tag && (
                        <div className="pt-3 border-t border-gray-100">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">RFID Tag</span>
                            <span className="font-mono text-xs">{supply.rfid_tag}</span>
                          </div>
                        </div>
                      )}

                      <div className="flex space-x-2 pt-3">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 hover:bg-blue-50 hover:border-blue-300"
                          onClick={() => {
                            const tag = rfidTags.find(t => t.item_id === supply.id);
                            if (tag) handleViewTag(tag);
                          }}
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="flex-1 hover:bg-green-50 hover:border-green-300"
                          onClick={() => {
                            const tag = rfidTags.find(t => t.item_id === supply.id);
                            if (tag) handleEditTag(tag);
                          }}
                        >
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="p-6 space-y-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold">RFID Analytics Dashboard</h3>
                  <p className="text-muted-foreground">Comprehensive analytics and insights for RFID management</p>
                </div>
                <div className="flex space-x-2">
                  <Button 
                    onClick={loadAnalyticsData} 
                    disabled={isLoadingAnalytics}
                    variant="outline"
                    className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700"
                  >
                    {isLoadingAnalytics ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <BarChart3 className="w-4 h-4 mr-2" />
                        Refresh Analytics
                      </>
                    )}
                  </Button>
                  <Button 
                    onClick={exportRFIDData} 
                    disabled={isExporting || rfidTags.length === 0}
                    variant="outline"
                    className="bg-gradient-to-r from-green-500 to-emerald-600 text-white hover:from-green-600 hover:to-emerald-700"
                  >
                    {isExporting ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      <>
                        <Download className="w-4 h-4 mr-2" />
                        Export Analytics
                      </>
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* RFID Coverage */}
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-blue-700">
                      <Target className="w-5 h-5" />
                      <span>RFID Coverage</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Total Supplies</span>
                        <span className="text-lg font-bold">{supplies.length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">With RFID Tags</span>
                        <span className="text-lg font-bold text-green-600">{supplies.filter(s => s.rfid_tag).length}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Without RFID Tags</span>
                        <span className="text-lg font-bold text-orange-600">{suppliesWithoutRFID.length}</span>
                      </div>
                      <div className="pt-2">
                        <Progress 
                          value={((supplies.filter(s => s.rfid_tag).length / supplies.length) * 100)} 
                          className="h-3"
                        />
                        <div className="text-center text-sm text-muted-foreground mt-1">
                          {((supplies.filter(s => s.rfid_tag).length / supplies.length) * 100).toFixed(1)}% Coverage
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* RFID Status Distribution */}
                <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2 text-purple-700">
                      <BarChart3 className="w-5 h-5" />
                      <span>RFID Status Distribution</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-2 bg-white/50 rounded">
                        <div className="flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm">Active</span>
                        </div>
                        <span className="font-semibold">{activeRFIDTags.length}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white/50 rounded">
                        <div className="flex items-center space-x-2">
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="text-sm">Lost</span>
                        </div>
                        <span className="font-semibold">{lostRFIDTags.length}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white/50 rounded">
                        <div className="flex items-center space-x-2">
                          <AlertTriangle className="w-4 h-4 text-orange-600" />
                          <span className="text-sm">Damaged</span>
                        </div>
                        <span className="font-semibold">{rfidTags.filter(t => t.status === 'damaged').length}</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-white/50 rounded">
                        <div className="flex items-center space-x-2">
                          <XSquare className="w-4 h-4 text-gray-600" />
                          <span className="text-sm">Inactive</span>
                        </div>
                        <span className="font-semibold">{rfidTags.filter(t => t.status === 'inactive').length}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Analytics Insights */}
              <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-indigo-700">
                    <TrendingUp className="w-5 h-5" />
                    <span>Analytics Insights</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {(() => {
                      const insights = getAnalyticsInsights();
                      if (!insights) return null;
                      
                      return (
                        <>
                          <div className="bg-white/50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-indigo-600">{insights.totalTags}</div>
                            <div className="text-sm text-indigo-700">Total RFID Tags</div>
                          </div>
                          <div className="bg-white/50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">{insights.activeTags}</div>
                            <div className="text-sm text-green-700">Active Tags</div>
                          </div>
                          <div className="bg-white/50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-red-600">{insights.lostTags}</div>
                            <div className="text-sm text-red-700">Lost Tags</div>
                          </div>
                          <div className="bg-white/50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-orange-600">{insights.damagedTags}</div>
                            <div className="text-sm text-orange-700">Damaged Tags</div>
                          </div>
                          <div className="bg-white/50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-blue-600">{insights.totalSupplies}</div>
                            <div className="text-sm text-blue-700">Total Supplies</div>
                          </div>
                          <div className="bg-white/50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-green-600">{insights.suppliesWithRFID}</div>
                            <div className="text-sm text-green-700">With RFID</div>
                          </div>
                          <div className="bg-white/50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-orange-600">{insights.suppliesWithoutRFID}</div>
                            <div className="text-sm text-orange-700">Without RFID</div>
                          </div>
                          <div className="bg-white/50 rounded-lg p-4 text-center">
                            <div className="text-2xl font-bold text-purple-600">{insights.coveragePercentage}%</div>
                            <div className="text-sm text-purple-700">Coverage Rate</div>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Activity Timeline */}
              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2 text-green-700">
                    <Activity className="w-5 h-5" />
                    <span>Recent RFID Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {rfidTags.slice(0, 10).map((tag, index) => (
                      <div key={tag.tag_id} className="flex items-center space-x-4 p-3 bg-white/50 rounded-lg">
                        <div className="flex-shrink-0">
                          <div className={`w-3 h-3 rounded-full ${
                            tag.status === 'active' ? 'bg-green-500' : 
                            tag.status === 'lost' ? 'bg-red-500' : 
                            tag.status === 'damaged' ? 'bg-orange-500' : 'bg-gray-500'
                          }`}></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{tag.item_name}</p>
                          <p className="text-sm text-gray-500">{tag.tag_id}</p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <p className="text-sm text-gray-900">{tag.status}</p>
                          <p className="text-sm text-gray-500">
                            {new Date(tag.generated_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </Card>
      </div>

      {/* View RFID Tag Modal */}
      {isViewModalOpen && selectedTag && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">RFID Tag Details</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsViewModalOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Item Name</label>
                <p className="text-sm text-gray-900 mt-1">{selectedTag.item_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">RFID Tag ID</label>
                <p className="text-sm font-mono text-gray-900 mt-1">{selectedTag.tag_id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <div className="mt-1">{getStatusBadge(selectedTag.status)}</div>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Generated</label>
                <p className="text-sm text-gray-900 mt-1">
                  {new Date(selectedTag.generated_at).toLocaleString()}
                </p>
              </div>
              {selectedTag.last_scan && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Last Scan</label>
                  <p className="text-sm text-gray-900 mt-1">
                    {new Date(selectedTag.last_scan).toLocaleString()}
                  </p>
                </div>
              )}
              {selectedTag.location && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Location</label>
                  <p className="text-sm text-gray-900 mt-1">{selectedTag.location}</p>
                </div>
              )}
              {selectedTag.battery_level && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Battery Level</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Progress value={selectedTag.battery_level} className="w-20 h-2" />
                    <span className="text-sm text-gray-900">{selectedTag.battery_level}%</span>
                  </div>
                </div>
              )}
              {selectedTag.signal_strength && (
                <div>
                  <label className="text-sm font-medium text-gray-700">Signal Strength</label>
                  <div className="flex items-center space-x-2 mt-1">
                    {getSignalStrengthIcon(selectedTag.signal_strength)}
                    <span className="text-sm text-gray-900">{selectedTag.signal_strength}</span>
                  </div>
                </div>
              )}
            </div>
            <div className="flex justify-end mt-6">
              <Button onClick={() => setIsViewModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Edit RFID Tag Modal */}
      {isEditModalOpen && selectedTag && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Edit RFID Tag</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditModalOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Item Name</label>
                <p className="text-sm text-gray-900 mt-1">{selectedTag.item_name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">RFID Tag ID</label>
                <p className="text-sm font-mono text-gray-900 mt-1">{selectedTag.tag_id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Status</label>
                <select 
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                  value={selectedTag.status}
                  onChange={(e) => setSelectedTag({...selectedTag, status: e.target.value as any})}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="lost">Lost</option>
                  <option value="damaged">Damaged</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Location</label>
                <input
                  type="text"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                  value={selectedTag.location || ''}
                  onChange={(e) => setSelectedTag({...selectedTag, location: e.target.value})}
                  placeholder="Enter location"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Battery Level (%)</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                  value={selectedTag.battery_level || ''}
                  onChange={(e) => setSelectedTag({...selectedTag, battery_level: parseInt(e.target.value) || undefined})}
                  placeholder="0-100"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Signal Strength</label>
                <select 
                  className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                  value={selectedTag.signal_strength || 'none'}
                  onChange={(e) => setSelectedTag({...selectedTag, signal_strength: e.target.value as any})}
                >
                  <option value="none">None</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => handleUpdateTag(selectedTag)}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RFIDDashboard;
