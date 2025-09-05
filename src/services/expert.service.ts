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
    listExperts(filter: { userId: { eq: $userId } }, limit: 10) {
      items {
        id
        userId
        specialization
        createdAt
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
      // Create a simplified mutation that doesn't fetch related fields
      const createExpertSimple = /* GraphQL */ `
        mutation CreateExpertSimple($input: CreateExpertInput!) {
          createExpert(input: $input) {
            id
            userId
            specialization
            subSpecializations
            licenseNumber
            yearsOfExperience
            bio
            practiceName
            practiceAddress
            practicePhone
            practiceEmail
            practiceWebsite
            consultationFee
            services
            languages
            education
            certifications
            verificationStatus
            isActive
            isVerified
            profileImage
            coverImage
            availability
            createdAt
            updatedAt
          }
        }
      `;

      const result = await client.graphql({
        query: createExpertSimple,
        variables: { input }
      });

      const createdExpert = (result as any).data.createExpert;
      console.log('Expert created successfully:', {
        expertId: createdExpert.id,
        userId: createdExpert.userId,
        specialization: createdExpert.specialization
      });

      return createdExpert;
    } catch (error) {
      console.error('Error creating expert:', error);
      
      // Check if expert was created successfully despite errors
      if (error.data && error.data.createExpert && error.data.createExpert.id) {
        console.log('Expert created successfully despite some errors');
        return error.data.createExpert;
      }
      
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
      console.log('getExpertByUserId called for userId:', userId);
      
      // Create a simplified query that doesn't fetch related fields
      const listExpertsSimple = /* GraphQL */ `
        query ListExpertsSimple($filter: ModelExpertFilterInput, $limit: Int) {
          listExperts(filter: $filter, limit: $limit) {
            items {
              id
              userId
              specialization
              subSpecializations
              licenseNumber
              yearsOfExperience
              bio
              practiceName
              practiceAddress
              practicePhone
              practiceEmail
              practiceWebsite
              consultationFee
              services
              languages
              education
              certifications
              verificationStatus
              isActive
              isVerified
              profileImage
              coverImage
              availability
              createdAt
              updatedAt
            }
          }
        }
      `;
      
      const result = await client.graphql({
        query: listExpertsSimple,
        variables: {
          filter: { userId: { eq: userId } }
        }
      });

      const experts = (result as any).data.listExperts.items;
      console.log('Experts found:', experts.length, experts);
      
      if (experts.length === 0) return null;
      
      // Sort by createdAt and return the most recent
      const sortedExperts = experts.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      console.log('Most recent expert:', sortedExperts[0]);
      return sortedExperts[0];
    } catch (error) {
      console.error('Error getting expert by user ID:', error);
      
      // Check if we got data despite errors
      if (error.data && error.data.listExperts && error.data.listExperts.items) {
        const experts = error.data.listExperts.items;
        if (experts.length > 0) {
          const sortedExperts = experts.sort((a: any, b: any) => 
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
          console.log('Got expert data despite errors:', sortedExperts[0]);
          return sortedExperts[0];
        }
      }
      
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
      // Create a query that includes user data
      const listExpertsWithUser = /* GraphQL */ `
        query ListExpertsWithUser($filter: ModelExpertFilterInput, $limit: Int) {
          listExperts(filter: $filter, limit: $limit) {
            items {
              id
              userId
              specialization
              subSpecializations
              licenseNumber
              yearsOfExperience
              education
              certifications
              languages
              practiceName
              practiceAddress
              practicePhone
              practiceEmail
              practiceWebsite
              availability
              consultationFee
              services
              bio
              profileImage
              coverImage
              isVerified
              isActive
              verificationStatus
              createdAt
              updatedAt
              user {
                id
                firstName
                lastName
                email
              }
            }
          }
        }
      `;

      const result = await client.graphql({
        query: listExpertsWithUser,
        variables: {
          filter: { isActive: { eq: true } },
          limit: 100
        }
      });

      const experts = (result as any).data.listExperts.items;
      
      // If any experts are missing user data, fetch it separately
      const expertsWithUserData = await Promise.all(
        experts.map(async (expert: Expert) => {
          if (!expert.user && expert.userId) {
            try {
              const userResponse = await client.graphql({
                query: /* GraphQL */ `
                  query GetUser($id: ID!) {
                    getUser(id: $id) {
                      id
                      firstName
                      lastName
                      email
                    }
                  }
                `,
                variables: { id: expert.userId }
              });
              expert.user = (userResponse as any).data?.getUser;
            } catch (error) {
              console.warn('Failed to fetch user data for expert:', expert.id, error);
            }
          }
          return expert;
        })
      );

      return expertsWithUserData;
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
      // Use the same enhanced query as getAllExperts
      const listExpertsWithUser = /* GraphQL */ `
        query ListExpertsWithUser($filter: ModelExpertFilterInput, $limit: Int) {
          listExperts(filter: $filter, limit: $limit) {
            items {
              id
              userId
              specialization
              subSpecializations
              licenseNumber
              yearsOfExperience
              education
              certifications
              languages
              practiceName
              practiceAddress
              practicePhone
              practiceEmail
              practiceWebsite
              availability
              consultationFee
              services
              bio
              profileImage
              coverImage
              isVerified
              isActive
              verificationStatus
              createdAt
              updatedAt
              user {
                id
                firstName
                lastName
                email
              }
            }
          }
        }
      `;

      const result = await client.graphql({
        query: listExpertsWithUser,
        variables: {
          filter: { 
            and: [
              { isActive: { eq: true } },
              { specialization: { contains: specialization } }
            ]
          },
          limit: 100
        }
      });

      const experts = (result as any).data.listExperts.items;
      
      // If any experts are missing user data, fetch it separately
      const expertsWithUserData = await Promise.all(
        experts.map(async (expert: Expert) => {
          if (!expert.user && expert.userId) {
            try {
              const userResponse = await client.graphql({
                query: /* GraphQL */ `
                  query GetUser($id: ID!) {
                    getUser(id: $id) {
                      id
                      firstName
                      lastName
                      email
                    }
                  }
                `,
                variables: { id: expert.userId }
              });
              expert.user = (userResponse as any).data?.getUser;
            } catch (error) {
              console.warn('Failed to fetch user data for expert:', expert.id, error);
            }
          }
          return expert;
        })
      );

      return expertsWithUserData;
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
      // Use the same enhanced query as getAllExperts
      const listExpertsWithUser = /* GraphQL */ `
        query ListExpertsWithUser($filter: ModelExpertFilterInput, $limit: Int) {
          listExperts(filter: $filter, limit: $limit) {
            items {
              id
              userId
              specialization
              subSpecializations
              licenseNumber
              yearsOfExperience
              education
              certifications
              languages
              practiceName
              practiceAddress
              practicePhone
              practiceEmail
              practiceWebsite
              availability
              consultationFee
              services
              bio
              profileImage
              coverImage
              isVerified
              isActive
              verificationStatus
              createdAt
              updatedAt
              user {
                id
                firstName
                lastName
                email
              }
            }
          }
        }
      `;

      const result = await client.graphql({
        query: listExpertsWithUser,
        variables: {
          filter: { 
            and: [
              { isActive: { eq: true } },
              { isVerified: { eq: true } }
            ]
          },
          limit: 100
        }
      });

      const experts = (result as any).data.listExperts.items;
      
      // If any experts are missing user data, fetch it separately
      const expertsWithUserData = await Promise.all(
        experts.map(async (expert: Expert) => {
          if (!expert.user && expert.userId) {
            try {
              const userResponse = await client.graphql({
                query: /* GraphQL */ `
                  query GetUser($id: ID!) {
                    getUser(id: $id) {
                      id
                      firstName
                      lastName
                      email
                    }
                  }
                `,
                variables: { id: expert.userId }
              });
              expert.user = (userResponse as any).data?.getUser;
            } catch (error) {
              console.warn('Failed to fetch user data for expert:', expert.id, error);
            }
          }
          return expert;
        })
      );

      return expertsWithUserData;
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
      console.log('hasExpertProfile called for userId:', userId);
      const expert = await this.getExpertByUserId(userId);
      console.log('Expert found:', expert);
      return !!expert;
    } catch (error) {
      console.error('Error checking expert profile:', error);
      return false;
    }
  }

  /**
   * Get the most recent expert profile for a user (handles duplicates)
   */
  async getMostRecentExpertByUserId(userId: string): Promise<Expert | null> {
    try {
      const result = await client.graphql({
        query: listExpertsQuery,
        variables: {
          filter: { userId: { eq: userId } }
        }
      });

      const experts = (result as any).data.listExperts.items;
      if (experts.length === 0) return null;
      
      // Sort by createdAt and return the most recent
      const sortedExperts = experts.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      return sortedExperts[0];
    } catch (error) {
      console.error('Error getting most recent expert by user ID:', error);
      return null;
    }
  }

  /**
   * Clean up duplicate expert profiles for a user (keeps the most recent)
   */
  async cleanupDuplicateProfiles(userId: string): Promise<void> {
    try {
      const result = await client.graphql({
        query: listExpertsQuery,
        variables: {
          filter: { userId: { eq: userId } }
        }
      });

      const experts = (result as any).data.listExperts.items;
      
      if (experts.length <= 1) {
        return; // No duplicates to clean up
      }
      
      // Sort by createdAt and keep the most recent
      const sortedExperts = experts.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      
      // Delete all except the most recent
      const toDelete = sortedExperts.slice(1);
      
      for (const expert of toDelete) {
        try {
          await this.deleteExpert(expert.id);
          console.log(`Deleted duplicate expert profile: ${expert.id}`);
        } catch (error) {
          console.error(`Failed to delete duplicate expert profile ${expert.id}:`, error);
        }
      }
    } catch (error) {
      console.error('Error cleaning up duplicate profiles:', error);
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