import React, { useState, useEffect } from "react";
import { Send, Mic, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FloLogoSmall } from "@/components/FloLogo";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { florenceService, HealthContext } from "@/services/florence.service";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services/user.service";
import { dietaryPlanService } from "@/services/dietary-plan.service";
import { healthGoalService } from "@/services/health-goal.service";

type Message = {
  id: string;
  text: string;
  sender: "user" | "florence";
  timestamp: Date;
};

interface FlorenceAction {
  type: 'update_dietary' | 'update_goals' | 'update_profile' | 'award_tokens';
  data: any;
}

interface ChatInterfaceProps {
  onClose?: () => void;
}

export function ChatInterface({ onClose }: ChatInterfaceProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [healthContext, setHealthContext] = useState<HealthContext | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    const initializeChat = async () => {
      if (!user) {
        setMessages([
          {
            id: "1",
            text: "Hello! I'm Florence, your health assistant. Please log in to get personalized advice.",
            sender: "florence",
            timestamp: new Date(),
          },
        ]);
        setIsLoading(false);
        return;
      }

      // Start with a personalized welcome message
      const welcomeText = `Hello, ${user.firstName || user.email}! I'm Florence, your personal AI health assistant. How can I help you on your wellness journey today?`;
      setMessages([
        {
          id: "1",
          text: welcomeText,
          sender: "florence",
          timestamp: new Date(),
        },
      ]);
      
      // Fetch user data to build context
      try {
        const [profile, dietaryPlans, healthGoals] = await Promise.all([
          userService.getUser(user.id),
          dietaryPlanService.getDietaryPlansByUserId(user.id),
          healthGoalService.getHealthGoalsByUserId(user.id),
        ]);

        const context: HealthContext = {
          healthProfile: profile || {},
          dietaryItems: dietaryPlans || [],
          healthGoals: healthGoals || [],
          userPreferences: profile?.preferences 
            ? (typeof profile.preferences === 'string' 
                ? JSON.parse(profile.preferences) 
                : profile.preferences)
            : {}
        };
        setHealthContext(context);
      } catch (error) {
        console.error("Failed to load user health context:", error);
        toast({
          title: "Error",
          description: "Could not load your health data for AI personalization.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeChat();
  }, [user, toast]);


  const handleSend = async () => {
    if (!inputValue.trim()) return;

    const userMessage = inputValue;
    
    // Add user message
    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");

    // Add loading message
    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      text: "Florence is thinking...",
      sender: "florence",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, loadingMessage]);

    try {
      // Get AI response from Florence service
      const florenceResponse = await florenceService.processUserRequest(userMessage, healthContext || {});

      // Remove loading message and add AI response
      setMessages((prev) => {
        const withoutLoading = prev.filter(msg => msg.id !== loadingMessage.id);
        return [...withoutLoading, {
          id: (Date.now() + 2).toString(),
          text: florenceResponse.text,
          sender: "florence",
          timestamp: new Date(),
        }];
      });

      // Handle any actions from Florence
      if (florenceResponse.action) {
        handleFlorenceAction(florenceResponse.action as FlorenceAction);
      }

    } catch (error) {
      console.error('Error getting Florence response:', error);
      
      // Remove loading message and add error response
      setMessages((prev) => {
        const withoutLoading = prev.filter(msg => msg.id !== loadingMessage.id);
        return [...withoutLoading, {
          id: (Date.now() + 2).toString(),
          text: "I'm having trouble processing your request right now. Please try again.",
          sender: "florence",
          timestamp: new Date(),
        }];
      });
    }
  };

  const handleFlorenceAction = (action: FlorenceAction) => {
    switch (action.type) {
      case 'update_dietary':
        console.log('Florence wants to update dietary plan:', action.data);
        // Trigger dietary plan update
        break;
      case 'update_goals':
        console.log('Florence wants to update health goals:', action.data);
        // Trigger health goals update
        break;
      case 'update_profile':
        console.log('Florence wants to update health profile:', action.data);
        // Trigger health profile update
        break;
      case 'award_tokens':
        console.log('Florence wants to award tokens:', action.data);
        // Trigger token award
        break;
      default:
        console.log('Unknown Florence action:', action);
    }
  };

  const handleVoice = () => {
    toast({
      title: "Voice input",
      description: "Voice input is not available in this demo.",
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center space-x-2">
          <FloLogoSmall className="w-6 h-6" />
          <h3 className="font-medium">Florence AI Assistant</h3>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.sender === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.sender === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {message.sender === "florence" ? (
                  <MarkdownRenderer 
                    content={message.text} 
                    className="text-sm"
                  />
                ) : (
                  <p className="text-sm">{message.text}</p>
                )}
                <p className="text-xs opacity-70 mt-1">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
      
      <div className="p-3 border-t">
        <div className="flex space-x-2">
          <Input
            placeholder="Type your message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
          />
          {/* <Button variant="outline" size="icon" onClick={handleVoice}>
            <Mic className="h-4 w-4" />
          </Button> */}
          <Button onClick={handleSend}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
