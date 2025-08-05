import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Amplify } from 'aws-amplify';
import { 
  signIn, 
  signOut, 
  signUp, 
  confirmSignUp, 
  getCurrentUser,
  resetPassword as initiateResetPassword,
  confirmResetPassword
} from 'aws-amplify/auth';
import awsconfig from '../aws-exports';
import { userService, User as UserData } from '../services/user.service';

// Configure Amplify
Amplify.configure(awsconfig);

// Define user roles
export type UserRole = "user" | "admin" | "expert";

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
  id: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
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
      const email = currentUser.signInDetails?.loginId || '';
      
      if (email) {
        // Get user data from database
        const userData = await userService.getUserByEmail(email);
        
        if (userData && userData.isActive) {
          const user: User = {
            email: userData.email,
            role: userData.role as UserRole,
            id: userData.id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            isActive: userData.isActive,
            attributes: { email: userData.email }
          };
          
          setUser(user);
          
          // Update login information
          try {
            await userService.updateUserLogin(userData.id);
          } catch (loginError) {
            console.warn('Failed to update login info:', loginError);
            // Don't fail authentication if login update fails
          }
        } else {
          // User not found in database but authenticated in Cognito
          // Try to create the user in database with default values
          try {
            console.log('Creating user in database:', email);
            const nameParts = email.split('@')[0].split('.');
            const firstName = nameParts[0] || 'User';
            const lastName = nameParts.slice(1).join(' ') || 'Account';
            
            const userData = await userService.createUser({
              email,
              firstName,
              lastName,
              role: 'user'
            });
            
            const user: User = {
              email: userData.email,
              role: userData.role as UserRole,
              id: userData.id,
              firstName: userData.firstName,
              lastName: userData.lastName,
              isActive: userData.isActive,
              attributes: { email: userData.email }
            };
            
            setUser(user);
            toast.success("Account synced successfully!");
          } catch (createError) {
            console.error('Failed to create user in database:', createError);
            setUser(null);
            await signOut();
          }
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      // User is not authenticated
      console.log('User not authenticated:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // First check if user is already authenticated
      try {
        const currentUser = await getCurrentUser();
        if (currentUser) {
          // User is already authenticated, get from database
          const userData = await userService.getUserByEmail(email);
          
          if (userData && userData.isActive) {
            const user: User = {
              email: userData.email,
              role: userData.role as UserRole,
              id: userData.id,
              firstName: userData.firstName,
              lastName: userData.lastName,
              isActive: userData.isActive,
              attributes: { email: userData.email }
            };
            
            setUser(user);
            
            // Update login information
            try {
              await userService.updateUserLogin(userData.id);
            } catch (loginError) {
              console.warn('Failed to update login info:', loginError);
              // Don't fail authentication if login update fails
            }
            
            toast.success("Already signed in!");
            setIsLoading(false);
            return true;

          }
        }
      } catch (authError) {
        // User is not authenticated, proceed with sign in
        console.log("No current user, proceeding with sign in");
      }

      const { isSignedIn } = await signIn({ username: email, password });
      
      if (isSignedIn) {
        // Get user data from database
        const userData = await userService.getUserByEmail(email);
        
        if (userData && userData.isActive) {
          const user: User = {
            email: userData.email,
            role: userData.role as UserRole,
            id: userData.id,
            firstName: userData.firstName,
            lastName: userData.lastName,
            isActive: userData.isActive,
            attributes: { email: userData.email }
          };
          
          setUser(user);
          
          // Update login information
          try {
            await userService.updateUserLogin(userData.id);
          } catch (loginError) {
            console.warn('Failed to update login info:', loginError);
            // Don't fail authentication if login update fails
          }
          
          toast.success("Login successful!");
          setIsLoading(false);
          return true;
        } else {
          // User not found in database but authenticated in Cognito
          // Try to create the user in database with default values
          try {
            console.log('Creating user in database during login:', email);
            const nameParts = email.split('@')[0].split('.');
            const firstName = nameParts[0] || 'User';
            const lastName = nameParts.slice(1).join(' ') || 'Account';
            
            const userData = await userService.createUser({
              email,
              firstName,
              lastName,
              role: 'user'
            });
            
            const user: User = {
              email: userData.email,
              role: userData.role as UserRole,
              id: userData.id,
              firstName: userData.firstName,
              lastName: userData.lastName,
              isActive: userData.isActive,
              attributes: { email: userData.email }
            };
            
            setUser(user);
            
            // Update login information
            try {
              await userService.updateUserLogin(userData.id);
            } catch (loginError) {
              console.warn('Failed to update login info:', loginError);
            }
            
            toast.success("Account synced and login successful!");
            setIsLoading(false);
            return true;
          } catch (createError) {
            console.error('Failed to create user in database:', createError);
            toast.error("Failed to sync account");
            await signOut();
            setIsLoading(false);
            return false;
          }
        }
      }
      
      toast.error("Login failed");
      setIsLoading(false);
      return false;
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(error.message || "Login failed");
      setIsLoading(false);
      return false;
    }
  };

  const register = async (email: string, password: string, fullName: string): Promise<{ success: boolean; error?: string }> => {
    try {
      // Split full name into first and last name
      const nameParts = fullName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      // Sign up with AWS Cognito
      const { isSignUpComplete } = await signUp({
        username: email,
        password,
        options: {
          userAttributes: {
            email,
            name: fullName
          }
        }
      });

      if (isSignUpComplete) {
        // Create user in database with default 'user' role
        await userService.createUser({
          email,
          firstName,
          lastName,
          role: 'user' // Default role
        });

        toast.success("Registration successful! Please check your email for verification.");
        return { success: true };
      } else {
        return { success: false, error: "Registration failed" };
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      return { success: false, error: error.message || "Registration failed" };
    }
  };

  const confirmRegistration = async (email: string, code: string): Promise<boolean> => {
    try {
      const { isSignUpComplete } = await confirmSignUp({
        username: email,
        confirmationCode: code
      });

      if (isSignUpComplete) {
        toast.success("Email confirmed successfully!");
        return true;
      } else {
        toast.error("Email confirmation failed");
        return false;
      }
    } catch (error: any) {
      console.error("Email confirmation error:", error);
      toast.error(error.message || "Email confirmation failed");
      return false;
    }
  };

  const forgotPassword = async (email: string): Promise<boolean> => {
    try {
      await initiateResetPassword({ username: email });
      toast.success("Password reset email sent!");
      return true;
    } catch (error: any) {
      console.error("Forgot password error:", error);
      toast.error(error.message || "Failed to send reset email");
      return false;
    }
  };

  const resetPassword = async (email: string, code: string, newPassword: string): Promise<boolean> => {
    try {
      await confirmResetPassword({
        username: email,
        confirmationCode: code,
        newPassword
      });
      toast.success("Password reset successfully!");
      return true;
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast.error(error.message || "Password reset failed");
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut();
      setUser(null);
      toast.success("Logged out successfully!");
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Logout failed");
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
