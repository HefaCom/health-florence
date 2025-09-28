import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Loader2,
  Trash2,
  Save,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { florenceService } from "@/services/florence.service";
import { healthGoalService, HealthGoal as HealthGoalType } from "@/services/health-goal.service";
import { haicTokenService } from "@/services/haic-token.service";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services/user.service";
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
  const { user } = useAuth();
  const [goals, setGoals] = useState<HealthGoalType[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingGoal, setEditingGoal] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newGoal, setNewGoal] = useState({
    title: "",
    description: "",
    category: "fitness",
    target: 0,
    current: 0,
    unit: "",
    deadline: "",
    priority: "medium",
    reward: 0,
    reason: ""
  });

  // Fetch health goals and user profile from database
  useEffect(() => {
    const fetchData = async () => {
      if (user?.id && user?.email) {
        try {
          setIsLoading(true);
          const [userGoals, profile] = await Promise.all([
            healthGoalService.getHealthGoalsByUserId(user.id),
            userService.getUserByEmail(user.email)
          ]);
          setGoals(userGoals);
          setUserProfile(profile);
        } catch (error) {
          console.error('Error fetching data:', error);
          toast.error("Failed to load data");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [user?.id, user?.email]);

  const handleUpdateProgress = async (id: string, newValue: number) => {
    try {
      const goal = goals.find(g => g.id === id);
      if (!goal) return;

      const wasCompleted = goal.isCompleted;
      const updatedGoal = await healthGoalService.updateProgress(id, newValue);
      
      // Update local state
    setGoals(prev => 
        prev.map(g => g.id === id ? updatedGoal : g)
      );

      // If goal was just completed and has a reward, create HAIC reward
      if (!wasCompleted && updatedGoal.isCompleted && updatedGoal.reward && user?.id) {
        try {
          await haicTokenService.distributeReward(
            user.id,
            updatedGoal.reward,
            `Completed goal: ${updatedGoal.title}`,
            "goal_completion"
          );
          toast.success(`🎉 Goal completed! You earned ${updatedGoal.reward} HAIC tokens!`);
        } catch (error) {
          console.error('Error creating HAIC reward:', error);
          toast.success(`🎉 Goal completed! (HAIC reward pending)`);
        }
      } else {
        toast.success("Progress updated!");
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error("Failed to update progress");
    }
  };

  const handleAskFlorence = async () => {
    if (!user?.id || !userProfile) {
      toast.error("User profile not found");
      return;
    }

    setIsUpdating(true);
    try {
      // Calculate age from date of birth
      const age = userProfile.dateOfBirth 
        ? new Date().getFullYear() - new Date(userProfile.dateOfBirth).getFullYear()
        : 30;

      // Parse health conditions and allergies
      const healthConditions = userProfile.medicalConditions 
        ? userProfile.medicalConditions.split(',').map((c: string) => c.trim()).filter((c: string) => c)
        : [];
      
      const allergies = userProfile.allergies 
        ? userProfile.allergies.split(',').map((a: string) => a.trim()).filter((a: string) => a)
        : [];

      // Calculate BMI
      const bmi = userProfile.weight && userProfile.height 
        ? (userProfile.weight / Math.pow(userProfile.height / 100, 2)).toFixed(1)
        : null;

      // Determine health focus based on BMI and conditions
      let healthFocus = "general wellness";
      if (bmi) {
        const bmiNum = parseFloat(bmi);
        if (bmiNum < 18.5) healthFocus = "healthy weight gain";
        else if (bmiNum < 25) healthFocus = "maintain healthy weight";
        else if (bmiNum < 30) healthFocus = "weight management";
        else healthFocus = "weight loss and health improvement";
      }

      // Create comprehensive personalized health profile
      const healthProfile = {
        height: userProfile.height || 175,
        weight: userProfile.weight || 72,
        age: age,
        gender: userProfile.gender || "unknown",
        bmi: bmi,
        bloodType: userProfile.bloodType || "",
        allergies: allergies,
        healthConditions: healthConditions,
        currentMedications: userProfile.currentMedications || "",
        activityLevel: "moderate",
        healthFocus: healthFocus,
        currentGoals: goals,
        existingHealthConditions: healthConditions,
        userPreferences: {
          goalCategories: goals.map(g => g.category),
          completedGoals: goals.filter(g => g.isCompleted).length,
          averageReward: goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + (g.reward || 0), 0) / goals.length) : 0,
          preferredDeadline: "2-4 weeks", // Could be learned from user behavior
          difficultyPreference: "moderate" // Could be learned from user behavior
        },
        healthMetrics: {
          // Could include current health metrics if available
          heartRate: 72,
          steps: 8500,
          sleep: 7,
          activity: 45
        }
      };

      const newGoals = await florenceService.generateHealthGoals(healthProfile, goals);
      
      // Create new health goals in the database
      const createdGoals: HealthGoalType[] = [];
      for (const goal of newGoals) {
        try {
          const newGoal = await healthGoalService.createHealthGoal({
            userId: user.id,
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
            reward: goal.reward,
            reason: "AI Generated Personalized Recommendation"
          });
          createdGoals.push(newGoal);
        } catch (error) {
          console.error('Error creating health goal:', error);
        }
      }

      // Award HAIC tokens for getting AI recommendations
      try {
        await haicTokenService.distributeReward(
          user.id,
          25, // 25 HAIC tokens for getting AI recommendations
          "Received personalized health goal recommendations from Florence AI",
          "ai_recommendation"
        );
        toast.success(`Florence has created ${createdGoals.length} personalized health goals for you! You earned 25 HAIC tokens! 🎉`);
      } catch (error) {
        console.error('Error awarding HAIC tokens:', error);
        toast.success(`Florence has created ${createdGoals.length} personalized health goals for you!`);
      }

      // Update user preferences with goal generation data
      try {
        const currentPreferences = userProfile.preferences ? JSON.parse(userProfile.preferences) : {};
        const updatedPreferences = {
          ...currentPreferences,
          healthGoals: {
            lastRecommendationDate: new Date().toISOString(),
            totalRecommendations: (currentPreferences.healthGoals?.totalRecommendations || 0) + 1,
            preferredCategories: [...new Set([...goals.map(g => g.category), ...newGoals.map(g => g.category)])],
            completedGoals: goals.filter(g => g.isCompleted).length,
            averageReward: goals.length > 0 ? Math.round(goals.reduce((sum, g) => sum + (g.reward || 0), 0) / goals.length) : 0,
            lastHealthProfile: {
              bmi: bmi,
              healthFocus: healthFocus,
              healthConditions: healthConditions,
              allergies: allergies
            }
          }
        };

        await userService.updateUser({
          id: user.id,
          preferences: JSON.stringify(updatedPreferences)
        });
      } catch (error) {
        console.error('Error updating user preferences:', error);
        // Don't show error to user as this is not critical
      }

      // Update local state with new goals
      setGoals(prev => [...prev, ...createdGoals]);
    } catch (error) {
      console.error('Error updating health goals:', error);
      toast.error("Failed to update health goals");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditGoal = (goal: HealthGoalType) => {
    setEditingGoal(goal.id);
  };

  const handleSaveEdit = async (goal: HealthGoalType) => {
    try {
      await healthGoalService.updateHealthGoal({
        id: goal.id,
        title: goal.title,
        description: goal.description,
        category: goal.category,
        target: goal.target,
        current: goal.current,
        unit: goal.unit,
        deadline: goal.deadline,
        priority: goal.priority,
        reward: goal.reward,
        reason: goal.reason
      });
      
      setGoals(prev => 
        prev.map(g => g.id === goal.id ? goal : g)
      );
      setEditingGoal(null);
      toast.success("Health goal updated successfully!");
    } catch (error) {
      console.error('Error updating health goal:', error);
      toast.error("Failed to update health goal");
    }
  };

  const handleDeleteGoal = async (id: string) => {
    try {
      await healthGoalService.deleteHealthGoal(id);
      setGoals(prev => prev.filter(goal => goal.id !== id));
      toast.success("Health goal deleted successfully!");
    } catch (error) {
      console.error('Error deleting health goal:', error);
      toast.error("Failed to delete health goal");
    }
  };

  const handleAddNewGoal = async () => {
    if (!user?.id) return;

    try {
      const newGoalData = await healthGoalService.createHealthGoal({
        userId: user.id,
        title: newGoal.title,
        description: newGoal.description,
        category: newGoal.category,
        target: newGoal.target,
        current: newGoal.current,
        unit: newGoal.unit,
        deadline: newGoal.deadline,
        isCompleted: false,
        isRecommended: false,
        priority: newGoal.priority,
        reward: newGoal.reward,
        reason: newGoal.reason
      });

      setGoals(prev => [...prev, newGoalData]);
      setShowAddForm(false);
      setNewGoal({
        title: "",
        description: "",
        category: "fitness",
        target: 0,
        current: 0,
        unit: "",
        deadline: "",
        priority: "medium",
        reward: 0,
        reason: ""
      });
      toast.success("New health goal added successfully!");
    } catch (error) {
      console.error('Error adding health goal:', error);
      toast.error("Failed to add health goal");
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

  if (isLoading) {
    return (
      <Card className={cn("rounded-florence overflow-hidden card-glow", className)}>
        <div className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-b">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-muted-foreground">Loading health goals...</span>
          </div>
        </div>
      </Card>
    );
  }

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

      <ScrollArea className="h-[500px] p-4">
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
              {editingGoal === goal.id ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor={`title-${goal.id}`}>Title</Label>
                      <Input
                        id={`title-${goal.id}`}
                        value={goal.title}
                        onChange={(e) => {
                          const updatedGoal = { ...goal, title: e.target.value };
                          setGoals(prev => 
                            prev.map(g => g.id === goal.id ? updatedGoal : g)
                          );
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`category-${goal.id}`}>Category</Label>
                      <Select
                        value={goal.category}
                        onValueChange={(value) => {
                          const updatedGoal = { ...goal, category: value };
                          setGoals(prev => 
                            prev.map(g => g.id === goal.id ? updatedGoal : g)
                          );
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fitness">Fitness</SelectItem>
                          <SelectItem value="nutrition">Nutrition</SelectItem>
                          <SelectItem value="mental">Mental Health</SelectItem>
                          <SelectItem value="medical">Medical</SelectItem>
                          <SelectItem value="lifestyle">Lifestyle</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor={`description-${goal.id}`}>Description</Label>
                    <Textarea
                      id={`description-${goal.id}`}
                      value={goal.description}
                      onChange={(e) => {
                        const updatedGoal = { ...goal, description: e.target.value };
                        setGoals(prev => 
                          prev.map(g => g.id === goal.id ? updatedGoal : g)
                        );
                      }}
                    />
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor={`target-${goal.id}`}>Target</Label>
                      <Input
                        id={`target-${goal.id}`}
                        type="number"
                        value={goal.target}
                        onChange={(e) => {
                          const updatedGoal = { ...goal, target: parseInt(e.target.value) || 0 };
                          setGoals(prev => 
                            prev.map(g => g.id === goal.id ? updatedGoal : g)
                          );
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`current-${goal.id}`}>Current</Label>
                      <Input
                        id={`current-${goal.id}`}
                        type="number"
                        value={goal.current}
                        onChange={(e) => {
                          const updatedGoal = { ...goal, current: parseInt(e.target.value) || 0 };
                          setGoals(prev => 
                            prev.map(g => g.id === goal.id ? updatedGoal : g)
                          );
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`unit-${goal.id}`}>Unit</Label>
                      <Input
                        id={`unit-${goal.id}`}
                        value={goal.unit}
                        onChange={(e) => {
                          const updatedGoal = { ...goal, unit: e.target.value };
                          setGoals(prev => 
                            prev.map(g => g.id === goal.id ? updatedGoal : g)
                          );
                        }}
                        placeholder="e.g., kg, steps, days"
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label htmlFor={`deadline-${goal.id}`}>Deadline</Label>
                      <Input
                        id={`deadline-${goal.id}`}
                        type="date"
                        value={goal.deadline}
                        onChange={(e) => {
                          const updatedGoal = { ...goal, deadline: e.target.value };
                          setGoals(prev => 
                            prev.map(g => g.id === goal.id ? updatedGoal : g)
                          );
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`priority-${goal.id}`}>Priority</Label>
                      <Select
                        value={goal.priority}
                        onValueChange={(value) => {
                          const updatedGoal = { ...goal, priority: value };
                          setGoals(prev => 
                            prev.map(g => g.id === goal.id ? updatedGoal : g)
                          );
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">High</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor={`reward-${goal.id}`}>Reward (HAIC)</Label>
                      <Input
                        id={`reward-${goal.id}`}
                        type="number"
                        value={goal.reward}
                        onChange={(e) => {
                          const updatedGoal = { ...goal, reward: parseInt(e.target.value) || 0 };
                          setGoals(prev => 
                            prev.map(g => g.id === goal.id ? updatedGoal : g)
                          );
                        }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor={`reason-${goal.id}`}>Reason/Notes</Label>
                    <Textarea
                      id={`reason-${goal.id}`}
                      value={goal.reason || ""}
                      onChange={(e) => {
                        const updatedGoal = { ...goal, reason: e.target.value };
                        setGoals(prev => 
                          prev.map(g => g.id === goal.id ? updatedGoal : g)
                        );
                      }}
                      placeholder="Optional notes about this goal..."
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingGoal(null)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSaveEdit(goal)}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
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

                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Trophy className="h-3 w-3" />
                      <span>Reward: {goal.reward} HAIC</span>
                    </div>
                  </div>
                    
                    {goal.reason && (
                      <p className="text-xs text-muted-foreground italic">{goal.reason}</p>
                    )}
              </div>

                  <div className="flex flex-col space-y-1 ml-2">
              {isEditing && !goal.isCompleted && (
                  <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">Progress:</span>
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
                    )}
                    
                    {isEditing && (
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditGoal(goal)}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteGoal(goal.id)}
                          className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {showAddForm && (
            <div className="p-4 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
              <div className="space-y-4">
                <h4 className="font-medium">Add New Health Goal</h4>
                
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="new-title">Title</Label>
                    <Input
                      id="new-title"
                      value={newGoal.title}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="e.g., Run 5K"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-category">Category</Label>
                    <Select
                      value={newGoal.category}
                      onValueChange={(value) => setNewGoal(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fitness">Fitness</SelectItem>
                        <SelectItem value="nutrition">Nutrition</SelectItem>
                        <SelectItem value="mental">Mental Health</SelectItem>
                        <SelectItem value="medical">Medical</SelectItem>
                        <SelectItem value="lifestyle">Lifestyle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="new-description">Description</Label>
                      <Textarea
                        id="new-description"
                        value={newGoal.description}
                        onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe your goal..."
                      />
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="new-target">Target</Label>
                    <Input
                      id="new-target"
                      type="number"
                      value={newGoal.target}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, target: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-current">Current</Label>
                    <Input
                      id="new-current"
                      type="number"
                      value={newGoal.current}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, current: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-unit">Unit</Label>
                    <Input
                      id="new-unit"
                      value={newGoal.unit}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, unit: e.target.value }))}
                      placeholder="e.g., kg, steps, days"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <Label htmlFor="new-deadline">Deadline</Label>
                    <Input
                      id="new-deadline"
                      type="date"
                      value={newGoal.deadline}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, deadline: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-priority">Priority</Label>
                    <Select
                      value={newGoal.priority}
                      onValueChange={(value) => setNewGoal(prev => ({ ...prev, priority: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="new-reward">Reward (HAIC)</Label>
                    <Input
                      id="new-reward"
                      type="number"
                      value={newGoal.reward}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, reward: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="new-reason">Reason/Notes</Label>
                  <Textarea
                    id="new-reason"
                    value={newGoal.reason}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Optional notes about this goal..."
                  />
                </div>
                
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowAddForm(false)}
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleAddNewGoal}
                    disabled={!newGoal.title}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-gray-50 dark:bg-muted/50">
        <div className="flex space-x-2">
          {isEditing && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 rounded-full"
              onClick={() => setShowAddForm(!showAddForm)}
            >
              <Plus className="h-4 w-4 mr-2" />
              {showAddForm ? "Cancel Add" : "Add New Goal"}
            </Button>
          )}
          
        <Button 
          variant="outline" 
          size="sm" 
            className="flex-1 rounded-full"
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
                Ask Florence for Personalized Goals
            </>
          )}
        </Button>
        </div>
      </div>
    </Card>
  );
} 