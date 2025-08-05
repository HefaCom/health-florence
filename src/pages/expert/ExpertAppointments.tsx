import { useState, useEffect } from "react";
import { generateClient } from 'aws-amplify/api';
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Plus, CheckCircle, XCircle, AlertCircle, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { listAppointments } from "@/graphql/queries";
import { updateAppointment } from "@/graphql/mutations";

interface AppointmentType {
  id: string;
  userId: string;
  expertId: string;
  date: string;
  status: string;
  type: string;
  duration: number;
  notes: string;
  symptoms: string;
  diagnosis: string;
  prescription: string;
  followUpDate: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
  };
  expert: {
    id: string;
    specialization: string;
  };
}

export default function ExpertAppointments() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const client = generateClient();

  const fetchAppointments = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      const response = await client.graphql({
        query: listAppointments,
        variables: {
          filter: {
            expertId: { eq: user.id }
          }
        }
      });

      if (response.data?.listAppointments?.items) {
        setAppointments(response.data.listAppointments.items as unknown as AppointmentType[]);
      }
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error("Failed to load appointments");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [user]);

  const handleUpdateStatus = async (appointmentId: string, newStatus: string) => {
    try {
      await client.graphql({
        query: updateAppointment,
        variables: {
          input: {
            id: appointmentId,
            status: newStatus
          }
        }
      });

      toast.success(`Appointment ${newStatus.toLowerCase()}`);
      fetchAppointments(); // Refresh the list
    } catch (error) {
      console.error('Error updating appointment:', error);
      toast.error("Failed to update appointment status");
    }
  };

  const filteredAppointments = filter === "all" 
    ? appointments 
    : appointments.filter(app => app.status.toLowerCase() === filter);

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'cancelled':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'scheduled':
        return <AlertCircle className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
          <p className="text-gray-600 mt-2">
            Manage your patient appointments and consultations
          </p>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex items-center space-x-2">
        <Button 
          variant={filter === "all" ? "default" : "outline"} 
          size="sm"
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button 
          variant={filter === "scheduled" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("scheduled")}
        >
          Scheduled
        </Button>
        <Button 
          variant={filter === "completed" ? "default" : "outline"} 
          size="sm"
          onClick={() => setFilter("completed")}
        >
          Completed
        </Button>
        <Button 
          variant={filter === "cancelled" ? "default" : "outline"} 
          size="sm"
          onClick={() => setFilter("cancelled")}
        >
          Cancelled
        </Button>
      </div>

      {isLoading ? (
        <Card className="p-6">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-4">Loading appointments...</p>
          </div>
        </Card>
      ) : filteredAppointments.length === 0 ? (
        <Card className="p-6">
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No appointments found
            </h3>
            <p className="text-gray-600">
              {filter === "all" 
                ? "You don't have any appointments yet." 
                : `No ${filter} appointments found.`
              }
            </p>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredAppointments.map((appointment) => (
            <Card key={appointment.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0">
                      {getStatusIcon(appointment.status)}
                    </div>
                    <div>
                      <CardTitle className="text-lg">
                        {appointment.user ? `${appointment.user.firstName} ${appointment.user.lastName}` : 'Unknown Patient'}
                      </CardTitle>
                      <CardDescription className="text-base">
                        {appointment.type} • {appointment.duration} minutes
                      </CardDescription>
                      <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {new Date(appointment.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Clock className="h-4 w-4" />
                          {new Date(appointment.date).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                {appointment.notes && (
                  <div className="mb-4">
                    <h4 className="font-medium text-sm text-gray-700 mb-1">Patient Notes:</h4>
                    <p className="text-sm text-gray-600">{appointment.notes}</p>
                  </div>
                )}
                
                {appointment.user && (
                  <div className="mb-4">
                    <h4 className="font-medium text-sm text-gray-700 mb-2">Patient Contact:</h4>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Mail className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">{appointment.user.email}</span>
                      </div>
                      {appointment.user.phoneNumber && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span className="text-gray-600">{appointment.user.phoneNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {appointment.status === 'SCHEDULED' && (
                  <div className="flex items-center gap-2 pt-4 border-t">
                    <Button
                      size="sm"
                      onClick={() => handleUpdateStatus(appointment.id, 'COMPLETED')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Mark Complete
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateStatus(appointment.id, 'CANCELLED')}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Cancel
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
} 