import React, { useState } from "react";
import { Send, Mic, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FloLogoSmall } from "@/components/FloLogo";
import { Card } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

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

  const handleSend = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const newMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    setInputValue("");

    // Simulate Florence response
    setTimeout(() => {
      const florenceResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "I'm processing your request. As a demo, I can simulate responses to common health questions.",
        sender: "florence",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, florenceResponse]);
    }, 1000);
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
                <p className="text-sm">{message.text}</p>
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
