
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { FloLogo } from "@/components/FloLogo";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Calendar, 
  SearchCheck, 
  Shield, 
  ChevronRight,
  LogOut,
  Apple,
  Target,
  UserCheck
} from "lucide-react";

interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;
}

export const MobileSidebar = ({ open, onClose }: MobileSidebarProps) => {
  const { user, logout } = useAuth();
  
  const handleLogout = () => {
    logout();
    onClose();
  };
  
  const navigationItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      name: "Dietary Plan",
      path: "/dietary-plan",
      icon: <Apple className="h-5 w-5" />
    },
    {
      name: "Health Goals",
      path: "/health-goals",
      icon: <Target className="h-5 w-5" />
    },
    {
      name: "Health Profile",
      path: "/health-profile",
      icon: <UserCheck className="h-5 w-5" />
    },
    {
      name: "Appointments",
      path: "/appointments",
      icon: <Calendar className="h-5 w-5" />
    },
    {
      name: "Find Expert",
      path: "/find-expert",
      icon: <SearchCheck className="h-5 w-5" />
    },
    {
      name: "Insurance",
      path: "/insurance",
      icon: <Shield className="h-5 w-5" />
    }
  ];

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="p-0 border-r w-[280px]">
        <div className="flex flex-col h-full">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="flex items-center gap-2">
              <FloLogo className="w-8 h-8" />
              <span className="font-bold text-xl neon-text">
                Health AI<span className="text-primary">.</span>
              </span>
            </SheetTitle>
          </SheetHeader>
          
          <div className="flex-1 py-2">
            <div className="px-2 py-4">
              {user && (
                <div className="px-4 py-2 mb-4">
                  <p className="text-sm font-medium">Logged in as:</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              )}
              
              <nav className="space-y-1">
                {navigationItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onClose}
                    className={({ isActive }) => 
                      `flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                        isActive 
                          ? "bg-primary/10 text-primary" 
                          : "text-foreground hover:bg-muted"
                      }`
                    }
                  >
                    {item.icon}
                    <span className="ml-3">{item.name}</span>
                    <ChevronRight className="ml-auto h-4 w-4 opacity-50" />
                  </NavLink>
                ))}
              </nav>
            </div>
          </div>
          
          <div className="p-4 border-t">
            <Button 
              variant="outline" 
              className="w-full justify-start" 
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};
