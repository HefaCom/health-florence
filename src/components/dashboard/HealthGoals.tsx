import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Target, 
  Trophy, 
  Plus, 
  Edit3, 
  CheckCircle, 
  Calendar,
  TrendingUp,
  Award,
  Clock,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { florenceService } from "@/services/florence.service";
import { toast } from "sonner";

interface HealthGoal {
  id: string;
  title: string;
  description: string;
  category: "fitness" | "nutrition" | "mental" | "medical" | "lifestyle";
  target: number;
  current: number;
  unit: string;
  deadline: string;
  isCompleted: boolean;
  isRecommended: boolean;
  priority: "low" | "medium" | "high";
  reward?: number; // HAIC tokens
}

interface HealthGoalsProps {
  className?: string;
}

export function HealthGoals({ className }: HealthGoalsProps) {
  const [goals, setGoals] = useState<HealthGoal[]>([
    {
      id: "1",
      title: "Daily Steps Goal",
      description: "Walk 10,000 steps daily for better cardiovascular health",
      category: "fitness",
      target: 10000,
      current: 8500,
      unit: "steps",
      deadline: "2024-12-31",
      isCompleted: false,
      isRecommended: true,
      priority: "high",
      reward: 50
    },
    {
      id: "2",
      title: "Weight Management",
      description: "Maintain healthy weight through balanced diet and exercise",
      category: "nutrition",
      target: 70,
      current: 72,
      unit: "kg",
      deadline: "2024-06-30",
      isCompleted: false,
      isRecommended: true,
      priority: "medium",
      reward: 100
    },
    {
      id: "3",
      title: "Blood Pressure Control",
      description: "Keep blood pressure below 120/80 mmHg",
      category: "medical",
      target: 120,
      current: 125,
      unit: "mmHg",
      deadline: "2024-08-31",
      isCompleted: false,
      isRecommended: true,
      priority: "high",
      reward: 75
    },
    {
      id: "4",
      title: "Sleep Quality",
      description: "Get 8 hours of quality sleep per night",
      category: "lifestyle",
      target: 8,
      current: 7,
      unit: "hours",
      deadline: "2024-12-31",
      isCompleted: false,
      isRecommended: true,
      priority: "medium",
      reward: 30
    },
    {
      id: "5",
      title: "Stress Management",
      description: "Practice meditation for 15 minutes daily",
      category: "mental",
      target: 15,
      current: 10,
      unit: "minutes",
      deadline: "2024-07-31",
      isCompleted: false,
      isRecommended: true,
      priority: "low",
      reward: 25
    }
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdateProgress = (id: string, newValue: number) => {
    setGoals(prev => 
      prev.map(goal => {
        if (goal.id === id) {
          const updatedGoal = { ...goal, current: newValue };
          // Check if goal is completed
          if (newValue >= goal.target && !goal.isCompleted) {
            updatedGoal.isCompleted = true;
            // Here you would trigger HAIC reward
            console.log(`Goal completed! Reward: ${goal.reward} HAIC`);
          }
          return updatedGoal;
        }
        return goal;
      })
    );
  };

  const handleAskFlorence = async () => {
    setIsUpdating(true);
    try {
      // Get current health profile (you can enhance this with real data)
      const healthProfile = {
        height: 175,
        weight: 72,
        age: 30,
        activityLevel: "moderate",
        currentGoals: goals,
        healthConditions: []
      };

      const newGoals = await florenceService.generateHealthGoals(healthProfile, goals);
      
      // Update goals with new recommendations
      setGoals(prev => {
        const existingIds = new Set(prev.map(goal => goal.id));
        const newGoalItems = newGoals
          .filter(goal => !existingIds.has(goal.id))
          .map(goal => ({
            id: goal.id,
            title: goal.title,
            description: goal.description,
            category: goal.category,
            target: goal.target,
            current: 0,
            unit: goal.unit,
            deadline: goal.deadline,
            isCompleted: false,
            isRecommended: true,
            priority: goal.priority,
            reward: goal.reward
          }));
        return [...prev, ...newGoalItems];
      });

      toast.success("Florence has suggested new health goals for you!");
    } catch (error) {
      console.error('Error updating health goals:', error);
      toast.error("Failed to update health goals");
    } finally {
      setIsUpdating(false);
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "fitness": return <TrendingUp className="h-4 w-4" />;
      case "nutrition": return <Trophy className="h-4 w-4" />;
      case "mental": return <Target className="h-4 w-4" />;
      case "medical": return <Award className="h-4 w-4" />;
      case "lifestyle": return <Clock className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "fitness": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "nutrition": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "mental": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "medical": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "lifestyle": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "medium": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "low": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const completedGoals = goals.filter(goal => goal.isCompleted).length;
  const totalGoals = goals.length;
  const totalRewards = goals.reduce((sum, goal) => sum + (goal.reward || 0), 0);
  const earnedRewards = goals
    .filter(goal => goal.isCompleted)
    .reduce((sum, goal) => sum + (goal.reward || 0), 0);

  return (
    <Card className={cn("rounded-florence overflow-hidden card-glow", className)}>
      <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
              <Target className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Health Goals</h3>
              <p className="text-sm text-muted-foreground">
                Track your progress and earn rewards
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
            className="rounded-full"
          >
            <Edit3 className="h-4 w-4 mr-2" />
            {isEditing ? "Done" : "Edit"}
          </Button>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{completedGoals}/{totalGoals}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{earnedRewards}</div>
            <div className="text-xs text-muted-foreground">HAIC Earned</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{totalRewards}</div>
            <div className="text-xs text-muted-foreground">Total Rewards</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
              {Math.round((completedGoals / totalGoals) * 100)}%
            </div>
            <div className="text-xs text-muted-foreground">Success Rate</div>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[400px] p-4">
        <div className="space-y-4">
          {goals.map((goal) => (
            <div
              key={goal.id}
              className={cn(
                "p-4 rounded-lg border transition-all duration-200",
                goal.isCompleted 
                  ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800" 
                  : "bg-white border-gray-200 hover:border-blue-300 dark:bg-card dark:border-border dark:hover:border-blue-600"
              )}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <Badge 
                      variant="secondary" 
                      className={cn("text-xs", getCategoryColor(goal.category))}
                    >
                      {getCategoryIcon(goal.category)}
                      <span className="ml-1 capitalize">{goal.category}</span>
                    </Badge>
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", getPriorityColor(goal.priority))}
                    >
                      {goal.priority} priority
                    </Badge>
                    {goal.isRecommended && (
                      <Badge variant="outline" className="text-xs border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-300">
                        <Target className="h-3 w-3 mr-1" />
                        AI Recommended
                      </Badge>
                    )}
                    {goal.isCompleted && (
                      <Badge variant="outline" className="text-xs border-green-300 text-green-700 dark:border-green-600 dark:text-green-300">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Completed
                      </Badge>
                    )}
                  </div>
                  
                  <h4 className={cn(
                    "font-medium mb-1",
                    goal.isCompleted && "line-through text-gray-500 dark:text-gray-400"
                  )}>
                    {goal.title}
                  </h4>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {goal.description}
                  </p>

                  <div className="flex items-center space-x-4 mb-3">
                    <div className="text-sm">
                      <span className="font-medium">{goal.current}</span>
                      <span className="text-muted-foreground"> / {goal.target} {goal.unit}</span>
                    </div>
                    <div className="flex-1">
                      <Progress 
                        value={(goal.current / goal.target) * 100} 
                        className="h-2"
                      />
                    </div>
                    <div className="text-sm font-medium text-green-600 dark:text-green-400">
                      {goal.reward} HAIC
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Trophy className="h-3 w-3" />
                      <span>Reward: {goal.reward} HAIC</span>
                    </div>
                  </div>
                </div>
              </div>

              {isEditing && !goal.isCompleted && (
                <div className="mt-3 pt-3 border-t">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Update Progress:</span>
                    <input
                      type="number"
                      value={goal.current}
                      onChange={(e) => handleUpdateProgress(goal.id, parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 text-sm border rounded dark:bg-input dark:border-border"
                      min="0"
                      max={goal.target * 2}
                    />
                    <span className="text-sm text-muted-foreground">{goal.unit}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-gray-50 dark:bg-muted/50">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full rounded-full"
          onClick={handleAskFlorence}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Florence is thinking...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4 mr-2" />
              Ask Florence for Health Goals Recommendations
            </>
          )}
        </Button>
      </div>
    </Card>
  );
} 