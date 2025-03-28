
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { NavigationBar } from "@/components/NavigationBar";
import { MobileSidebar } from "@/components/MobileSidebar";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export const DashboardLayout = () => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  
  // Close sidebar when switching to desktop view
  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <NavigationBar 
        showSidebarTrigger={isMobile} 
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        isSidebarOpen={sidebarOpen}
      />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Sidebar */}
        {isMobile && (
          <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}
        
        {/* Desktop Sidebar */}
        {!isMobile && <DesktopSidebar />}
        
        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
      
      {/* Footer */}
      <footer className="bg-background/80 backdrop-blur-md border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} Florence Health Connector. All rights reserved.</p>
          <div className="flex justify-center space-x-4 mt-2">
            <a href="#" className="hover:text-primary">Privacy Policy</a>
            <a href="#" className="hover:text-primary">Terms of Service</a>
            <a href="#" className="hover:text-primary">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
};
