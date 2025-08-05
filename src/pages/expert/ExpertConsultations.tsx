import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Stethoscope, Video, Phone, MessageSquare } from "lucide-react";

export default function ExpertConsultations() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Consultations</h1>
          <p className="text-gray-600 mt-2">
            Manage patient consultations and telemedicine sessions
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Stethoscope className="h-4 w-4 mr-2" />
          New Consultation
        </Button>
      </div>

      <Card className="p-6">
        <div className="text-center py-12">
          <Stethoscope className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Patient Consultations
          </h3>
          <p className="text-gray-600 mb-6">
            This section will contain video consultations, patient assessments, and treatment recommendations.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline">
              <Video className="h-4 w-4 mr-2" />
              Video Consultations
            </Button>
            <Button variant="outline">
              <Phone className="h-4 w-4 mr-2" />
              Phone Consultations
            </Button>
            <Button variant="outline">
              <MessageSquare className="h-4 w-4 mr-2" />
              Chat Consultations
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
} 