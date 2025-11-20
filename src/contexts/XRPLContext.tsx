import React, { createContext, useContext, useState, useEffect } from 'react';
import { xrplService } from '../services/xrpl.service';
import { useAuth } from './AuthContext';
import { toast } from 'sonner';

interface XRPLContextType {
  isConnected: boolean;
  isInitialized: boolean;
  balance: {
    xrp: string;
    haic: string;
  };
  walletAddress: string | null;
  connect: () => Promise<boolean>;
  disconnect: () => Promise<void>;
  transferHAIC: (destination: string, amount: string) => Promise<boolean>;
  refreshBalance: () => Promise<void>;
}

const XRPLContext = createContext<XRPLContextType | undefined>(undefined);

export const XRPLProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState({ xrp: '0', haic: '0' });
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
      const wallet = await xrplService.initializeWallet({ userId: user?.id });
      if (!wallet) {
        throw new Error('Failed to initialize wallet');
      }
      setWalletAddress(wallet.address);
      setIsInitialized(true);
      
      console.log('Getting initial balance...');
      await refreshBalance();
      
      console.log('XRPL initialization complete');
      return true;
    } catch (error) {
      console.error('Failed to connect to XRPL:', error);
      setIsConnected(false);
      setIsInitialized(false);
      setWalletAddress(null);
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
      setBalance({ xrp: '0', haic: '0' });
    } catch (error) {
      console.error('Failed to disconnect from XRPL:', error);
    }
  };

  // Transfer HAIC tokens
  const transferHAIC = async (destination: string, amount: string) => {
    try {
      if (!isConnected || !isInitialized) {
        console.log('Attempting to initialize XRPL connection...');
        await connect();
      }

      if (!isConnected || !isInitialized) {
        throw new Error('Failed to initialize XRPL connection');
      }

      const result = await xrplService.transferHAICTokens(destination, amount);
      if (result.success) {
        await refreshBalance();
        toast.success('HAIC transfer successful');
        return true;
      }
      toast.error('HAIC transfer failed');
      return false;
    } catch (error) {
      console.error('Failed to transfer HAIC:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to transfer HAIC tokens');
      return false;
    }
  };

  // Refresh wallet balance
  const refreshBalance = async () => {
    if (!walletAddress) return;

    try {
      const newBalance = await xrplService.getAccountBalance(walletAddress);
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
      if (isConnected) {
        disconnect();
      }
    };
  }, [user]);

  // Refresh balance periodically
  useEffect(() => {
    if (isConnected && walletAddress) {
      const interval = setInterval(refreshBalance, 30000); // Every 30 seconds
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
        connect,
        disconnect,
        transferHAIC,
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