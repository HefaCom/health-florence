import { generateClient } from 'aws-amplify/api';

const client = generateClient();

export interface DietaryPlan {
  id: string;
  userId: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  isRecommended: boolean;
  isCompleted: boolean;
  time?: string;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDietaryPlanInput {
  id?: string;
  userId: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  isRecommended?: boolean;
  isCompleted?: boolean;
  time?: string;
  reason?: string;
}

export interface UpdateDietaryPlanInput {
  id: string;
  name?: string;
  category?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  isRecommended?: boolean;
  isCompleted?: boolean;
  time?: string;
  reason?: string;
}

class DietaryPlanService {
  // Create a new dietary plan
  async createDietaryPlan(input: CreateDietaryPlanInput): Promise<DietaryPlan> {
    try {
      const createDietaryPlan = /* GraphQL */ `
        mutation CreateDietaryPlan($input: CreateDietaryPlanInput!) {
          createDietaryPlan(input: $input) {
            id
            userId
            name
            category
            calories
            protein
            carbs
            fat
            fiber
            isRecommended
            isCompleted
            time
            reason
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
        query: createDietaryPlan,
        variables: { input: inputWithId },
        authMode: 'apiKey'
      }) as any;

      return result.data.createDietaryPlan;
    } catch (error) {
      console.error('Error creating dietary plan:', error);
      throw error;
    }
  }

  // Get dietary plans for a user
  async getDietaryPlansByUserId(userId: string): Promise<DietaryPlan[]> {
    try {
      const listDietaryPlans = /* GraphQL */ `
        query ListDietaryPlans($filter: ModelDietaryPlanFilterInput, $limit: Int) {
          listDietaryPlans(filter: $filter, limit: $limit) {
            items {
              id
              userId
              name
              category
              calories
              protein
              carbs
              fat
              fiber
              isRecommended
              isCompleted
              time
              reason
              createdAt
              updatedAt
            }
          }
        }
      `;

      const result = await client.graphql({
        query: listDietaryPlans,
        variables: {
          filter: { userId: { eq: userId } },
          limit: 100
        },
        authMode: 'apiKey'
      }) as any;

      return result.data.listDietaryPlans.items || [];
    } catch (error) {
      console.error('Error fetching dietary plans:', error);
      throw error;
    }
  }

  // Update a dietary plan
  async updateDietaryPlan(input: UpdateDietaryPlanInput): Promise<DietaryPlan> {
    try {
      const updateDietaryPlan = /* GraphQL */ `
        mutation UpdateDietaryPlan($input: UpdateDietaryPlanInput!) {
          updateDietaryPlan(input: $input) {
            id
            userId
            name
            category
            calories
            protein
            carbs
            fat
            fiber
            isRecommended
            isCompleted
            time
            reason
            createdAt
            updatedAt
          }
        }
      `;

      const result = await client.graphql({
        query: updateDietaryPlan,
        variables: { input },
        authMode: 'apiKey'
      }) as any;

      return result.data.updateDietaryPlan;
    } catch (error) {
      console.error('Error updating dietary plan:', error);
      throw error;
    }
  }

  // Delete a dietary plan
  async deleteDietaryPlan(id: string): Promise<void> {
    try {
      const deleteDietaryPlan = /* GraphQL */ `
        mutation DeleteDietaryPlan($input: DeleteDietaryPlanInput!) {
          deleteDietaryPlan(input: $input) {
            id
          }
        }
      `;

      await client.graphql({
        query: deleteDietaryPlan,
        variables: { input: { id } },
        authMode: 'apiKey'
      });
    } catch (error) {
      console.error('Error deleting dietary plan:', error);
      throw error;
    }
  }

  // Toggle completion status
  async toggleCompletion(id: string, isCompleted: boolean): Promise<DietaryPlan> {
    return this.updateDietaryPlan({ id, isCompleted });
  }
}

export const dietaryPlanService = new DietaryPlanService();
