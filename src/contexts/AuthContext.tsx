
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

// Dummy user credentials
const DUMMY_USERS = {
  user: { email: "user@florence.com", password: "password123", role: "user" },
  admin: { email: "admin@florence.com", password: "admin123", role: "admin" }
};

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

interface User {
  email: string;
  role: "user" | "admin";
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Check local storage for user on mount
  useEffect(() => {
    const storedUser = localStorage.getItem("florenceUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Check against dummy credentials
    if (email === DUMMY_USERS.user.email && password === DUMMY_USERS.user.password) {
      const userData = { email, role: "user" as const };
      setUser(userData);
      localStorage.setItem("florenceUser", JSON.stringify(userData));
      toast.success("Login successful!");
      setIsLoading(false);
      return true;
    } else if (email === DUMMY_USERS.admin.email && password === DUMMY_USERS.admin.password) {
      const userData = { email, role: "admin" as const };
      setUser(userData);
      localStorage.setItem("florenceUser", JSON.stringify(userData));
      toast.success("Admin login successful!");
      setIsLoading(false);
      return true;
    } else {
      toast.error("Invalid email or password");
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("florenceUser");
    toast.info("You have been logged out");
    navigate("/login");
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
