import { Client, Wallet, xrpToDrops } from 'xrpl';
import { toast } from 'sonner';

// Define types for XRPL responses
interface XRPLResponse {
  result: {
    meta?: {
      TransactionResult?: string;
    };
    hash?: string;
    account_data?: {
      Balance: string;
    };
  };
}

class XRPLService {
  private client: Client | null = null;
  private wallet: Wallet | null = null;
  private readonly MAX_RETRIES = 3;
  private readonly CONNECTION_TIMEOUT = 15000; // 15 seconds
  
  // Initialize XRPL client
  async connect() {
    let retries = 0;
    while (retries < this.MAX_RETRIES) {
      try {
        // Connect to XRPL testnet with increased timeout
        this.client = new Client('wss://s.altnet.rippletest.net:51233', {
          timeout: this.CONNECTION_TIMEOUT,
          connectionTimeout: this.CONNECTION_TIMEOUT
        });
        await this.client.connect();
        return true;
      } catch (error) {
        console.error(`Failed to connect to XRPL (attempt ${retries + 1}/${this.MAX_RETRIES}):`, error);
        retries++;
        if (retries < this.MAX_RETRIES) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retries)));
        }
      }
    }
    return false;
  }

  // Disconnect from XRPL
  async disconnect() {
    if (this.client) {
      await this.client.disconnect();
      this.client = null;
    }
  }

  // Create or load a wallet
  async initializeWallet(seed?: string) {
    if (!this.client) {
      const connected = await this.connect();
      if (!connected) {
        throw new Error('Failed to connect to XRPL');
      }
    }

    // Ensure client is connected before proceeding
    if (!this.client?.isConnected()) {
      console.log('Client not connected, attempting to reconnect...');
      const connected = await this.connect();
      if (!connected) {
        throw new Error('Failed to connect to XRPL');
      }
    }

    try {
      if (seed) {
        // Load existing wallet
        this.wallet = Wallet.fromSeed(seed);
      } else {
        // Create new wallet with proper type handling
        const { wallet } = await this.client!.fundWallet();
        this.wallet = wallet;
      }
      return this.wallet;
    } catch (error) {
      console.error('Failed to initialize wallet:', error);
      throw error;
    }
  }

  // Convert string to hex
  private stringToHex(str: string): string {
    return Array.from(str)
      .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('');
  }

  // Pad currency code to 40 characters
  private padCurrencyCode(code: string): string {
    const hex = this.stringToHex(code);
    return hex.padEnd(40, '0');
  }

  // Submit audit trail to XRPL with retry mechanism
  async submitAuditTrail(merkleRoot: string, retryCount: number = 0) {
    const maxRetries = 3;
    
    try {
      // Ensure connection and wallet
      if (!this.client || !this.wallet) {
        await this.connect();
        await this.initializeWallet();
      }

      // Get latest ledger information
      const ledgerResponse = await this.client!.request({
        command: 'ledger',
        ledger_index: 'validated'
      });
      
      const currentLedgerSequence = ledgerResponse.result.ledger_index;
      
      // Prepare transaction with appropriate ledger sequence
      const prepared = await this.client!.autofill({
        TransactionType: 'Payment',
        Account: this.wallet!.address,
        Destination: this.wallet!.address,
        Amount: '1',
        Memos: [{
          Memo: {
            MemoData: this.stringToHex(merkleRoot)
          }
        }],
        // Add more ledgers to the sequence to allow for longer processing time
        LastLedgerSequence: currentLedgerSequence + 100
      });

      const signed = this.wallet!.sign(prepared);
      
      // Submit but don't wait for validation
      const submitResult = await this.client!.submit(signed.tx_blob);
      
      if (submitResult.result.engine_result === 'tesSUCCESS' ||
          submitResult.result.engine_result === 'terQUEUED') {
        
        // Validate the transaction hash format
        const hash = submitResult.result.tx_json?.hash;
        if (hash && this.isValidXRPLHash(hash)) {
          return {
            success: true,
            hash: hash,
            status: submitResult.result.engine_result
          };
        } else {
          console.warn('Invalid transaction hash format:', hash);
          
          // Retry if we have attempts left
          if (retryCount < maxRetries) {
            console.log(`Retrying XRPL submission (attempt ${retryCount + 1}/${maxRetries})`);
            await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1))); // Exponential backoff
            return this.submitAuditTrail(merkleRoot, retryCount + 1);
          }
          
          return {
            success: false,
            hash: undefined,
            error: 'Invalid transaction hash format after retries'
          };
        }
      }

      // Handle specific error cases
      if (submitResult.result.engine_result === 'terPRE_SEQ' && retryCount < maxRetries) {
        // Sequence number too low, retry
        console.log(`Sequence number too low, retrying (attempt ${retryCount + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.submitAuditTrail(merkleRoot, retryCount + 1);
      }

      return {
        success: false,
        hash: undefined,
        error: submitResult.result.engine_result_message
      };
    } catch (error) {
      console.error('Failed to submit audit trail:', error);
      
      // Retry on connection errors
      if (retryCount < maxRetries && this.isRetryableError(error)) {
        console.log(`Retrying due to error (attempt ${retryCount + 1}/${maxRetries}):`, error);
        await new Promise(resolve => setTimeout(resolve, 1000 * (retryCount + 1)));
        return this.submitAuditTrail(merkleRoot, retryCount + 1);
      }
      
      return {
        success: false,
        hash: undefined,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Validate XRPL transaction hash format
  private isValidXRPLHash(hash: string): boolean {
    // XRPL transaction hashes should be 64-character hexadecimal strings
    const hashRegex = /^[A-Fa-f0-9]{64}$/;
    return hashRegex.test(hash);
  }

  // Public method to validate transaction hash format
  public validateTransactionHash(hash: string): { isValid: boolean; error?: string } {
    if (!hash) {
      return { isValid: false, error: 'Transaction hash is required' };
    }
    
    if (typeof hash !== 'string') {
      return { isValid: false, error: 'Transaction hash must be a string' };
    }
    
    if (hash.length !== 64) {
      return { isValid: false, error: `Transaction hash must be 64 characters long, got ${hash.length}` };
    }
    
    if (!this.isValidXRPLHash(hash)) {
      return { isValid: false, error: 'Transaction hash must contain only hexadecimal characters (0-9, A-F)' };
    }
    
    return { isValid: true };
  }

  // Get detailed error information for debugging
  public getTransactionErrorDetails(error: any): string {
    if (error instanceof Error) {
      return `${error.name}: ${error.message}`;
    }
    
    if (typeof error === 'string') {
      return error;
    }
    
    if (error && typeof error === 'object') {
      return JSON.stringify(error, null, 2);
    }
    
    return 'Unknown error';
  }

  // Check if an error is retryable
  private isRetryableError(error: any): boolean {
    const retryableErrors = [
      'Connection failed',
      'Network error',
      'Timeout',
      'ECONNRESET',
      'ENOTFOUND'
    ];
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    return retryableErrors.some(retryableError => 
      errorMessage.toLowerCase().includes(retryableError.toLowerCase())
    );
  }

  // Issue HAIC tokens
  async issueHAICTokens(amount: string) {
    if (!this.client || !this.wallet) {
      throw new Error('XRPL client or wallet not initialized');
    }

    try {
      // First, set up the issuer account for the HAIC token
      const trustSetTx = {
        TransactionType: 'TrustSet' as const,
        Account: this.wallet.address,
        LimitAmount: {
          currency: this.padCurrencyCode('HAIC'),
          issuer: this.wallet.address,
          value: '1000000000' // 1 billion max supply
        }
      };

      const prepared = await this.client.autofill(trustSetTx);
      const signed = this.wallet.sign(prepared);
      const result = await this.client.submitAndWait(signed.tx_blob) as XRPLResponse;

      return {
        success: result.result.meta?.TransactionResult === 'tesSUCCESS',
        hash: result.result.hash
      };
    } catch (error) {
      console.error('Failed to issue HAIC tokens:', error);
      throw error;
    }
  }

  // Check if account exists on XRPL
  private async accountExists(address: string): Promise<boolean> {
    try {
      await this.client!.request({
        command: 'account_info',
        account: address,
        ledger_index: 'validated'
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  // Set up trust line for HAIC token
  private async setupTrustLine(destination: string): Promise<boolean> {
    try {
      // Create trust set transaction
      const trustSetTx = {
        TransactionType: 'TrustSet' as const,
        Account: destination,
        LimitAmount: {
          currency: this.padCurrencyCode('HAIC'),
          issuer: this.wallet!.address,
          value: '1000000000' // 1 billion max supply
        }
      };

      const prepared = await this.client!.autofill(trustSetTx);
      console.log('Prepared trust set transaction:', JSON.stringify(prepared, null, 2));

      // Note: The destination account needs to sign this transaction
      // This is just the preparation step
      return true;
    } catch (error) {
      console.error('Failed to setup trust line:', error);
      return false;
    }
  }

  // Check if trust line exists
  private async checkTrustLine(address: string): Promise<boolean> {
    try {
      const response = await this.client!.request({
        command: 'account_lines',
        account: address,
        peer: this.wallet!.address
      });
      
      const lines = response.result.lines || [];
      return lines.some(line => 
        line.currency === this.padCurrencyCode('HAIC') && 
        line.account === this.wallet!.address
      );
    } catch (error) {
      console.error('Failed to check trust line:', error);
      return false;
    }
  }

  // Transfer HAIC tokens
  async transferHAICTokens(destination: string, amount: string) {
    if (!this.client || !this.wallet) {
      throw new Error('XRPL client or wallet not initialized');
    }

    try {
      // Check if destination account exists
      const exists = await this.accountExists(destination);
      if (!exists) {
        throw new Error('Destination account does not exist on XRPL. The account needs to be funded with XRP first.');
      }

      // Check if trust line exists
      const hasTrustLine = await this.checkTrustLine(destination);
      if (!hasTrustLine) {
        throw new Error('Recipient needs to set up a trust line for HAIC tokens. Please ask them to trust your issuing address: ' + this.wallet.address);
      }

      // Create payment transaction
      const payment = {
        TransactionType: 'Payment' as const,
        Account: this.wallet.address,
        Destination: destination,
        Amount: {
          currency: this.padCurrencyCode('HAIC'),
          value: amount,
          issuer: this.wallet.address
        },
        Flags: 131072  // tfSetNoRipple flag
      };

      console.log('Preparing HAIC transfer with payment:', JSON.stringify(payment, null, 2));

      const prepared = await this.client.autofill(payment);
      console.log('Prepared transaction:', JSON.stringify(prepared, null, 2));

      const signed = this.wallet.sign(prepared);
      console.log('Signed transaction. Submitting to XRPL...');

      const result = await this.client.submitAndWait(signed.tx_blob) as XRPLResponse;
      console.log('XRPL response:', JSON.stringify(result, null, 2));

      const txResult = result.result.meta?.TransactionResult;
      if (txResult === 'tesSUCCESS') {
        console.log('Transfer successful!');
        return {
          success: true,
          hash: result.result.hash
        };
      } else {
        const errorMessage = this.getTransactionErrorMessage(txResult);
        console.error('Transfer failed with result:', txResult);
        return {
          success: false,
          hash: result.result.hash,
          error: errorMessage
        };
      }
    } catch (error) {
      console.error('Failed to transfer HAIC tokens. Full error:', error);
      if (error instanceof Error) {
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
      }
      throw error;
    }
  }

  // Get human-readable error message for transaction result codes
  private getTransactionErrorMessage(code: string | undefined): string {
    const errorMessages: { [key: string]: string } = {
      'tecPATH_DRY': 'No path exists between accounts. Make sure the recipient has set up a trust line.',
      'tecNO_LINE': 'No trust line exists. The recipient needs to set up a trust line.',
      'tecNO_AUTH': 'The token requires authorization. Please contact the issuer.',
      'tecNO_DST': 'Destination account does not exist.',
      'tecUNFUNDED': 'Not enough XRP to send the transaction.',
    };
    return errorMessages[code || ''] || `Transaction failed with code: ${code}`;
  }

  // Get account balance
  async getAccountBalance(address: string) {
    if (!this.client) {
      throw new Error('XRPL client not initialized');
    }

    try {
      const response = await this.client.request({
        command: 'account_info',
        account: address,
        ledger_index: 'validated'
      }) as XRPLResponse;

      return {
        xrp: response.result.account_data?.Balance || '0',
        haic: '0' // TODO: Implement token balance lookup
      };
    } catch (error) {
      console.error('Failed to get account balance:', error);
      throw error;
    }
  }

  // Debug function to test XRPL connection
  async debugXRPL() {
    console.log('🔍 XRPL Debug Information:');
    console.log('Client exists:', !!this.client);
    console.log('Client connected:', this.client?.isConnected());
    console.log('Wallet exists:', !!this.wallet);
    console.log('Wallet address:', this.wallet?.address);
    
    if (this.client && this.client.isConnected()) {
      try {
        const serverInfo = await this.client.request({
          command: 'server_info'
        });
        console.log('Server info:', serverInfo);
      } catch (error) {
        console.error('Failed to get server info:', error);
      }
    } else {
      console.log('⚠️ XRPL client not connected. Attempting to connect...');
      try {
        const connected = await this.connect();
        if (connected) {
          console.log('✅ Successfully connected to XRPL');
          const serverInfo = await this.client!.request({
            command: 'server_info'
          });
          console.log('Server info:', serverInfo);
        } else {
          console.log('❌ Failed to connect to XRPL');
        }
      } catch (error) {
        console.error('❌ Connection error:', error);
      }
    }
  }
}

export const xrplService = new XRPLService(); 