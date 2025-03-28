
import { useState } from "react";
import { FloLogo } from "@/components/FloLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Bell, MessageCircle, User, Search, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { ChatInterface } from "@/components/ChatInterface";

interface NavigationBarProps {
  showSidebarTrigger?: boolean;
  onSidebarToggle?: () => void;
  isSidebarOpen?: boolean;
}

export function NavigationBar({ 
  showSidebarTrigger = false, 
  onSidebarToggle,
  isSidebarOpen = false
}: NavigationBarProps) {
  const [searchOpen, setSearchOpen] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const handleNotification = () => {
    toast({
      title: "Notifications",
      description: "You have no new notifications.",
    });
  };

  const handleProfileClick = () => {
    if (user?.role === "admin") {
      navigate("/admin");
    } else {
      navigate("/profile");
    }
  };

  return (
    <header className="bg-background/80 backdrop-blur-md sticky top-0 z-10 border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          {showSidebarTrigger && (
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full mr-2"
              onClick={onSidebarToggle}
            >
              {isSidebarOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          )}
          
          <FloLogo className="w-12 h-12 mr-3" />
          <span className="font-bold text-xl hidden md:inline-block neon-text">
            Health AI<span className="text-primary">.</span>
          </span>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex items-center space-x-6 text-sm">
          <a href="/" className="font-medium hover:text-primary transition-colors">
            Dashboard
          </a>
          <a href="/appointments" className="font-medium hover:text-primary transition-colors">
            Appointments
          </a>
          <a href="/find-doctor" className="font-medium hover:text-primary transition-colors">
            Find Doctor
          </a>
          <a href="/insurance" className="font-medium hover:text-primary transition-colors">
            Insurance
          </a>
        </nav>

        <div className="flex items-center gap-2">
          {searchOpen ? (
            <div className="relative flex items-center">
              <Input
                placeholder="Search..."
                className="w-[200px] rounded-full pr-8"
                autoFocus
                onBlur={() => setSearchOpen(false)}
              />
              <Search className="absolute right-2 h-4 w-4 text-muted-foreground" />
            </div>
          ) : (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSearchOpen(true)}
              className="rounded-full"
            >
              <Search className="h-5 w-5" />
            </Button>
          )}
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleNotification}
            className="rounded-full"
          >
            <Bell className="h-5 w-5" />
          </Button>
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <MessageCircle className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-[400px] p-0">
              <div className="h-full flex flex-col">
                <ChatInterface />
              </div>
            </SheetContent>
          </Sheet>
          
          <ThemeToggle />
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="rounded-full"
            onClick={handleProfileClick}
          >
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
}
