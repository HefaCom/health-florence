import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { haicTokenService, TokenBalance, HAICReward, HAICTransaction } from '@/services/haic-token.service';
import { walletService, JoeyWalletLink } from '@/services/wallet.service';
import { walletEvents } from '@/services/wallet-events';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { 
  Coins, 
  TrendingUp, 
  History, 
  Gift, 
  Send, 
  RefreshCw,
  ExternalLink,
  Calendar,
  CheckCircle,
  Clock,
  XCircle,
  Star,
  Trophy,
  Target,
  Heart,
  Activity,
  Link as LinkIcon
} from 'lucide-react';
import { ConnectJoey } from '@/components/wallet/ConnectJoey';
import type { SessionTypes } from '@walletconnect/types';
import { TokenRewards } from '@/components/dashboard/TokenRewards';

export default function HAICWallet() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [balance, setBalance] = useState<TokenBalance>({ haic: 0, xrp: 0, lastUpdated: '' });
  const [rewards, setRewards] = useState<HAICReward[]>([]);
  const [transactions, setTransactions] = useState<HAICTransaction[]>([]);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [joeyAddress, setJoeyAddress] = useState<string | null>(null);
  const [joeySession, setJoeySession] = useState<SessionTypes.Struct | null>(null);
  const [persistedWallet, setPersistedWallet] = useState<JoeyWalletLink | null>(null);
  const [isPersistingWallet, setIsPersistingWallet] = useState(false);

  const loadWalletData = useCallback(async () => {
    if (!user?.id) return;
    try {
      setIsLoading(true);
      const [balanceData, rewardsData, transactionsData] = await Promise.all([
        haicTokenService.getUserBalance(user.id),
        haicTokenService.getUserRewards(user.id, 20),
        haicTokenService.getUserTransactions(user.id, 20)
      ]);
      
      setBalance(balanceData);
      setRewards(rewardsData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading wallet data:', error);
      toast.error('Failed to load wallet data');
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const unsubscribe = walletEvents.onBalanceUpdated(({ userId }) => {
      if (userId === user.id) {
        loadWalletData();
      }
    });
    return unsubscribe;
  }, [user?.id, loadWalletData]);

  useEffect(() => {
    loadWalletData();
  }, [loadWalletData]);

  useEffect(() => {
    let isMounted = true;

    const fetchLinkedWallet = async () => {
      if (!user?.id) {
        if (isMounted) {
          setPersistedWallet(null);
        }
        return;
      }
      try {
        const linked = await walletService.getJoeyWallet(user.id);
        if (isMounted) {
          setPersistedWallet(linked);
        }
      } catch (error) {
        console.error('Failed to load linked wallet:', error);
      }
    };

    fetchLinkedWallet();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleRefresh = () => {
    loadWalletData();
  };

  const saveWalletLink = useCallback(async (wallet: JoeyWalletLink | null) => {
    if (!user?.id) return;
    setIsPersistingWallet(true);
    try {
      if (wallet) {
        const stored = await walletService.linkJoeyWallet(user.id, wallet);
        setPersistedWallet(stored);
        toast.success('Joey wallet linked to your account');
        walletEvents.emitBalanceUpdated(user.id);
      } else {
        await walletService.unlinkJoeyWallet(user.id);
        setPersistedWallet(null);
        toast.success('Joey wallet disconnected');
        walletEvents.emitBalanceUpdated(user.id);
      }
    } catch (error) {
      console.error('Failed to persist wallet link:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update wallet link');
    } finally {
      setIsPersistingWallet(false);
    }
  }, [user?.id]);

  const handleJoeyConnected = useCallback(async (account: { address: string; chain: string }, session: SessionTypes.Struct) => {
    setJoeyAddress(account.address);
    setJoeySession(session);
    await saveWalletLink({
      address: account.address,
      chain: account.chain,
      connectedAt: new Date().toISOString(),
      sessionTopic: session.topic,
      relayProtocol: session.relay?.protocol,
      metadata: {
        name: session.peer?.metadata?.name,
        description: session.peer?.metadata?.description,
        url: session.peer?.metadata?.url,
        icon: session.peer?.metadata?.icons?.[0],
      },
    });
  }, [saveWalletLink]);

  const handleJoeyDisconnected = useCallback(async () => {
    setJoeySession(null);
    setJoeyAddress(null);
    await saveWalletLink(null);
  }, [saveWalletLink]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'goal_completion':
        return <Target className="h-4 w-4" />;
      case 'dietary_adherence':
        return <Heart className="h-4 w-4" />;
      case 'appointment_attendance':
        return <Calendar className="h-4 w-4" />;
      case 'health_checkin':
        return <Activity className="h-4 w-4" />;
      case 'profile_completion':
        return <Star className="h-4 w-4" />;
      case 'medication_adherence':
        return <Trophy className="h-4 w-4" />;
      default:
        return <Gift className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'goal_completion':
        return 'bg-blue-100 text-blue-800';
      case 'dietary_adherence':
        return 'bg-green-100 text-green-800';
      case 'appointment_attendance':
        return 'bg-purple-100 text-purple-800';
      case 'health_checkin':
        return 'bg-orange-100 text-orange-800';
      case 'profile_completion':
        return 'bg-yellow-100 text-yellow-800';
      case 'medication_adherence':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading wallet...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">HAIC Wallet</h1>
          <p className="text-gray-600">Manage your Health AI Coin tokens and rewards</p>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          <div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <LinkIcon className="h-3 w-3" />
              <span>Linked Joey Wallet</span>
            </div>
            <div className="text-xs font-mono text-gray-700">
              {persistedWallet?.address
                ? `${persistedWallet.address.slice(0, 6)}…${persistedWallet.address.slice(-6)}`
                : 'Not linked'}
            </div>
            {persistedWallet?.connectedAt && (
              <div className="text-[11px] text-gray-400">
                Linked {new Date(persistedWallet.connectedAt).toLocaleString()}
              </div>
            )}
            {joeyAddress && (
              <div className="text-[11px] text-emerald-600">
                Active session {joeyAddress.slice(0, 6)}…{joeyAddress.slice(-6)}
              </div>
            )}
          </div>
          <ConnectJoey
            networkPreference="xrpl:testnet"
            onConnected={handleJoeyConnected}
            onDisconnected={handleJoeyDisconnected}
            className="hidden sm:inline-flex"
          />
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <div className="sm:hidden">
        <ConnectJoey
          networkPreference="xrpl:testnet"
          onConnected={handleJoeyConnected}
          onDisconnected={handleJoeyDisconnected}
          className="w-full justify-center"
        />
      </div>

      {isPersistingWallet && (
        <div className="flex items-center gap-2 text-xs text-gray-500">
          <span className="h-2 w-2 rounded-full bg-blue-500 animate-ping"></span>
          <span>Saving wallet link…</span>
        </div>
      )}

      {/* Consolidated HAIC Summary and Actions (from TokenRewards) */}
      <TokenRewards />

      {/* Balance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">HAIC Balance</p>
                <p className="text-3xl font-bold">{formatAmount(balance.haic)}</p>
                <p className="text-blue-100 text-sm">Health AI Coins</p>
              </div>
              <Coins className="h-12 w-12 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-500 to-teal-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm font-medium">XRP Balance</p>
                <p className="text-3xl font-bold">{balance.xrp.toFixed(2)}</p>
                <p className="text-green-100 text-sm">XRP Ledger</p>
              </div>
              <TrendingUp className="h-12 w-12 text-green-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Manage your HAIC tokens and view earning opportunities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={() => setShowTransferModal(true)}
              className="h-20 flex flex-col items-center justify-center gap-2"
            >
              <Send className="h-6 w-6" />
              <span>Send HAIC</span>
            </Button>
            
            <Button 
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={() => window.open('https://xrpscan.com', '_blank')}
            >
              <ExternalLink className="h-6 w-6" />
              <span>View on XRPL</span>
            </Button>
            
            <Button 
              variant="outline"
              className="h-20 flex flex-col items-center justify-center gap-2"
              onClick={handleRefresh}
            >
              <RefreshCw className="h-6 w-6" />
              <span>Refresh Balance</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <Tabs defaultValue="rewards" className="space-y-4">
        <TabsList>
          <TabsTrigger value="rewards">Rewards</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="earning">Earning Guide</TabsTrigger>
        </TabsList>

        <TabsContent value="rewards" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Gift className="h-5 w-5" />
                Recent Rewards
              </CardTitle>
              <CardDescription>
                Your HAIC token rewards for health activities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {rewards.length === 0 ? (
                <div className="text-center py-8">
                  <Gift className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No rewards yet</h3>
                  <p className="text-gray-600">Start earning HAIC tokens by completing health activities</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {rewards.map((reward) => (
                    <div key={reward.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-full ${getCategoryColor(reward.category)}`}>
                            {getCategoryIcon(reward.category)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium">{reward.reason}</h4>
                              <Badge className={getCategoryColor(reward.category)}>
                                {reward.category.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {formatTimestamp(reward.createdAt || '')}
                            </p>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(reward.status)}
                              <span className="text-sm text-gray-600">
                                {reward.status === 'confirmed' ? 'Confirmed' : 
                                 reward.status === 'pending' ? 'Pending' : 'Failed'}
                              </span>
                              {reward.transactionHash && (
                                <span className="text-xs text-gray-500 font-mono">
                                  {reward.transactionHash.slice(0, 8)}...
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-green-600">
                            +{formatAmount(reward.amount)} HAIC
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Transaction History
              </CardTitle>
              <CardDescription>
                All your HAIC token transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No transactions yet</h3>
                  <p className="text-gray-600">Your transaction history will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div key={transaction.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-medium">{transaction.description}</h4>
                            <Badge variant="outline">
                              {transaction.type.toUpperCase()}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">
                            {formatTimestamp(transaction.createdAt || '')}
                          </p>
                          <div className="flex items-center gap-2">
                            {getStatusIcon(transaction.status)}
                            <span className="text-sm text-gray-600">
                              {transaction.status === 'confirmed' ? 'Confirmed' : 
                               transaction.status === 'pending' ? 'Pending' : 'Failed'}
                            </span>
                            {transaction.transactionHash && (
                              <span className="text-xs text-gray-500 font-mono">
                                {transaction.transactionHash.slice(0, 8)}...
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-bold ${
                            transaction.type === 'earn' ? 'text-green-600' : 
                            transaction.type === 'spend' ? 'text-red-600' : 'text-blue-600'
                          }`}>
                            {transaction.type === 'earn' ? '+' : 
                             transaction.type === 'spend' ? '-' : '→'} {formatAmount(transaction.amount)} HAIC
                          </p>
                          <p className="text-sm text-gray-600">
                            Balance: {formatAmount(transaction.balance)} HAIC
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="earning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5" />
                How to Earn HAIC Tokens
              </CardTitle>
              <CardDescription>
                Complete health activities to earn HAIC tokens
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-yellow-100 text-yellow-800">
                      <Star className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium">Complete Profile</h4>
                      <p className="text-sm text-gray-600">Fill out your complete health profile</p>
                      <p className="text-sm font-medium text-green-600">+150 HAIC</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-blue-100 text-blue-800">
                      <Target className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium">Complete Health Goals</h4>
                      <p className="text-sm text-gray-600">Achieve your health and wellness goals</p>
                      <p className="text-sm font-medium text-green-600">+100 HAIC</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-purple-100 text-purple-800">
                      <Calendar className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium">Attend Appointments</h4>
                      <p className="text-sm text-gray-600">Show up for scheduled appointments</p>
                      <p className="text-sm font-medium text-green-600">+75 HAIC</p>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-red-100 text-red-800">
                      <Trophy className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium">Medication Adherence</h4>
                      <p className="text-sm text-gray-600">Take medications as prescribed</p>
                      <p className="text-sm font-medium text-green-600">+60 HAIC</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-green-100 text-green-800">
                      <Heart className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium">Dietary Adherence</h4>
                      <p className="text-sm text-gray-600">Follow your dietary plan</p>
                      <p className="text-sm font-medium text-green-600">+50 HAIC</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-full bg-orange-100 text-orange-800">
                      <Activity className="h-4 w-4" />
                    </div>
                    <div>
                      <h4 className="font-medium">Health Check-ins</h4>
                      <p className="text-sm text-gray-600">Regular health status updates</p>
                      <p className="text-sm font-medium text-green-600">+25 HAIC</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Send HAIC Tokens</h3>
              <Button variant="ghost" size="sm" onClick={() => setShowTransferModal(false)}>
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Recipient Address</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter XRPL address"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Amount</label>
                <input 
                  type="number" 
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter amount"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description (Optional)</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded-md"
                  placeholder="Enter description"
                />
              </div>
              
              <div className="flex gap-2 pt-4">
                <Button className="flex-1">Send HAIC</Button>
                <Button variant="outline" onClick={() => setShowTransferModal(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
