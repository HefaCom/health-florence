import React, { createContext, useContext, useState, useEffect } from 'react';
import { xrplService } from '../services/xrpl.service';
import { walletService } from '../services/wallet.service';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';
import { xumm } from '@/lib/wallet/xaman';
import { getSignClient } from '@/lib/wallet/walletconnect';

interface XRPLContextType {
  isConnected: boolean;
  isInitialized: boolean;
  balance: {
    xrp: string;
    haic: string;
  };
  walletAddress: string | null;
  isJoeyWallet: boolean;
  isXamanWallet: boolean;
  connect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
  transferHAIC: (destination: string, amount: string) => Promise<boolean>;
  setupTrustLine: () => Promise<boolean>;
  refreshBalance: () => Promise<void>;
}

const XRPLContext = createContext<XRPLContextType | undefined>(undefined);

export const XRPLProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState({ xrp: '0', haic: '0' });
  const [isJoeyWallet, setIsJoeyWallet] = useState(false);
  const [isXamanWallet, setIsXamanWallet] = useState(false);
  const [custodialAddress, setCustodialAddress] = useState<string | null>(null); // Platform wallet
  const [externalWalletAddress, setExternalWalletAddress] = useState<string | null>(null); // Connected wallet
  const { user } = useAuth();

  // Initialize XRPL connection
  const connect = async () => {
    try {
      console.log('Connecting to XRPL...');
      const connected = await xrplService.connect();
      if (!connected) {
        throw new Error('Failed to connect to XRPL network');
      }
      setIsConnected(true);

      console.log('Initializing wallet...');

      // ALWAYS initialize/load custodial wallet for this user
      const custodialWallet = await xrplService.initializeWallet({ userId: user?.id });
      if (!custodialWallet) {
        throw new Error('Failed to initialize custodial wallet');
      }

      console.log('[XRPL Context] Custodial wallet (platform):', custodialWallet.address);
      setCustodialAddress(custodialWallet.address);
      setWalletAddress(custodialWallet.address); // This is what we show as "the balance"

      // Check for linked external wallets (for transfer convenience)
      if (user?.id) {
        const xamanWallet = await walletService.getXamanWallet(user.id);
        if (xamanWallet) {
          console.log('[XRPL Context] External Xaman wallet linked:', xamanWallet.address);
          setExternalWalletAddress(xamanWallet.address);
          setIsXamanWallet(true);
          setIsJoeyWallet(false);
        } else {
          const joeyWallet = await walletService.getJoeyWallet(user.id);
          if (joeyWallet && joeyWallet.address) {
            console.log('[XRPL Context] External Joey wallet linked:', joeyWallet.address);
            setExternalWalletAddress(joeyWallet.address);
            setIsJoeyWallet(true);
            setIsXamanWallet(false);
          }
        }
      }

      setIsInitialized(true);

      // Always fetch balance from custodial wallet
      console.log('Getting custodial wallet balance...');
      await refreshBalance(custodialWallet.address);

      console.log('XRPL initialization complete');
      return true;
    } catch (error) {
      console.error('Failed to connect to XRPL:', error);
      setIsConnected(false);
      setIsInitialized(false);
      setWalletAddress(null);
      setCustodialAddress(null);
      setExternalWalletAddress(null);
      setIsJoeyWallet(false);
      setIsXamanWallet(false);
      toast.error(error instanceof Error ? error.message : 'Failed to connect to XRPL network');
      return false;
    }
  };

  // Disconnect from XRPL
  const disconnect = async () => {
    try {
      await xrplService.disconnect();
      setIsConnected(false);
      setIsInitialized(false);
      setWalletAddress(null);
      setIsJoeyWallet(false);
      setBalance({ xrp: '0', haic: '0' });
    } catch (error) {
      console.error('Failed to disconnect from XRPL:', error);
    }
  };

  // Setup Trust Line
  const setupTrustLine = async () => {
    if (!walletAddress) return false;

    try {
      if ((isJoeyWallet || isXamanWallet) && user?.id) {

        // Handle Xaman Wallet
        if (isXamanWallet) {
          const issuerAddress = 'roFYYcmHunBu8Qp8dLEYcqxsS3EDvyuUY';
          const currencyCode = '4841494300000000000000000000000000000000';

          const payload = await xumm.payload.create({
            TransactionType: 'TrustSet',
            Account: walletAddress,
            LimitAmount: {
              currency: currencyCode,
              issuer: issuerAddress,
              value: '1000000000'
            }
          });

          if (payload?.uuid) {
            xumm.xapp.openSignRequest(payload);
            toast.info('Please sign the request in Xaman');

            // Wait for subscription
            return new Promise<boolean>((resolve) => {
              const sub = xumm.payload.subscribe(payload.uuid, (event) => {
                if (event.data.signed === true) {
                  toast.success('Trust line setup successful');
                  resolve(true);
                  // sub.resolve is not needed/valid here if using promise wrapper around subscribe
                }
                if (event.data.signed === false) {
                  toast.error('Trust line setup rejected');
                  resolve(false);
                }
              });
            });
          }
          return false;
        }

        // Handle Joey Wallet signing
        const client = await getSignClient();
        const joeyWallet = await walletService.getJoeyWallet(user.id);

        if (!joeyWallet?.sessionTopic) {
          throw new Error('No active Joey wallet session found');
        }

        const session = client.session.get(joeyWallet.sessionTopic);
        console.log('Joey Wallet Session:', {
          topic: session?.topic,
          namespaces: session?.namespaces,
          requiredNamespaces: session?.requiredNamespaces,
          sessionProperties: session?.sessionProperties
        });

        console.log('Target Chain:', joeyWallet.chain);

        const issuerAddress = 'roFYYcmHunBu8Qp8dLEYcqxsS3EDvyuUY'; // Hardcoded issuer for now, ideally from env/service
        const currencyCode = '4841494300000000000000000000000000000000'; // HAIC hex

        // Construct TrustSet transaction
        const tx = {
          TransactionType: 'TrustSet',
          Account: walletAddress,
          LimitAmount: {
            currency: currencyCode,
            issuer: issuerAddress,
            value: '1000000000'
          }
        };

        console.log('Requesting TrustSet signature from Joey wallet:', tx);

        // Resolve the correct chain ID from the session
        // The stored joeyWallet.chain might be 'xrpl:testnet' but the session expects 'xrpl:1' (CAIP-2)
        // or vice versa. We need to find a chain in the session that supports our method.
        let targetChain = joeyWallet.chain;
        const requiredMethod = 'xrpl_signAndSubmitTransaction';

        if (session) {
          // Check namespaces for a chain that supports the method
          const allNamespaces = { ...session.requiredNamespaces, ...session.namespaces };

          // Helper to find chain in namespace
          const findChain = (ns: any) => {
            if (!ns) return null;
            if (ns.methods?.includes(requiredMethod)) {
              // Found a namespace with the method, return its first chain or the one matching our preference
              const chains = ns.chains || ns.accounts?.map((a: string) => a.split(':').slice(0, 2).join(':')) || [];
              return chains.find((c: string) => c === targetChain) || chains[0];
            }
            return null;
          };

          // Look in 'xrpl' namespace first
          const resolvedChain = findChain(allNamespaces['xrpl']);
          if (resolvedChain) {
            console.log('Resolved chain from session:', resolvedChain);
            targetChain = resolvedChain;
          }
        }

        // Fallback to xrpl:1 if we couldn't resolve from session but have a session
        if (!targetChain || !targetChain.includes(':')) {
          targetChain = 'xrpl:1';
        }

        console.log('Final Target Chain for Request:', targetChain);

        const result = await client.request({
          topic: joeyWallet.sessionTopic,
          chainId: targetChain,
          request: {
            method: requiredMethod,
            params: {
              tx_json: tx
            }
          }
        });

        console.log('TrustSet result:', result);
        toast.success('Trust line setup transaction submitted');
        return true;
      } else {
        // Handle Custodial Wallet setup (via service)
        // Since setupTrustLine is private in service, we might need to expose it or assume custodial is auto-setup
        // For now, we'll log warning as custodial should have it by default
        console.warn('Custodial wallet should have trust line auto-configured');
        return true;
      }
    } catch (error) {
      console.error('Failed to setup trust line:', error);
      toast.error('Failed to sign trust line transaction. Please try again.');
      return false;
    }
  };

  // Transfer HAIC tokens
  const transferHAIC = async (destination: string, amount: string): Promise<boolean> => {
    try {
      if (!isConnected || !isInitialized) {
        console.log('Attempting to initialize XRPL connection...');
        await connect();
      }

      if (!isConnected || !isInitialized) {
        throw new Error('Failed to initialize XRPL connection');
      }

      if (!custodialAddress) {
        throw new Error('No custodial wallet initialized');
      }

      if (!user?.id) {
        throw new Error('No user logged in');
      }

      console.log('[Transfer] FROM custodial wallet:', custodialAddress, 'TO:', destination, 'AMOUNT:', amount);

      // Always transfer from the custodial (platform) wallet
      // Pass userId so xrplService loads the CORRECT wallet seed
      const result = await xrplService.transferHAICTokens(destination, amount, user.id);

      if (result.success) {
        toast.success('HAIC transfer successful!');
        await refreshBalance(custodialAddress);
        return true;
      } else {
        throw new Error(result.error || 'Transfer failed');
      }
    } catch (error) {
      console.error('Transfer failed:', error);
      if (error instanceof Error) {
        if (error.message.includes('does not exist')) {
          toast.error('The recipient account does not exist on XRPL. They need to create and fund their account first.');
        } else if (error.message.includes('trust line')) {
          toast.error('The recipient needs to set up their account to accept HAIC tokens first.');
        } else {
          toast.error(error.message);
        }
      } else {
        toast.error('Failed to transfer HAIC tokens');
      }
      return false;
    }
  };

  // Refresh wallet balance
  const refreshBalance = async (address?: string) => {
    const targetAddress = address || walletAddress;
    if (!targetAddress) return;

    try {
      // Ensure connected
      if (!xrplService.isConnected()) {
        console.log('refreshBalance: XRPL not connected, reconnecting...');
        const connected = await xrplService.connect();
        if (!connected) return;
      }

      const newBalance = await xrplService.getAccountBalance(targetAddress);
      setBalance(newBalance);
    } catch (error) {
      console.error('Failed to refresh balance:', error);
    }
  };

  // Connect to XRPL when the component mounts
  useEffect(() => {
    if (user && !isConnected) {
      connect();
    }
    return () => {
      // Don't disconnect here on unmount to prevent thrashing
      // logic handles reconnection
    };
  }, [user]);

  // Refresh balance periodically
  useEffect(() => {
    if (isConnected && walletAddress) {
      refreshBalance(walletAddress);
      const interval = setInterval(() => refreshBalance(walletAddress), 30000); // Every 30 seconds
      return () => clearInterval(interval);
    }
  }, [isConnected, walletAddress]);

  return (
    <XRPLContext.Provider
      value={{
        isConnected,
        isInitialized,
        balance,
        walletAddress,
        isJoeyWallet,
        isXamanWallet,
        connect,
        disconnect,
        transferHAIC,
        setupTrustLine,
        refreshBalance,
      }}
    >
      {children}
    </XRPLContext.Provider>
  );
};

export const useXRPL = () => {
  const context = useContext(XRPLContext);
  if (context === undefined) {
    throw new Error('useXRPL must be used within an XRPLProvider');
  }
  return context;
}; 