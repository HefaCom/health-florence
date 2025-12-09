import { Client, Wallet, xrpToDrops } from 'xrpl';
import { toast } from 'sonner';
import { walletService } from './wallet.service';

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
    // Check if already connected
    if (this.client && this.client.isConnected()) {
      return true;
    }

    let retries = 0;
    while (retries < this.MAX_RETRIES) {
      try {
        // Disconnect existing client if it exists but isn't connected
        if (this.client) {
          await this.client.disconnect().catch(() => { });
        }

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

  // Check connection status
  isConnected(): boolean {
    return !!this.client?.isConnected();
  }

  // Create or load a wallet
  async initializeWallet(options?: { seed?: string; userId?: string } | string) {
    const normalized =
      typeof options === 'string' ? { seed: options } : options || {};
    const { seed, userId } = normalized;

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
      let walletSeed = seed;
      let storedWallet = null;

      if (!walletSeed && userId) {
        storedWallet = await walletService.getCustodialWallet(userId);
        walletSeed = storedWallet?.seed;

        if (storedWallet) {
          console.log(`[XRPL Service] Loading EXISTING custodial wallet for user ${userId}: ${storedWallet.address}`);
        }
      }

      if (seed) {
        // Load existing wallet
        this.wallet = Wallet.fromSeed(seed);
        console.log(`[XRPL Service] Loaded wallet from seed: ${this.wallet.address}`);
      } else {
        if (walletSeed) {
          this.wallet = Wallet.fromSeed(walletSeed);
          console.log(`[XRPL Service] Loaded custodial wallet from stored seed: ${this.wallet.address}`);
        } else {
          // Create new wallet with proper type handling
          console.log(`[XRPL Service] Creating NEW custodial wallet for user ${userId}...`);
          const { wallet } = await this.client!.fundWallet();
          this.wallet = wallet;
          walletSeed = wallet.seed;
          console.log(`[XRPL Service] Created NEW wallet: ${this.wallet.address} with seed starting: ${walletSeed.substring(0, 10)}...`);
        }
      }

      if (userId && this.wallet && walletSeed) {
        await walletService.saveCustodialWallet(
          userId,
          {
            address: this.wallet.address,
            seed: walletSeed,
            createdAt: storedWallet?.createdAt || new Date().toISOString(),
            lastUsedAt: new Date().toISOString(),
          },
          true
        );

        console.log(`[XRPL Service] Saved custodial wallet for user ${userId}: ${this.wallet.address}`);

        // Auto-setup trust line for custodial wallet
        await this.verifyAndSetupTrustLine();
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

  // Submit transaction to XRPL (generic method)
  async submitTransaction(transaction: any): Promise<{ hash: string; success: boolean }> {
    if (!this.client || !this.wallet) {
      throw new Error('XRPL client or wallet not initialized');
    }

    try {
      const prepared = await this.client.autofill(transaction);
      const signed = this.wallet.sign(prepared);
      const result = await this.client.submitAndWait(signed.tx_blob) as XRPLResponse;

      return {
        hash: result.result.hash || '',
        success: result.result.meta?.TransactionResult === 'tesSUCCESS'
      };
    } catch (error) {
      console.error('Failed to submit transaction:', error);
      throw error;
    }
  }

  // Verify transaction on XRPL
  async verifyTransaction(hash: string): Promise<boolean> {
    if (!this.client) {
      throw new Error('XRPL client not initialized');
    }

    try {
      const response = await this.client.request({
        command: 'tx',
        transaction: hash
      });

      return response.result.validated === true;
    } catch (error) {
      console.error('Failed to verify transaction:', error);
      return false;
    }
  }

  // Get wallet address
  async getWalletAddress(): Promise<string> {
    if (!this.wallet) {
      await this.initializeWallet();
    }
    return this.wallet!.address;
  }

  // Get audit address (for audit trail submissions)
  async getAuditAddress(): Promise<string> {
    // For now, use the same wallet address
    // In production, this could be a dedicated audit address
    return await this.getWalletAddress();
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
    } catch (error: any) {
      if (error?.data?.error === 'actNotFound' ||
        error?.message?.includes('Account not found')) {
        return false;
      }
      // For other errors, we might want to log them but returning false is usually safe for existence checks
      console.warn('Error checking account existence:', error);
      return false;
    }
  }

  // Set up trust line for HAIC token
  private async setupTrustLine(destination: string): Promise<boolean> {
    try {
      if (!this.wallet) {
        throw new Error('Wallet not initialized for signing');
      }

      // Create trust set transaction
      const trustSetTx = {
        TransactionType: 'TrustSet' as const,
        Account: destination,
        LimitAmount: {
          currency: this.padCurrencyCode('HAIC'),
          issuer: 'roFYYcmHunBu8Qp8dLEYcqxsS3EDvyuUY', // Hardcoded issuer
          value: '1000000000' // 1 billion max supply
        }
      };

      const prepared = await this.client!.autofill(trustSetTx);
      const signed = this.wallet.sign(prepared);
      const result = await this.client!.submitAndWait(signed.tx_blob);

      console.log('TrustSet Result:', (result.result.meta as any)?.TransactionResult);
      return (result.result.meta as any)?.TransactionResult === 'tesSUCCESS';
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
        peer: 'roFYYcmHunBu8Qp8dLEYcqxsS3EDvyuUY' // Issuer address
      });

      const lines = response.result.lines || [];
      return lines.some(line =>
        line.currency === this.padCurrencyCode('HAIC')
      );
    } catch (error: any) {
      // If account not found (unfunded), trust line effectively doesn't exist
      if (error?.data?.error === 'actNotFound') return false;
      console.error('Failed to check trust line:', error);
      return false;
    }
  }

  // New public method to verify and fix trust line for current wallet
  async verifyAndSetupTrustLine(): Promise<boolean> {
    if (!this.wallet) return false;

    try {
      const hasLine = await this.checkTrustLine(this.wallet.address);
      if (hasLine) return true;

      console.log('Trust line missing for custodial wallet. Setting up...');
      return await this.setupTrustLine(this.wallet.address);
    } catch (error) {
      console.error('Failed to verify/setup trust line:', error);
      return false;
    }
  }

  // Submit a signed transaction blob
  async submitSignedTransaction(txBlob: string): Promise<XRPLResponse> {
    if (!this.client) {
      await this.connect();
    }

    try {
      console.log('Submitting signed transaction blob...');
      const result = await this.client!.submitAndWait(txBlob);
      return result as unknown as XRPLResponse;
    } catch (error) {
      console.error('Failed to submit signed transaction:', error);
      throw error;
    }
  }

  // Transfer HAIC tokens - NOW LOADS CORRECT USER'S WALLET
  async transferHAICTokens(destination: string, amount: string, userId?: string) {
    try {
      if (!this.client?.isConnected()) {
        await this.connect();
      }

      // Load the correct wallet for this user
      let walletToUse = this.wallet;

      if (userId) {
        console.log(`[XRPL Service] Loading custodial wallet for user: ${userId}`);
        const custodialWallet = await walletService.getCustodialWallet(userId);

        if (!custodialWallet?.seed) {
          throw new Error('No custodial wallet found for this user');
        }

        // Create wallet from the user's seed (don't store in this.wallet!)
        walletToUse = Wallet.fromSeed(custodialWallet.seed);
        console.log(`[XRPL Service] Using custodial wallet: ${walletToUse.address}`);
      } else if (!this.wallet) {
        throw new Error('No wallet initialized');
      }

      // Check if destination account exists
      const exists = await this.accountExists(destination);
      if (!exists) {
        throw new Error('Destination account does not exist on XRPL. The account needs to be funded with XRP first.');
      }

      // Check if trust line exists
      const hasTrustLine = await this.checkTrustLine(destination);
      if (!hasTrustLine) {
        throw new Error('Recipient needs to set up a trust line for HAIC tokens.');
      }

      // Create payment transaction
      const payment = {
        TransactionType: 'Payment' as const,
        Account: walletToUse!.address,
        Destination: destination,
        Amount: {
          currency: this.padCurrencyCode('HAIC'),
          value: amount,
          issuer: walletToUse!.address
        },
        Flags: 131072  // tfSetNoRipple flag
      };

      console.log('Preparing HAIC transfer with payment:', JSON.stringify(payment, null, 2));

      const prepared = await this.client!.autofill(payment);
      const signed = walletToUse!.sign(prepared);
      const result = await this.client!.submitAndWait(signed.tx_blob) as XRPLResponse;

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
      if (error instanceof Error &&
        (error.message.includes('Destination account does not exist') ||
          error.message.includes('account needs to be funded'))) {
        console.warn('HAIC Transfer Info:', error.message);
      } else {
        console.error('Failed to transfer HAIC tokens. Full error:', error);
        if (error instanceof Error) {
          console.error('Error name:', error.name);
          console.error('Error message:', error.message);
          console.error('Error stack:', error.stack);
        }
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
    } catch (error: any) {
      // Handle case where account exists on ledger but is unfunded or not found
      if (error?.data?.error === 'actNotFound' ||
        error?.message?.includes('Account not found') ||
        error?.toString().includes('Account not found')) {
        return {
          xrp: '0',
          haic: '0'
        };
      }
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