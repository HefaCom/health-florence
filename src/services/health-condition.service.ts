import { generateClient } from 'aws-amplify/api';

const client = generateClient();

export interface HealthCondition {
  id: string;
  userId: string;
  name: string;
  severity: string;
  status: string;
  diagnosedDate: string;
  description: string;
  medications?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHealthConditionInput {
  id?: string;
  userId: string;
  name: string;
  severity: string;
  status: string;
  diagnosedDate: string;
  description: string;
  medications?: string;
}

export interface UpdateHealthConditionInput {
  id: string;
  name?: string;
  severity?: string;
  status?: string;
  diagnosedDate?: string;
  description?: string;
  medications?: string;
}

class HealthConditionService {
  // Create a new health condition
  async createHealthCondition(input: CreateHealthConditionInput): Promise<HealthCondition> {
    try {
      const createHealthCondition = /* GraphQL */ `
        mutation CreateHealthCondition($input: CreateHealthConditionInput!) {
          createHealthCondition(input: $input) {
            id
            userId
            name
            severity
            status
            diagnosedDate
            description
            medications
            createdAt
            updatedAt
          }
        }
      `;

      // Generate ID if not provided
      const inputWithId = {
        ...input,
        id: input.id || crypto.randomUUID()
      };

      const result = await client.graphql({
        query: createHealthCondition,
        variables: { input: inputWithId },
        authMode: 'apiKey'
      }) as any;

      return result.data.createHealthCondition;
    } catch (error) {
      console.error('Error creating health condition:', error);
      throw error;
    }
  }

  // Get health conditions for a user
  async getHealthConditionsByUserId(userId: string): Promise<HealthCondition[]> {
    try {
      const listHealthConditions = /* GraphQL */ `
        query ListHealthConditions($filter: ModelHealthConditionFilterInput, $limit: Int) {
          listHealthConditions(filter: $filter, limit: $limit) {
            items {
              id
              userId
              name
              severity
              status
              diagnosedDate
              description
              medications
              createdAt
              updatedAt
            }
          }
        }
      `;

      const result = await client.graphql({
        query: listHealthConditions,
        variables: {
          filter: { userId: { eq: userId } },
          limit: 100
        },
        authMode: 'apiKey'
      }) as any;

      return result.data.listHealthConditions.items || [];
    } catch (error) {
      console.error('Error fetching health conditions:', error);
      throw error;
    }
  }

  // Update a health condition
  async updateHealthCondition(input: UpdateHealthConditionInput): Promise<HealthCondition> {
    try {
      const updateHealthCondition = /* GraphQL */ `
        mutation UpdateHealthCondition($input: UpdateHealthConditionInput!) {
          updateHealthCondition(input: $input) {
            id
            userId
            name
            severity
            status
            diagnosedDate
            description
            medications
            createdAt
            updatedAt
          }
        }
      `;

      const result = await client.graphql({
        query: updateHealthCondition,
        variables: { input },
        authMode: 'apiKey'
      }) as any;

      return result.data.updateHealthCondition;
    } catch (error) {
      console.error('Error updating health condition:', error);
      throw error;
    }
  }

  // Delete a health condition
  async deleteHealthCondition(id: string): Promise<void> {
    try {
      const deleteHealthCondition = /* GraphQL */ `
        mutation DeleteHealthCondition($input: DeleteHealthConditionInput!) {
          deleteHealthCondition(input: $input) {
            id
          }
        }
      `;

      await client.graphql({
        query: deleteHealthCondition,
        variables: { input: { id } },
        authMode: 'apiKey'
      });
    } catch (error) {
      console.error('Error deleting health condition:', error);
      throw error;
    }
  }

  // Get a single health condition
  async getHealthCondition(id: string): Promise<HealthCondition> {
    try {
      const getHealthCondition = /* GraphQL */ `
        query GetHealthCondition($id: ID!) {
          getHealthCondition(id: $id) {
            id
            userId
            name
            severity
            status
            diagnosedDate
            description
            medications
            createdAt
            updatedAt
          }
        }
      `;

      const result = await client.graphql({
        query: getHealthCondition,
        variables: { id },
        authMode: 'apiKey'
      }) as any;

      return result.data.getHealthCondition;
    } catch (error) {
      console.error('Error fetching health condition:', error);
      throw error;
    }
  }
}

export const healthConditionService = new HealthConditionService();
