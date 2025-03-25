
import { Card } from "@/components/ui/card";
import { HealthAICoin } from "@/components/FloLogo";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TokenRewardsProps {
  balance: number;
  className?: string;
}

export function TokenRewards({ balance, className }: TokenRewardsProps) {
  const formatBalance = (value: number) => {
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <Card className={cn("rounded-florence overflow-hidden card-glow", className)}>
      <div className="p-6 bg-gradient-to-br from-healthAI-navy to-healthAI-darkBlue">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-semibold text-white">Health AI Coin</h3>
          <HealthAICoin className="w-12 h-12" />
        </div>
        
        <div className="mb-2">
          <div className="text-sm text-blue-200">Current Balance</div>
          <div className="text-3xl font-bold text-white">
            {formatBalance(balance)} <span className="text-sm font-normal">HAIC</span>
          </div>
        </div>
        
        <div className="flex items-center text-xs text-blue-200">
          <span className="text-green-400 flex items-center">
            +3.5% <ArrowUpRight className="h-3 w-3 ml-1" />
          </span>
          <span className="mx-2">|</span>
          <span>Last 7 days</span>
        </div>
      </div>
      
      <div className="p-4 bg-card">
        <div className="grid grid-cols-2 gap-2">
          <Button size="sm" variant="outline" className="rounded-full text-xs">
            Transfer
          </Button>
          <Button size="sm" className="rounded-full text-xs">
            Earn More
          </Button>
        </div>
      </div>
    </Card>
  );
}
