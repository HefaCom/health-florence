import { xrplService } from './xrpl.service';
import { generateClient } from 'aws-amplify/api';
import { createAuditEvent, createAuditBatch } from '../graphql/mutations';
import { GraphQLResult } from '@aws-amplify/api';
import { getCurrentUser } from 'aws-amplify/auth';

const client = generateClient();

export interface AuditEvent {
  id?: string;
  timestamp: string;
  userId: string;
  action: string;
  resourceId: string;
  details: object;
}

// For testing: Process all actions immediately
const TESTING_MODE = true;
const MAX_RETRIES = 2;

class AuditService {
  private events: AuditEvent[] = [];
  // private readonly BATCH_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
  private readonly BATCH_INTERVAL = 10 * 1000; // 10 seconds for testing
  private readonly MAX_BATCH_SIZE = 100;
  private batchTimer: NodeJS.Timeout | null = null;
  private isProcessingBatch: boolean = false;
  private lastProcessTime: number = Date.now();

  constructor() {
    this.initializeBatchProcessing();
    if (TESTING_MODE) {
      console.log('🔍 Audit Service running in TESTING MODE - Events will still be batched every 4 hours');
    }
  }

  private initializeBatchProcessing() {
    // Clear any existing timer
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
    }

    // Set up new batch processing timer for every 4 hours
    this.batchTimer = setInterval(async () => {
      const now = Date.now();
      // Only process if 4 hours have passed or we have a full batch
      if (now - this.lastProcessTime >= this.BATCH_INTERVAL || this.events.length >= this.MAX_BATCH_SIZE) {
        await this.processBatch();
        this.lastProcessTime = now;
      }
    }, 60000); // Check every minute but only process when conditions are met
  }

  async logEvent(event: AuditEvent) {
    try {
      if (TESTING_MODE) {
        console.log(`📝 Logging audit event: ${event.action}`);
      }

      // Always store in database first
      const storedEvent = await this.storeEventInDatabase(event);
      
      if (TESTING_MODE && storedEvent.data?.createAuditEvent?.id) {
        console.log(`✅ Event stored in database with ID: ${storedEvent.data.createAuditEvent.id}`);
      }

      // Add to batch for processing
      if (storedEvent.data?.createAuditEvent?.id) {
        this.events.push({
          ...event,
          id: storedEvent.data.createAuditEvent.id
        });

        // Process immediately only if batch is full
        if (this.events.length >= this.MAX_BATCH_SIZE) {
          await this.processBatch();
          this.lastProcessTime = Date.now();
        }
      }
    } catch (error) {
      console.error('Failed to log audit event:', error);
    }
  }

  private async processBatch() {
    if (this.events.length === 0 || this.isProcessingBatch) {
      if (TESTING_MODE) {
        console.log(`⏭️ Skipping batch processing: ${this.events.length === 0 ? 'No events' : 'Already processing'}`);
      }
      return;
    }

    // Filter out any events without IDs
    const validEvents = this.events.filter(event => event.id);
    if (validEvents.length === 0) {
      if (TESTING_MODE) {
        console.log('⚠️ No valid events to process (all events missing IDs)');
      }
      this.events = []; // Clear invalid events
      return;
    }

    this.isProcessingBatch = true;
    try {
      if (TESTING_MODE) {
        console.log(`🔄 Processing batch of ${validEvents.length} events`);
      }

      // Create merkle root for the batch
      const merkleRoot = await this.createMerkleRoot(validEvents);
      if (!merkleRoot) {
        throw new Error('Failed to create merkle root');
      }
      
      if (TESTING_MODE) {
        console.log(`🌳 Created merkle root: ${merkleRoot}`);
      }

      let transactionHash: string | null = null;

      // Try to submit to XRPL
      try {
        if (TESTING_MODE) {
          console.log(`📤 Submitting to XRPL with merkle root: ${merkleRoot}`);
        }
        const xrplResult = await xrplService.submitAuditTrail(merkleRoot);
        if (xrplResult.success) {
          transactionHash = xrplResult.hash;
          if (TESTING_MODE) {
            console.log(`✅ XRPL submission successful. Hash: ${transactionHash}`);
          }
        } else if (xrplResult.error === 'The transaction is redundant.') {
          // If the transaction is redundant, it means it was already submitted successfully
          if (TESTING_MODE) {
            console.log('ℹ️ XRPL submission was redundant (already submitted)');
          }
          // Use a placeholder hash for redundant transactions
          transactionHash = `redundant-${merkleRoot.substring(0, 8)}`;
        } else {
          console.warn('❌ XRPL submission failed:', xrplResult.error);
        }
      } catch (error) {
        console.warn('❌ XRPL submission failed with error:', error);
      }

      // Create audit batch regardless of XRPL status
      try {
        if (TESTING_MODE) {
          console.log(`📝 Creating audit batch with merkle root: ${merkleRoot}`);
        }

        // If XRPL submission failed, use a placeholder transaction hash
        const finalTransactionHash = transactionHash || `pending-${merkleRoot.substring(0, 8)}`;

        const batchResponse = await client.graphql({
          query: createAuditBatch,
          variables: {
            input: {
              timestamp: new Date().toISOString(),
              merkleRoot,
              transactionHash: finalTransactionHash
            }
          },
          authMode: 'apiKey'
        });

        if (batchResponse.data?.createAuditBatch?.id) {
          if (TESTING_MODE) {
            console.log(`✅ Created batch ${batchResponse.data.createAuditBatch.id}`);
          }

          // Update all events in the batch
          const updatePromises = this.events.map(event => 
            this.updateEventWithBatch(
              event.id!,
              batchResponse.data.createAuditBatch.id,
              merkleRoot,
              finalTransactionHash
            )
          );

          const updateResults = await Promise.allSettled(updatePromises);
          
          if (TESTING_MODE) {
            const successful = updateResults.filter(r => r.status === 'fulfilled').length;
            const failed = updateResults.filter(r => r.status === 'rejected').length;
            console.log(`📊 Updated ${successful} events successfully, ${failed} failed`);
          }
        }
      } catch (error) {
        console.error('❌ Failed to create audit batch:', error);
      }

      // Clear processed events
      this.events = [];
      if (TESTING_MODE) {
        console.log('🧹 Cleared processed events');
      }
    } catch (error) {
      console.error('❌ Failed to process batch:', error);
      if (error instanceof Error) {
        console.error('Error details:', error.message);
        console.error('Stack trace:', error.stack);
      }
    } finally {
      this.isProcessingBatch = false;
      if (TESTING_MODE) {
        console.log('🏁 Batch processing completed');
      }
    }
  }

  private async storeEventInDatabase(event: AuditEvent) {
    try {
      const response = await client.graphql({
        query: createAuditEvent,
        variables: {
          input: {
            timestamp: event.timestamp,
            userId: event.userId,
            action: event.action,
            resourceId: event.resourceId,
            details: JSON.stringify(event.details),
            merkleRoot: null,
            transactionHash: null
          }
        },
        authMode: 'apiKey'
      });

      if (TESTING_MODE) {
        console.log('📋 Database response:', response);
      }

      return response;
    } catch (error) {
      console.error('Failed to store event in database:', error);
      throw error;
    }
  }

  private async updateEventWithBatch(
    eventId: string,
    batchId: string,
    merkleRoot: string,
    transactionHash: string | null,
    retryCount: number = 0
  ) {
    try {
      await client.graphql({
        query: /* GraphQL */ `
          mutation UpdateAuditEvent(
            $input: UpdateAuditEventInput!
          ) {
            updateAuditEvent(input: $input) {
              id
              batchId
              merkleRoot
              transactionHash
            }
          }
        `,
        variables: {
          input: {
            id: eventId,
            batchId,
            merkleRoot,
            transactionHash
          }
        },
        authMode: 'apiKey'
      });

      if (TESTING_MODE) {
        console.log(`🔗 Event ${eventId} updated with batch ${batchId}`);
      }
    } catch (error) {
      console.error(`❌ Failed to update event ${eventId} with batch information:`, error);
      
      // Retry up to MAX_RETRIES times with exponential backoff
      if (retryCount < MAX_RETRIES) {
        const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff: 1s, 2s, 4s
        if (TESTING_MODE) {
          console.log(`🔄 Retrying update for event ${eventId} in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
        }
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.updateEventWithBatch(eventId, batchId, merkleRoot, transactionHash, retryCount + 1);
      }
      
      throw error; // Re-throw after max retries
    }
  }

  // Create a Merkle tree root from the events
  private async createMerkleRoot(events: AuditEvent[]): Promise<string> {
    // Hash each event
    const leaves = await Promise.all(events.map(event => this.hashEvent(event)));
    
    // If there's only one event, return its hash
    if (leaves.length === 1) {
      return leaves[0];
    }

    // Build the Merkle tree
    let level = leaves;
    while (level.length > 1) {
      const nextLevel: string[] = [];
      for (let i = 0; i < level.length; i += 2) {
        if (i + 1 < level.length) {
          // Hash the pair of nodes
          nextLevel.push(await this.hashPair(level[i], level[i + 1]));
        } else {
          // If there's an odd number of nodes, promote the last one
          nextLevel.push(level[i]);
        }
      }
      level = nextLevel;
    }

    return level[0];
  }

  // Hash an individual event using Web Crypto API
  private async hashEvent(event: AuditEvent): Promise<string> {
    const eventString = JSON.stringify(event);
    const encoder = new TextEncoder();
    const data = encoder.encode(eventString);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return this.bufferToHex(hashBuffer);
  }

  // Hash a pair of nodes using Web Crypto API
  private async hashPair(left: string, right: string): Promise<string> {
    const combined = left + right;
    const encoder = new TextEncoder();
    const data = encoder.encode(combined);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return this.bufferToHex(hashBuffer);
  }

  // Convert ArrayBuffer to hexadecimal string
  private bufferToHex(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  }

  // Manually trigger batch processing (for testing)
  async forceBatchProcessing() {
    if (TESTING_MODE) {
      console.log('🔄 Manually triggering batch processing');
    }
    await this.processBatch();
  }

  destroy() {
    if (this.batchTimer) {
      clearInterval(this.batchTimer);
      this.batchTimer = null;
    }
  }
}

export const auditService = new AuditService(); 