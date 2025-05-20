import { useState } from "react";
import { Outlet, NavLink, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings, 
  Menu, 
  Bell, 
  LogOut,
  MessageCircle,
  History
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Sheet, 
  SheetContent 
} from "@/components/ui/sheet";
import { FloLogo } from "@/components/FloLogo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { ChatInterface } from "@/components/ChatInterface";
import { useTheme } from "@/components/ThemeProvider";

export const AdminLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const { theme } = useTheme();

  // Get user's name from email or attributes
  const getUserName = () => {
    if (user?.attributes?.name) {
      return user.attributes.name;
    }
    
    // Extract name from email if available
    if (user?.email) {
      const emailName = user.email.split('@')[0];
      // Capitalize first letter of each word
      return emailName
        .split(/[._-]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    
    return "Admin";
  };
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const navigationItems = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />
    },
    {
      name: "Users",
      path: "/admin/users",
      icon: <Users className="h-5 w-5" />
    },
    {
      name: "Appointments",
      path: "/admin/appointments",
      icon: <Calendar className="h-5 w-5" />
    },
    {
      name: "Analytics",
      path: "/admin/analytics",
      icon: <BarChart3 className="h-5 w-5" />
    },
    {
      name: "Audit Trails",
      path: "/admin/audit-trails",
      icon: <History className="h-5 w-5" />
    },
    {
      name: "Settings",
      path: "/admin/settings",
      icon: <Settings className="h-5 w-5" />
    }
  ];

  const sidebarBgClass = theme === "dark" ? "bg-card" : "bg-white";
  const sidebarBorderClass = theme === "dark" ? "border-gray-800" : "border-gray-200";
  const sidebarTextClass = theme === "dark" ? "text-gray-300" : "text-gray-700";
  const sidebarHoverBgClass = theme === "dark" ? "hover:bg-muted" : "hover:bg-gray-100";
  const sidebarActiveClass = theme === "dark" ? "bg-primary/20 text-primary" : "bg-primary/10 text-primary";

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className={`hidden md:flex flex-col w-64 ${sidebarBgClass} border-r ${sidebarBorderClass} transition-all duration-300`}>
        <div className={`p-4 flex items-center justify-between h-16 border-b ${sidebarBorderClass}`}>
          <div className="flex items-center">
          <FloLogo className="w-10 h-10" />
          <span className="font-bold text-xl hidden lg:block neon-text">
            Health AI <span className="text-primary">.</span>
          </span>
          </div>
        </div>

        {/* Admin Profile Section */}
        <div className={`p-4 border-b ${sidebarBorderClass}`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <span className="text-primary font-bold">{getUserName().charAt(0)}</span>
            </div>
            <div>
              <p className="font-medium text-sm">{getUserName()}</p>
              <p className="text-xs text-muted-foreground">{user?.role || "Administrator"}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col flex-1 overflow-y-auto">
          <nav className="flex-1 py-6 px-4 space-y-1">
            {navigationItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => 
                  `flex items-center px-3 py-2.5 text-sm rounded-lg transition-colors ${
                    isActive 
                      ? sidebarActiveClass
                      : `${sidebarTextClass} ${sidebarHoverBgClass} hover:text-foreground`
                  }`
                }
                end={item.path === "/admin"}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>

          <div className={`p-4 mt-auto border-t ${sidebarBorderClass}`}>
            <Button 
              variant="ghost" 
              className={`w-full justify-start ${sidebarTextClass} ${sidebarHoverBgClass} hover:text-foreground`}
              onClick={logout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
        <SheetContent side="left" className="p-0 w-72">
          <div className="flex flex-col h-full">
            <div className={`p-4 flex items-center border-b ${sidebarBorderClass}`}>
              <FloLogo className="w-8 h-8 mr-2" />
              <span className="font-bold text-xl text-foreground">
                Health AI<span className="text-primary">.</span>
              </span>
            </div>

            <nav className="flex-1 py-6 px-4 space-y-1">
              {navigationItems.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => 
                    `flex items-center px-3 py-2.5 text-sm rounded-lg transition-colors ${
                      isActive 
                        ? sidebarActiveClass
                        : `${sidebarTextClass} ${sidebarHoverBgClass} hover:text-foreground`
                    }`
                  }
                  end={item.path === "/admin"}
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <span className="mr-3">{item.icon}</span>
                  <span>{item.name}</span>
                </NavLink>
              ))}
            </nav>

            {/* Admin Profile Section for Mobile */}
            <div className="p-4 border-b border-border">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                  <span className="text-primary font-bold">{getUserName().charAt(0)}</span>
                </div>
                <div>
                  <p className="font-medium text-sm">{getUserName()}</p>
                  <p className="text-xs text-muted-foreground">{user?.role || "Administrator"}</p>
                </div>
              </div>
            </div>

            <div className={`p-4 mt-auto border-t ${sidebarBorderClass}`}>
              <Button 
                variant="ghost" 
                className={`w-full justify-start ${sidebarTextClass} ${sidebarHoverBgClass} hover:text-foreground`}
                onClick={logout}
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <header className={`h-16 border-b ${sidebarBorderClass} flex items-center justify-between px-4 ${sidebarBgClass}`}>
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className="md:hidden mr-2" 
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold">
              {navigationItems.find(item => item.path === location.pathname)?.name || "Admin Dashboard"}
            </h1>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* Personalized Greeting */}
            <div className="hidden md:block mr-4 text-right">
              <p className="text-sm font-medium">{getGreeting()}, {getUserName()}</p>
              <p className="text-xs text-muted-foreground">{user?.role || "Administrator"}</p>
            </div>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="relative"
                    onClick={() => setIsChatOpen(!isChatOpen)}
                  >
                    <MessageCircle className="h-5 w-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Open Chat</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full"></span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Notifications</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <ThemeToggle />
            
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={logout}
                  >
                    <LogOut className="h-5 w-5" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Logout</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </header>
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
      
      {/* Chat Interface */}
      {isChatOpen && (
        <div className="fixed bottom-4 right-4 z-50 w-80 h-96 bg-card rounded-lg shadow-lg border overflow-hidden">
          <ChatInterface onClose={() => setIsChatOpen(false)} />
        </div>
      )}
    </div>
  );
};
