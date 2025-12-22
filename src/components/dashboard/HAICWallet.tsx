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
  Link as LinkIcon,
  Trash2
} from 'lucide-react';
import { ConnectJoey } from '@/components/wallet/ConnectJoey';
import type { SessionTypes } from '@walletconnect/types';
import { ConnectXaman } from '@/components/wallet/ConnectXaman';
import { TokenRewards } from '@/components/dashboard/TokenRewards';
import { xumm } from '@/lib/wallet/xaman';

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
  const [xamanWallet, setXamanWallet] = useState<any | null>(null);
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
        // Reload wallets
        walletService.getJoeyWallet(user.id).then(w => setPersistedWallet(w));
        walletService.getXamanWallet(user.id).then(w => setXamanWallet(w));
      }
    });
    return unsubscribe;
  }, [user?.id, loadWalletData]);

  useEffect(() => {
    loadWalletData();
  }, [loadWalletData]);

  useEffect(() => {
    // Check if returning from Xumm redirect
    xumm.on("success", async () => {
      try {
        const state = await xumm.state();
        if (state?.me && user?.id) {
          console.log('✅ Xumm PKCE Login Successful', state.me);

          await walletService.linkXamanWallet(user.id, {
            address: state.me.account,
            token: state.jwt || '',
            uui: state.me.sub || ''
          });

          setXamanWallet({
            address: state.me.account,
            linkedAt: new Date().toISOString()
          });

          toast.success('Xaman wallet connected successfully');
          loadWalletData();
        }
      } catch (e) {
        console.error('Error handling Xumm callback:', e);
        toast.error('Failed to complete Xaman connection');
      }
    });
  }, [user?.id, loadWalletData]);

  useEffect(() => {
    let isMounted = true;

    const fetchLinkedWallets = async () => {
      if (!user?.id) {
        if (isMounted) {
          setPersistedWallet(null);
          setXamanWallet(null);
        }
        return;
      }
      try {
        const [joey, xaman] = await Promise.all([
          walletService.getJoeyWallet(user.id),
          walletService.getXamanWallet(user.id)
        ]);

        // Validate Xaman session
        try {
          const xummState = await xumm.state();
          if (xummState?.me?.account && xaman?.address) {
            if (xummState.me.account !== xaman.address) {
              console.warn('Xaman wallet mismatch detected. Clearing session.');
              await xumm.logout();
              // Don't set xamanWallet - force reconnect
              if (isMounted) {
                setPersistedWallet(joey);
                setXamanWallet(null);
              }
              toast.error('Wallet mismatch detected. Please reconnect Xaman.');
              return;
            }
          } else if (xummState?.me?.account && !xaman) {
            // Browser has session but user has no linked wallet in DB
            // We could either link it automatically or force logout. For isolation, force logout 
            // to allow clean "Connect" flow.
            console.warn('Orphaned Xaman session detected. Clearing.');
            await xumm.logout();
          }
        } catch (e) {
          console.error('Error validating Xaman state:', e);
        }

        if (isMounted) {
          setPersistedWallet(joey);
          setXamanWallet(xaman);
        }
      } catch (error) {
        console.error('Failed to load linked wallets:', error);
      }
    };

    fetchLinkedWallets();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const handleRefresh = useCallback(() => {
    loadWalletData();
    // Explicitly reload wallets
    if (user?.id) {
      walletService.getJoeyWallet(user.id).then(w => setPersistedWallet(w));
      walletService.getXamanWallet(user.id).then(w => setXamanWallet(w));
    }
  }, [loadWalletData, user?.id]);

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
      <div className="flex flex-col gap-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">HAIC Wallet</h1>
            <p className="text-muted-foreground">Manage your Health AI Coin tokens and rewards</p>
          </div>
          <Button onClick={handleRefresh} variant="outline" size="sm" className="w-full md:w-auto">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Wallet Connection Status Alert */}
        {!persistedWallet && !xamanWallet && (
          <Card className="border-amber-200 bg-amber-50/50">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-100 rounded-full shrink-0">
                  <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-amber-900 mb-1">No Wallet Connected</h4>
                  <p className="text-sm text-amber-700/80">
                    Connect your Joey wallet below to start managing your HAIC tokens and earning rewards.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Connected Wallets Section */}
        <div className="grid grid-cols-1  gap-4">
          {/* Joey Wallet Card */}
          <Card className={`relative overflow-hidden transition-all card-glow rounded-florence ${persistedWallet ? 'border-blue-500/50 bg-blue-50/50 dark:bg-blue-950/20 dark:border-blue-500/30' : 'hover:border-blue-500/30 dark:hover:border-blue-500/30'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full text-blue-600 dark:text-blue-400">
                    <LinkIcon className="h-4 w-4" />
                  </div>
                  Joey Wallet
                </CardTitle>
                {persistedWallet && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/50 dark:text-blue-300">
                    Linked
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {persistedWallet ? (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Address</p>
                    <p className="font-mono text-sm font-medium truncate text-foreground">
                      {persistedWallet.address}
                    </p>
                  </div>
                  {joeyAddress && (
                    <div className="flex items-center gap-2 text-xs text-emerald-600 bg-emerald-50 dark:bg-emerald-950/30 dark:text-emerald-400 p-2 rounded-md">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Active Session
                    </div>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                    onClick={() => {
                      if (window.confirm('Unlink this wallet?')) {
                        saveWalletLink(null);
                      }
                    }}
                  >
                    Unlink Wallet
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">Connect your Joey wallet to manage assets.</p>
                  <ConnectJoey
                    networkPreference="xrpl:testnet"
                    onConnected={handleJoeyConnected}
                    onDisconnected={handleJoeyDisconnected}
                    className="w-full"
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {/* Xaman Wallet Card */}
          <Card className={`relative overflow-hidden transition-all card-glow rounded-florence ${xamanWallet ? 'border-black/10 bg-gray-50/50 dark:bg-zinc-900/50 dark:border-zinc-800' : 'hover:border-black/20 dark:hover:border-zinc-700'}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-medium flex items-center gap-2">
                  <div className="p-2 bg-black dark:bg-white text-white dark:text-black rounded-full h-8 w-8 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
                      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
                    </svg>
                  </div>
                  Xaman Wallet
                </CardTitle>
                {xamanWallet && (
                  <Badge variant="secondary" className="bg-black/5 text-black hover:bg-black/10 dark:bg-white/10 dark:text-white shrink-0 ml-2">
                    Linked
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {xamanWallet ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Wallet Address</p>
                    <div className="flex items-center gap-2 bg-slate-50 dark:bg-zinc-950 p-2 rounded border dark:border-zinc-800 font-mono text-sm break-all">
                      <span className="truncate text-foreground">{xamanWallet.address}</span>
                      <ExternalLink className="w-3 h-3 text-gray-400 dark:text-gray-500 shrink-0" />
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-950/20 transition-all"
                    onClick={async () => {
                      if (window.confirm('Unlink Xaman wallet?')) {
                        if (user?.id) {
                          // Unlink in DB
                          await walletService.unlinkXamanWallet(user.id);
                          // Explicitly logout from SDK to clear stored token
                          await xumm.logout();
                          setXamanWallet(null);
                          toast.success('Xaman wallet unlinked');
                        }
                      }
                    }}
                  >
                    Unlink Wallet
                  </Button>
                </div>
              ) : (
                <div className="space-y-4 flex flex-col h-full justify-between">
                  <p className="text-sm text-muted-foreground">Connect Xaman for secure mobile signing.</p>
                  <ConnectXaman onConnected={handleRefresh} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Handle Xaman PKCE Callback */}
        {/* Logic handled by top-level useEffect */}

        {isPersistingWallet && (
          <div className="flex items-center justify-end gap-2 text-xs text-muted-foreground animate-pulse">
            <span className="h-2 w-2 rounded-full bg-primary"></span>
            <span>Saving wallet changes...</span>
          </div>
        )}
      </div>

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
      <Card className="card-glow rounded-florence">
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
          <Card className="card-glow rounded-florence">
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
          <Card className="card-glow rounded-florence">
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
                          <p className={`text-lg font-bold ${transaction.type === 'earn' ? 'text-green-600' :
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
          <Card className="card-glow rounded-florence">
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
