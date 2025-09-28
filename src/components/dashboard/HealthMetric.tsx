
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Edit3, Save, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface HealthMetricProps {
  title: string;
  value: number;
  target: number;
  unit: string;
  icon: React.ReactNode;
  color?: string;
  className?: string;
  onValueChange?: (newValue: number) => void;
  onTargetChange?: (newTarget: number) => void;
  isEditable?: boolean;
}

export function HealthMetric({
  title,
  value,
  target,
  unit,
  icon,
  color = "bg-healthAI-blue",
  className,
  onValueChange,
  onTargetChange,
  isEditable = true,
}: HealthMetricProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());
  const [editTarget, setEditTarget] = useState(target.toString());
  const [isEditingValue, setIsEditingValue] = useState(false);
  const [isEditingTarget, setIsEditingTarget] = useState(false);

  const percentage = Math.min((value / target) * 100, 100);
  
  const handleSaveValue = () => {
    const newValue = parseFloat(editValue);
    if (!isNaN(newValue) && newValue >= 0) {
      onValueChange?.(newValue);
      setIsEditingValue(false);
    }
  };

  const handleSaveTarget = () => {
    const newTarget = parseFloat(editTarget);
    if (!isNaN(newTarget) && newTarget > 0) {
      onTargetChange?.(newTarget);
      setIsEditingTarget(false);
    }
  };

  const handleCancelEdit = () => {
    setEditValue(value.toString());
    setEditTarget(target.toString());
    setIsEditingValue(false);
    setIsEditingTarget(false);
    setIsEditing(false);
  };

  return (
    <Card className={cn("p-4 rounded-florence card-glow", className)}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-medium">{title}</h3>
        <div className="flex items-center space-x-2">
          <div className={cn("p-2 rounded-full bg-opacity-20", color)}>
            {icon}
          </div>
          {isEditable && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="h-6 w-6 p-0"
            >
              <Edit3 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
      
      <div className="space-y-2">
        {/* Current Value */}
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold">
            {isEditingValue ? (
              <div className="flex items-center space-x-2">
                <Input
                  type="number"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-20 h-8 text-lg"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveValue();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                  autoFocus
                />
                <span className="text-sm font-normal">{unit}</span>
              </div>
            ) : (
              <span>
                {value}
                <span className="text-sm font-normal ml-1">{unit}</span>
              </span>
            )}
          </div>
          {isEditing && !isEditingValue && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsEditingValue(true);
                setEditValue(value.toString());
              }}
              className="h-6 px-2 text-xs"
            >
              Edit
            </Button>
          )}
          {isEditingValue && (
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveValue}
                className="h-6 w-6 p-0"
              >
                <Save className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>

        {/* Target Value */}
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {isEditingTarget ? (
              <div className="flex items-center space-x-2">
                <span>Target:</span>
                <Input
                  type="number"
                  value={editTarget}
                  onChange={(e) => setEditTarget(e.target.value)}
                  className="w-16 h-6 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveTarget();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                  autoFocus
                />
                <span>{unit}</span>
              </div>
            ) : (
              <span>Target: {target} {unit}</span>
            )}
          </div>
          {isEditing && !isEditingTarget && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsEditingTarget(true);
                setEditTarget(target.toString());
              }}
              className="h-6 px-2 text-xs"
            >
              Edit
            </Button>
          )}
          {isEditingTarget && (
            <div className="flex space-x-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSaveTarget}
                className="h-6 w-6 p-0"
              >
                <Save className="h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleCancelEdit}
                className="h-6 w-6 p-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <Progress value={percentage} className="h-2 rounded-full mt-3" />
    </Card>
  );
}
