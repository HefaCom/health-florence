import { generateClient } from 'aws-amplify/api';

import { NotificationService, NotificationType } from './NotificationService';

const client = generateClient();

export interface HealthGoal {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  isCompleted: boolean;
  isRecommended: boolean;
  priority: string;
  reward?: number;
  reason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHealthGoalInput {
  id?: string;
  userId: string;
  title: string;
  description: string;
  category: string;
  target: number;
  current?: number;
  unit: string;
  deadline: string;
  isCompleted?: boolean;
  isRecommended?: boolean;
  priority: string;
  reward?: number;
  reason?: string;
}

export interface UpdateHealthGoalInput {
  id: string;
  title?: string;
  description?: string;
  category?: string;
  target?: number;
  current?: number;
  unit?: string;
  deadline?: string;
  isCompleted?: boolean;
  isRecommended?: boolean;
  priority?: string;
  reward?: number;
  reason?: string;
}

class HealthGoalService {
  // Create a new health goal
  async createHealthGoal(input: CreateHealthGoalInput): Promise<HealthGoal> {
    try {
      const createHealthGoal = /* GraphQL */ `
        mutation CreateHealthGoal($input: CreateHealthGoalInput!) {
          createHealthGoal(input: $input) {
            id
            userId
            title
            description
            category
            target
            current
            unit
            deadline
            isCompleted
            isRecommended
            priority
            reward
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
        query: createHealthGoal,
        variables: { input: inputWithId },
        authMode: 'apiKey'
      }) as any;

      // Trigger notification
      try {
        await NotificationService.createNotification(
          inputWithId.userId,
          NotificationType.GOAL,
          'New Health Goal Set',
          `You've set a new goal: ${inputWithId.title}`,
          { goalId: inputWithId.id },
          '/health-goals'
        );
      } catch (e) {
        console.warn('Failed to send health goal notification:', e);
      }

      return result.data.createHealthGoal;
    } catch (error) {
      console.error('Error creating health goal:', error);
      throw error;
    }
  }

  // Get health goals for a user
  async getHealthGoalsByUserId(userId: string): Promise<HealthGoal[]> {
    try {
      const listHealthGoals = /* GraphQL */ `
        query ListHealthGoals($filter: ModelHealthGoalFilterInput, $limit: Int) {
          listHealthGoals(filter: $filter, limit: $limit) {
            items {
              id
              userId
              title
              description
              category
              target
              current
              unit
              deadline
              isCompleted
              isRecommended
              priority
              reward
              reason
              createdAt
              updatedAt
            }
          }
        }
      `;

      const result = await client.graphql({
        query: listHealthGoals,
        variables: {
          filter: { userId: { eq: userId } },
          limit: 100
        },
        authMode: 'apiKey'
      }) as any;

      return result.data.listHealthGoals.items || [];
    } catch (error) {
      console.error('Error fetching health goals:', error);
      throw error;
    }
  }

  // Update a health goal
  async updateHealthGoal(input: UpdateHealthGoalInput): Promise<HealthGoal> {
    try {
      const updateHealthGoal = /* GraphQL */ `
        mutation UpdateHealthGoal($input: UpdateHealthGoalInput!) {
          updateHealthGoal(input: $input) {
            id
            userId
            title
            description
            category
            target
            current
            unit
            deadline
            isCompleted
            isRecommended
            priority
            reward
            reason
            createdAt
            updatedAt
          }
        }
      `;

      const result = await client.graphql({
        query: updateHealthGoal,
        variables: { input },
        authMode: 'apiKey'
      }) as any;

      return result.data.updateHealthGoal;
    } catch (error) {
      console.error('Error updating health goal:', error);
      throw error;
    }
  }

  // Delete a health goal
  async deleteHealthGoal(id: string): Promise<void> {
    try {
      const deleteHealthGoal = /* GraphQL */ `
        mutation DeleteHealthGoal($input: DeleteHealthGoalInput!) {
          deleteHealthGoal(input: $input) {
            id
          }
        }
      `;

      await client.graphql({
        query: deleteHealthGoal,
        variables: { input: { id } },
        authMode: 'apiKey'
      });
    } catch (error) {
      console.error('Error deleting health goal:', error);
      throw error;
    }
  }

  // Update progress for a health goal
  async updateProgress(id: string, current: number): Promise<HealthGoal> {
    const goal = await this.getHealthGoal(id);
    const isCompleted = current >= goal.target;

    const result = await this.updateHealthGoal({
      id,
      current,
      isCompleted
    });

    if (isCompleted && !goal.isCompleted) {
      try {
        // Notify User
        await NotificationService.createNotification(
          goal.userId,
          NotificationType.GOAL,
          'Goal Completed! 🎉',
          `Congratulations! You've completed your goal: ${goal.title}`,
          { goalId: id },
          '/health/goals'
        );

        // Notify Admins
        await NotificationService.notifyAdmins(
          NotificationType.GOAL,
          'User Completed Goal',
          `User has completed their goal: ${goal.title}`,
          { goalId: id, userId: goal.userId },
          '/admin/users' // Or specific goal view
        );
      } catch (e) { console.warn(e); }
    }

    return result;
  }

  // Get a single health goal
  async getHealthGoal(id: string): Promise<HealthGoal> {
    try {
      const getHealthGoal = /* GraphQL */ `
        query GetHealthGoal($id: ID!) {
          getHealthGoal(id: $id) {
            id
            userId
            title
            description
            category
            target
            current
            unit
            deadline
            isCompleted
            isRecommended
            priority
            reward
            reason
            createdAt
            updatedAt
          }
        }
      `;

      const result = await client.graphql({
        query: getHealthGoal,
        variables: { id },
        authMode: 'apiKey'
      }) as any;

      return result.data.getHealthGoal;
    } catch (error) {
      console.error('Error fetching health goal:', error);
      throw error;
    }
  }
}

export const healthGoalService = new HealthGoalService();
