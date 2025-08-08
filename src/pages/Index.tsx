import React, { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { InventoryTable } from "@/components/dashboard/InventoryTable";
import { BlockchainActivity } from "@/components/dashboard/BlockchainActivity";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import InventoryNav from "@/components/inventory/InventoryNav";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import heroImage from "@/assets/medical-hero.jpg";
import { 
  ArrowRight, 
  Shield, 
  Zap, 
  TrendingUp, 
  Activity, 
  CheckCircle, 
  Play,
  Star,
  Users,
  Package,
  Globe,
  Lock,
  BarChart3,
  Sparkles,
  Rocket,
  Target,
  Award,
  Clock,
  DollarSign
} from "lucide-react";

const Index = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 overflow-hidden">
      <Header />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-0 right-0 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-400 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        <div className="container mx-auto px-6 py-12 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className={`space-y-8 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <div className="space-y-4">
                <Badge className="bg-gradient-to-r from-blue-500 to-purple-600 text-white border-0 px-4 py-2 text-sm font-medium animate-pulse">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Next-Generation Healthcare
                </Badge>
                <h1 className="text-5xl lg:text-7xl font-bold">
                  <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                    Blockchain-Powered
                  </span>
                  <span className="block text-4xl lg:text-6xl font-bold text-gray-800 mt-2">
                    Medical Inventory
                  </span>
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                  Secure, transparent, and automated inventory management for healthcare facilities. 
                  Every transaction recorded on the blockchain for complete audit trails.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105 group"
                >
                  Get Started
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="border-2 border-blue-300 text-blue-700 hover:bg-blue-50 px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Watch Demo
                </Button>
              </div>

              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-3 px-4 py-2 bg-green-100 text-green-700 rounded-full border border-green-200">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium">Blockchain Connected</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-blue-100 text-blue-700 rounded-full border border-blue-200">
                  <Package className="w-4 h-4" />
                  <span className="text-sm font-medium">1,247 Items Tracked</span>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-purple-100 text-purple-700 rounded-full border border-purple-200">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">100% Secure</span>
                </div>
              </div>
            </div>
            
            <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-95'}`}>
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
                <img 
                  src={heroImage} 
                  alt="Medical inventory management dashboard" 
                  className="relative rounded-3xl shadow-2xl max-w-full h-auto transform hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Why Choose MedChain?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Experience the future of healthcare inventory management with cutting-edge blockchain technology
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Shield,
                title: "Blockchain Security",
                description: "Every transaction is immutably recorded on the blockchain, ensuring complete transparency and audit trails.",
                color: "from-blue-500 to-blue-600"
              },
              {
                icon: Zap,
                title: "Real-time Alerts",
                description: "Instant notifications for low stock, expiring items, and critical inventory levels.",
                color: "from-purple-500 to-purple-600"
              },
              {
                icon: TrendingUp,
                title: "Smart Analytics",
                description: "AI-powered insights and predictive analytics to optimize inventory management.",
                color: "from-green-500 to-green-600"
              },
              {
                icon: Users,
                title: "Multi-role Access",
                description: "Role-based access control for administrators, managers, staff, and suppliers.",
                color: "from-orange-500 to-orange-600"
              },
              {
                icon: Globe,
                title: "Global Compliance",
                description: "Meet international healthcare standards and regulatory requirements.",
                color: "from-indigo-500 to-indigo-600"
              },
              {
                icon: Award,
                title: "Proven Excellence",
                description: "Trusted by leading healthcare facilities worldwide for reliable inventory management.",
                color: "from-pink-500 to-pink-600"
              }
            ].map((feature, index) => (
              <Card 
                key={index}
                className={`group hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer border-0 bg-white/80 backdrop-blur-sm ${
                  isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-10'
                }`}
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <CardHeader className="text-center">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature.color} rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-800">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "1,247", label: "Items Tracked", icon: Package },
              { number: "99.9%", label: "Uptime", icon: CheckCircle },
              { number: "24/7", label: "Support", icon: Clock },
              { number: "50+", label: "Healthcare Partners", icon: Users }
            ].map((stat, index) => (
              <div 
                key={index}
                className={`text-white ${isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-10'}`}
                style={{ animationDelay: `${index * 300}ms` }}
              >
                <div className="flex items-center justify-center mb-4">
                  <stat.icon className="w-8 h-8 text-white/80" />
                </div>
                <div className="text-4xl font-bold mb-2">{stat.number}</div>
                <div className="text-white/80">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Main Dashboard */}
      <main className="container mx-auto px-6 py-16">
        <div className="space-y-12">
          {/* Stats Overview */}
          <section className={`transition-all duration-1000 delay-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <h2 className="text-3xl font-bold text-gray-800 mb-8 text-center">Dashboard Overview</h2>
            <StatsGrid />
          </section>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Inventory & Alerts */}
            <div className="lg:col-span-2 space-y-8">
              <InventoryTable />
            </div>
            
            {/* Right Column - Activity & Alerts */}
            <div className="space-y-8">
              <AlertsPanel />
              <BlockchainActivity />
              <InventoryNav />
            </div>
          </div>
        </div>
      </main>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center text-white">
            <h2 className="text-4xl lg:text-5xl font-bold mb-6">
              Ready to Transform Your Healthcare Inventory?
            </h2>
            <p className="text-xl text-white/90 mb-8 max-w-3xl mx-auto">
              Join leading healthcare facilities worldwide in adopting blockchain-powered inventory management. 
              Experience the future of secure, transparent, and automated healthcare supply chain management.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-2xl hover:shadow-3xl transition-all duration-300 hover:scale-105"
              >
                <Rocket className="w-5 h-5 mr-2" />
                Start Free Trial
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg font-semibold transition-all duration-300 hover:scale-105"
              >
                <BarChart3 className="w-5 h-5 mr-2" />
                View Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-6">
              Trusted by Healthcare Leaders
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See what healthcare professionals are saying about MedChain
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Dr. Sarah Johnson",
                role: "Chief Medical Officer",
                hospital: "City General Hospital",
                content: "MedChain has revolutionized our inventory management. The blockchain transparency gives us complete confidence in our supply chain.",
                rating: 5
              },
              {
                name: "Michael Chen",
                role: "Hospital Administrator",
                hospital: "Regional Medical Center",
                content: "The automated alerts and real-time tracking have significantly reduced our stockouts and improved patient care.",
                rating: 5
              },
              {
                name: "Dr. Emily Rodriguez",
                role: "Director of Operations",
                hospital: "University Health System",
                content: "The AI-powered analytics help us predict demand accurately and optimize our inventory levels like never before.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <Card 
                key={index}
                className={`group hover:shadow-2xl transition-all duration-500 hover:scale-105 cursor-pointer border-0 bg-white/80 backdrop-blur-sm ${
                  isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-10'
                }`}
                style={{ animationDelay: `${index * 300}ms` }}
              >
                <CardContent className="p-8">
                  <div className="flex mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-6 italic">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold text-gray-800">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">{testimonial.role}</div>
                    <div className="text-sm text-blue-600">{testimonial.hospital}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;