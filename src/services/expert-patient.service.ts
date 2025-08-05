import { generateClient } from 'aws-amplify/api';
import { 
  createExpertPatient as createExpertPatientMutation,
  updateExpertPatient as updateExpertPatientMutation,
  deleteExpertPatient as deleteExpertPatientMutation
} from '../graphql/mutations';
import { 
  getExpertPatient as getExpertPatientQuery, 
  listExpertPatients as listExpertPatientsQuery 
} from '../graphql/queries';

// Generate API client
const client = generateClient();

export interface ExpertPatient {
  id: string;
  userId: string;
  expertId: string;
  status: string; // active, inactive, pending
  addedAt: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  expert?: {
    id: string;
    specialization: string;
    user?: {
      firstName: string;
      lastName: string;
    };
  };
}

export interface CreateExpertPatientInput {
  id: string;
  userId: string;
  expertId: string;
  status: string;
  addedAt: string;
  notes?: string;
}

export interface UpdateExpertPatientInput {
  id: string;
  status?: string;
  notes?: string;
}

class ExpertPatientService {
  /**
   * Add an expert as a patient's specialist
   */
  async addExpertToPatient(input: CreateExpertPatientInput): Promise<ExpertPatient> {
    try {
      const result = await client.graphql({
        query: createExpertPatientMutation,
        variables: { input }
      });

      return (result as any).data.createExpertPatient;
    } catch (error) {
      console.error('Error adding expert to patient:', error);
      throw error;
    }
  }

  /**
   * Remove an expert from a patient's specialists
   */
  async removeExpertFromPatient(id: string): Promise<boolean> {
    try {
      await client.graphql({
        query: deleteExpertPatientMutation,
        variables: { input: { id } }
      });

      return true;
    } catch (error) {
      console.error('Error removing expert from patient:', error);
      throw error;
    }
  }

  /**
   * Update expert-patient relationship status
   */
  async updateExpertPatientStatus(id: string, status: string, notes?: string): Promise<ExpertPatient> {
    try {
      const input: UpdateExpertPatientInput = { id, status };
      if (notes) input.notes = notes;

      const result = await client.graphql({
        query: updateExpertPatientMutation,
        variables: { input }
      });

      return (result as any).data.updateExpertPatient;
    } catch (error) {
      console.error('Error updating expert-patient status:', error);
      throw error;
    }
  }

  /**
   * Get all experts for a specific patient
   */
  async getPatientExperts(userId: string): Promise<ExpertPatient[]> {
    try {
      const result = await client.graphql({
        query: listExpertPatientsQuery,
        variables: {
          filter: { userId: { eq: userId } }
        }
      });

      return (result as any).data.listExpertPatients.items;
    } catch (error) {
      console.error('Error getting patient experts:', error);
      throw error;
    }
  }

  /**
   * Get all patients for a specific expert
   */
  async getExpertPatients(expertId: string): Promise<ExpertPatient[]> {
    try {
      const result = await client.graphql({
        query: listExpertPatientsQuery,
        variables: {
          filter: { expertId: { eq: expertId } }
        }
      });

      return (result as any).data.listExpertPatients.items;
    } catch (error) {
      console.error('Error getting expert patients:', error);
      throw error;
    }
  }

  /**
   * Check if a patient has a specific expert
   */
  async hasExpert(userId: string, expertId: string): Promise<boolean> {
    try {
      const result = await client.graphql({
        query: listExpertPatientsQuery,
        variables: {
          filter: { 
            and: [
              { userId: { eq: userId } },
              { expertId: { eq: expertId } }
            ]
          }
        }
      });

      const relationships = (result as any).data.listExpertPatients.items;
      return relationships.length > 0;
    } catch (error) {
      console.error('Error checking expert relationship:', error);
      return false;
    }
  }

  /**
   * Get active expert-patient relationships
   */
  async getActiveExpertPatients(userId: string): Promise<ExpertPatient[]> {
    try {
      const result = await client.graphql({
        query: listExpertPatientsQuery,
        variables: {
          filter: { 
            and: [
              { userId: { eq: userId } },
              { status: { eq: 'active' } }
            ]
          }
        }
      });

      return (result as any).data.listExpertPatients.items;
    } catch (error) {
      console.error('Error getting active expert patients:', error);
      throw error;
    }
  }

  /**
   * Get expert-patient relationship by ID
   */
  async getExpertPatient(id: string): Promise<ExpertPatient | null> {
    try {
      const result = await client.graphql({
        query: getExpertPatientQuery,
        variables: { id }
      });

      return (result as any).data.getExpertPatient;
    } catch (error) {
      console.error('Error getting expert-patient relationship:', error);
      return null;
    }
  }

  /**
   * Get relationship between specific user and expert
   */
  async getRelationship(userId: string, expertId: string): Promise<ExpertPatient | null> {
    try {
      const result = await client.graphql({
        query: listExpertPatientsQuery,
        variables: {
          filter: { 
            and: [
              { userId: { eq: userId } },
              { expertId: { eq: expertId } }
            ]
          }
        }
      });

      const relationships = (result as any).data.listExpertPatients.items;
      return relationships.length > 0 ? relationships[0] : null;
    } catch (error) {
      console.error('Error getting relationship:', error);
      return null;
    }
  }
}

export const expertPatientService = new ExpertPatientService(); 