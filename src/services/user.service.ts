import { generateClient } from 'aws-amplify/api';
import { 
  createUser, 
  updateUser, 
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
  preferences?: string | any; // Can be string (from DB) or object (in memory)
  notificationSettings?: string | any; // Can be string (from DB) or object (in memory)
  privacySettings?: string | any; // Can be string (from DB) or object (in memory)
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
   * Helper function to parse JSON fields from database
   */
  private parseUserFromDB(user: any): User {
    return {
      ...user,
      preferences: user.preferences ? (typeof user.preferences === 'string' ? JSON.parse(user.preferences) : user.preferences) : {},
      notificationSettings: user.notificationSettings ? (typeof user.notificationSettings === 'string' ? JSON.parse(user.notificationSettings) : user.notificationSettings) : {},
      privacySettings: user.privacySettings ? (typeof user.privacySettings === 'string' ? JSON.parse(user.privacySettings) : user.privacySettings) : {}
    };
  }

  /**
   * Create a new user with default role as 'user'
   */
  async createUser(input: CreateUserInput): Promise<User> {
    try {
      // Generate a unique UUID for the user ID
      const userId = crypto.randomUUID();
      
      const userInput = {
        id: userId, // Use UUID for ID
        email: input.email,
        firstName: input.firstName,
        lastName: input.lastName,
        phoneNumber: input.phoneNumber,
        role: input.role || 'user', // Default to 'user' role
        isActive: input.isActive !== false, // Default to true
        loginCount: 0,
        preferences: JSON.stringify(input.preferences || {}),
        notificationSettings: JSON.stringify(input.notificationSettings || {
          email: true,
          push: true,
          sms: false
        }),
        privacySettings: JSON.stringify(input.privacySettings || {
          profileVisibility: 'private',
          healthDataSharing: false
        }),
        subscriptionTier: input.subscriptionTier || 'basic'
      };

      console.log('Creating user with input:', userInput);

      // Create a simplified mutation that doesn't fetch related fields
      const createUserSimple = /* GraphQL */ `
        mutation CreateUserSimple($input: CreateUserInput!) {
          createUser(input: $input) {
            id
            email
            firstName
            lastName
            phoneNumber
            role
            isActive
            loginCount
            preferences
            notificationSettings
            privacySettings
            subscriptionTier
            createdAt
            updatedAt
          }
        }
      `;

      const result = await client.graphql({
        query: createUserSimple,
        variables: { input: userInput },
        authMode: 'apiKey' // Use API key for public access
      });

      console.log('User creation result:', result);
      const createdUser = (result as any).data.createUser;
      
      // Check if user was actually created successfully
      if (createdUser && createdUser.id) {
        console.log('User created successfully:', createdUser);
        return this.parseUserFromDB(createdUser);
      } else {
        console.error('User creation failed - no user data returned');
        throw new Error('User creation failed - no user data returned');
      }
    } catch (error) {
      console.error('Error creating user:', error);
      
      // Check if this is just authorization errors but user was created
      if (error.data && error.data.createUser && error.data.createUser.id) {
        console.log('User created successfully despite authorization warnings:', error.data.createUser);
        return this.parseUserFromDB(error.data.createUser);
      }
      
      throw error;
    }
  }

  /**
   * Get user by ID (UUID)
   */
  async getUser(id: string): Promise<User | null> {
    try {
      const result = await client.graphql({
        query: getUserQuery,
        variables: { id }
      });

      const user = (result as any).data.getUser;
      return user ? this.parseUserFromDB(user) : null;
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
      const user = users.find((u: any) => u.email === email);
      return user ? this.parseUserFromDB(user) : null;
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
      // Serialize JSON fields if they exist
      const updateInput = {
        ...input,
        preferences: input.preferences ? (typeof input.preferences === 'string' ? input.preferences : JSON.stringify(input.preferences)) : undefined,
        notificationSettings: input.notificationSettings ? (typeof input.notificationSettings === 'string' ? input.notificationSettings : JSON.stringify(input.notificationSettings)) : undefined,
        privacySettings: input.privacySettings ? (typeof input.privacySettings === 'string' ? input.privacySettings : JSON.stringify(input.privacySettings)) : undefined
      };

      // Create a simplified mutation for user updates
      const updateUserSimple = /* GraphQL */ `
        mutation UpdateUserSimple($input: UpdateUserInput!) {
          updateUser(input: $input) {
            id
            email
            firstName
            lastName
            phoneNumber
            role
            isActive
            preferences
            notificationSettings
            privacySettings
            updatedAt
          }
        }
      `;

      const result = await client.graphql({
        query: updateUserSimple,
        variables: { input: updateInput }
      });

      const updatedUser = (result as any).data.updateUser;
      console.log('User updated successfully:', {
        userId: updatedUser.id,
        updatedAt: updatedUser.updatedAt
      });
      
      return this.parseUserFromDB(updatedUser);
    } catch (error) {
      console.error('Error updating user:', error);
      
      // Check if update was successful despite errors
      if (error.data && error.data.updateUser && error.data.updateUser.id) {
        console.log('User updated successfully despite some errors');
        return this.parseUserFromDB(error.data.updateUser);
      }
      
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

      // Create a simplified mutation for role updates
      const updateUserRoleSimple = /* GraphQL */ `
        mutation UpdateUserRoleSimple($input: UpdateUserInput!) {
          updateUser(input: $input) {
            id
            email
            firstName
            lastName
            role
            isActive
            updatedAt
          }
        }
      `;

      const result = await client.graphql({
        query: updateUserRoleSimple,
        variables: { input }
      });

      const updatedUser = (result as any).data.updateUser;
      console.log('User role updated successfully:', {
        userId,
        newRole: updatedUser.role,
        updatedAt: updatedUser.updatedAt
      });

      return this.parseUserFromDB(updatedUser);
    } catch (error: any) {
      console.error('Error updating user role:', error);
      
      // Check if update was successful despite errors
      if (error.data && error.data.updateUser && error.data.updateUser.id) {
        console.log('User role updated successfully despite some errors');
        return this.parseUserFromDB(error.data.updateUser);
      }
      
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
      // First, try to get the user with a simplified query to avoid authorization issues
      const getUserSimple = /* GraphQL */ `
        query GetUserSimple($id: ID!) {
          getUser(id: $id) {
            id
            email
            firstName
            lastName
            loginCount
            isActive
            role
          }
        }
      `;

      let user;
      try {
        const userResult = await client.graphql({
          query: getUserSimple,
          variables: { id: userId }
        });
        user = (userResult as any).data.getUser;
      } catch (getUserError) {
        // If getUser fails due to authorization, check if we got partial data
        if (getUserError.data && getUserError.data.getUser && getUserError.data.getUser.id) {
          user = getUserError.data.getUser;
          console.log('Got user data despite authorization warnings');
        } else {
          throw new Error('User not found');
        }
      }

      if (!user) {
        throw new Error('User not found');
      }

      const input = {
        id: userId,
        lastLoginAt: new Date().toISOString(),
        loginCount: (user.loginCount || 0) + 1
      };

      // Create a simplified mutation for login updates
      const updateUserLoginSimple = /* GraphQL */ `
        mutation UpdateUserLoginSimple($input: UpdateUserInput!) {
          updateUser(input: $input) {
            id
            email
            firstName
            lastName
            lastLoginAt
            loginCount
            isActive
            role
            updatedAt
          }
        }
      `;

      const result = await client.graphql({
        query: updateUserLoginSimple,
        variables: { input }
      });

      const updatedUser = (result as any).data.updateUser;
      console.log('Login information updated successfully:', {
        userId,
        lastLoginAt: updatedUser.lastLoginAt,
        loginCount: updatedUser.loginCount
      });
      
      return this.parseUserFromDB(updatedUser);
    } catch (error) {
      console.error('Error updating user login:', error);
      
      // Check if update was successful despite errors
      if (error.data && error.data.updateUser && error.data.updateUser.id) {
        console.log('Login information updated successfully despite some errors');
        return this.parseUserFromDB(error.data.updateUser);
      }
      
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