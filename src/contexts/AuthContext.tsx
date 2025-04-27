
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Amplify, Auth } from 'aws-amplify';
import { awsConfig } from "@/lib/cognito-config";

// Configure Amplify
Amplify.configure(awsConfig);

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

  // Check if user is already authenticated on mount
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    setIsLoading(true);
    try {
      const cognitoUser = await Auth.currentAuthenticatedUser();
      const userData = {
        email: cognitoUser.attributes.email,
        role: cognitoUser.attributes.email === "admin@florence.com" ? "admin" as const : "user" as const
      };
      setUser(userData);
    } catch (error) {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      const cognitoUser = await Auth.signIn(email, password);
      const userData = {
        email: cognitoUser.attributes.email,
        role: cognitoUser.attributes.email === "admin@florence.com" ? "admin" as const : "user" as const
      };
      
      setUser(userData);
      toast.success("Login successful!");
      setIsLoading(false);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Invalid email or password");
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      await Auth.signOut();
      setUser(null);
      toast.info("You have been logged out");
      navigate("/login");
    } catch (error) {
      console.error("Error signing out: ", error);
      toast.error("Error logging out. Please try again.");
    }
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
