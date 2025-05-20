import { useState, useEffect } from "react";
import { 
  Calendar,
  Clock, 
  MapPin, 
  User,
  Filter,
  Plus,
  X,
  CheckCircle,
  XCircle,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudit } from '@/hooks/useAudit';
import { toast } from 'sonner';
import { generateClient } from 'aws-amplify/api';
import { createAppointment, updateAppointment } from '../graphql/mutations';
import { listAppointments } from '../graphql/queries';
import { Appointment } from '../API';

const client = generateClient();

interface AppointmentType {
  id: string;
  title: string;
  doctor: string;
  location: string;
  date: string;
  time: string;
  status: string;
}

const Appointments = () => {
  const [filter, setFilter] = useState("all");
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { logAction } = useAudit();

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const response = await client.graphql({
        query: listAppointments
      });

      if (response.data?.listAppointments?.items) {
        setAppointments(response.data.listAppointments.items.map((item: any) => ({
          id: item.id,
          title: item.type || 'Consultation',
          doctor: item.doctor?.name || 'Unknown Doctor',
          location: item.location || 'Virtual',
          date: new Date(item.date).toLocaleDateString(),
          time: new Date(item.date).toLocaleTimeString(),
          status: item.status
        })));
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
  }, []);
  
  const filteredAppointments = filter === "all" 
    ? appointments 
    : appointments.filter(app => app.status.toLowerCase() === filter);

  const handleScheduleAppointment = async (appointmentData: any) => {
    try {
      const response = await client.graphql({
        query: createAppointment,
        variables: { input: appointmentData }
      });

      if (response.data?.createAppointment) {
        toast.success("Appointment scheduled successfully");
        
        // Log the appointment creation
        await logAction(
          'APPOINTMENT_CREATE',
          response.data.createAppointment.id,
          {
            doctorId: appointmentData.doctorId,
            date: appointmentData.date,
            timestamp: new Date().toISOString()
          }
        );

        // Refresh appointments list
        fetchAppointments();
      }
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      toast.error("Failed to schedule appointment");
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const response = await client.graphql({
        query: updateAppointment,
        variables: {
          input: {
            id: appointmentId,
            status: 'CANCELLED'
          }
        }
      });

      if (response.data?.updateAppointment) {
        toast.success("Appointment cancelled successfully");
        
        // Log the appointment cancellation
        await logAction(
          'APPOINTMENT_CANCEL',
          appointmentId,
          {
            timestamp: new Date().toISOString()
          }
        );

        // Refresh appointments list
        fetchAppointments();
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error);
      toast.error("Failed to cancel appointment");
    }
  };

  const handleRescheduleAppointment = async (appointmentId: string, newDate: string) => {
    try {
      const response = await client.graphql({
        query: updateAppointment,
        variables: {
          input: {
            id: appointmentId,
            date: newDate
          }
        }
      });

      if (response.data?.updateAppointment) {
        toast.success("Appointment rescheduled successfully");
        
        // Log the appointment reschedule
        await logAction(
          'APPOINTMENT_RESCHEDULE',
          appointmentId,
          {
            newDate,
            timestamp: new Date().toISOString()
          }
        );

        // Refresh appointments list
        fetchAppointments();
      }
    } catch (error) {
      console.error('Error rescheduling appointment:', error);
      toast.error("Failed to reschedule appointment");
    }
  };

  return (
    <div className="space-y-6 px-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Appointments</h1>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Schedule New
        </Button>
      </div>
      
      <div className="flex items-center space-x-2">
        <Button 
          variant={filter === "all" ? "default" : "outline"} 
          size="sm"
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button 
          variant={filter === "upcoming" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("upcoming")}
        >
          Upcoming
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
      
      <div className="grid gap-4">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">
            Loading appointments...
          </div>
        ) : filteredAppointments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No appointments found
          </div>
        ) : (
          filteredAppointments.map((appointment) => (
            <div
              key={appointment.id}
              className="border rounded-lg p-4 flex items-center justify-between"
            >
              <div className="space-y-1">
                <h3 className="font-medium">{appointment.title}</h3>
                <div className="text-sm text-muted-foreground space-y-1">
                  <div className="flex items-center">
                    <User className="h-4 w-4 mr-2" />
                    {appointment.doctor}
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-2" />
                    {appointment.location}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    {appointment.date}
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    {appointment.time}
                </div>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {appointment.status === 'upcoming' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRescheduleAppointment(appointment.id, new Date().toISOString())}
                    >
                      Reschedule
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleCancelAppointment(appointment.id)}
                    >
                      Cancel
                    </Button>
                  </>
                )}
                <div className={`flex items-center px-2 py-1 rounded-full text-xs ${
                  appointment.status === 'completed'
                    ? 'bg-green-100 text-green-700'
                    : appointment.status === 'cancelled'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {appointment.status === 'completed' && <CheckCircle className="h-3 w-3 mr-1" />}
                  {appointment.status === 'cancelled' && <XCircle className="h-3 w-3 mr-1" />}
                  {appointment.status === 'upcoming' && <AlertCircle className="h-3 w-3 mr-1" />}
                  {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Appointments;
