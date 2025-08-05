import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity, Clock, Filter, Download } from "lucide-react";

export default function ExpertActivity() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Activity Log</h1>
          <p className="text-gray-600 mt-2">
            Track your professional activities and patient interactions
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="h-4 w-4 mr-2" />
          Export Log
        </Button>
      </div>

      <Card className="p-6">
        <div className="text-center py-12">
          <Activity className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Activity Tracking
          </h3>
          <p className="text-gray-600 mb-6">
            This section will contain detailed logs of patient interactions, consultations, and professional activities.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline">
              <Clock className="h-4 w-4 mr-2" />
              View Timeline
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter Activities
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
} 