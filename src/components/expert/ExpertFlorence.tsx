import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Send, 
  Bot, 
  User,
  Stethoscope,
  Activity,
  TrendingUp,
  Users
} from "lucide-react";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { florenceService } from "@/services/florence.service";
import { toast } from "sonner";

interface Message {
  id: string;
  text: string;
  sender: "user" | "florence";
  timestamp: Date;
}

export const ExpertFlorence = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello Dr. Johnson! I'm Florence, your AI healthcare assistant. I can help you with patient consultations, medical research, treatment recommendations, and practice management. How can I assist you today?",
      sender: "florence",
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: "user",
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

          try {
        // Create expert-specific context for Gemini
        const expertContext = {
          role: "healthcare_professional",
          specialty: "cardiology",
          currentPatient: null,
          practiceType: "clinic",
          requestType: "expert_assistance",
          userType: "doctor",
          expertise: "cardiology",
          experience: "senior",
          context: "clinical_decision_support"
        };

        const response = await florenceService.processUserRequest(inputValue, expertContext, 'expert');
      
      const florenceMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: "florence",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, florenceMessage]);
    } catch (error) {
      console.error('Error getting Florence response:', error);
      toast.error("Failed to get response from Florence");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const quickActions = [
    {
      title: "Patient Assessment",
      description: "Get AI assistance with patient diagnosis",
      icon: <Stethoscope className="h-5 w-5" />,
      prompt: "Help me assess a patient with chest pain symptoms"
    },
    {
      title: "Treatment Plan",
      description: "Generate treatment recommendations",
      icon: <Activity className="h-5 w-5" />,
      prompt: "Suggest a treatment plan for hypertension management"
    },
    {
      title: "Medical Research",
      description: "Get latest medical insights",
      icon: <TrendingUp className="h-5 w-5" />,
      prompt: "What are the latest guidelines for heart failure treatment?"
    },
    {
      title: "Practice Management",
      description: "Optimize your practice workflow",
      icon: <Users className="h-5 w-5" />,
      prompt: "How can I improve patient scheduling efficiency?"
    }
  ];

  const handleQuickAction = (prompt: string) => {
    setInputValue(prompt);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4 sm:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
              Florence AI Assistant
            </h1>
            <p className="text-gray-600 mt-2 text-sm sm:text-base">
              Your AI-powered healthcare assistant for professional support
            </p>
          </div>
          <Badge variant="secondary" className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white border-0 px-4 py-2">
            <Bot className="h-4 w-4 mr-2" />
            Expert Mode
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chat Interface */}
          <Card className="lg:col-span-2 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="flex flex-col h-[calc(100vh-200px)] min-h-[600px]">
              {/* Chat Header */}
              <div className="flex items-center space-x-3 p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center shadow-lg">
                  <Bot className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="font-semibold text-lg text-gray-900">Florence AI</h2>
                  <p className="text-sm text-gray-600">Healthcare Professional Assistant</p>
                </div>
                <div className="ml-auto">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600 font-medium">Online</span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-[98%] rounded-2xl p-4 shadow-sm transition-all duration-200 hover:shadow-md ${
                          message.sender === "user"
                            ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white"
                            : "bg-white border border-gray-200 text-gray-900"
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          {message.sender === "florence" && (
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center flex-shrink-0">
                              <Bot className="h-4 w-4 text-white" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            {message.sender === "florence" ? (
                              <MarkdownRenderer 
                                content={message.text} 
                                className="text-sm leading-relaxed"
                              />
                            ) : (
                              <p className="text-sm leading-relaxed">{message.text}</p>
                            )}
                          </div>
                          {message.sender === "user" && (
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                              <User className="h-4 w-4 text-white" />
                            </div>
                          )}
                        </div>
                        <p className={`text-xs mt-3 ${
                          message.sender === "user" ? "text-blue-100" : "text-gray-500"
                        }`}>
                          {message.timestamp.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="bg-white border border-gray-200 rounded-2xl p-4 max-w-[85%] shadow-sm">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                            <Bot className="h-4 w-4 text-white" />
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex space-x-1">
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                            <p className="text-sm text-gray-600">Florence is thinking...</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>

              {/* Input - Always Visible */}
              <div className="p-6 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-blue-50 rounded-b-lg">
                <div className="flex space-x-3">
                  <div className="flex-1 relative">
                    <Input
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Ask Florence for medical assistance, patient assessment, or practice management help..."
                      className="w-full pl-4 pr-12 py-3 rounded-xl border-gray-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all duration-200 bg-white shadow-sm"
                      disabled={isLoading}
                    />
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="flex items-center space-x-1 text-xs text-gray-400">
                        <span>⌘</span>
                        <span>Enter</span>
                      </div>
                    </div>
                  </div>
                  <Button 
                    onClick={handleSendMessage} 
                    disabled={isLoading || !inputValue.trim()}
                    className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </Card>

          {/* Quick Actions - Sidebar */}
          <Card className="lg:col-span-1 bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <div className="p-6">
              <h3 className="font-semibold text-lg mb-6 text-gray-900">Quick Actions</h3>
              <div className="space-y-4">
                {quickActions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="w-full justify-start h-auto p-4 rounded-xl border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
                    onClick={() => handleQuickAction(action.prompt)}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="p-2 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg group-hover:from-blue-200 group-hover:to-indigo-200 transition-all duration-200">
                        {action.icon}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-sm text-gray-900">{action.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{action.description}</p>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>

              {/* Expert Features */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h4 className="font-medium text-sm mb-4 text-gray-900">Expert Features</h4>
                <div className="space-y-3 text-sm text-gray-600">
                  <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Patient Diagnosis Support</span>
                  </div>
                  <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Treatment Recommendations</span>
                  </div>
                  <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Medical Research Updates</span>
                  </div>
                  <div className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors duration-200">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Practice Management</span>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}; 