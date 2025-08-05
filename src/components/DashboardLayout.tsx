import { useState, useEffect, createContext, useContext } from "react";
import { Outlet } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";
import { NavigationBar } from "@/components/NavigationBar";
import { MobileSidebar } from "@/components/MobileSidebar";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { generateClient } from "aws-amplify/api";
import { GraphQLResult } from '@aws-amplify/api';

// Create a context to share sidebar state
interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export const useSidebar = () => {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider");
  }
  return context;
};

interface UserData {
  listUsers: {
    items: Array<{
      firstName: string;
      lastName: string;
    }>;
  };
}

const client = generateClient();

export const DashboardLayout = () => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState<{ firstName: string; lastName: string; } | null>(null);
  
  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      if (user?.email) {
        try {
          const response = await client.graphql({
            query: `query GetUserByEmail {
              listUsers(filter: { email: { eq: "${user.email}" } }) {
                items {
                  firstName
                  lastName
                }
              }
            }`,
            authMode: 'apiKey'
          }) as GraphQLResult<UserData>;
          
          const fetchedUser = response.data?.listUsers?.items?.[0];
          if (fetchedUser) {
            setUserData(fetchedUser);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
    };

    fetchUserData();
  }, [user?.email]);
  
  // Get user's name from email or attributes
  const getUserName = () => {
    // First try to get the name from fetched user data
    if (userData?.firstName && userData?.lastName) {
      return `${userData.firstName} ${userData.lastName}`;
    }
    
    // Fallback to attributes if available
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
    
    return "User";
  };
  
  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };
  
  // Close sidebar when switching to desktop view
  useEffect(() => {
    if (!isMobile) {
      setSidebarOpen(false);
    }
  }, [isMobile]);

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      <div className="min-h-screen flex flex-col bg-background">
        <NavigationBar 
          showSidebarTrigger={isMobile} 
          onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
          isSidebarOpen={sidebarOpen}
        />
        
        <div className="flex flex-1 relative">
          {/* Mobile Sidebar */}
          {isMobile && (
            <MobileSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          )}
          
          {/* Desktop Sidebar - Fixed Position */}
          {!isMobile && (
            <div className="fixed left-0 top-[90px] bottom-0 z-20">
              <DesktopSidebar />
            </div>
          )}
          
          {/* Main Content - With dynamic margin for fixed sidebar */}
          <main className={`flex-1 overflow-auto transition-all duration-300 ${!isMobile ? (isCollapsed ? 'ml-16' : 'ml-64') : ''}`}>
          {/* Personalized Greeting */}
          {/* <div className="bg-card/50 backdrop-blur-sm border-b p-4">
            <div className="container mx-auto">
              <h2 className="text-2xl font-bold">
                {getGreeting()}, {getUserName()}!
              </h2>
              <p className="text-muted-foreground">
                Welcome to your health dashboard
              </p>
            </div>
          </div> */}
          
          <Outlet />
        </main>
      </div>
      
      {/* Footer */}
      <footer className="bg-background/80 backdrop-blur-md border-t py-4">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()}  Health AI. All rights reserved.</p>
          <div className="flex justify-center space-x-4 mt-2">
            <a href="#" className="hover:text-primary">Privacy Policy</a>
            <a href="#" className="hover:text-primary">Terms of Service</a>
            <a href="#" className="hover:text-primary">Contact</a>
          </div>
        </div>
      </footer>
      </div>
    </SidebarContext.Provider>
  );
};
