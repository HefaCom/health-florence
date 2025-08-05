import { createContext, useContext, useState, ReactNode } from "react";

interface ExpertSidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const ExpertSidebarContext = createContext<ExpertSidebarContextType | undefined>(undefined);

export const useExpertSidebar = () => {
  const context = useContext(ExpertSidebarContext);
  if (context === undefined) {
    throw new Error('useExpertSidebar must be used within an ExpertSidebarProvider');
  }
  return context;
};

interface ExpertSidebarProviderProps {
  children: ReactNode;
}

export const ExpertSidebarProvider = ({ children }: ExpertSidebarProviderProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <ExpertSidebarContext.Provider value={{ isCollapsed, setIsCollapsed }}>
      {children}
    </ExpertSidebarContext.Provider>
  );
}; 