import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { HealthAICoin } from "@/components/FloLogo";
import { ArrowUpRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useXRPL } from "@/contexts/XRPLContext";
import { useAuth } from "@/contexts/AuthContext";
import { haicRewardService } from "@/services/haic-reward.service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface TokenRewardsProps {
  className?: string;
}

export function TokenRewards({ className }: TokenRewardsProps) {
  const { user } = useAuth();
  const { balance, isConnected, walletAddress, transferHAIC, setupTrustLine, isJoeyWallet } = useXRPL();
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [transferAmount, setTransferAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [isTransferring, setIsTransferring] = useState(false);
  const [isSettingUpTrust, setIsSettingUpTrust] = useState(false);
  const [totalEarned, setTotalEarned] = useState(0);
  const [recentRewards, setRecentRewards] = useState<any[]>([]);

  // Fetch HAIC rewards from database
  useEffect(() => {
    const fetchHAICRewards = async () => {
      if (user?.id) {
        try {
          const total = await haicRewardService.getTotalHAICBalance(user.id);
          const recent = await haicRewardService.getRecentHAICRewards(user.id, 5);
          setTotalEarned(total);
          setRecentRewards(recent);
        } catch (error) {
          console.error('Error fetching HAIC rewards:', error);
        }
      }
    };

    fetchHAICRewards();
  }, [user?.id]);

  const formatBalance = (value: string) => {
    return parseFloat(value).toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const handleTransfer = async () => {
    if (!transferAmount || !recipientAddress) return;

    setIsTransferring(true);
    try {
      const success = await transferHAIC(recipientAddress, transferAmount);
      if (success) {
        setIsTransferDialogOpen(false);
        setTransferAmount("");
        setRecipientAddress("");
        toast.success("HAIC transfer successful!");
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message.includes('does not exist')) {
          toast.error('The recipient account does not exist on XRPL. They need to create and fund their account first.');
        } else if (error.message.includes('trust line')) {
          toast.error('The recipient needs to set up their account to accept HAIC tokens first.');
        } else {
          toast.error(error.message);
        }
      }
    } finally {
      setIsTransferring(false);
    }
  };

  const handleSetupTrustLine = async () => {
    setIsSettingUpTrust(true);
    try {
      const success = await setupTrustLine();
      if (success) {
        toast.success('Trust line setup initiated. Please wait for confirmation.');
      }
    } catch (error) {
      toast.error('Failed to setup trust line');
    } finally {
      setIsSettingUpTrust(false);
    }
  };

  return (
    <Card className={cn("rounded-florence overflow-hidden card-glow", className)}>
      <div className="p-6 bg-gradient-to-br from-healthAI-navy to-healthAI-darkBlue">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-white">Health AI Coin</h3>
          <HealthAICoin className="w-12 h-12" />
        </div>

        <div className="mb-2">
          <div className="text-sm text-blue-200">XRPL Balance</div>
          <div className="text-3xl font-bold text-white">
            {formatBalance(balance.haic)} <span className="text-sm font-normal">HAIC</span>
          </div>
          <div className="text-xs text-blue-200 mt-1">
            {formatBalance(balance.xrp)} XRP Available
          </div>
        </div>

        <div className="mb-2">
          <div className="text-sm text-blue-200">Total Earned</div>
          <div className="text-2xl font-bold text-green-400">
            {totalEarned.toLocaleString()} <span className="text-sm font-normal">HAIC</span>
          </div>
          <div className="text-xs text-blue-200 mt-1">
            From health activities
          </div>
        </div>

        <div className="flex items-center text-xs text-blue-200">
          {isConnected ? (
            <>
              <span className="text-green-400">Connected</span>
              <span className="mx-2">|</span>
              <span className="truncate" title={walletAddress || ""}>
                {walletAddress}
                {/* ?.slice(0, 8)}...{walletAddress?.slice(-6) */}
              </span>
            </>
          ) : (
            <span className="text-yellow-400">Connecting to XRPL...</span>
          )}
        </div>
      </div>

      <div className="p-4 bg-card">
        <div className="grid grid-cols-2 gap-2 mb-4">
          <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="rounded-full text-xs">
                Transfer
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Transfer HAIC Tokens</DialogTitle>
                <DialogDescription className="space-y-2">
                  <p>Send HAIC tokens to another wallet address.</p>
                  <div className="mt-2 text-xs bg-muted p-2 rounded-md">
                    <p className="font-semibold mb-1">⚠️ Important for Recipients:</p>
                    <ol className="list-decimal list-inside space-y-1">
                      <li>Must have an active XRPL account with XRP</li>
                      <li>Must set up a trust line for HAIC tokens</li>
                      <li>Trust line issuer address: {walletAddress}</li>
                    </ol>
                  </div>
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="recipient">Recipient Address</Label>
                  <Input
                    id="recipient"
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="Enter recipient's XRPL address"
                  />
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
                    XRP Wallet Status
                  </div>
                  <div className="flex items-center gap-2">
                    {isConnected && walletAddress ? (
                      <>
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <div className="text-sm font-medium text-emerald-600">Connected</div>
                        <span className="text-gray-400">|</span>
                        <div className="text-xs font-mono text-gray-600">{walletAddress}</div>
                      </>
                    ) : (
                      <>
                        <div className="h-2 w-2 rounded-full bg-gray-400"></div>
                        <div className="text-sm font-medium text-gray-500">No Wallet Connected</div>
                      </>
                    )}
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    placeholder="Enter amount to transfer"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <Button
                  onClick={handleTransfer}
                  disabled={isTransferring || !transferAmount || !recipientAddress}
                >
                  {isTransferring ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Transferring...
                    </>
                  ) : (
                    'Transfer'
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>



          <Button
            size="sm"
            className="rounded-full text-xs"
            onClick={() => {
              // This would show ways to earn HAIC tokens
              console.log("Show earning opportunities");
            }}
          >
            Earn More
          </Button>
        </div>

        {/* Recent Rewards */}
        {recentRewards.length > 0 && (
          <div className="space-y-2 mb-4">
            <h4 className="text-sm font-medium text-muted-foreground">Recent Rewards</h4>
            <div className="space-y-1 text-xs max-h-32 overflow-y-auto">
              {recentRewards.slice(0, 3).map((reward, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
                  <span className="truncate">{reward.reason}</span>
                  <span className="font-medium text-green-600 dark:text-green-400">+{reward.amount} HAIC</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Earning Opportunities */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Earn HAIC Tokens</h4>
          <div className="space-y-2 text-xs">
            <div className="flex items-center justify-between p-2 bg-green-50 dark:bg-green-900/20 rounded">
              <span>Complete Health Goals</span>
              <span className="font-medium text-green-600 dark:text-green-400">+25-100 HAIC</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-blue-50 dark:bg-blue-900/20 rounded">
              <span>Follow Dietary Plan</span>
              <span className="font-medium text-blue-600 dark:text-blue-400">+10-50 HAIC</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-purple-50 dark:bg-purple-900/20 rounded">
              <span>Attend Appointments</span>
              <span className="font-medium text-purple-600 dark:text-purple-400">+30-75 HAIC</span>
            </div>
            <div className="flex items-center justify-between p-2 bg-orange-50 dark:bg-orange-900/20 rounded">
              <span>Daily Health Check-ins</span>
              <span className="font-medium text-orange-600 dark:text-orange-400">+5-15 HAIC</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
