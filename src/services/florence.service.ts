import { toast } from "sonner";
import { geminiService, FlorenceResponse, HealthContext } from "./gemini.service";

// Types for Florence's responses and actions
export interface DietaryRecommendation {
  id: string;
  name: string;
  category: "breakfast" | "lunch" | "dinner" | "snack";
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  isRecommended: boolean;
  time?: string;
  reason?: string;
}

export interface HealthGoalRecommendation {
  id: string;
  title: string;
  description: string;
  category: "fitness" | "nutrition" | "mental" | "medical" | "lifestyle";
  target: number;
  unit: string;
  deadline: string;
  priority: "low" | "medium" | "high";
  reward: number;
  reason?: string;
}

export interface HealthProfileUpdate {
  height?: number;
  weight?: number;
  bloodType?: string;
  allergies?: string[];
  conditions?: {
    name: string;
    severity: "mild" | "moderate" | "severe";
    status: "active" | "managed" | "resolved";
    description: string;
    medications?: string[];
  }[];
}

export interface HAICReward {
  amount: number;
  reason: string;
  category: "goal_completion" | "dietary_adherence" | "appointment_attendance" | "health_checkin";
}

class FlorenceService {
  private static instance: FlorenceService;

  private constructor() {}

  public static getInstance(): FlorenceService {
    if (!FlorenceService.instance) {
      FlorenceService.instance = new FlorenceService();
    }
    return FlorenceService.instance;
  }

  // Generate dietary recommendations based on user health profile using Gemini AI
  async generateDietaryRecommendations(healthProfile: any): Promise<DietaryRecommendation[]> {
    try {
      // Use Gemini AI to generate personalized recommendations
      const recommendations = await geminiService.generateDietaryRecommendations(healthProfile);
      
      toast.success("Florence has updated your dietary recommendations!");
      return recommendations;
    } catch (error) {
      console.error('Error generating dietary recommendations:', error);
      toast.error("Failed to generate dietary recommendations");
      throw error;
    }
  }

  // Generate health goals based on user profile and current health status using Gemini AI
  async generateHealthGoals(healthProfile: any, currentGoals: any[]): Promise<HealthGoalRecommendation[]> {
    try {
      // Use Gemini AI to generate personalized health goals
      const recommendations = await geminiService.generateHealthGoals(healthProfile);
      
      toast.success("Florence has suggested new health goals for you!");
      return recommendations;
    } catch (error) {
      console.error('Error generating health goals:', error);
      toast.error("Failed to generate health goals");
      throw error;
    }
  }

  // Update health profile with AI insights
  async updateHealthProfile(currentProfile: any, updates: HealthProfileUpdate): Promise<any> {
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const updatedProfile = {
        ...currentProfile,
        ...updates
      };

      toast.success("Florence has updated your health profile!");
      return updatedProfile;
    } catch (error) {
      toast.error("Failed to update health profile");
      throw error;
    }
  }

  // Award HAIC tokens for achievements
  async awardHAICTokens(reward: HAICReward): Promise<boolean> {
    try {
      await new Promise(resolve => setTimeout(resolve, 500));

      // Here you would integrate with XRPL to actually transfer tokens
      console.log(`Awarding ${reward.amount} HAIC for: ${reward.reason}`);

      toast.success(`Congratulations! You earned ${reward.amount} HAIC for ${reward.reason}!`);
      return true;
    } catch (error) {
      toast.error("Failed to award HAIC tokens");
      return false;
    }
  }

  // Process natural language requests from users using Gemini AI
  async processUserRequest(userMessage: string, context: any, aiContext?: 'dietary' | 'goals' | 'profile' | 'general' | 'expert'): Promise<FlorenceResponse> {
    try {
      const message = userMessage.toLowerCase();
      let determinedContext: 'dietary' | 'goals' | 'profile' | 'general' | 'expert' = aiContext || 'general';

      // Determine context based on user message if not explicitly provided
      if (!aiContext) {
        if (message.includes("diet") || message.includes("food") || message.includes("nutrition") || message.includes("meal")) {
          determinedContext = 'dietary';
        } else if (message.includes("goal") || message.includes("target") || message.includes("fitness") || message.includes("exercise")) {
          determinedContext = 'goals';
        } else if (message.includes("health") && (message.includes("profile") || message.includes("condition") || message.includes("bmi") || message.includes("weight"))) {
          determinedContext = 'profile';
        }
      }

      // Create health context for AI
      const healthContext: HealthContext = {
        dietaryItems: context?.dietaryItems || [],
        healthGoals: context?.healthGoals || [],
        healthProfile: context?.healthProfile || {},
        userPreferences: context?.userPreferences || {}
      };

      // Generate AI response
      const response = await geminiService.generateFlorenceResponse(
        userMessage,
        determinedContext,
        healthContext
      );

      return response;
    } catch (error) {
      console.error('Error processing user request:', error);
      return {
        text: "I'm having trouble processing your request right now. Please try again, or if you need immediate assistance, consider reaching out to a healthcare professional.",
        suggestions: ["Try rephrasing your question", "Check your internet connection", "Contact support if the issue persists"]
      };
    }
  }

  // Get health insights and recommendations
  async getHealthInsights(healthData: any): Promise<string[]> {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const insights = [
        "Your blood pressure readings show improvement with the current medication regimen.",
        "Consider increasing your daily step count to 10,000 steps for better cardiovascular health.",
        "Your dietary adherence has been excellent this week - keep it up!",
        "Don't forget to schedule your next follow-up appointment with Dr. Johnson."
      ];

      return insights;
    } catch (error) {
      return ["Unable to generate health insights at this time."];
    }
  }
}

export const florenceService = FlorenceService.getInstance(); 