import React, { useState } from "react";
import { Send, Mic, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FloLogoSmall } from "@/components/FloLogo";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { florenceService } from "@/services/florence.service";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

type Message = {
  id: string;
  text: string;
  sender: "user" | "florence";
  timestamp: Date;
};

interface ChatInterfaceProps {
  onClose?: () => void;
}

export function ChatInterface({ onClose }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm Florence, your health assistant. How can I help you today?",
      sender: "florence",
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const { toast } = useToast();

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
      const florenceResponse = await florenceService.processUserRequest(userMessage, {
        // Add context here if needed
        dietaryItems: [],
        healthGoals: [],
        healthProfile: {},
        userPreferences: {}
      });

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
        handleFlorenceAction(florenceResponse.action);
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

  const handleFlorenceAction = (action: any) => {
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
          <Button variant="outline" size="icon" onClick={handleVoice}>
            <Mic className="h-4 w-4" />
          </Button>
          <Button onClick={handleSend}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
