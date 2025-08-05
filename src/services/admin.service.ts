import { userService, User } from './user.service';

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  usersByRole: {
    user: number;
    expert: number;
    admin: number;
  };
  recentRegistrations: number;
  totalAppointments: number;
  systemHealth: {
    status: 'healthy' | 'warning' | 'critical';
    message: string;
  };
}

export interface UserManagementData {
  users: User[];
  stats: AdminStats;
}

class AdminService {
  /**
   * Get all users for admin management
   */
  async getAllUsers(): Promise<User[]> {
    try {
      return await userService.getAllUsers();
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
      return await userService.getUsersByRole(role);
    } catch (error) {
      console.error('Error getting users by role:', error);
      throw error;
    }
  }

  /**
   * Update user role (admin only)
   */
  async updateUserRole(userId: string, role: 'user' | 'admin' | 'expert'): Promise<User> {
    try {
      return await userService.updateUserRole(userId, role);
    } catch (error) {
      console.error('Error updating user role:', error);
      throw error;
    }
  }

  /**
   * Activate/deactivate user account
   */
  async toggleUserStatus(userId: string, isActive: boolean): Promise<User> {
    try {
      return await userService.updateUser({
        id: userId,
        isActive
      });
    } catch (error) {
      console.error('Error toggling user status:', error);
      throw error;
    }
  }

  /**
   * Delete user account
   */
  async deleteUser(userId: string): Promise<boolean> {
    try {
      return await userService.deleteUser(userId);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  /**
   * Get admin dashboard statistics
   */
  async getAdminStats(): Promise<AdminStats> {
    try {
      const allUsers = await userService.getAllUsers();
      const activeUsers = allUsers.filter(user => user.isActive);
      
      const usersByRole = {
        user: allUsers.filter(user => user.role === 'user').length,
        expert: allUsers.filter(user => user.role === 'expert').length,
        admin: allUsers.filter(user => user.role === 'admin').length
      };

      // Calculate recent registrations (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentRegistrations = allUsers.filter(user => 
        new Date(user.createdAt) > thirtyDaysAgo
      ).length;

      // Mock data for appointments (replace with actual appointment service)
      const totalAppointments = 0; // TODO: Implement appointment counting

      // System health check
      const systemHealth = {
        status: 'healthy' as const,
        message: 'All systems operational'
      };

      return {
        totalUsers: allUsers.length,
        activeUsers: activeUsers.length,
        usersByRole,
        recentRegistrations,
        totalAppointments,
        systemHealth
      };
    } catch (error) {
      console.error('Error getting admin stats:', error);
      throw error;
    }
  }

  /**
   * Get comprehensive user management data
   */
  async getUserManagementData(): Promise<UserManagementData> {
    try {
      const [users, stats] = await Promise.all([
        this.getAllUsers(),
        this.getAdminStats()
      ]);

      return {
        users,
        stats
      };
    } catch (error) {
      console.error('Error getting user management data:', error);
      throw error;
    }
  }

  /**
   * Bulk update user roles
   */
  async bulkUpdateUserRoles(updates: Array<{ userId: string; role: 'user' | 'admin' | 'expert' }>): Promise<User[]> {
    try {
      const results = await Promise.all(
        updates.map(update => this.updateUserRole(update.userId, update.role))
      );
      return results;
    } catch (error) {
      console.error('Error bulk updating user roles:', error);
      throw error;
    }
  }

  /**
   * Search users by various criteria
   */
  async searchUsers(criteria: {
    email?: string;
    role?: 'user' | 'admin' | 'expert';
    isActive?: boolean;
    name?: string;
  }): Promise<User[]> {
    try {
      const allUsers = await this.getAllUsers();
      
      return allUsers.filter(user => {
        if (criteria.email && !user.email.toLowerCase().includes(criteria.email.toLowerCase())) {
          return false;
        }
        if (criteria.role && user.role !== criteria.role) {
          return false;
        }
        if (criteria.isActive !== undefined && user.isActive !== criteria.isActive) {
          return false;
        }
        if (criteria.name) {
          const fullName = `${user.firstName} ${user.lastName}`.toLowerCase();
          if (!fullName.includes(criteria.name.toLowerCase())) {
            return false;
          }
        }
        return true;
      });
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  }

  /**
   * Export user data for reporting
   */
  async exportUserData(): Promise<Array<{
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean;
    createdAt: string;
    lastLoginAt?: string;
    loginCount: number;
  }>> {
    try {
      const users = await this.getAllUsers();
      
      return users.map(user => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
        loginCount: user.loginCount
      }));
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  }
}

export const adminService = new AdminService(); 