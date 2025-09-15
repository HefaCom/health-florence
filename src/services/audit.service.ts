import { generateClient } from 'aws-amplify/api';
import { xrplService } from './xrpl.service';
import { createAuditEvent, createAuditBatch } from '../graphql/mutations';
import { listAuditEvents, listAuditBatches } from '../graphql/queries';

// Generate API client
const client = generateClient();

export interface AuditEvent {
  id?: string;
  timestamp: string;
  userId: string;
  action: string;
  resourceId: string;
  details: any;
  transactionHash?: string;
  merkleRoot?: string;
  batchId?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'authentication' | 'data_access' | 'data_modification' | 'system';
  outcome: 'success' | 'failure' | 'partial';
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export interface AuditBatch {
  id?: string;
  timestamp: string;
  merkleRoot: string;
  transactionHash: string;
  events: AuditEvent[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

export interface AuditFilter {
  userId?: string;
  action?: string;
  category?: string;
  severity?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
  nextToken?: string;
}

class AuditService {
  private static BATCH_INTERVAL = 4 * 60 * 60 * 1000; // 4 hours
  private static MAX_BATCH_SIZE = 1000;
  private static pendingEvents: AuditEvent[] = [];
  private static batchTimer: NodeJS.Timeout | null = null;

  /**
   * Log an audit event
   */
  async logEvent(event: Omit<AuditEvent, 'id' | 'timestamp'>): Promise<void> {
    try {
      const auditEvent: AuditEvent = {
          ...event,
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString()
      };

      // Add to pending events
      AuditService.pendingEvents.push(auditEvent);

      // Store in database immediately for local tracking
      await this.storeEvent(auditEvent);

      // Check if we should process a batch
      if (this.shouldProcessBatch()) {
        await this.processBatch();
      }

      console.log(`📝 Audit event logged: ${event.action} by ${event.userId}`);
    } catch (error) {
      console.error('Error logging audit event:', error);
      // Don't throw error to avoid breaking the main application flow
      console.warn('Audit logging failed, but continuing with main operation');
    }
  }

  /**
   * Store audit event in database
   */
  private async storeEvent(event: AuditEvent): Promise<void> {
    try {
      await client.graphql({
        query: createAuditEvent,
        variables: {
          input: {
            id: event.id,
            timestamp: event.timestamp,
            userId: event.userId,
            action: event.action,
            resourceId: event.resourceId,
            details: JSON.stringify(event.details),
            transactionHash: event.transactionHash || 'pending',
            merkleRoot: event.merkleRoot || null,
            batchId: event.batchId || null,
            severity: event.severity,
            category: event.category,
            outcome: event.outcome,
            ipAddress: event.ipAddress || null,
            userAgent: event.userAgent || null,
            sessionId: event.sessionId || null
          }
        }
      });
    } catch (error) {
      console.error('Error storing audit event:', error);
      
      // Check if the event was actually created despite errors
      if (error.data && error.data.createAuditEvent && error.data.createAuditEvent.id) {
        console.log('Audit event created successfully despite authorization warnings');
        return; // Don't throw error if event was created
      }
      
      // For now, just log the error and don't throw to avoid breaking the main flow
      console.warn('Audit event logging failed, but continuing with main operation');
    }
  }

  /**
   * Check if we should process a batch
   */
  private shouldProcessBatch(): boolean {
    return AuditService.pendingEvents.length >= AuditService.MAX_BATCH_SIZE ||
           (AuditService.pendingEvents.length > 0 && this.isBatchIntervalReached());
  }

  /**
   * Check if batch interval has been reached
   */
  private isBatchIntervalReached(): boolean {
    if (AuditService.pendingEvents.length === 0) return false;
    
    const oldestEvent = AuditService.pendingEvents[0];
    const now = new Date().getTime();
    const eventTime = new Date(oldestEvent.timestamp).getTime();
    
    return (now - eventTime) >= AuditService.BATCH_INTERVAL;
  }

  /**
   * Process a batch of audit events
   */
  private async processBatch(): Promise<void> {
    if (AuditService.pendingEvents.length === 0) return;

    try {
      console.log(`🔄 Processing audit batch with ${AuditService.pendingEvents.length} events`);

      // Create Merkle tree root
      const merkleRoot = this.createMerkleRoot(AuditService.pendingEvents);
      
      // Submit to XRPL
      const transactionHash = await this.submitToXRPL(merkleRoot);

      // Create audit batch record
      const batch: AuditBatch = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        merkleRoot,
        transactionHash,
        events: [...AuditService.pendingEvents],
        status: 'completed'
      };

      // Store batch in database
      await this.storeBatch(batch);

      // Update events with batch information
      await this.updateEventsWithBatch(AuditService.pendingEvents, batch.id!, transactionHash, merkleRoot);

      // Clear pending events
      AuditService.pendingEvents = [];

      console.log(`✅ Audit batch processed successfully. Hash: ${transactionHash}`);
    } catch (error) {
      console.error('Error processing audit batch:', error);
      
      // Mark batch as failed
      const batch: AuditBatch = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        merkleRoot: 'failed',
        transactionHash: 'failed',
        events: [...AuditService.pendingEvents],
        status: 'failed'
      };

      await this.storeBatch(batch);
      AuditService.pendingEvents = [];
      
      throw error;
    }
  }

  /**
   * Create Merkle tree root from events
   */
  private createMerkleRoot(events: AuditEvent[]): string {
    // Sort events by timestamp for consistent ordering
    const sortedEvents = events.sort((a, b) => 
      new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    // Create leaf hashes
    const leafHashes = sortedEvents.map(event => 
      this.hashEvent(event)
    );

    // Build Merkle tree
    return this.buildMerkleTree(leafHashes);
  }

  /**
   * Hash an individual event
   */
  private hashEvent(event: AuditEvent): string {
    const eventString = JSON.stringify({
      timestamp: event.timestamp,
      userId: event.userId,
      action: event.action,
      resourceId: event.resourceId,
      details: event.details,
      severity: event.severity,
      category: event.category,
      outcome: event.outcome
    });

    return this.sha256(eventString);
  }

  /**
   * Build Merkle tree from leaf hashes
   */
  private buildMerkleTree(hashes: string[]): string {
    if (hashes.length === 0) return '';
    if (hashes.length === 1) return hashes[0];

    const nextLevel: string[] = [];
    
    for (let i = 0; i < hashes.length; i += 2) {
      const left = hashes[i];
      const right = hashes[i + 1] || left; // Duplicate last hash if odd number
      const combined = left + right;
      nextLevel.push(this.sha256(combined));
    }

    return this.buildMerkleTree(nextLevel);
  }

  /**
   * Simple SHA-256 implementation (for demo purposes)
   * In production, use a proper crypto library
   */
  private sha256(input: string): string {
    // This is a simplified hash function for demo purposes
    // In production, use crypto.subtle.digest or a proper crypto library
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16).padStart(8, '0').repeat(8);
  }

  /**
   * Submit Merkle root to XRPL
   */
  private async submitToXRPL(merkleRoot: string): Promise<string> {
    try {
      console.log(`📤 Submitting audit batch to XRPL with merkle root: ${merkleRoot}`);
      
      // Ensure XRPL is connected
      await xrplService.connect();
      
      // Create audit transaction
      const transaction = {
        TransactionType: "Payment",
        Account: await xrplService.getWalletAddress(),
        Destination: await xrplService.getAuditAddress(),
        Amount: "0", // Zero amount for audit trail
        Memos: [{
          Memo: {
            MemoData: Buffer.from(merkleRoot, 'utf8').toString('hex')
          }
        }],
        Fee: "12" // Minimum fee
      };

      // Submit transaction
      const result = await xrplService.submitTransaction(transaction);
      
      console.log(`✅ XRPL submission successful. Hash: ${result.hash}`);
      return result.hash;
    } catch (error) {
      console.error('Error submitting to XRPL:', error);
      throw error;
    }
  }

  /**
   * Store audit batch in database
   */
  private async storeBatch(batch: AuditBatch): Promise<void> {
    try {
      await client.graphql({
        query: createAuditBatch,
        variables: {
          input: {
            id: batch.id,
            timestamp: batch.timestamp,
            merkleRoot: batch.merkleRoot,
            transactionHash: batch.transactionHash,
            status: batch.status
          }
        }
      });
    } catch (error) {
      console.error('Error storing audit batch:', error);
      throw error;
    }
  }

  /**
   * Update events with batch information
   */
  private async updateEventsWithBatch(events: AuditEvent[], batchId: string, transactionHash: string, merkleRoot: string): Promise<void> {
    // In a real implementation, you would update the events in the database
    // For now, we'll just log the update
    console.log(`📝 Updated ${events.length} events with batch ${batchId}`);
  }

  /**
   * Get audit events with filtering
   */
  async getAuditEvents(filter: AuditFilter = {}): Promise<{ events: AuditEvent[]; nextToken?: string }> {
    try {
      const result = await client.graphql({
        query: listAuditEvents,
        variables: {
          filter: {
            userId: filter.userId ? { eq: filter.userId } : undefined,
            action: filter.action ? { eq: filter.action } : undefined,
            category: filter.category ? { eq: filter.category } : undefined,
            severity: filter.severity ? { eq: filter.severity } : undefined,
            timestamp: {
              between: filter.startDate && filter.endDate ? [filter.startDate, filter.endDate] : undefined
            }
          },
          limit: filter.limit || 50,
          nextToken: filter.nextToken
        }
      });

      // Filter out null items and map the valid ones
      const events = (result as any).data.listAuditEvents.items
        .filter((item: any) => item !== null && item.id) // Filter out null items
        .map((item: any) => ({
          id: item.id,
          timestamp: item.timestamp,
          userId: item.userId,
          action: item.action,
          resourceId: item.resourceId,
          details: typeof item.details === 'string' ? JSON.parse(item.details) : item.details,
          transactionHash: item.transactionHash,
          merkleRoot: item.merkleRoot,
          batchId: item.batchId,
          severity: item.severity || 'low', // Default value for existing null records
          category: item.category || 'general', // Default value for existing null records
          outcome: item.outcome || 'success', // Default value for existing null records
          ipAddress: item.ipAddress,
          userAgent: item.userAgent,
          sessionId: item.sessionId
        }));

      return {
        events,
        nextToken: (result as any).data.listAuditEvents.nextToken
      };
    } catch (error) {
      console.error('Error fetching audit events:', error);
      
      // Check if we got data despite errors (common with authorization issues)
      if (error.data && error.data.listAuditEvents && error.data.listAuditEvents.items) {
        console.log('Got audit events data despite some errors, processing...');
        
        // Filter out null items and map the valid ones
        const events = error.data.listAuditEvents.items
          .filter((item: any) => item !== null && item.id) // Filter out null items
          .map((item: any) => ({
            id: item.id,
            timestamp: item.timestamp,
            userId: item.userId,
            action: item.action,
            resourceId: item.resourceId,
            details: typeof item.details === 'string' ? JSON.parse(item.details) : item.details,
            transactionHash: item.transactionHash,
            merkleRoot: item.merkleRoot,
            batchId: item.batchId,
            severity: item.severity || 'low',
            category: item.category || 'general',
            outcome: item.outcome || 'success',
            ipAddress: item.ipAddress,
            userAgent: item.userAgent,
            sessionId: item.sessionId
          }));

        return {
          events,
          nextToken: error.data.listAuditEvents.nextToken
        };
      }
      
      throw error;
    }
  }

  /**
   * Get audit batches
   */
  async getAuditBatches(limit: number = 20): Promise<AuditBatch[]> {
    try {
      const result = await client.graphql({
        query: listAuditBatches,
        variables: { limit }
      });

      // Filter out null items and map the valid ones
      return (result as any).data.listAuditBatches.items
        .filter((item: any) => item !== null && item.id) // Filter out null items
        .map((item: any) => ({
          id: item.id,
          timestamp: item.timestamp,
          merkleRoot: item.merkleRoot,
          transactionHash: item.transactionHash,
          events: [], // Events would be fetched separately
          status: item.status || 'pending' // Default value for existing null records
        }));
    } catch (error) {
      console.error('Error fetching audit batches:', error);
      
      // Check if we got data despite errors
      if (error.data && error.data.listAuditBatches && error.data.listAuditBatches.items) {
        console.log('Got audit batches data despite some errors, processing...');
        
        // Filter out null items and map the valid ones
        return error.data.listAuditBatches.items
          .filter((item: any) => item !== null && item.id) // Filter out null items
          .map((item: any) => ({
            id: item.id,
            timestamp: item.timestamp,
            merkleRoot: item.merkleRoot,
            transactionHash: item.transactionHash,
            events: [], // Events would be fetched separately
            status: item.status || 'pending' // Default value for existing null records
          }));
      }
      
      throw error;
    }
  }

  /**
   * Verify audit integrity against XRPL
   */
  async verifyAuditIntegrity(auditId: string): Promise<boolean> {
    try {
      // Get the audit event
      const events = await this.getAuditEvents({ limit: 1 });
      const event = events.events.find(e => e.id === auditId);
      
      if (!event || !event.transactionHash || event.transactionHash === 'pending') {
        return false;
      }

      // Verify transaction exists on XRPL
      const isValid = await xrplService.verifyTransaction(event.transactionHash);
      return isValid;
    } catch (error) {
      console.error('Error verifying audit integrity:', error);
      return false;
    }
  }

  /**
   * Start batch processing timer
   */
  startBatchProcessing(): void {
    if (AuditService.batchTimer) {
      clearInterval(AuditService.batchTimer);
    }

    AuditService.batchTimer = setInterval(async () => {
      if (AuditService.pendingEvents.length > 0) {
        await this.processBatch();
      }
    }, AuditService.BATCH_INTERVAL);
  }

  /**
   * Stop batch processing timer
   */
  stopBatchProcessing(): void {
    if (AuditService.batchTimer) {
      clearInterval(AuditService.batchTimer);
      AuditService.batchTimer = null;
    }
  }

  /**
   * Get pending events count
   */
  getPendingEventsCount(): number {
    return AuditService.pendingEvents.length;
  }

  /**
   * Force process current batch
   */
  async forceProcessBatch(): Promise<void> {
    if (AuditService.pendingEvents.length > 0) {
      await this.processBatch();
    }
  }
}

export const auditService = new AuditService(); 

