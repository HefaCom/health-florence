import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Apple, 
  Utensils, 
  Plus, 
  Edit3, 
  CheckCircle, 
  Clock,
  AlertCircle,
  Loader2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { florenceService } from "@/services/florence.service";
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
  const [dietaryItems, setDietaryItems] = useState<DietaryItem[]>([
    {
      id: "1",
      name: "Oatmeal with Berries",
      category: "breakfast",
      calories: 250,
      protein: 8,
      carbs: 45,
      fat: 4,
      fiber: 6,
      isRecommended: true,
      isCompleted: false,
      time: "8:00 AM"
    },
    {
      id: "2",
      name: "Grilled Chicken Salad",
      category: "lunch",
      calories: 320,
      protein: 35,
      carbs: 15,
      fat: 12,
      fiber: 8,
      isRecommended: true,
      isCompleted: false,
      time: "12:30 PM"
    },
    {
      id: "3",
      name: "Greek Yogurt with Nuts",
      category: "snack",
      calories: 180,
      protein: 15,
      carbs: 12,
      fat: 8,
      fiber: 3,
      isRecommended: true,
      isCompleted: false,
      time: "3:00 PM"
    },
    {
      id: "4",
      name: "Salmon with Vegetables",
      category: "dinner",
      calories: 420,
      protein: 38,
      carbs: 20,
      fat: 18,
      fiber: 10,
      isRecommended: true,
      isCompleted: false,
      time: "7:00 PM"
    }
  ]);

  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleToggleComplete = (id: string) => {
    setDietaryItems(prev => 
      prev.map(item => 
        item.id === id 
          ? { ...item, isCompleted: !item.isCompleted }
          : item
      )
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
        dietaryRestrictions: [],
        healthConditions: []
      };

      const newRecommendations = await florenceService.generateDietaryRecommendations(healthProfile);
      
      // Update dietary items with new recommendations
      setDietaryItems(prev => {
        const existingIds = new Set(prev.map(item => item.id));
        const newItems = newRecommendations
          .filter(item => !existingIds.has(item.id))
          .map(item => ({
            ...item,
            isCompleted: false // Add missing property
          }));
        return [...prev, ...newItems];
      });

      toast.success("Florence has updated your dietary recommendations!");
    } catch (error) {
      console.error('Error updating dietary recommendations:', error);
      toast.error("Failed to update dietary recommendations");
    } finally {
      setIsUpdating(false);
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

      <ScrollArea className="h-[300px] p-4">
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
                  
                  <div className="grid grid-cols-4 gap-2 text-xs text-muted-foreground">
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
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleToggleComplete(item.id)}
                  className={cn(
                    "ml-2",
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
              </div>
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
              Ask Florence for Dietary Recommendations
            </>
          )}
        </Button>
      </div>
    </Card>
  );
} 