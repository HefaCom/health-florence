import { generateClient } from 'aws-amplify/api';

// Generate API client
const client = generateClient();

export interface HealthMetrics {
  id: string;
  userId: string;
  heartRate: number;
  heartRateTarget: number;
  steps: number;
  stepsTarget: number;
  activityMinutes: number;
  activityTarget: number;
  sleepHours: number;
  sleepTarget: number;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHealthMetricsInput {
  userId: string;
  heartRate: number;
  heartRateTarget: number;
  steps: number;
  stepsTarget: number;
  activityMinutes: number;
  activityTarget: number;
  sleepHours: number;
  sleepTarget: number;
  date: string;
}

export interface UpdateHealthMetricsInput {
  id: string;
  heartRate?: number;
  heartRateTarget?: number;
  steps?: number;
  stepsTarget?: number;
  activityMinutes?: number;
  activityTarget?: number;
  sleepHours?: number;
  sleepTarget?: number;
  date?: string;
}

class HealthMetricsService {
  /**
   * Create new health metrics entry
   */
  async createHealthMetrics(input: CreateHealthMetricsInput): Promise<HealthMetrics> {
    try {
      const createHealthMetrics = /* GraphQL */ `
        mutation CreateHealthMetrics($input: CreateHealthMetricsInput!) {
          createHealthMetrics(input: $input) {
            id
            userId
            heartRate
            heartRateTarget
            steps
            stepsTarget
            activityMinutes
            activityTarget
            sleepHours
            sleepTarget
            date
            createdAt
            updatedAt
          }
        }
      `;

      const result = await client.graphql({
        query: createHealthMetrics,
        variables: { input }
      });

      if ((result as any).data?.createHealthMetrics) {
        return (result as any).data.createHealthMetrics;
      } else {
        throw new Error('Failed to create health metrics');
      }
    } catch (error: any) {
      console.error('Error creating health metrics:', error);
      throw new Error(`Failed to create health metrics: ${error.message}`);
    }
  }

  /**
   * Update existing health metrics
   */
  async updateHealthMetrics(input: UpdateHealthMetricsInput): Promise<HealthMetrics> {
    try {
      const updateHealthMetrics = /* GraphQL */ `
        mutation UpdateHealthMetrics($input: UpdateHealthMetricsInput!) {
          updateHealthMetrics(input: $input) {
            id
            userId
            heartRate
            heartRateTarget
            steps
            stepsTarget
            activityMinutes
            activityTarget
            sleepHours
            sleepTarget
            date
            createdAt
            updatedAt
          }
        }
      `;

      const result = await client.graphql({
        query: updateHealthMetrics,
        variables: { input }
      });

      if ((result as any).data?.updateHealthMetrics) {
        return (result as any).data.updateHealthMetrics;
      } else {
        throw new Error('Failed to update health metrics');
      }
    } catch (error: any) {
      console.error('Error updating health metrics:', error);
      throw new Error(`Failed to update health metrics: ${error.message}`);
    }
  }

  /**
   * Get health metrics for a user
   */
  async getHealthMetricsByUserId(userId: string): Promise<HealthMetrics[]> {
    try {
      const listHealthMetrics = /* GraphQL */ `
        query ListHealthMetrics($filter: ModelHealthMetricsFilterInput) {
          listHealthMetrics(filter: $filter) {
            items {
              id
              userId
              heartRate
              heartRateTarget
              steps
              stepsTarget
              activityMinutes
              activityTarget
              sleepHours
              sleepTarget
              date
              createdAt
              updatedAt
            }
          }
        }
      `;

      const result = await client.graphql({
        query: listHealthMetrics,
        variables: {
          filter: { userId: { eq: userId } }
        }
      });

      if ((result as any).data?.listHealthMetrics?.items) {
        return (result as any).data.listHealthMetrics.items;
      } else {
        return [];
      }
    } catch (error: any) {
      console.error('Error fetching health metrics:', error);
      throw new Error(`Failed to fetch health metrics: ${error.message}`);
    }
  }

  /**
   * Get today's health metrics for a user
   */
  async getTodaysHealthMetrics(userId: string): Promise<HealthMetrics | null> {
    try {
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      
      const listHealthMetrics = /* GraphQL */ `
        query ListHealthMetrics($filter: ModelHealthMetricsFilterInput) {
          listHealthMetrics(filter: $filter) {
            items {
              id
              userId
              heartRate
              heartRateTarget
              steps
              stepsTarget
              activityMinutes
              activityTarget
              sleepHours
              sleepTarget
              date
              createdAt
              updatedAt
            }
          }
        }
      `;

      const result = await client.graphql({
        query: listHealthMetrics,
        variables: {
          filter: { 
            userId: { eq: userId },
            date: { eq: today }
          }
        }
      });

      if ((result as any).data?.listHealthMetrics?.items?.length > 0) {
        return (result as any).data.listHealthMetrics.items[0];
      } else {
        return null;
      }
    } catch (error: any) {
      console.error('Error fetching today\'s health metrics:', error);
      throw new Error(`Failed to fetch today's health metrics: ${error.message}`);
    }
  }

  /**
   * Delete health metrics
   */
  async deleteHealthMetrics(id: string): Promise<void> {
    try {
      const deleteHealthMetrics = /* GraphQL */ `
        mutation DeleteHealthMetrics($input: DeleteHealthMetricsInput!) {
          deleteHealthMetrics(input: $input) {
            id
          }
        }
      `;

      await client.graphql({
        query: deleteHealthMetrics,
        variables: { input: { id } }
      });
    } catch (error: any) {
      console.error('Error deleting health metrics:', error);
      throw new Error(`Failed to delete health metrics: ${error.message}`);
    }
  }
}

export const healthMetricsService = new HealthMetricsService();
