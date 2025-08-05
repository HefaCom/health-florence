import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Search, Filter, Plus } from "lucide-react";

export default function ExpertRecords() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Medical Records</h1>
          <p className="text-gray-600 mt-2">
            Access and manage patient medical records and documentation
          </p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          New Record
        </Button>
      </div>

      <Card className="p-6">
        <div className="text-center py-12">
          <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Medical Records Management
          </h3>
          <p className="text-gray-600 mb-6">
            This section will contain patient medical records, test results, treatment plans, and documentation.
          </p>
          <div className="flex justify-center space-x-4">
            <Button variant="outline">
              <Search className="h-4 w-4 mr-2" />
              Search Records
            </Button>
            <Button variant="outline">
              <Filter className="h-4 w-4 mr-2" />
              Filter Records
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
} 