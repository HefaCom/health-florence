import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Apple, 
  Utensils, 
  Plus, 
  Edit3, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Loader2,
  Trash2,
  Save,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { florenceService } from "@/services/florence.service";
import { dietaryPlanService, DietaryPlan as DietaryPlanType } from "@/services/dietary-plan.service";
import { haicTokenService } from "@/services/haic-token.service";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services/user.service";
import { toast } from "sonner";

interface DietaryItem {
  id: string;
  name: string;
  category: "breakfast" | "lunch" | "dinner" | "snack";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  isRecommended: boolean;
  isCompleted: boolean;
  time?: string;
}

interface DietaryPlanProps {
  className?: string;
}

export function DietaryPlan({ className }: DietaryPlanProps) {
  const { user } = useAuth();
  const [dietaryItems, setDietaryItems] = useState<DietaryPlanType[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "",
    category: "breakfast",
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
    time: "",
    reason: ""
  });

  // Fetch dietary plans and user profile from database
  useEffect(() => {
    const fetchData = async () => {
      if (user?.id && user?.email) {
        try {
          setIsLoading(true);
          const [plans, profile] = await Promise.all([
            dietaryPlanService.getDietaryPlansByUserId(user.id),
            userService.getUserByEmail(user.email)
          ]);
          setDietaryItems(plans);
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

  const handleToggleComplete = async (id: string) => {
    try {
      const item = dietaryItems.find(item => item.id === id);
      if (item) {
        const updatedItem = await dietaryPlanService.toggleCompletion(id, !item.isCompleted);
    setDietaryItems(prev => 
      prev.map(item => 
            item.id === id ? updatedItem : item
          )
        );
        toast.success(`Meal ${updatedItem.isCompleted ? 'completed' : 'marked as incomplete'}!`);
      }
    } catch (error) {
      console.error('Error updating dietary plan:', error);
      toast.error("Failed to update meal status");
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

      // Parse allergies and medical conditions
      const allergies = userProfile.allergies 
        ? userProfile.allergies.split(',').map((a: string) => a.trim()).filter((a: string) => a)
        : [];
      
      const healthConditions = userProfile.medicalConditions 
        ? userProfile.medicalConditions.split(',').map((c: string) => c.trim()).filter((c: string) => c)
        : [];

      // Create personalized health profile
      const healthProfile = {
        height: userProfile.height || 175,
        weight: userProfile.weight || 72,
        age: age,
        gender: userProfile.gender || "unknown",
        activityLevel: "moderate", // Could be enhanced with user input
        dietaryRestrictions: allergies,
        healthConditions: healthConditions,
        currentMedications: userProfile.currentMedications || "",
        bloodType: userProfile.bloodType || "",
        existingDietaryPlans: dietaryItems
      };

      const newRecommendations = await florenceService.generateDietaryRecommendations(healthProfile);
      
      // Create new dietary plans in the database
      const createdPlans: DietaryPlanType[] = [];
      for (const recommendation of newRecommendations) {
        try {
          const newPlan = await dietaryPlanService.createDietaryPlan({
            userId: user.id,
            name: recommendation.name,
            category: recommendation.category,
            calories: recommendation.calories,
            protein: recommendation.protein,
            carbs: recommendation.carbs,
            fat: recommendation.fat,
            fiber: recommendation.fiber,
            isRecommended: true,
            isCompleted: false,
            time: recommendation.time,
            reason: "AI Generated Personalized Recommendation"
          });
          createdPlans.push(newPlan);
        } catch (error) {
          console.error('Error creating dietary plan:', error);
        }
      }

      // Update local state with new plans
      setDietaryItems(prev => [...prev, ...createdPlans]);

      // Award HAIC tokens for getting dietary recommendations
      if (createdPlans.length > 0 && user?.id) {
        try {
          await haicTokenService.distributeReward(
            user.id,
            25, // 25 HAIC tokens for dietary recommendations
            `Received ${createdPlans.length} personalized dietary recommendations`,
            "dietary_adherence"
          );
          toast.success(`Florence has created ${createdPlans.length} personalized dietary recommendations! You earned 25 HAIC tokens! 🎉`);
        } catch (error) {
          console.error('Error awarding HAIC tokens:', error);
          toast.success(`Florence has created ${createdPlans.length} personalized dietary recommendations!`);
        }
      } else {
        toast.success(`Florence has created ${createdPlans.length} personalized dietary recommendations!`);
      }
    } catch (error) {
      console.error('Error updating dietary recommendations:', error);
      toast.error("Failed to update dietary recommendations");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEditItem = (item: DietaryPlanType) => {
    setEditingItem(item.id);
  };

  const handleSaveEdit = async (item: DietaryPlanType) => {
    try {
      await dietaryPlanService.updateDietaryPlan({
        id: item.id,
        name: item.name,
        category: item.category,
        calories: item.calories,
        protein: item.protein,
        carbs: item.carbs,
        fat: item.fat,
        fiber: item.fiber,
        time: item.time,
        reason: item.reason
      });
      
      setDietaryItems(prev => 
        prev.map(i => i.id === item.id ? item : i)
      );
      setEditingItem(null);
      toast.success("Dietary plan updated successfully!");
    } catch (error) {
      console.error('Error updating dietary plan:', error);
      toast.error("Failed to update dietary plan");
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      await dietaryPlanService.deleteDietaryPlan(id);
      setDietaryItems(prev => prev.filter(item => item.id !== id));
      toast.success("Dietary plan deleted successfully!");
    } catch (error) {
      console.error('Error deleting dietary plan:', error);
      toast.error("Failed to delete dietary plan");
    }
  };

  const handleAddNewItem = async () => {
    if (!user?.id) return;

    try {
      const newPlan = await dietaryPlanService.createDietaryPlan({
        userId: user.id,
        name: newItem.name,
        category: newItem.category,
        calories: newItem.calories,
        protein: newItem.protein,
        carbs: newItem.carbs,
        fat: newItem.fat,
        fiber: newItem.fiber,
        isRecommended: false,
        isCompleted: false,
        time: newItem.time,
        reason: newItem.reason
      });

      setDietaryItems(prev => [...prev, newPlan]);
      setShowAddForm(false);
      setNewItem({
        name: "",
        category: "breakfast",
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        time: "",
        reason: ""
      });

      // Award HAIC tokens for creating a dietary plan
      try {
        await haicTokenService.distributeReward(
          user.id,
          10, // 10 HAIC tokens for creating a dietary plan
          `Created dietary plan: ${newPlan.name}`,
          "dietary_adherence"
        );
        toast.success("New dietary plan added successfully! You earned 10 HAIC tokens! 🎉");
      } catch (error) {
        console.error('Error awarding HAIC tokens:', error);
        toast.success("New dietary plan added successfully!");
      }
    } catch (error) {
      console.error('Error adding dietary plan:', error);
      toast.error("Failed to add dietary plan");
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "breakfast": return <Utensils className="h-4 w-4" />;
      case "lunch": return <Apple className="h-4 w-4" />;
      case "dinner": return <Utensils className="h-4 w-4" />;
      case "snack": return <Apple className="h-4 w-4" />;
      default: return <Utensils className="h-4 w-4" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "breakfast": return "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300";
      case "lunch": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "dinner": return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300";
      case "snack": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const totalCalories = dietaryItems.reduce((sum, item) => sum + item.calories, 0);
  const completedItems = dietaryItems.filter(item => item.isCompleted).length;
  const recommendedItems = dietaryItems.filter(item => item.isRecommended).length;

  if (isLoading) {
    return (
      <Card className={cn("rounded-florence overflow-hidden card-glow", className)}>
        <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <span className="ml-2 text-muted-foreground">Loading dietary plans...</span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("rounded-florence overflow-hidden card-glow", className)}>
      <div className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
              <Apple className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Dietary Plan</h3>
              <p className="text-sm text-muted-foreground">
                Personalized nutrition recommendations
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

        <div className="grid grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{totalCalories}</div>
            <div className="text-xs text-muted-foreground">Total Calories</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{completedItems}</div>
            <div className="text-xs text-muted-foreground">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{recommendedItems}</div>
            <div className="text-xs text-muted-foreground">Recommended</div>
          </div>
        </div>
      </div>

      <ScrollArea className="h-[400px] p-4">
        <div className="space-y-3">
          {dietaryItems.map((item) => (
            <div
              key={item.id}
              className={cn(
                "p-3 rounded-lg border transition-all duration-200",
                item.isCompleted 
                  ? "bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800" 
                  : "bg-white border-gray-200 hover:border-green-300 dark:bg-card dark:border-border dark:hover:border-green-600"
              )}
            >
              {editingItem === item.id ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor={`name-${item.id}`}>Name</Label>
                      <Input
                        id={`name-${item.id}`}
                        value={item.name}
                        onChange={(e) => {
                          const updatedItem = { ...item, name: e.target.value };
                          setDietaryItems(prev => 
                            prev.map(i => i.id === item.id ? updatedItem : i)
                          );
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`category-${item.id}`}>Category</Label>
                      <Select
                        value={item.category}
                        onValueChange={(value) => {
                          const updatedItem = { ...item, category: value };
                          setDietaryItems(prev => 
                            prev.map(i => i.id === item.id ? updatedItem : i)
                          );
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="breakfast">Breakfast</SelectItem>
                          <SelectItem value="lunch">Lunch</SelectItem>
                          <SelectItem value="dinner">Dinner</SelectItem>
                          <SelectItem value="snack">Snack</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <Label htmlFor={`calories-${item.id}`}>Calories</Label>
                      <Input
                        id={`calories-${item.id}`}
                        type="number"
                        value={item.calories}
                        onChange={(e) => {
                          const updatedItem = { ...item, calories: parseInt(e.target.value) || 0 };
                          setDietaryItems(prev => 
                            prev.map(i => i.id === item.id ? updatedItem : i)
                          );
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`protein-${item.id}`}>Protein (g)</Label>
                      <Input
                        id={`protein-${item.id}`}
                        type="number"
                        value={item.protein}
                        onChange={(e) => {
                          const updatedItem = { ...item, protein: parseFloat(e.target.value) || 0 };
                          setDietaryItems(prev => 
                            prev.map(i => i.id === item.id ? updatedItem : i)
                          );
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`carbs-${item.id}`}>Carbs (g)</Label>
                      <Input
                        id={`carbs-${item.id}`}
                        type="number"
                        value={item.carbs}
                        onChange={(e) => {
                          const updatedItem = { ...item, carbs: parseFloat(e.target.value) || 0 };
                          setDietaryItems(prev => 
                            prev.map(i => i.id === item.id ? updatedItem : i)
                          );
                        }}
                      />
                    </div>
                    <div>
                      <Label htmlFor={`fat-${item.id}`}>Fat (g)</Label>
                      <Input
                        id={`fat-${item.id}`}
                        type="number"
                        value={item.fat}
                        onChange={(e) => {
                          const updatedItem = { ...item, fat: parseFloat(e.target.value) || 0 };
                          setDietaryItems(prev => 
                            prev.map(i => i.id === item.id ? updatedItem : i)
                          );
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor={`time-${item.id}`}>Time</Label>
                      <Input
                        id={`time-${item.id}`}
                        value={item.time || ""}
                        onChange={(e) => {
                          const updatedItem = { ...item, time: e.target.value };
                          setDietaryItems(prev => 
                            prev.map(i => i.id === item.id ? updatedItem : i)
                          );
                        }}
                        placeholder="e.g., 8:00 AM"
                      />
                    </div>
                    <div>
                      <Label htmlFor={`fiber-${item.id}`}>Fiber (g)</Label>
                      <Input
                        id={`fiber-${item.id}`}
                        type="number"
                        value={item.fiber}
                        onChange={(e) => {
                          const updatedItem = { ...item, fiber: parseFloat(e.target.value) || 0 };
                          setDietaryItems(prev => 
                            prev.map(i => i.id === item.id ? updatedItem : i)
                          );
                        }}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor={`reason-${item.id}`}>Reason/Notes</Label>
                    <Textarea
                      id={`reason-${item.id}`}
                      value={item.reason || ""}
                      onChange={(e) => {
                        const updatedItem = { ...item, reason: e.target.value };
                        setDietaryItems(prev => 
                          prev.map(i => i.id === item.id ? updatedItem : i)
                        );
                      }}
                      placeholder="Optional notes about this meal..."
                    />
                  </div>
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingItem(null)}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleSaveEdit(item)}
                    >
                      <Save className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="flex items-center space-x-1">
                      {item.isCompleted ? (
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                      ) : (
                          <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                      )}
                      <span className="text-sm font-medium">{item.time}</span>
                    </div>
                    <Badge 
                      variant="secondary" 
                      className={cn("text-xs", getCategoryColor(item.category))}
                    >
                      {getCategoryIcon(item.category)}
                      <span className="ml-1 capitalize">{item.category}</span>
                    </Badge>
                    {item.isRecommended && (
                        <Badge variant="outline" className="text-xs border-green-300 text-green-700 dark:border-green-600 dark:text-green-300">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        AI Recommended
                      </Badge>
                    )}
                  </div>
                  
                  <h4 className={cn(
                    "font-medium mb-1",
                      item.isCompleted && "line-through text-gray-500 dark:text-gray-400"
                  )}>
                    {item.name}
                  </h4>
                  
                    <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground mb-2">
                    <div>
                      <span className="font-medium">{item.calories}</span> cal
                    </div>
                    <div>
                      <span className="font-medium">{item.protein}g</span> protein
                    </div>
                    <div>
                      <span className="font-medium">{item.carbs}g</span> carbs
                    </div>
                    <div>
                      <span className="font-medium">{item.fat}g</span> fat
                    </div>
                  </div>
                    
                    {item.reason && (
                      <p className="text-xs text-muted-foreground italic">{item.reason}</p>
                    )}
                </div>
                
                  <div className="flex flex-col space-y-1 ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleComplete(item.id)}
                  className={cn(
                    item.isCompleted 
                          ? "text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300" 
                          : "text-gray-400 hover:text-green-600 dark:text-gray-500 dark:hover:text-green-400"
                  )}
                >
                  <CheckCircle className={cn(
                    "h-5 w-5",
                    item.isCompleted && "fill-current"
                  )} />
                </Button>
                    
                    {isEditing && (
                      <div className="flex space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditItem(item)}
                          className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
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
            <div className="p-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
              <div className="space-y-3">
                <h4 className="font-medium">Add New Dietary Plan</h4>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="new-name">Name</Label>
                    <Input
                      id="new-name"
                      value={newItem.name}
                      onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="e.g., Grilled Chicken Salad"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-category">Category</Label>
                    <Select
                      value={newItem.category}
                      onValueChange={(value) => setNewItem(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="breakfast">Breakfast</SelectItem>
                        <SelectItem value="lunch">Lunch</SelectItem>
                        <SelectItem value="dinner">Dinner</SelectItem>
                        <SelectItem value="snack">Snack</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <Label htmlFor="new-calories">Calories</Label>
                    <Input
                      id="new-calories"
                      type="number"
                      value={newItem.calories}
                      onChange={(e) => setNewItem(prev => ({ ...prev, calories: parseInt(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-protein">Protein (g)</Label>
                    <Input
                      id="new-protein"
                      type="number"
                      value={newItem.protein}
                      onChange={(e) => setNewItem(prev => ({ ...prev, protein: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-carbs">Carbs (g)</Label>
                    <Input
                      id="new-carbs"
                      type="number"
                      value={newItem.carbs}
                      onChange={(e) => setNewItem(prev => ({ ...prev, carbs: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-fat">Fat (g)</Label>
                    <Input
                      id="new-fat"
                      type="number"
                      value={newItem.fat}
                      onChange={(e) => setNewItem(prev => ({ ...prev, fat: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label htmlFor="new-time">Time</Label>
                    <Input
                      id="new-time"
                      value={newItem.time}
                      onChange={(e) => setNewItem(prev => ({ ...prev, time: e.target.value }))}
                      placeholder="e.g., 8:00 AM"
                    />
                  </div>
                  <div>
                    <Label htmlFor="new-fiber">Fiber (g)</Label>
                    <Input
                      id="new-fiber"
                      type="number"
                      value={newItem.fiber}
                      onChange={(e) => setNewItem(prev => ({ ...prev, fiber: parseFloat(e.target.value) || 0 }))}
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="new-reason">Reason/Notes</Label>
                  <Textarea
                    id="new-reason"
                    value={newItem.reason}
                    onChange={(e) => setNewItem(prev => ({ ...prev, reason: e.target.value }))}
                    placeholder="Optional notes about this meal..."
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
                    onClick={handleAddNewItem}
                    disabled={!newItem.name}
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
              {showAddForm ? "Cancel Add" : "Add New Plan"}
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
                Ask Florence for Personalized Recommendations
            </>
          )}
        </Button>
        </div>
      </div>
    </Card>
  );
} 