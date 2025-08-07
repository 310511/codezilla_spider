import { Bell, Shield, User, Brain, TrendingUp, Pill, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export const Header = () => {
  return (
    <header className="border-b bg-card shadow-card h-16 flex items-center justify-between px-6">
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <Shield className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-xl font-bold text-foreground">MedChain</h1>
            <p className="text-xs text-muted-foreground">Inventory System</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <Link to="/infinite-memory">
          <Button variant="outline" className="font-semibold">
            <Brain className="h-4 w-4 mr-2" />
            Infinite Memory
          </Button>
        </Link>

        <Link to="/ml-predictions">
          <Button variant="outline" className="font-semibold">
            <TrendingUp className="h-4 w-4 mr-2" />
            ML Predictions
          </Button>
        </Link>

        <Link to="/medicine-recommendation">
          <Button variant="outline" className="font-semibold">
            <Pill className="h-4 w-4 mr-2" />
            Medicine AI
          </Button>
        </Link>

        <Link to="/inventory">
          <Button variant="outline" className="font-semibold">
            <Package className="h-4 w-4 mr-2" />
            Inventory
          </Button>
        </Link>
        
        <Link to="/marketplace">
          <Button variant="default" className="font-semibold">
            Marketplace 
          </Button>
        </Link>

        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute -top-1 -right-1 h-4 w-4 bg-destructive text-destructive-foreground text-xs rounded-full flex items-center justify-center">
            3
          </span>
        </Button>
        
        <Button variant="ghost" size="icon">
          <User className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
};