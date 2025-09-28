import { generateClient } from 'aws-amplify/api';

const client = generateClient();

// XUMM API Configuration
const XUMM_CONFIG = {
  apiKey: "81714331-6a90-496a-8af4-c0655922715a",
  apiSecret: "e7977f2c-5205-42a5-a800-3c7186672674",
  baseUrl: "https://xumm.app/api/v1",
  // Main application account address for balance monitoring
  // You can set this to any XRPL account address you want to monitor
  mainAccountAddress: "rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH" // Replace with your main account address
};

export interface XUMMWallet {
  address: string;
  balance: number;
  currency: string;
  lastUpdated: string;
}

export interface HAICBalance {
  userId: string;
  userEmail: string;
  userName: string;
  walletAddress?: string;
  haicBalance: number;
  xrpBalance: number;
  lastUpdated: string;
}

class XUMMService {
  /**
   * Get wallet balance from XUMM API
   */
  async getWalletBalance(address: string): Promise<{ xrp: number; haic: number }> {
    try {
      const response = await fetch(`${XUMM_CONFIG.baseUrl}/account/${address}`, {
        method: 'GET',
        headers: {
          'X-API-Key': XUMM_CONFIG.apiKey,
          'X-API-Secret': XUMM_CONFIG.apiSecret,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`XUMM API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Extract XRP balance
      const xrpBalance = data.account_data?.Balance ? 
        parseFloat(data.account_data.Balance) / 1000000 : 0; // XRP is in drops (1 XRP = 1,000,000 drops)
      
      // Look for HAIC token balance in trustlines
      let haicBalance = 0;
      if (data.account_lines?.lines) {
        const haicLine = data.account_lines.lines.find((line: any) => 
          line.currency === 'HAIC' || line.currency === 'HAIC'
        );
        if (haicLine) {
          haicBalance = parseFloat(haicLine.balance) || 0;
        }
      }

      return { xrp: xrpBalance, haic: haicBalance };
    } catch (error) {
      console.error('Error fetching wallet balance:', error);
      return { xrp: 0, haic: 0 };
    }
  }

  /**
   * Get HAIC balances for all users
   */
  async getAllUserHAICBalances(): Promise<HAICBalance[]> {
    try {
      // First, get all users from the database
      const listUsersQuery = /* GraphQL */ `
        query ListUsers {
          listUsers {
            items {
              id
              email
              firstName
              lastName
              preferences
            }
          }
        }
      `;

      const result = await client.graphql({
        query: listUsersQuery,
        authMode: 'apiKey'
      });

      const users = (result as any).data?.listUsers?.items || [];
      const balances: HAICBalance[] = [];

      // Process each user
      for (const user of users) {
        try {
          // Try to get wallet address from user preferences
          let walletAddress: string | undefined;
          if (user.preferences) {
            const preferences = typeof user.preferences === 'string' 
              ? JSON.parse(user.preferences) 
              : user.preferences;
            walletAddress = preferences?.wallet?.address || preferences?.xumm?.address;
          }

          let haicBalance = 0;
          let xrpBalance = 0;

          if (walletAddress) {
            const walletData = await this.getWalletBalance(walletAddress);
            haicBalance = walletData.haic;
            xrpBalance = walletData.xrp;
          }

          balances.push({
            userId: user.id,
            userEmail: user.email,
            userName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            walletAddress,
            haicBalance,
            xrpBalance,
            lastUpdated: new Date().toISOString()
          });
        } catch (error) {
          console.error(`Error processing user ${user.email}:`, error);
          // Add user with zero balance if wallet fetch fails
          balances.push({
            userId: user.id,
            userEmail: user.email,
            userName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
            haicBalance: 0,
            xrpBalance: 0,
            lastUpdated: new Date().toISOString()
          });
        }
      }

      return balances;
    } catch (error) {
      console.error('Error fetching HAIC balances:', error);
      throw error;
    }
  }

  /**
   * Get HAIC balance for a specific user
   */
  async getUserHAICBalance(userId: string): Promise<HAICBalance | null> {
    try {
      const getUserQuery = /* GraphQL */ `
        query GetUser($id: ID!) {
          getUser(id: $id) {
            id
            email
            firstName
            lastName
            preferences
          }
        }
      `;

      const result = await client.graphql({
        query: getUserQuery,
        variables: { id: userId },
        authMode: 'apiKey'
      });

      const user = (result as any).data?.getUser;
      if (!user) return null;

      // Try to get wallet address from user preferences
      let walletAddress: string | undefined;
      if (user.preferences) {
        const preferences = typeof user.preferences === 'string' 
          ? JSON.parse(user.preferences) 
          : user.preferences;
        walletAddress = preferences?.wallet?.address || preferences?.xumm?.address;
      }

      let haicBalance = 0;
      let xrpBalance = 0;

      if (walletAddress) {
        const walletData = await this.getWalletBalance(walletAddress);
        haicBalance = walletData.haic;
        xrpBalance = walletData.xrp;
      }

      return {
        userId: user.id,
        userEmail: user.email,
        userName: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        walletAddress,
        haicBalance,
        xrpBalance,
        lastUpdated: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching user HAIC balance:', error);
      return null;
    }
  }

  /**
   * Get total HAIC supply across all users
   */
  async getTotalHAICSupply(): Promise<{ totalHAIC: number; totalXRP: number; userCount: number }> {
    try {
      const balances = await this.getAllUserHAICBalances();
      
      const totalHAIC = balances.reduce((sum, balance) => sum + balance.haicBalance, 0);
      const totalXRP = balances.reduce((sum, balance) => sum + balance.xrpBalance, 0);
      const userCount = balances.length;

      return { totalHAIC, totalXRP, userCount };
    } catch (error) {
      console.error('Error getting total HAIC supply:', error);
      return { totalHAIC: 0, totalXRP: 0, userCount: 0 };
    }
  }

  /**
   * Get the total balance from the main application account
   * This fetches the balance of the configured main account address
   */
  async getXUMMAPIBalance(): Promise<{ xrp: number; haic: number; accountInfo: any }> {
    try {
      console.log('🔍 XUMM Service: Starting getXUMMAPIBalance');
      // Use the configured main account address
      const accountAddress = XUMM_CONFIG.mainAccountAddress;
      console.log('🔍 XUMM Service: Account address:', accountAddress);
      
      if (!accountAddress) {
        console.warn('No main account address configured');
        return { xrp: 0, haic: 0, accountInfo: null };
      }

      // Now get the balance using the XRP Ledger API
      // Try using a public XRP Ledger API that supports CORS
      let xrpResponse;
      try {
        xrpResponse = await fetch('https://xrplcluster.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            method: 'account_info',
            params: [
              {
                account: accountAddress,
                ledger_index: 'validated'
              }
            ]
          })
        });
      } catch (corsError) {
        console.warn('CORS-enabled endpoint failed, trying direct endpoint:', corsError);
        // Fallback to direct endpoint (might fail due to CORS)
        xrpResponse = await fetch('https://s1.ripple.com:51234', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            method: 'account_info',
            params: [
              {
                account: accountAddress,
                ledger_index: 'validated'
              }
            ]
          })
        });
      }

      if (!xrpResponse.ok) {
        throw new Error(`XRP Ledger API error: ${xrpResponse.status}`);
      }

      const xrpData = await xrpResponse.json();
      console.log('🔍 XUMM Service: XRP response:', xrpData);
      
      // Extract XRP balance
      const xrpBalance = xrpData.result?.account_data?.Balance ? 
        parseFloat(xrpData.result.account_data.Balance) / 1000000 : 0;
      console.log('🔍 XUMM Service: XRP balance calculated:', xrpBalance);
      
      // Get trustlines for HAIC tokens
      let trustlinesResponse;
      try {
        trustlinesResponse = await fetch('https://xrplcluster.com', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            method: 'account_lines',
            params: [
              {
                account: accountAddress,
                ledger_index: 'validated'
              }
            ]
          })
        });
      } catch (corsError) {
        console.warn('CORS-enabled endpoint failed for trustlines, trying direct endpoint:', corsError);
        // Fallback to direct endpoint (might fail due to CORS)
        trustlinesResponse = await fetch('https://s1.ripple.com:51234', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            method: 'account_lines',
            params: [
              {
                account: accountAddress,
                ledger_index: 'validated'
              }
            ]
          })
        });
      }

      let haicBalance = 0;
      if (trustlinesResponse.ok) {
        const trustlinesData = await trustlinesResponse.json();
        if (trustlinesData.result?.lines) {
          const haicLine = trustlinesData.result.lines.find((line: any) => 
            line.currency === 'HAIC' || line.currency === 'HAIC'
          );
          if (haicLine) {
            haicBalance = parseFloat(haicLine.balance) || 0;
          }
        }
      }

      const result = { 
        xrp: xrpBalance, 
        haic: haicBalance, 
        accountInfo: { 
          accountAddress, 
          xrpData: xrpData.result,
          pingData: null // We're not using ping data in this implementation
        } 
      };
      console.log('🔍 XUMM Service: Final result:', result);
      return result;
    } catch (error) {
      console.error('❌ XUMM Service: Error getting XUMM API balance:', error);
      console.error('❌ XUMM Service: Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      });
      return { xrp: 0, haic: 0, accountInfo: null };
    }
  }
}

export const xummService = new XUMMService();
