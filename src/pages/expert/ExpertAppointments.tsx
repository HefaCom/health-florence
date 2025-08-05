import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Plus } from "lucide-react";

export default function ExpertAppointments() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointments</h1>
          <p className="text-gray-600 mt-2">
            Manage your patient appointments and schedule
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          New Appointment
        </Button>
      </div>

      <Card className="p-6">
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Appointments Management
          </h3>
          <p className="text-gray-600 mb-6">
            This section will contain appointment scheduling, calendar view, and patient consultation management.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline">
              <Clock className="h-4 w-4 mr-2" />
              View Calendar
            </Button>
            <Button variant="outline">
              <User className="h-4 w-4 mr-2" />
              Patient Schedule
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
} 