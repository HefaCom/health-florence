import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Amplify } from 'aws-amplify';
import { 
  signIn, 
  signOut, 
  signUp, 
  confirmSignUp, 
  resendSignUpCode,
  getCurrentUser,
  resetPassword as initiateResetPassword,
  confirmResetPassword,
  fetchUserAttributes
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
  confirmRegistration: (email: string, code: string, firstName?: string, lastName?: string) => Promise<boolean>;
  resendVerificationCode: (email: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<boolean>;
  logout: () => Promise<boolean>;
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
              console.log('Updating login information for already authenticated user:', userData.id);
              await userService.updateUserLogin(userData.id);
              console.log('Login information updated successfully for already authenticated user');
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
            console.log('Updating login information for user:', userData.id);
            await userService.updateUserLogin(userData.id);
            console.log('Login information updated successfully');
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
              console.log('Updating login information for newly created user:', userData.id);
              await userService.updateUserLogin(userData.id);
              console.log('Login information updated successfully for newly created user');
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

      console.log('Attempting to register user:', { email, firstName, lastName });

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

      console.log('Sign up result:', { isSignUpComplete });

      if (isSignUpComplete) {
        // User is immediately confirmed (shouldn't happen with email verification enabled)
        // Create user in database with default 'user' role
        await userService.createUser({
          email,
          firstName,
          lastName,
          role: 'user' // Default role
        });

        toast.success("Registration successful!");
        return { success: true };
      } else {
        // User needs to confirm email - this is the expected flow
        toast.success("Registration successful! Please check your email for verification.");
        return { success: true };
      }
    } catch (error: any) {
      console.error("Registration error:", error);
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        code: error.code
      });
      
      // Handle specific Cognito errors
      if (error.name === 'UsernameExistsException') {
        // User already exists - check if they're confirmed
        console.log('User already exists, checking confirmation status...');
        return { success: false, error: "User already exists" };
      } else if (error.name === 'InvalidPasswordException') {
        return { success: false, error: "Password does not meet requirements" };
      } else if (error.name === 'InvalidParameterException') {
        return { success: false, error: "Invalid email format" };
      }
      
      return { success: false, error: error.message || "Registration failed" };
    }
  };

  // Helper function to create user in database
  const createUserInDatabase = async (email: string, firstName?: string, lastName?: string): Promise<boolean> => {
    try {
      // Use provided names or extract from email as fallback
      let finalFirstName = firstName;
      let finalLastName = lastName;
      
      if (!finalFirstName || !finalLastName) {
        const nameParts = email.split('@')[0].split('.');
        finalFirstName = finalFirstName || nameParts[0] || 'User';
        finalLastName = finalLastName || nameParts.slice(1).join(' ') || 'Account';
      }
      
      // Check if user already exists in database
      const existingUser = await userService.getUserByEmail(email);
      if (existingUser) {
        console.log('User already exists in database:', existingUser);
        return true; // User already exists, consider it successful
      }
      
      console.log('Creating user in database:', {
        email,
        firstName: finalFirstName,
        lastName: finalLastName
      });
      
      const user = await userService.createUser({
        email,
        firstName: finalFirstName,
        lastName: finalLastName,
        role: 'user' // Default role
      });
      
      console.log('User created successfully:', user);
      return true;
    } catch (dbError: any) {
      console.error("Failed to create user in database:", dbError);
      
      // Check if user was actually created despite errors
      if (dbError.data && dbError.data.createUser && dbError.data.createUser.id) {
        console.log("User was created successfully despite some errors");
        return true;
      }
      
      throw dbError;
    }
  };

  const confirmRegistration = async (email: string, code: string, firstName?: string, lastName?: string): Promise<boolean> => {
    try {
      console.log('Attempting to confirm registration for:', email);
      
      const { isSignUpComplete } = await confirmSignUp({
        username: email,
        confirmationCode: code
      });

      console.log('Confirmation result:', { isSignUpComplete });

      if (isSignUpComplete) {
        // Email confirmed successfully - now create user in database
        try {
          await createUserInDatabase(email, firstName, lastName);
          toast.success("Email confirmed successfully! Account created.");
          return true;
        } catch (dbError: any) {
          console.error("Failed to create user in database after confirmation:", dbError);
          
          // Check if user was actually created despite errors
          if (dbError.data && dbError.data.createUser && dbError.data.createUser.id) {
            console.log("User was created successfully despite some errors");
            toast.success("Email confirmed successfully! Account created.");
            return true;
          }
          
          // Provide more specific error messages
          if (dbError.errors && dbError.errors.length > 0) {
            const errorMessage = dbError.errors[0].message;
            toast.error(`Account setup failed: ${errorMessage}`);
          } else if (dbError.message) {
            toast.error(`Account setup failed: ${dbError.message}`);
          } else {
            toast.error("Email confirmed but account setup failed. Please contact support.");
          }
          
          return false;
        }
      } else {
        toast.error("Email confirmation failed");
        return false;
      }
    } catch (error: any) {
      console.error("Email confirmation error:", error);
      console.error("Error details:", {
        name: error.name,
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      // Handle specific Cognito errors
      if (error.name === 'CodeMismatchException') {
        toast.error("Invalid verification code. Please check and try again.");
      } else if (error.name === 'ExpiredCodeException') {
        toast.error("Verification code has expired. Please request a new one.");
      } else if (error.name === 'NotAuthorizedException') {
        // User might already be confirmed - try to create user in database anyway
        console.log('User might already be confirmed, attempting to create user in database...');
        
        try {
          await createUserInDatabase(email, firstName, lastName);
          toast.success("Account created successfully! You can now login.");
          return true;
        } catch (dbError: any) {
          console.error("Failed to create user in database:", dbError);
          toast.error("User is already confirmed but account setup failed. Please contact support.");
          return false;
        }
      } else {
        toast.error(error.message || "Email confirmation failed");
      }
      
      return false;
    }
  };

  const resendVerificationCode = async (email: string): Promise<boolean> => {
    try {
      await resendSignUpCode({ username: email });
      toast.success("Verification code resent! Please check your email.");
      return true;
    } catch (error: any) {
      console.error("Resend verification code error:", error);
      
      // Handle specific Cognito errors
      if (error.name === 'UserNotFoundException') {
        toast.error("User not found. Please register first.");
      } else if (error.name === 'InvalidParameterException') {
        toast.error("Invalid email format.");
      } else if (error.name === 'LimitExceededException') {
        toast.error("Too many attempts. Please wait before requesting another code.");
      } else {
        toast.error(error.message || "Failed to resend verification code");
      }
      
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
      // Don't navigate here - let the calling component handle navigation
      return true;
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
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
        resendVerificationCode,
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
