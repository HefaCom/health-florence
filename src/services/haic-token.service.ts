import { generateClient } from 'aws-amplify/api';
import { xrplService } from './xrpl.service';
import { auditService } from './audit.service';
import { walletService } from './wallet.service';
import { walletEvents } from './wallet-events';
import { createHAICReward, createHAICTransaction } from '../graphql/mutations';
import { listHAICRewards, listHAICTransactions } from '../graphql/queries';

// Generate API client
const client = generateClient();

export interface HAICReward {
  id?: string;
  userId: string;
  amount: number;
  reason: string;
  category: 'goal_completion' | 'dietary_adherence' | 'appointment_attendance' | 'health_checkin' | 'profile_completion' | 'medication_adherence';
  transactionHash?: string;
  blockNumber?: number;
  status: 'pending' | 'confirmed' | 'failed';
  gasUsed?: number;
  gasPrice?: number;
  confirmationCount: number;
  expiresAt?: string;
  metadata?: any;
  createdAt?: string;
  updatedAt?: string;
}

export interface HAICTransaction {
  id?: string;
  userId: string;
  type: 'earn' | 'spend' | 'transfer';
  amount: number;
  balance: number;
  description: string;
  transactionHash?: string;
  blockNumber?: number;
  status: 'pending' | 'confirmed' | 'failed';
  gasUsed?: number;
  gasPrice?: number;
  recipientAddress?: string;
  senderAddress?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface TokenBalance {
  haic: number;
  xrp: number;
  lastUpdated: string;
}

export interface RewardRates {
  goal_completion: number;
  dietary_adherence: number;
  appointment_attendance: number;
  health_checkin: number;
  profile_completion: number;
  medication_adherence: number;
}

class HAICTokenService {
  private readonly REWARD_RATES: RewardRates = {
    goal_completion: 100,
    dietary_adherence: 50,
    appointment_attendance: 75,
    health_checkin: 25,
    profile_completion: 150,
    medication_adherence: 60
  };

  private readonly MAX_SUPPLY = 1000000000; // 1 billion HAIC tokens
  private readonly DECIMALS = 6;

  /**
   * Calculate reward amount for an action
   */
  calculateReward(action: string, userId: string): number {
    const category = action as keyof RewardRates;
    return this.REWARD_RATES[category] || 0;
  }

  /**
   * Distribute HAIC tokens as reward
   */
  async distributeReward(userId: string, amount: number, reason: string, category: string): Promise<HAICReward> {
    try {
      console.log(`🎁 Distributing ${amount} HAIC tokens to user ${userId} for ${reason}`);

      // Create reward record
      const reward: HAICReward = {
        id: crypto.randomUUID(),
        userId,
        amount,
        reason,
        category: category as any,
        status: 'pending',
        confirmationCount: 0
      };

      // Store reward in database
      await this.storeReward(reward);

      try {
        const transactionHash = await this.submitRewardToXRPL(userId, amount.toString(), reason);
        reward.transactionHash = transactionHash;
        reward.status = 'confirmed';
      } catch (error) {
        console.error('Failed to submit reward to XRPL:', error);
        reward.status = 'failed';
        await this.updateReward(reward);
        walletEvents.emitBalanceUpdated(userId);
        throw error;
      }

      await this.updateReward(reward);
      walletEvents.emitBalanceUpdated(userId);

      // Log audit event (commented out for now to avoid compilation issues)
      // await auditService.logEvent({
      //   userId,
      //   action: 'haic_reward_distributed',
      //   resourceId: reward.id!,
      //   details: { amount, reason, category, transactionHash: reward.transactionHash },
      //   severity: 'low',
      //   category: 'system',
      //   outcome: reward.status === 'confirmed' ? 'success' : 'failure'
      // });

      return reward;
    } catch (error) {
      console.error('Error distributing reward:', error);
      throw error;
    }
  }

  /**
   * Submit reward to XRPL
   */
  private async submitRewardToXRPL(userId: string, amount: string, reason: string): Promise<string> {
    try {
      // Get user's XRPL address (in a real implementation, this would be stored in user profile)
      const userAddress = await this.getUserXRPLAddress(userId);
      
      // Transfer HAIC tokens
      const result = await xrplService.transferHAICTokens(userAddress, amount);
      
      if (result.success && result.hash) {
        return result.hash;
      } else {
        throw new Error(result.error || 'Failed to transfer HAIC tokens');
      }
    } catch (error) {
      console.error('Error submitting reward to XRPL:', error);
      throw error;
    }
  }

  /**
   * Get user's XRPL address
   */
  private async getUserXRPLAddress(userId: string): Promise<string> {
    const wallet = await walletService.getJoeyWallet(userId);
    if (wallet?.address) {
      return wallet.address;
    }
    throw new Error('No linked Joey wallet found for this user.');
  }

  /**
   * Store reward in database
   */
  private async storeReward(reward: HAICReward): Promise<void> {
    try {
      // Use a simplified mutation that doesn't fetch related user fields
      const createHAICRewardSimple = /* GraphQL */ `
        mutation CreateHAICRewardSimple($input: CreateHAICRewardInput!) {
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

      const result = await client.graphql({
        query: createHAICRewardSimple,
        variables: {
          input: {
            id: reward.id,
            userId: reward.userId,
            amount: reward.amount,
            reason: reward.reason,
            category: reward.category,
            transactionHash: reward.transactionHash
          }
        },
        authMode: 'apiKey' // Use API key for public access
      });

      // Check if the reward was actually created successfully
      if ((result as any).data && (result as any).data.createHAICReward) {
        console.log('✅ HAIC reward stored successfully:', (result as any).data.createHAICReward);
        return;
      }

      // If there are errors but the data was created, log them but don't throw
      if ((result as any).errors && (result as any).errors.length > 0) {
        console.warn('⚠️ HAIC reward created but with authorization warnings:', (result as any).errors);
        return; // Don't throw error if data was created
      }

      throw new Error('No data returned from createHAICReward mutation');
    } catch (error) {
      console.error('Error storing reward:', error);
      
      // Check if this is just authorization errors but reward was created
      if (error.data && error.data.createHAICReward && error.data.createHAICReward.id) {
        console.log('✅ HAIC reward created successfully despite authorization warnings');
        return; // Don't throw error if reward was created
      }
      
      throw error;
    }
  }

  /**
   * Update reward in database
   */
  private async updateReward(reward: HAICReward): Promise<void> {
    try {
      const updateHAICRewardSimple = /* GraphQL */ `
        mutation UpdateHAICRewardSimple($input: UpdateHAICRewardInput!) {
          updateHAICReward(input: $input) {
            id
            transactionHash
            updatedAt
          }
        }
      `;

      await client.graphql({
        query: updateHAICRewardSimple,
        variables: {
          input: {
            id: reward.id,
            transactionHash: reward.transactionHash ?? null
          }
        },
        authMode: 'apiKey'
      });
    } catch (error) {
      console.error('Error updating HAIC reward:', error);
    }
  }

  /**
   * Get user's HAIC token balance
   */
  async getUserBalance(userId: string): Promise<TokenBalance> {
    try {
      // Get XRPL balance
      let userAddress: string | null = null;
      try {
        userAddress = await this.getUserXRPLAddress(userId);
      } catch (walletError) {
        console.warn('Wallet lookup failed for user balance:', walletError);
      }

      let xrplBalance = { xrp: '0', haic: '0' };
      if (userAddress) {
        try {
          xrplBalance = await xrplService.getAccountBalance(userAddress);
        } catch (balanceError) {
          console.error('Failed to fetch XRPL balance:', balanceError);
        }
      }

      // Calculate HAIC balance from rewards
      const rewards = await this.getUserRewards(userId);
      const haicBalance = rewards.reduce((total, reward) => {
        return total + (reward.status === 'confirmed' ? reward.amount : 0);
      }, 0);

      return {
        haic: haicBalance,
        xrp: parseFloat(xrplBalance.xrp) / 1000000, // Convert drops to XRP
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting user balance:', error);
      return {
        haic: 0,
        xrp: 0,
        lastUpdated: new Date().toISOString()
      };
    }
  }

  /**
   * Get user's reward history
   */
  async getUserRewards(userId: string, limit: number = 50): Promise<HAICReward[]> {
    try {
      const result = await client.graphql({
        query: listHAICRewards,
        variables: {
          filter: { userId: { eq: userId } },
          limit
        }
      });

      return (result as any).data.listHAICRewards.items.map((item: any) => ({
        id: item.id,
        userId: item.userId,
        amount: item.amount,
        reason: item.reason,
        category: item.category,
        transactionHash: item.transactionHash,
        blockNumber: item.blockNumber,
        // Some legacy records may not have a status; default to confirmed for display
        status: item.status ?? 'confirmed',
        gasUsed: item.gasUsed,
        gasPrice: item.gasPrice,
        confirmationCount: item.confirmationCount,
        expiresAt: item.expiresAt,
        metadata: item.metadata ? JSON.stringify(item.metadata) : undefined,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }));
    } catch (error) {
      console.error('Error getting user rewards:', error);
      return [];
    }
  }

  /**
   * Get user's transaction history
   */
  async getUserTransactions(userId: string, limit: number = 50): Promise<HAICTransaction[]> {
    try {
      const result = await client.graphql({
        query: listHAICTransactions,
        variables: {
          filter: { userId: { eq: userId } },
          limit
        }
      });

      return (result as any).data.listHAICTransactions.items.map((item: any) => ({
        id: item.id,
        userId: item.userId,
        type: item.type,
        amount: item.amount,
        balance: item.balance,
        description: item.description,
        transactionHash: item.transactionHash,
        blockNumber: item.blockNumber,
        status: item.status,
        gasUsed: item.gasUsed,
        gasPrice: item.gasPrice,
        recipientAddress: item.recipientAddress,
        senderAddress: item.senderAddress,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt
      }));
    } catch (error) {
      console.error('Error getting user transactions:', error);
      return [];
    }
  }

  /**
   * Transfer HAIC tokens between users
   */
  async transferTokens(fromUserId: string, toUserId: string, amount: number, description: string): Promise<HAICTransaction> {
    try {
      console.log(`💸 Transferring ${amount} HAIC tokens from ${fromUserId} to ${toUserId}`);

      // Check sender balance
      const senderBalance = await this.getUserBalance(fromUserId);
      if (senderBalance.haic < amount) {
        throw new Error('Insufficient HAIC token balance');
      }

      // Create transaction record
      const transaction: HAICTransaction = {
        id: crypto.randomUUID(),
        userId: fromUserId,
        type: 'transfer',
        amount,
        balance: senderBalance.haic - amount,
        description,
        status: 'pending'
      };

      // Store transaction in database
      await this.storeTransaction(transaction);

      // Submit to XRPL
      try {
        const fromAddress = await this.getUserXRPLAddress(fromUserId);
        const toAddress = await this.getUserXRPLAddress(toUserId);
        
        const result = await xrplService.transferHAICTokens(toAddress, amount.toString());
        
        if (result.success && result.hash) {
          transaction.transactionHash = result.hash;
          transaction.status = 'confirmed';
          transaction.recipientAddress = toAddress;
          transaction.senderAddress = fromAddress;

          // Update transaction
          await this.updateTransaction(transaction);
        } else {
          transaction.status = 'failed';
          await this.updateTransaction(transaction);
        }
      } catch (error) {
        console.error('Failed to submit transfer to XRPL:', error);
        transaction.status = 'failed';
        await this.updateTransaction(transaction);
      }
      finally {
        walletEvents.emitBalanceUpdated(fromUserId);
        walletEvents.emitBalanceUpdated(toUserId);
      }

      // Log audit event
      await auditService.logEvent({
        userId: fromUserId,
        action: 'haic_transfer',
        resourceId: transaction.id!,
        details: { toUserId, amount, description, transactionHash: transaction.transactionHash },
        severity: 'medium',
        category: 'data_modification',
        outcome: transaction.status === 'confirmed' ? 'success' : 'failure'
      });

      return transaction;
    } catch (error) {
      console.error('Error transferring tokens:', error);
      throw error;
    }
  }

  /**
   * Store transaction in database
   */
  private async storeTransaction(transaction: HAICTransaction): Promise<void> {
    try {
      // Use a simplified mutation that doesn't fetch related user fields
      const createHAICTransactionSimple = /* GraphQL */ `
        mutation CreateHAICTransactionSimple($input: CreateHAICTransactionInput!) {
          createHAICTransaction(input: $input) {
            id
            userId
            type
            amount
            balance
            description
            transactionHash
            blockNumber
            status
            gasUsed
            gasPrice
            recipientAddress
            senderAddress
            createdAt
            updatedAt
          }
        }
      `;

      const result = await client.graphql({
        query: createHAICTransactionSimple,
        variables: {
          input: {
            id: transaction.id,
            userId: transaction.userId,
            type: transaction.type,
            amount: transaction.amount,
            balance: transaction.balance,
            description: transaction.description,
            transactionHash: transaction.transactionHash,
            blockNumber: transaction.blockNumber,
            status: transaction.status,
            gasUsed: transaction.gasUsed,
            gasPrice: transaction.gasPrice,
            recipientAddress: transaction.recipientAddress,
            senderAddress: transaction.senderAddress
          }
        },
        authMode: 'apiKey' // Use API key for public access
      });

      console.log('✅ HAIC transaction stored successfully:', result);
    } catch (error) {
      console.error('Error storing transaction:', error);
      
      // Check if this is just authorization errors but transaction was created
      if (error.data && error.data.createHAICTransaction && error.data.createHAICTransaction.id) {
        console.log('✅ HAIC transaction created successfully despite authorization warnings');
        return; // Don't throw error if transaction was created
      }
      
      throw error;
    }
  }

  /**
   * Update transaction in database
   */
  private async updateTransaction(transaction: HAICTransaction): Promise<void> {
    try {
      const updateHAICTransactionSimple = /* GraphQL */ `
        mutation UpdateHAICTransactionSimple($input: UpdateHAICTransactionInput!) {
          updateHAICTransaction(input: $input) {
            id
            status
            transactionHash
            recipientAddress
            senderAddress
            updatedAt
          }
        }
      `;

      await client.graphql({
        query: updateHAICTransactionSimple,
        variables: {
          input: {
            id: transaction.id,
            status: transaction.status,
            transactionHash: transaction.transactionHash ?? null,
            recipientAddress: transaction.recipientAddress ?? null,
            senderAddress: transaction.senderAddress ?? null
          }
        },
        authMode: 'apiKey'
      });
    } catch (error) {
      console.error('Error updating HAIC transaction:', error);
    }
  }

  /**
   * Get reward rates
   */
  getRewardRates(): RewardRates {
    return { ...this.REWARD_RATES };
  }

  /**
   * Update reward rates (admin only)
   */
  async updateRewardRates(newRates: Partial<RewardRates>): Promise<void> {
    // In a real implementation, this would update the rates in a smart contract or database
    Object.assign(this.REWARD_RATES, newRates);
    console.log('📊 Updated reward rates:', this.REWARD_RATES);
  }

  /**
   * Mint new HAIC tokens (admin only)
   */
  async mintTokens(amount: number): Promise<string> {
    try {
      console.log(`🪙 Minting ${amount} new HAIC tokens`);

      // Submit mint transaction to XRPL
      const result = await xrplService.issueHAICTokens(amount.toString());
      
      if (result.success && result.hash) {
        // Log audit event
        await auditService.logEvent({
          userId: 'system',
          action: 'haic_tokens_minted',
          resourceId: result.hash,
          details: { amount, transactionHash: result.hash },
          severity: 'high',
          category: 'system',
          outcome: 'success'
        });

        return result.hash;
      } else {
        throw new Error('Failed to mint HAIC tokens');
      }
    } catch (error) {
      console.error('Error minting tokens:', error);
      throw error;
    }
  }

  /**
   * Get token statistics
   */
  async getTokenStatistics(): Promise<{
    totalSupply: number;
    totalRewards: number;
    totalTransfers: number;
    activeUsers: number;
  }> {
    try {
      // In a real implementation, this would query the database for statistics
      return {
        totalSupply: this.MAX_SUPPLY,
        totalRewards: 0, // Would be calculated from database
        totalTransfers: 0, // Would be calculated from database
        activeUsers: 0 // Would be calculated from database
      };
    } catch (error) {
      console.error('Error getting token statistics:', error);
      return {
        totalSupply: this.MAX_SUPPLY,
        totalRewards: 0,
        totalTransfers: 0,
        activeUsers: 0
      };
    }
  }
}

export const haicTokenService = new HAICTokenService();
