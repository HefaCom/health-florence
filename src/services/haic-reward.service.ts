import { generateClient } from 'aws-amplify/api';

const client = generateClient();

export interface HAICReward {
  id: string;
  userId: string;
  amount: number;
  reason: string;
  category: string;
  transactionHash?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHAICRewardInput {
  id?: string;
  userId: string;
  amount: number;
  reason: string;
  category: string;
  transactionHash?: string;
}

export interface UpdateHAICRewardInput {
  id: string;
  amount?: number;
  reason?: string;
  category?: string;
  transactionHash?: string;
}

class HAICRewardService {
  // Create a new HAIC reward
  async createHAICReward(input: CreateHAICRewardInput): Promise<HAICReward> {
    try {
      const createHAICReward = /* GraphQL */ `
        mutation CreateHAICReward($input: CreateHAICRewardInput!) {
          createHAICReward(input: $input) {
            id
            userId
            amount
            reason
            category
            transactionHash
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
        query: createHAICReward,
        variables: { input: inputWithId },
        authMode: 'apiKey'
      }) as any;

      return result.data.createHAICReward;
    } catch (error) {
      console.error('Error creating HAIC reward:', error);
      throw error;
    }
  }

  // Get HAIC rewards for a user
  async getHAICRewardsByUserId(userId: string): Promise<HAICReward[]> {
    try {
      const listHAICRewards = /* GraphQL */ `
        query ListHAICRewards($filter: ModelHAICRewardFilterInput, $limit: Int) {
          listHAICRewards(filter: $filter, limit: $limit) {
            items {
              id
              userId
              amount
              reason
              category
              transactionHash
              createdAt
              updatedAt
            }
          }
        }
      `;

      const result = await client.graphql({
        query: listHAICRewards,
        variables: {
          filter: { userId: { eq: userId } },
          limit: 100
        },
        authMode: 'apiKey'
      }) as any;

      return result.data.listHAICRewards.items || [];
    } catch (error) {
      console.error('Error fetching HAIC rewards:', error);
      throw error;
    }
  }

  // Get total HAIC balance for a user
  async getTotalHAICBalance(userId: string): Promise<number> {
    try {
      const rewards = await this.getHAICRewardsByUserId(userId);
      return rewards.reduce((total, reward) => total + reward.amount, 0);
    } catch (error) {
      console.error('Error calculating HAIC balance:', error);
      return 0;
    }
  }

  // Get recent HAIC rewards (last 10)
  async getRecentHAICRewards(userId: string, limit: number = 10): Promise<HAICReward[]> {
    try {
      const listHAICRewards = /* GraphQL */ `
        query ListHAICRewards($filter: ModelHAICRewardFilterInput, $limit: Int) {
          listHAICRewards(filter: $filter, limit: $limit) {
            items {
              id
              userId
              amount
              reason
              category
              transactionHash
              createdAt
              updatedAt
            }
          }
        }
      `;

      const result = await client.graphql({
        query: listHAICRewards,
        variables: {
          filter: { userId: { eq: userId } },
          limit: limit
        },
        authMode: 'apiKey'
      }) as any;

      const rewards = result.data.listHAICRewards.items || [];
      // Sort by creation date (newest first)
      return rewards.sort((a: HAICReward, b: HAICReward) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error) {
      console.error('Error fetching recent HAIC rewards:', error);
      return [];
    }
  }

  // Update a HAIC reward
  async updateHAICReward(input: UpdateHAICRewardInput): Promise<HAICReward> {
    try {
      const updateHAICReward = /* GraphQL */ `
        mutation UpdateHAICReward($input: UpdateHAICRewardInput!) {
          updateHAICReward(input: $input) {
            id
            userId
            amount
            reason
            category
            transactionHash
            createdAt
            updatedAt
          }
        }
      `;

      const result = await client.graphql({
        query: updateHAICReward,
        variables: { input },
        authMode: 'apiKey'
      }) as any;

      return result.data.updateHAICReward;
    } catch (error) {
      console.error('Error updating HAIC reward:', error);
      throw error;
    }
  }

  // Delete a HAIC reward
  async deleteHAICReward(id: string): Promise<void> {
    try {
      const deleteHAICReward = /* GraphQL */ `
        mutation DeleteHAICReward($input: DeleteHAICRewardInput!) {
          deleteHAICReward(input: $input) {
            id
          }
        }
      `;

      await client.graphql({
        query: deleteHAICReward,
        variables: { input: { id } },
        authMode: 'apiKey'
      });
    } catch (error) {
      console.error('Error deleting HAIC reward:', error);
      throw error;
    }
  }

  // Get HAIC rewards by category
  async getHAICRewardsByCategory(userId: string, category: string): Promise<HAICReward[]> {
    try {
      const listHAICRewards = /* GraphQL */ `
        query ListHAICRewards($filter: ModelHAICRewardFilterInput, $limit: Int) {
          listHAICRewards(filter: $filter, limit: $limit) {
            items {
              id
              userId
              amount
              reason
              category
              transactionHash
              createdAt
              updatedAt
            }
          }
        }
      `;

      const result = await client.graphql({
        query: listHAICRewards,
        variables: {
          filter: { 
            userId: { eq: userId },
            category: { eq: category }
          },
          limit: 100
        },
        authMode: 'apiKey'
      }) as any;

      return result.data.listHAICRewards.items || [];
    } catch (error) {
      console.error('Error fetching HAIC rewards by category:', error);
      return [];
    }
  }
}

export const haicRewardService = new HAICRewardService();
