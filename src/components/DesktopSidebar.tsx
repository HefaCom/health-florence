
import { NavLink } from "react-router-dom";
import { FloLogo } from "@/components/FloLogo";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSidebar } from "./DashboardLayout";
import {
  LayoutDashboard,
  Calendar,
  SearchCheck,
  Shield,
  LogOut,
  User,
  Apple,
  Target,
  UserCheck,
  ChevronLeft,
  ChevronRight
} from "lucide-react";

export const DesktopSidebar = () => {
  const { user, logout } = useAuth();
  const { isCollapsed, setIsCollapsed } = useSidebar();
  
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
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} border-r bg-card/80 backdrop-blur-sm shadow-lg hidden md:flex flex-col h-full transition-all duration-300 relative`}>
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-card border shadow-md hover:bg-muted z-10"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      {/* <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
        <FloLogo className="w-10 h-10 mr-2" />
        {!isCollapsed && (
          <span className="font-bold text-xl neon-text">
            Health AI<span className="text-primary">.</span>
          </span>
        )}
      </div> */}
      
      <Separator />
      
      {user && (
        <div className={`px-4 py-3 ${isCollapsed ? 'px-2' : ''}`}>
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            {!isCollapsed && (
              <div className="ml-3">
                <p className="text-sm font-medium truncate">Hello, {user.firstName} {user.lastName }!</p>
                <p className="text-xs text-muted-foreground capitalize">{user.role}</p>
              </div>
            )}  
          </div>
        </div>
      )}
      
      <Separator className="mb-2" />
      
      {/* Scrollable Navigation Area */}
      <div className="flex-1 overflow-y-auto py-2">
        <nav className="space-y-1 px-2">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-3'} py-3 text-sm font-medium rounded-lg transition-colors group relative ${
                  isActive 
                    ? "bg-primary/10 text-primary" 
                    : "text-foreground hover:bg-muted"
                }`
              }
              end
            >
              {item.icon}
              {!isCollapsed && <span className="ml-3">{item.name}</span>}
              
              {/* Tooltip for collapsed state */}
              {isCollapsed && (
                <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-50">
                  {item.name}
                </div>
              )}
            </NavLink>
          ))}
        </nav>
      </div>
      
      {/* Fixed Footer */}
      <div className={`border-t bg-card/50 ${isCollapsed ? 'p-2' : 'p-4'}`}>
        <Button 
          variant="outline" 
          className={`${isCollapsed ? 'w-full justify-center' : 'w-full justify-start'}`}
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Logout</span>}
        </Button>
      </div>
    </div>
  );
};
