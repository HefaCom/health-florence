
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
  MessageCircle
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
        <SheetContent side="left" className={`p-0 w-[240px] ${sidebarBgClass}`}>
          <div className="flex flex-col h-full">
            <div className={`p-4 flex items-center border-b ${sidebarBorderClass}`}>
              <FloLogo className="w-8 h-8 mr-2" />
              <span className="font-bold text-xl text-foreground">
                HealthAI<span className="text-primary">.</span>
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

      {/* Chat Interface */}
      <Sheet open={isChatOpen} onOpenChange={setIsChatOpen}>
        <SheetContent className="w-[90%] sm:w-[440px] p-0">
          <ChatInterface />
        </SheetContent>
      </Sheet>
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-background/80 backdrop-blur-md sticky top-0 z-10 border-b">
          <div className="px-4 h-16 flex items-center justify-between">
            <div className="flex items-center">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full mr-2 md:hidden" 
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>

              <h1 className="text-xl font-bold">Admin Dashboard</h1>
            </div>

            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full"
                onClick={() => setIsChatOpen(true)}
              >
                <MessageCircle className="h-5 w-5" />
              </Button>
              
              <Button variant="ghost" size="icon" className="rounded-full">
                <Bell className="h-5 w-5" />
              </Button>

              <ThemeToggle />

              <div className="relative">
                <Button variant="ghost" size="icon" className="rounded-full">
                  <span className="sr-only">User menu</span>
                  <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                    <span className="text-xs font-medium">{user?.email.substring(0, 2).toUpperCase()}</span>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-muted/30">
          <div className="container mx-auto px-4 py-6">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
