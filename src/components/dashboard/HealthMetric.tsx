
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface HealthMetricProps {
  title: string;
  value: number;
  target: number;
  unit: string;
  icon: React.ReactNode;
  color?: string;
  className?: string;
}

export function HealthMetric({
  title,
  value,
  target,
  unit,
  icon,
  color = "bg-healthAI-blue",
  className,
}: HealthMetricProps) {
  const percentage = Math.min((value / target) * 100, 100);
  
  return (
    <Card className={cn("p-4 rounded-florence card-glow", className)}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">{title}</h3>
        <div className={cn("p-2 rounded-full bg-opacity-20", color)}>
          {icon}
        </div>
      </div>
      
      <div className="flex items-end justify-between mb-1">
        <div className="text-2xl font-bold">
          {value}
          <span className="text-sm font-normal ml-1">{unit}</span>
        </div>
        <div className="text-sm text-muted-foreground">
          Target: {target} {unit}
        </div>
      </div>
      
      <Progress value={percentage} className="h-2 rounded-full" />
    </Card>
  );
}
