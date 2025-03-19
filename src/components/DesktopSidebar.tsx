
import { NavLink } from "react-router-dom";
import { FloLogo } from "@/components/FloLogo";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  LayoutDashboard,
  Calendar,
  SearchCheck,
  Shield,
  LogOut,
  User
} from "lucide-react";

export const DesktopSidebar = () => {
  const { user, logout } = useAuth();
  
  const navigationItems = [
    {
      name: "Dashboard",
      path: "/",
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      name: "Appointments",
      path: "/appointments",
      icon: <Calendar className="h-5 w-5" />
    },
    {
      name: "Find Doctor",
      path: "/find-doctor",
      icon: <SearchCheck className="h-5 w-5" />
    },
    {
      name: "Insurance",
      path: "/insurance",
      icon: <Shield className="h-5 w-5" />
    }
  ];

  return (
    <div className="w-64 border-r bg-card/50 hidden md:flex flex-col h-[calc(100vh-100px)]">
      <div className="p-4 flex items-center">
        <FloLogo className="w-10 h-10 mr-2" />
        <span className="font-bold text-xl neon-text">
          Florence<span className="text-primary">.</span>
        </span>
      </div>
      
      <Separator />
      
      {user && (
        <div className="px-4 py-3">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium truncate">{user.email}</p>
              <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
            </div>
          </div>
        </div>
      )}
      
      <Separator className="mb-2" />
      
      <div className="flex-1 overflow-auto py-2">
        <nav className="space-y-1 px-2">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center px-3 py-3 text-sm font-medium rounded-lg transition-colors ${
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-foreground hover:bg-muted"
                }`
              }
              end
            >
              {item.icon}
              <span className="ml-3">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>
      
      <div className="p-4">
        <Button 
          variant="outline" 
          className="w-full justify-start" 
          onClick={logout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};
