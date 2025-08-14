import { generateClient } from 'aws-amplify/api';
import {
  createExpert as createExpertMutation,
  updateExpert as updateExpertMutation,
  deleteExpert as deleteExpertMutation
} from '../graphql/mutations';
import { 
  getExpert as getExpertQuery, 
  listExperts as listExpertsQuery 
} from '../graphql/queries';

// Generate API client
const client = generateClient();

// Custom query to get expert with user data by userId
const GET_EXPERT_BY_USER_ID_WITH_USER = /* GraphQL */ `
  query GetExpertByUserIdWithUser($userId: String!) {
    listExperts(filter: { userId: { eq: $userId } }, limit: 1) {
      items {
        id
        userId
        specialization
        user {
          id
          email
          firstName
          lastName
        }
      }
    }
  }
`;

export interface Expert {
  id: string;
  userId: string;
  specialization: string;
  subSpecializations?: string[];
  licenseNumber: string;
  yearsOfExperience: number;
  education?: string[];
  certifications?: string[];
  languages?: string[];
  practiceName?: string;
  practiceAddress?: string;
  practicePhone?: string;
  practiceEmail?: string;
  practiceWebsite?: string;
  availability?: any;
  consultationFee?: number;
  services?: string[];
  bio?: string;
  profileImage?: string;
  coverImage?: string;
  isVerified: boolean;
  isActive: boolean;
  verificationStatus: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export interface CreateExpertInput {
  id: string;
  userId: string;
  specialization: string;
  subSpecializations?: string[];
  licenseNumber: string;
  yearsOfExperience: number;
  education?: string[];
  certifications?: string[];
  languages?: string[];
  practiceName?: string;
  practiceAddress?: string;
  practicePhone?: string;
  practiceEmail?: string;
  practiceWebsite?: string;
  availability?: any;
  consultationFee?: number;
  services?: string[];
  bio?: string;
  profileImage?: string;
  coverImage?: string;
  isVerified?: boolean;
  isActive?: boolean;
  verificationStatus?: string;
}

export interface UpdateExpertInput {
  id: string;
  userId?: string;
  specialization?: string;
  subSpecializations?: string[];
  licenseNumber?: string;
  yearsOfExperience?: number;
  education?: string[];
  certifications?: string[];
  languages?: string[];
  practiceName?: string;
  practiceAddress?: string;
  practicePhone?: string;
  practiceEmail?: string;
  practiceWebsite?: string;
  availability?: any;
  consultationFee?: number;
  services?: string[];
  bio?: string;
  profileImage?: string;
  coverImage?: string;
  isVerified?: boolean;
  isActive?: boolean;
  verificationStatus?: string;
}

class ExpertService {
  /**
   * Create a new expert profile
   */
  async createExpert(input: CreateExpertInput): Promise<Expert> {
    try {
      const result = await client.graphql({
        query: createExpertMutation,
        variables: { input }
      });

      return (result as any).data.createExpert;
    } catch (error) {
      console.error('Error creating expert:', error);
      throw error;
    }
  }

  /**
   * Get expert by ID
   */
  async getExpert(id: string): Promise<Expert | null> {
    try {
      const result = await client.graphql({
        query: getExpertQuery,
        variables: { id }
      });

      return (result as any).data.getExpert;
    } catch (error) {
      console.error('Error getting expert:', error);
      return null;
    }
  }

  /**
   * Get expert by user ID
   */
  async getExpertByUserId(userId: string): Promise<Expert | null> {
    try {
      const result = await client.graphql({
        query: GET_EXPERT_BY_USER_ID_WITH_USER,
        variables: {
          userId
        }
      });

      const experts = (result as any).data.listExperts.items;
      return experts.length > 0 ? experts[0] : null;
    } catch (error) {
      console.error('Error getting expert by user ID:', error);
      return null;
    }
  }

  /**
   * Update expert profile
   */
  async updateExpert(input: UpdateExpertInput): Promise<Expert> {
    try {
      const result = await client.graphql({
        query: updateExpertMutation,
        variables: { input }
      });

      return (result as any).data.updateExpert;
    } catch (error) {
      console.error('Error updating expert:', error);
      throw error;
    }
  }

  /**
   * Delete expert profile
   */
  async deleteExpert(id: string): Promise<boolean> {
    try {
      await client.graphql({
        query: deleteExpertMutation,
        variables: { input: { id } }
      });

      return true;
    } catch (error) {
      console.error('Error deleting expert:', error);
      throw error;
    }
  }

  /**
   * Get all experts (for discovery)
   */
  async getAllExperts(): Promise<Expert[]> {
    try {
      const result = await client.graphql({
        query: listExpertsQuery,
        variables: {
          filter: { isActive: { eq: true } }
        }
      });

      return (result as any).data.listExperts.items;
    } catch (error) {
      console.error('Error getting all experts:', error);
      throw error;
    }
  }

  /**
   * Search experts by specialization
   */
  async searchExpertsBySpecialization(specialization: string): Promise<Expert[]> {
    try {
      const result = await client.graphql({
        query: listExpertsQuery,
        variables: {
          filter: { 
            and: [
              { isActive: { eq: true } },
              { specialization: { contains: specialization } }
            ]
          }
        }
      });

      return (result as any).data.listExperts.items;
    } catch (error) {
      console.error('Error searching experts by specialization:', error);
      throw error;
    }
  }

  /**
   * Get verified experts only
   */
  async getVerifiedExperts(): Promise<Expert[]> {
    try {
      const result = await client.graphql({
        query: listExpertsQuery,
        variables: {
          filter: { 
            and: [
              { isActive: { eq: true } },
              { isVerified: { eq: true } }
            ]
          }
        }
      });

      return (result as any).data.listExperts.items;
    } catch (error) {
      console.error('Error getting verified experts:', error);
      throw error;
    }
  }

  /**
   * Check if user has expert profile
   */
  async hasExpertProfile(userId: string): Promise<boolean> {
    try {
      const expert = await this.getExpertByUserId(userId);
      return !!expert;
    } catch (error) {
      console.error('Error checking expert profile:', error);
      return false;
    }
  }

  /**
   * Get expert statistics
   */
  async getExpertStats(expertId: string): Promise<{
    totalPatients: number;
    totalAppointments: number;
    averageRating: number;
    totalReviews: number;
  }> {
    try {
      // This would need to be implemented with actual appointment and patient data
      // For now, returning mock data
      return {
        totalPatients: 0,
        totalAppointments: 0,
        averageRating: 0,
        totalReviews: 0
      };
    } catch (error) {
      console.error('Error getting expert stats:', error);
      throw error;
    }
  }
}

export const expertService = new ExpertService(); 