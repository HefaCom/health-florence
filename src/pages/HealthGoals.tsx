import { HealthGoals } from "@/components/dashboard/HealthGoals";
import { ChatInterface } from "@/components/ChatInterface";
import { Card } from "@/components/ui/card";
import { FloLogo } from "@/components/FloLogo";

const HealthGoalsPage = () => {
  return (
    <div className="flex-1">
      <div className="container mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">
            Health Goals<span className="text-primary">.</span>
          </h1>
          <p className="text-muted-foreground">
            Set, track, and achieve your health objectives with AI-powered recommendations
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <HealthGoals />
          </div>
          
          <div className="lg:col-span-1">
            <Card className="p-4 rounded-florence text-center card-glow">
              <div className="mb-3 flex justify-center">
                <FloLogo className="w-24 h-24" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Need Help?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Chat with Florence about your health goals
              </p>
              <div className="h-[500px]">
                <ChatInterface />
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HealthGoalsPage; 