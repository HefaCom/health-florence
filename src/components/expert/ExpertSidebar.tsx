import { NavLink, useNavigate } from "react-router-dom";
import { FloLogo } from "@/components/FloLogo";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useExpertSidebar } from "./ExpertSidebarContext";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  LayoutDashboard,
  Users,
  Calendar,
  FileText,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  Activity,
  MessageSquare,
  BarChart3,
  Shield,
  Bot
} from "lucide-react";

export const ExpertSidebar = () => {
  const { isCollapsed, setIsCollapsed } = useExpertSidebar();
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const navigationItems = [
    {
      name: "Dashboard",
      path: "/expert/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      name: "Florence AI",
      path: "/expert/dashboard/florence",
      icon: <Bot className="h-5 w-5" />
    },
    {
      name: "Patients",
      path: "/expert/dashboard/patients",
      icon: <Users className="h-5 w-5" />
    },
    {
      name: "Appointments",
      path: "/expert/dashboard/appointments",
      icon: <Calendar className="h-5 w-5" />
    },
    {
      name: "Medical Records",
      path: "/expert/dashboard/records",
      icon: <FileText className="h-5 w-5" />
    },
    {
      name: "Consultations",
      path: "/expert/dashboard/consultations",
      icon: <Stethoscope className="h-5 w-5" />
    },
    {
      name: "Health Analytics",
      path: "/expert/dashboard/analytics",
      icon: <BarChart3 className="h-5 w-5" />
    },
    {
      name: "Messages",
      path: "/expert/dashboard/messages",
      icon: <MessageSquare className="h-5 w-5" />
    },
    {
      name: "Activity Log",
      path: "/expert/dashboard/activity",
      icon: <Activity className="h-5 w-5" />
    }
  ];

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} border-r bg-white shadow-lg hidden md:flex flex-col h-full transition-all duration-300 relative overflow-y-auto`}>
      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="sm"
        className="absolute -right-3 top-6 w-6 h-6 rounded-full bg-white border shadow-md hover:bg-gray-50 z-10"
        onClick={() => setIsCollapsed(!isCollapsed)}
      >
        {isCollapsed ? (
          <ChevronRight className="h-3 w-3" />
        ) : (
          <ChevronLeft className="h-3 w-3" />
        )}
      </Button>

      {/* Header */}
      <div className={`p-4 flex items-center ${isCollapsed ? 'justify-center' : ''}`}>
        <FloLogo className="w-10 h-10 mr-2" />
        {!isCollapsed && (
          <div>
            <h2 className="font-bold text-lg text-gray-900">Expert Portal</h2>
            <p className="text-xs text-gray-500">Healthcare Professional</p>
          </div>
        )}
      </div>
      
      <Separator />
      
      {/* User Info */}
      <div className={`px-4 py-3 ${isCollapsed ? 'px-2' : ''}`}>
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
            <Shield className="h-5 w-5 text-blue-600" />
          </div>
          {!isCollapsed && (
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">Dr. Sarah Johnson</p>
              <p className="text-xs text-gray-500">Cardiologist</p>
              <Badge variant="secondary" className="text-xs mt-1">
                Verified
              </Badge>
            </div>
          )}
        </div>
      </div>
      
      <Separator className="mb-2" />
      
      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-2">
        <nav className="space-y-1 px-2">
          {navigationItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center ${isCollapsed ? 'justify-center px-2' : 'px-3'} py-3 text-sm font-medium rounded-lg transition-colors group relative ${
                  isActive 
                    ? "bg-blue-50 text-blue-700 border border-blue-200" 
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
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
      
      {/* Footer */}
      <div className={`border-t bg-gray-50 ${isCollapsed ? 'p-2' : 'p-4'}`}>
        <Button 
          variant="outline" 
          className={`${isCollapsed ? 'w-full justify-center' : 'w-full justify-start'}`}
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">Sign Out</span>}
        </Button>
      </div>
    </div>
  );
}; 