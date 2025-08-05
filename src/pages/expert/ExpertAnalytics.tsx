import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, Activity } from "lucide-react";

export default function ExpertAnalytics() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Health Analytics</h1>
          <p className="text-gray-600 mt-2">
            View patient health trends and performance metrics
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <TrendingUp className="h-4 w-4 mr-2" />
          Export Report
        </Button>
      </div>

      <Card className="p-6">
        <div className="text-center py-12">
          <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Health Analytics Dashboard
          </h3>
          <p className="text-gray-600 mb-6">
            This section will contain patient health trends, treatment outcomes, and performance analytics.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline">
              <Users className="h-4 w-4 mr-2" />
              Patient Trends
            </Button>
            <Button variant="outline">
              <Activity className="h-4 w-4 mr-2" />
              Treatment Outcomes
            </Button>
            <Button variant="outline">
              <TrendingUp className="h-4 w-4 mr-2" />
              Performance Metrics
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
} 