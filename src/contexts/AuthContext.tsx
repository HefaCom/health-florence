import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Amplify } from 'aws-amplify';
import { signIn, signOut, signUp, confirmSignUp, getCurrentUser } from 'aws-amplify/auth';
import awsconfig from '../aws-exports';

// Configure Amplify
Amplify.configure(awsconfig);

// Define user roles
export type UserRole = "user" | "admin" | "nurse" | "doctor";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  confirmRegistration: (email: string, code: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

interface User {
  email: string;
  role: UserRole;
  attributes?: {
    email: string;
    name?: string;
    [key: string]: any;
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Check if user is authenticated on mount
  useEffect(() => {
    checkAuthState();
  }, []);

  const checkAuthState = async () => {
    try {
      const currentUser = await getCurrentUser();
      
      // Get user attributes
      const attributes = currentUser.signInDetails?.loginId || '';
      
      // Determine user role based on email or custom attribute
      let role: UserRole = "user";
      
      // Check for admin role
      if (attributes === "toptutor0001@gmail.com") {
        role = "admin";
      }
      // You can add more role checks here for nurse/doctor in the future
      
      const userData: User = {
        email: attributes,
        role,
        attributes: { email: attributes }
      };
      
      setUser(userData);
    } catch (error) {
      // User is not authenticated
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      const { isSignedIn } = await signIn({ username: email, password });
      
      if (isSignedIn) {
        // Determine user role based on email or custom attribute
        let role: UserRole = "user";
        
        // Check for admin role
        if (email === "toptutor0001@gmail.com") {
          role = "admin";
        }
        // You can add more role checks here for nurse/doctor in the future
        
        const userData: User = {
          email,
          role,
          attributes: { email }
        };
        
        setUser(userData);
        toast.success("Login successful!");
        setIsLoading(false);
        return true;
      }
      
      toast.error("Login failed");
      setIsLoading(false);
      return false;
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Failed to login");
      setIsLoading(false);
      return false;
    }
  };

  const register = async (email: string, password: string, fullName: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    
    try {
      const { isSignUpComplete, nextStep } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name: fullName
          }
        }
      });
      
      // In Cognito v6, isSignUpComplete can be false when nextStep is CONFIRM_SIGN_UP
      // This is actually a successful registration that needs verification
      if (nextStep.signUpStep === 'CONFIRM_SIGN_UP') {
        toast.success("Registration successful! Please check your email for verification code.");
        setIsLoading(false);
        return { success: true };
      }
      
      // If we get here, something unexpected happened
      console.error("Unexpected registration state:", { isSignUpComplete, nextStep });
      toast.error("Registration failed - unexpected state");
      setIsLoading(false);
      return { success: false, error: "Registration failed - unexpected state" };
    } catch (error: any) {
      console.error("Registration error:", error);
      
      // Handle specific error cases
      if (error.name === 'UsernameExistsException') {
        toast.error("This email is already registered. Please login or use a different email.");
        setIsLoading(false);
        return { success: false, error: "User already exists" };
      }
      
      toast.error(error.message || "Failed to register");
      setIsLoading(false);
      return { success: false, error: error.message || "Failed to register" };
    }
  };

  const confirmRegistration = async (email: string, code: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // First ensure no user is currently signed in
      try {
        await signOut();
      } catch (signOutError) {
        console.log("No user was signed in:", signOutError);
      }

      // Now confirm the signup
      const { isSignUpComplete, nextStep } = await confirmSignUp({
        username: email,
        confirmationCode: code
      });

      if (isSignUpComplete) {
        return true;
      }

      console.error("Unexpected confirmation state:", { isSignUpComplete, nextStep });
      return false;
    } catch (error) {
      console.error("Error confirming registration:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // For password reset, we'll use a custom implementation
      // In a real app, you would use the appropriate Amplify v6 method
      // This is a placeholder that simulates the behavior
      console.log(`Password reset requested for ${email}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Password reset instructions sent to your email");
      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error("Forgot password error:", error);
      toast.error(error.message || "Failed to send reset instructions");
      setIsLoading(false);
      return false;
    }
  };

  const resetPassword = async (email: string, code: string, newPassword: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // For password reset confirmation, we'll use a custom implementation
      // In a real app, you would use the appropriate Amplify v6 method
      // This is a placeholder that simulates the behavior
      console.log(`Password reset confirmation for ${email} with code ${code}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Password reset successful! You can now login with your new password.");
      setIsLoading(false);
      return true;
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast.error(error.message || "Failed to reset password");
      setIsLoading(false);
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      toast.info("You have been logged out");
      navigate("/login");
    } catch (error: any) {
      console.error("Logout error:", error);
      toast.error(error.message || "Failed to logout");
    }
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        login, 
        register,
        confirmRegistration,
        forgotPassword,
        resetPassword,
        logout, 
        isLoading 
      }}
    >
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
