import { generateClient } from 'aws-amplify/api';
import { 
  createUser, 
  updateUser, 
  getUser, 
  listUsers,
  deleteUser 
} from '../graphql/mutations';
import { 
  getUser as getUserQuery, 
  listUsers as listUsersQuery 
} from '../graphql/queries';

// Generate API client
const client = generateClient();

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  allergies?: string;
  medicalConditions?: string;
  currentMedications?: string;
  height?: number;
  weight?: number;
  gender?: string;
  bloodType?: string;
  role: 'user' | 'admin' | 'expert';
  isActive: boolean;
  lastLoginAt?: string;
  loginCount: number;
  preferences?: any;
  notificationSettings?: any;
  privacySettings?: any;
  subscriptionTier: string;
  subscriptionExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserInput {
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  role?: 'user' | 'admin' | 'expert';
  isActive?: boolean;
  preferences?: any;
  notificationSettings?: any;
  privacySettings?: any;
  subscriptionTier?: string;
}

export interface UpdateUserInput {
  id: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  allergies?: string;
  medicalConditions?: string;
  currentMedications?: string;
  height?: number;
  weight?: number;
  gender?: string;
  bloodType?: string;
  role?: 'user' | 'admin' | 'expert';
  isActive?: boolean;
  lastLoginAt?: string;
  loginCount?: number;
  preferences?: any;
  notificationSettings?: any;
  privacySettings?: any;
  subscriptionTier?: string;
  subscriptionExpiresAt?: string;
}

class UserService {
  /**
   * Create a new user with default role as 'user'
   */
  async createUser(input: CreateUserInput): Promise<User> {
    try {
      const userInput = {
        id: input.email, // Use email as ID for consistency
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        phoneNumber: input.phoneNumber,
        role: input.role || 'user', // Default to 'user' role
        isActive: input.isActive !== false, // Default to true
        loginCount: 0,
        preferences: input.preferences || {},
        notificationSettings: input.notificationSettings || {
          email: true,
          push: true,
          sms: false
        },
        privacySettings: input.privacySettings || {
          profileVisibility: 'private',
          healthDataSharing: false
        },
        subscriptionTier: input.subscriptionTier || 'basic'
      };

      const result = await client.graphql({
        query: createUser,
        variables: { input: userInput }
      });

      return (result as any).data.createUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  /**
   * Get user by ID (email)
   */
  async getUser(id: string): Promise<User | null> {
    try {
      const result = await client.graphql({
        query: getUserQuery,
        variables: { id }
      });

      return (result as any).data.getUser;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string): Promise<User | null> {
    try {
      const result = await client.graphql({
        query: listUsersQuery
      });

      const users = (result as any).data.listUsers.items;
      const user = users.find((u: User) => u.email === email);
      return user || null;
    } catch (error) {
      console.error('Error getting user by email:', error);
      return null;
    }
  }

  /**
   * Update user information
   */
  async updateUser(input: UpdateUserInput): Promise<User> {
    try {
      const result = await client.graphql({
        query: updateUser,
        variables: { input }
      });

      return (result as any).data.updateUser;
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(userId: string, role: 'user' | 'admin' | 'expert'): Promise<User> {
    try {
      const input = {
        id: userId,
        role
      };

      const result = await client.graphql({
        query: updateUser,
        variables: { input }
      });

      if (!result.data?.updateUser) {
        throw new Error('Failed to update user role: No data returned');
      }

      return result.data.updateUser;
    } catch (error: any) {
      console.error('Error updating user role:', error);
      
      // Provide more specific error messages
      if (error.errors && error.errors.length > 0) {
        const errorMessage = error.errors[0].message;
        throw new Error(`Failed to update user role: ${errorMessage}`);
      }
      
      if (error.message) {
        throw new Error(`Failed to update user role: ${error.message}`);
      }
      
      throw new Error('Failed to update user role: Unknown error occurred');
    }
  }

  /**
   * Update user login information
   */
  async updateUserLogin(userId: string): Promise<User> {
    try {
      const user = await this.getUser(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const input = {
        id: userId,
        lastLoginAt: new Date().toISOString(),
        loginCount: (user.loginCount || 0) + 1
      };

      const result = await client.graphql({
        query: updateUser,
        variables: { input }
      });

      return (result as any).data.updateUser;
    } catch (error) {
      console.error('Error updating user login:', error);
      throw error;
    }
  }

  /**
   * Get all users (admin only)
   */
  async getAllUsers(): Promise<User[]> {
    try {
      const result = await client.graphql({
        query: listUsersQuery
      });

      return (result as any).data.listUsers.items;
    } catch (error) {
      console.error('Error getting all users:', error);
      throw error;
    }
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role: 'user' | 'admin' | 'expert'): Promise<User[]> {
    try {
      const result = await client.graphql({
        query: listUsersQuery,
        variables: {
          filter: { role: { eq: role } }
        }
      });

      return (result as any).data.listUsers.items;
    } catch (error) {
      console.error('Error getting users by role:', error);
      throw error;
    }
  }

  /**
   * Delete user (admin only)
   */
  async deleteUser(userId: string): Promise<boolean> {
    try {
      await client.graphql({
        query: deleteUser,
        variables: { input: { id: userId } }
      });

      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Validate user role and permissions
   */
  validateUserRole(user: User, requiredRole: 'user' | 'admin' | 'expert'): boolean {
    if (!user || !user.isActive) {
      return false;
    }

    const roleHierarchy = {
      'user': 1,
      'expert': 2,
      'admin': 3
    };

    const userRoleLevel = roleHierarchy[user.role] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

    return userRoleLevel >= requiredRoleLevel;
  }

  /**
   * Get user dashboard route based on role
   */
  getUserDashboardRoute(user: User): string {
    switch (user.role) {
      case 'admin':
        return '/admin';
      case 'expert':
        return '/expert/dashboard';
      case 'user':
      default:
        return '/';
    }
  }

  /**
   * Check if user has admin privileges
   */
  isAdmin(user: User): boolean {
    return this.validateUserRole(user, 'admin');
  }

  /**
   * Check if user has expert privileges
   */
  isExpert(user: User): boolean {
    return this.validateUserRole(user, 'expert');
  }

  /**
   * Check if user has user privileges
   */
  isUser(user: User): boolean {
    return this.validateUserRole(user, 'user');
  }
}

export const userService = new UserService(); 