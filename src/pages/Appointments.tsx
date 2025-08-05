import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
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
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { generateClient } from 'aws-amplify/api';
import { createAppointment, updateAppointment } from '../graphql/mutations';
import { listAppointments } from '../graphql/queries';
import { Appointment } from '../API';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

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
  const location = useLocation();
  const { user } = useAuth();
  const [filter, setFilter] = useState("all");
  const [appointments, setAppointments] = useState<AppointmentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [bookingData, setBookingData] = useState({
    expertId: '',
    expert: null,
    date: '',
    time: '',
    type: 'consultation',
    notes: ''
  });
  const { logAction } = useAudit();

  // Check if we have new appointment data from navigation
  useEffect(() => {
    if (location.state?.newAppointment) {
      setBookingData(prev => ({
        ...prev,
        expertId: location.state.newAppointment.expertId || '',
        expert: location.state.newAppointment.expert || null
      }));
      setShowBookingDialog(true);
    }
  }, [location.state]);

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
          doctor: item.expert?.user ? `${item.expert.user.firstName} ${item.expert.user.lastName}` : item.expert?.specialization || 'Unknown Expert',
          location: item.expert?.practiceName || 'Virtual',
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

  const handleBookNewAppointment = async () => {
    if (!user || !bookingData.expertId || !bookingData.date || !bookingData.time) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const appointmentDateTime = new Date(bookingData.date);
      const [hours, minutes] = bookingData.time.split(':');
      appointmentDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);

      const appointmentData = {
        id: `appointment_${user.id}_${bookingData.expertId}_${Date.now()}`,
        userId: user.id,
        expertId: bookingData.expertId,
        date: appointmentDateTime.toISOString(),
        status: 'SCHEDULED',
        type: bookingData.type,
        duration: 30,
        notes: bookingData.notes
      };

      const response = await client.graphql({
        query: createAppointment,
        variables: { input: appointmentData }
      });

      if (response.data?.createAppointment) {
        toast.success("Appointment booked successfully");
        
        // Log the appointment creation
        await logAction(
          'APPOINTMENT_CREATE',
          response.data.createAppointment.id,
          {
            expertId: bookingData.expertId,
            date: appointmentData.date,
            timestamp: new Date().toISOString()
          }
        );

        // Reset booking data and close dialog
        setBookingData({
          expertId: '',
          expert: null,
          date: '',
          time: '',
          type: 'consultation',
          notes: ''
        });
        setShowBookingDialog(false);
        
        // Refresh appointments list
        fetchAppointments();
      }
    } catch (error) {
      console.error('Error booking appointment:', error);
      toast.error("Failed to book appointment");
    }
  };

  const availableTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  const appointmentTypes = [
    { value: 'consultation', label: 'General Consultation' },
    { value: 'followup', label: 'Follow-up Visit' },
    { value: 'emergency', label: 'Emergency Consultation' },
    { value: 'specialist', label: 'Specialist Consultation' }
  ];

  return (
    <div className="space-y-6 px-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">My Appointments</h1>
        {/* <Button onClick={() => setShowBookingDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Schedule New
        </Button> */}
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

      {/* Booking Dialog */}
      <Dialog open={showBookingDialog} onOpenChange={setShowBookingDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Book New Appointment</DialogTitle>
            <DialogDescription>
              {bookingData.expert ? `Schedule an appointment with ${bookingData.expert.user ? `${bookingData.expert.user.firstName} ${bookingData.expert.user.lastName}` : 'this expert'}` : 'Schedule a new appointment'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="appointment-type">Appointment Type</Label>
              <Select value={bookingData.type} onValueChange={(value) => setBookingData(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {appointmentTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="appointment-date">Date</Label>
              <Input
                id="appointment-date"
                type="date"
                value={bookingData.date}
                onChange={(e) => setBookingData(prev => ({ ...prev, date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div>
              <Label htmlFor="appointment-time">Time</Label>
              <Select value={bookingData.time} onValueChange={(value) => setBookingData(prev => ({ ...prev, time: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {availableTimes.map((time) => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="appointment-notes">Notes (Optional)</Label>
              <Textarea
                id="appointment-notes"
                placeholder="Any specific concerns or questions..."
                value={bookingData.notes}
                onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                rows={3}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleBookNewAppointment}
                disabled={!bookingData.expertId || !bookingData.date || !bookingData.time}
                className="flex-1"
              >
                Book Appointment
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowBookingDialog(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Appointments;
