import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { ExpertSidebar } from "./ExpertSidebar";
import { ExpertSidebarProvider, useExpertSidebar } from "./ExpertSidebarContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  Bell, 
  Search, 
  Menu,
  User,
  Settings,
  LogOut,
  X,
  LayoutDashboard,
  Bot,
  Users,
  Calendar,
  FileText,
  Stethoscope,
  BarChart3,
  MessageSquare,
  Activity
} from "lucide-react";
import { NavLink } from "react-router-dom";

const ExpertLayoutContent = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { isCollapsed } = useExpertSidebar();
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close sidebar when switching to desktop view
  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

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
    <div className="min-h-screen flex bg-gray-50">
      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Fixed Sidebar for Desktop */}
      {!isMobile && (
        <div className="fixed left-0 top-0 h-full z-30">
          <ExpertSidebar />
        </div>
      )}

      {/* Mobile Sidebar */}
      {isMobile && (
        <div className={`fixed left-0 top-0 h-full z-50 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="w-80 h-full bg-white shadow-xl flex flex-col">
            {/* Mobile Header */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">F</span>
                  </div>
                  <div>
                    <h2 className="font-semibold text-lg text-gray-900">Expert Portal</h2>
                    <p className="text-sm text-gray-500">Healthcare Dashboard</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarOpen(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            {/* Mobile Navigation */}
            <div className="flex-1 overflow-y-auto p-4">
              <nav className="space-y-2">
                {[
                  { name: "Dashboard", path: "/expert/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
                  { name: "My Profile", path: "/expert/dashboard/profile", icon: <User className="h-5 w-5" /> },
                  { name: "Florence AI", path: "/expert/dashboard/florence", icon: <Bot className="h-5 w-5" /> },
                  { name: "Patients", path: "/expert/dashboard/patients", icon: <Users className="h-5 w-5" /> },
                  { name: "Appointments", path: "/expert/dashboard/appointments", icon: <Calendar className="h-5 w-5" /> },
                  // { name: "Medical Records", path: "/expert/dashboard/records", icon: <FileText className="h-5 w-5" /> },
                  // { name: "Consultations", path: "/expert/dashboard/consultations", icon: <Stethoscope className="h-5 w-5" /> },
                  // { name: "Health Analytics", path: "/expert/dashboard/analytics", icon: <BarChart3 className="h-5 w-5" /> },
                  // { name: "Messages", path: "/expert/dashboard/messages", icon: <MessageSquare className="h-5 w-5" /> },
                  // { name: "Activity Log", path: "/expert/dashboard/activity", icon: <Activity className="h-5 w-5" /> }
                ].map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      `flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors duration-200 ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`
                    }
                    onClick={() => setSidebarOpen(false)}
                  >
                    <div className="flex-shrink-0">{item.icon}</div>
                    <span className="font-medium">{item.name}</span>
                  </NavLink>
                ))}
              </nav>
            </div>
            
            {/* Mobile Footer */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user?.email || 'Expert User'
                    }
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.role === 'expert' ? 'Healthcare Professional' : user?.role || 'User'}
                  </p>
                </div>
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content with dynamic margin for fixed sidebar */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${!isMobile ? (isCollapsed ? 'ml-16' : 'ml-64') : ''}`}>
        {/* Top Navigation Bar */}
        <header className="bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              {/* Mobile Menu Button - Always show on mobile */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className={`md:hidden p-2 rounded-lg border transition-all duration-200 ${
                  sidebarOpen 
                    ? 'bg-blue-50 border-blue-300 text-blue-700' 
                    : 'hover:bg-gray-100 border-gray-200 text-gray-700'
                }`}
              >
                <Menu className="h-6 w-6" />
              </Button>
              
              <div className="hidden md:block">
                <h1 className="text-xl font-semibold text-gray-900">
                  Expert Portal
                </h1>
                <p className="text-sm text-gray-500">
                  Professional Healthcare Dashboard
                </p>
              </div>
              
              {/* Mobile Title */}
              <div className="md:hidden">
                <h1 className="text-lg font-semibold text-gray-900">
                  Expert Portal
                </h1>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Search */}
              <div className="relative hidden md:block">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="Search patients, records..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="sm" className="relative">
                <Bell className="h-5 w-5" />
                <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs">
                  3
                </Badge>
              </Button>

              {/* User Menu */}
              <div className="flex items-center space-x-3">
                <div className="hidden md:block text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {user?.firstName && user?.lastName 
                      ? `${user.firstName} ${user.lastName}`
                      : user?.email || 'Expert User'
                    }
                  </p>
                  <p className="text-xs text-gray-500">
                    {user?.role === 'expert' ? 'Healthcare Professional' : user?.role || 'User'}
                  </p>
                </div>
                
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="h-4 w-4 text-blue-600" />
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export const ExpertLayout = () => {
  return (
    <ExpertSidebarProvider>
      <ExpertLayoutContent />
    </ExpertSidebarProvider>
  );
}; 