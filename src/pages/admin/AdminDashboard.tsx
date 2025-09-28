
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useEffect, useMemo, useState } from "react";
import { 
  Users, 
  Calendar, 
  Activity, 
  Coins, 
  TrendingUp,
  RefreshCw
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { generateClient } from "aws-amplify/api";
import { listUsers, listHAICRewards } from "@/graphql/queries";
import { xummService, HAICBalance } from "@/services/xumm.service";

// Custom query to get appointments with expert user data
const LIST_APPOINTMENTS_WITH_EXPERT_USER = /* GraphQL */ `
  query ListAppointmentsWithExpertUser($filter: ModelAppointmentFilterInput, $limit: Int, $nextToken: String) {
    listAppointments(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        userId
        expertId
        date
        status
        type
        expert {
          id
          specialization
          user {
            id
            email
            firstName
            lastName
          }
        }
      }
      nextToken
    }
  }
`;
import { toast } from "sonner";

const client = generateClient();

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [rewards, setRewards] = useState<any[]>([]);
  const [haicBalances, setHaicBalances] = useState<HAICBalance[]>([]);
  const [totalHAICSupply, setTotalHAICSupply] = useState({ totalHAIC: 0, totalXRP: 0, userCount: 0 });
  const [xummAPIBalance, setXummAPIBalance] = useState({ xrp: 0, haic: 0, accountInfo: null });
  const [isRefreshingBalances, setIsRefreshingBalances] = useState(false);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const [u, a] = await Promise.all([
          client.graphql({ query: listUsers }),
          client.graphql({ query: LIST_APPOINTMENTS_WITH_EXPERT_USER })
        ]);
        setUsers((u as any).data?.listUsers?.items || []);
        setAppointments((a as any).data?.listAppointments?.items || []);

        try {
          const r = await client.graphql({ query: listHAICRewards });
          setRewards((r as any).data?.listHAICRewards?.items || []);
        } catch (err: any) {
          // Swallow authorization error for rewards; not all roles can list all rewards
          const msg = err?.errors?.[0]?.message || err?.message || '';
          if (typeof msg === 'string' && msg.includes('Not Authorized')) {
            setRewards([]);
          } else {
            console.warn('Failed to load HAIC rewards', err);
            setRewards([]);
          }
        }

        // Load HAIC balances from XUMM
        try {
          const [balances, supply, apiBalance] = await Promise.all([
            xummService.getAllUserHAICBalances(),
            xummService.getTotalHAICSupply(),
            xummService.getXUMMAPIBalance()
          ]);
          console.log('XUMM API Balance fetched:', apiBalance);
          setHaicBalances(balances);
          setTotalHAICSupply(supply);
          setXummAPIBalance(apiBalance);
        } catch (err) {
          console.warn('Failed to load HAIC balances', err);
          setHaicBalances([]);
          setTotalHAICSupply({ totalHAIC: 0, totalXRP: 0, userCount: 0 });
          setXummAPIBalance({ xrp: 0, haic: 0, accountInfo: null });
        }
      } catch (e) {
        console.error("Failed to load admin dashboard data", e);
        toast.error("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const refreshBalances = async () => {
    setIsRefreshingBalances(true);
    try {
      const apiBalance = await xummService.getXUMMAPIBalance();
      console.log('Refreshed XUMM API Balance:', apiBalance);
      setXummAPIBalance(apiBalance);
      toast.success("Balances refreshed successfully!");
    } catch (error) {
      console.error('Error refreshing balances:', error);
      toast.error("Failed to refresh balances");
    } finally {
      setIsRefreshingBalances(false);
    }
  };

  const stats = useMemo(() => {
    const totalUsers = users.length;
    const totalAppointments = appointments.length;
    const activeSince = Date.now() - 24 * 60 * 60 * 1000;
    const activeUsers = users.filter(u => u.lastLoginAt && new Date(u.lastLoginAt).getTime() >= activeSince).length;
    const rewardsCount = rewards.length;
    const rewardsTotal = rewards.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
    const recentUsers = [...users].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
    const recentAppointments = [...appointments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
    
    // HAIC balance stats - using XUMM API balance instead of individual user balances
    const totalHAICInWallets = xummAPIBalance.haic;
    const totalXRPInWallets = xummAPIBalance.xrp;
    const usersWithWallets = haicBalances.filter(b => b.walletAddress).length;
    const topHAICHolders = haicBalances
      .filter(b => b.haicBalance > 0)
      .sort((a, b) => b.haicBalance - a.haicBalance)
      .slice(0, 5);
    
    console.log('Dashboard stats calculation:', {
      totalHAICInWallets,
      totalXRPInWallets,
      xummAPIBalance,
      usersWithWallets
    });
    
    return { 
      totalUsers, 
      totalAppointments, 
      activeUsers, 
      rewardsCount, 
      rewardsTotal, 
      recentUsers, 
      recentAppointments,
      totalHAICInWallets,
      totalXRPInWallets,
      usersWithWallets,
      topHAICHolders
    };
  }, [users, appointments, rewards, haicBalances, totalHAICSupply, xummAPIBalance]);

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="text-muted-foreground">Welcome to the Florence Admin Dashboard.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '—' : stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 flex items-center">
                <TrendingUp className="h-3 w-3 mr-1" />
                All registered users
              </span>
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '—' : stats.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">Total appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active (24h)</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '—' : stats.activeUsers}</div>
            <p className="text-xs text-muted-foreground">Users active in last 24h</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">HAIC Rewards</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '—' : stats.rewardsCount}</div>
            <p className="text-xs text-muted-foreground">Total issued: {isLoading ? '—' : `${stats.rewardsTotal} HAIC`}</p>
          </CardContent>
        </Card>
      </div>

      {/* HAIC Balance Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">XUMM API Balance</h2>
            {/* <p className="text-muted-foreground">
              Monitoring account: {xummAPIBalance.accountInfo?.accountAddress || 'rN7n7otQDd6FczFgLdSqtcsAUxDkw6fzRH'}
            </p> */}
          </div>
          <button
            onClick={refreshBalances}
            disabled={isRefreshingBalances}
            className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshingBalances ? 'animate-spin' : ''}`} />
            <span>{isRefreshingBalances ? 'Refreshing...' : 'Refresh'}</span>
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">XUMM API HAIC Balance</CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '—' : stats.totalHAICInWallets.toFixed(6)}</div>
            <p className="text-xs text-muted-foreground">HAIC tokens in XUMM API account</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">XUMM API XRP Balance</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '—' : stats.totalXRPInWallets.toFixed(6)}</div>
            <p className="text-xs text-muted-foreground">XRP in XUMM API account</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Users with Wallets</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '—' : stats.usersWithWallets}</div>
            <p className="text-xs text-muted-foreground">Connected XUMM wallets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Wallet Coverage</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? '—' : `${((stats.usersWithWallets / stats.totalUsers) * 100).toFixed(1)}%`}
            </div>
            <p className="text-xs text-muted-foreground">Users with connected wallets</p>
          </CardContent>
        </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>Latest registered users on the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Loading...</div>
              ) : stats.recentUsers.length === 0 ? (
                <div className="text-sm text-muted-foreground">No users found</div>
              ) : (
                stats.recentUsers.map((u) => (
                  <div key={u.id} className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <span className="text-xs font-medium">{(u.firstName?.trim()?.[0] || 'U')}{(u.lastName?.trim()?.[0] || '')}</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{u.firstName?.trim()} {u.lastName?.trim()}</p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                    </div>
                    <div className="ml-auto text-xs text-muted-foreground">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Appointments</CardTitle>
            <CardDescription>Latest scheduled appointments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="text-sm text-muted-foreground">Loading...</div>
              ) : stats.recentAppointments.length === 0 ? (
                <div className="text-sm text-muted-foreground">No appointments found</div>
              ) : (
                stats.recentAppointments.map((a) => (
                  <div key={a.id} className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{a.expert?.user ? `${a.expert.user.firstName?.trim()} ${a.expert.user.lastName?.trim()}` : a.expert?.specialization || 'Expert'}</p>
                      <p className="text-xs text-muted-foreground">{new Date(a.date).toLocaleString()}</p>
                    </div>
                    <div className="ml-auto">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        a.status === 'COMPLETED' ? 'bg-green-500/10 text-green-600' :
                        a.status === 'CANCELLED' ? 'bg-red-500/10 text-red-600' :
                        'bg-blue-500/10 text-blue-600'
                      }`}>
                        {a.status}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Top HAIC Holders Section */}
      <Card>
        <CardHeader>
          <CardTitle>Top HAIC Holders</CardTitle>
          <CardDescription>Users with the highest HAIC token balances</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {isLoading ? (
              <div className="text-sm text-muted-foreground">Loading...</div>
            ) : stats.topHAICHolders.length === 0 ? (
              <div className="text-sm text-muted-foreground">No HAIC holders found</div>
            ) : (
              stats.topHAICHolders.map((holder, index) => (
                <div key={holder.userId} className="flex items-center">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                    <span className="text-xs font-medium">#{index + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{holder.userName || 'Unknown User'}</p>
                    <p className="text-xs text-muted-foreground">{holder.userEmail}</p>
                    {holder.walletAddress && (
                      <p className="text-xs text-muted-foreground">
                        Wallet: {holder.walletAddress.slice(0, 8)}...{holder.walletAddress.slice(-8)}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-primary">{holder.haicBalance.toFixed(2)} HAIC</p>
                    <p className="text-xs text-muted-foreground">{holder.xrpBalance.toFixed(2)} XRP</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
