import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Send, Search, Plus } from "lucide-react";

export default function ExpertMessages() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
          <p className="text-gray-600 mt-2">
            Communicate with patients and healthcare team members
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          New Message
        </Button>
      </div>

      <Card className="p-6">
        <div className="text-center py-12">
          <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Messaging Center
          </h3>
          <p className="text-gray-600 mb-6">
            This section will contain secure messaging with patients, team communications, and notification management.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Search Messages
            </Button>
            <Button variant="outline">
              <Send className="h-4 w-4 mr-2" />
              Send Message
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
} 