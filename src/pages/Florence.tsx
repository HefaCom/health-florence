import { ChatInterface } from "@/components/ChatInterface";
import { Bot } from "lucide-react";

const FlorencePage = () => {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 md:p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Bot className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Chat with Florence</h1>
            <p className="text-muted-foreground">Your personal AI health assistant is here to help.</p>
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-hidden">
        <ChatInterface />
      </div>
    </div>
  );
};

export default FlorencePage;

