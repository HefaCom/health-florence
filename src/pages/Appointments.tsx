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
import { listAppointments } from '../graphql/queries';
import { Appointment } from '../API';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

import { NotificationService, NotificationType } from '@/services/NotificationService';

const client = generateClient();

// Use minimal selection sets to avoid nested nulls causing GraphQL non-null errors
const CREATE_APPOINTMENT_MIN = /* GraphQL */ `mutation CreateAppointment($input: CreateAppointmentInput!, $condition: ModelAppointmentConditionInput) {
  createAppointment(input: $input, condition: $condition) {
    id
    userId
    expertId
    date
    status
    type
    duration
    notes
    createdAt
    updatedAt
  }
}`;

const UPDATE_APPOINTMENT_MIN = /* GraphQL */ `mutation UpdateAppointment($input: UpdateAppointmentInput!, $condition: ModelAppointmentConditionInput) {
  updateAppointment(input: $input, condition: $condition) {
    id
    userId
    expertId
    date
    status
    type
    duration
    notes
    createdAt
    updatedAt
  }
}`;

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
  const [rescheduleDialog, setRescheduleDialog] = useState({ open: false, appointmentId: '', date: '', time: '' });
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
      // Create a query that includes expert data
      const listAppointmentsWithExpert = /* GraphQL */ `
        query ListAppointmentsWithExpert($filter: ModelAppointmentFilterInput, $limit: Int) {
          listAppointments(filter: $filter, limit: $limit) {
            items {
              id
              userId
              expertId
              date
              status
              type
              duration
              notes
              symptoms
              diagnosis
              prescription
              followUpDate
              expert {
                id
                specialization
                practiceName
                practiceAddress
                user {
                  id
                  firstName
                  lastName
                  email
                }
              }
            }
          }
        }
      `;

      const response = await client.graphql({
        query: listAppointmentsWithExpert,
        variables: {
          filter: { userId: { eq: user?.id } },
          limit: 500
        }
      }) as any;

      if (response.data?.listAppointments?.items) {
        const appointmentsWithExpertData = await Promise.all(
          response.data.listAppointments.items.map(async (item: any) => {
            // If expert data is missing, fetch it separately
            if (!item.expert && item.expertId) {
              try {
                const expertResponse = await client.graphql({
                  query: /* GraphQL */ `
                    query GetExpert($id: ID!) {
                      getExpert(id: $id) {
                        id
                        specialization
                        practiceName
                        practiceAddress
                        user {
                          id
                          firstName
                          lastName
                          email
                        }
                      }
                    }
                  `,
                  variables: { id: item.expertId }
                }) as any;
                item.expert = expertResponse.data?.getExpert;
              } catch (error) {
                console.warn('Failed to fetch expert data for appointment:', item.id, error);
              }
            }
            return item;
          })
        );

        setAppointments(appointmentsWithExpertData.map((item: any) => ({
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
    if (user) {
      fetchAppointments();
    }
  }, [user]);

  const filteredAppointments = filter === "all"
    ? appointments
    : appointments.filter(app => {
      const status = (app.status || '').toLowerCase();
      const f = (filter || '').toLowerCase();
      if (f === 'upcoming') {
        return status === 'upcoming' || status === 'scheduled';
      }
      return status === f;
    });

  const handleScheduleAppointment = async (appointmentData: any) => {
    try {
      const response = await client.graphql({
        query: CREATE_APPOINTMENT_MIN,
        variables: { input: appointmentData }
      });

      if ((response as any).data?.createAppointment) {
        toast.success("Appointment scheduled successfully");

        // Log the appointment creation
        await logAction(
          'APPOINTMENT_CREATE',
          (response as any).data.createAppointment.id,
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
        query: UPDATE_APPOINTMENT_MIN,
        variables: {
          input: {
            id: appointmentId,
            status: 'CANCELLED'
          }
        }
      });

      if ((response as any).data?.updateAppointment) {
        toast.success("Appointment cancelled successfully");

        try {
          await NotificationService.createNotification(
            user.id,
            NotificationType.APPOINTMENT,
            'Appointment Cancelled',
            `Your appointment has been cancelled.`,
            { appointmentId },
            '/appointments'
          );

          // Notify Admins
          await NotificationService.notifyAdmins(
            NotificationType.APPOINTMENT,
            'Appointment Cancelled',
            `User ${user.firstName} ${user.lastName} cancelled their appointment`,
            { appointmentId, userId: user.id },
            '/admin/appointments' // or specific view
          );

        } catch (e) { console.warn('Cancel notification failed:', e); }

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
        query: UPDATE_APPOINTMENT_MIN,
        variables: {
          input: {
            id: appointmentId,
            date: newDate
          }
        }
      });

      if ((response as any).data?.updateAppointment) {
        toast.success("Appointment rescheduled successfully");

        try {
          await NotificationService.createNotification(
            user.id,
            NotificationType.APPOINTMENT,
            'Appointment Rescheduled',
            `Your appointment has been rescheduled to ${new Date(newDate).toLocaleString()}`,
            { appointmentId, newDate },
            '/appointments'
          );

          // Notify Admins
          await NotificationService.notifyAdmins(
            NotificationType.APPOINTMENT,
            'Appointment Rescheduled',
            `User ${user.firstName} ${user.lastName} rescheduled their appointment to ${new Date(newDate).toLocaleString()}`,
            { appointmentId, newDate, userId: user.id },
            '/admin/appointments'
          );

        } catch (e) { console.warn('Reschedule notification failed:', e); }

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
        query: CREATE_APPOINTMENT_MIN,
        variables: { input: appointmentData }
      });

      if ((response as any).data?.createAppointment) {
        toast.success("Appointment booked successfully");

        // Notification
        try {
          await NotificationService.createNotification(
            user.id,
            NotificationType.APPOINTMENT,
            'Appointment Booked',
            `Your appointment is confirmed for ${new Date(appointmentData.date).toLocaleDateString()} at ${bookingData.time}`,
            { appointmentId: (response as any).data.createAppointment.id },
            '/appointments'
          );

          // Notify Admins
          await NotificationService.notifyAdmins(
            NotificationType.APPOINTMENT,
            'New Appointment Booked',
            `New appointment booked by ${user.firstName} ${user.lastName} for ${new Date(appointmentData.date).toLocaleDateString()} at ${bookingData.time}`,
            {
              appointmentId: (response as any).data.createAppointment.id,
              userId: user.id,
              expertId: bookingData.expertId
            },
            '/admin/appointments'
          );

        } catch (e) { console.warn('Notification failed:', e); }

        // Log the appointment creation
        await logAction(
          'APPOINTMENT_CREATE',
          (response as any).data.createAppointment.id,
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
    { value: 'Consultation', label: 'General Consultation' },
    { value: 'Follow-up', label: 'Follow-up Visit' },
    { value: 'Emergency', label: 'Emergency Consultation' },
    { value: 'Specialist', label: 'Specialist Consultation' }
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
                {(['UPCOMING', 'SCHEDULED', 'Scheduled', 'upcoming'].includes((appointment.status || '').toUpperCase())) && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setRescheduleDialog({ open: true, appointmentId: appointment.id, date: '', time: '' })}
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
                <div className={`flex items-center px-2 py-1 rounded-full text-xs ${((appointment.status || '').toUpperCase()) === 'COMPLETED'
                  ? 'bg-green-100 text-green-700'
                  : ((appointment.status || '').toUpperCase()) === 'CANCELLED'
                    ? 'bg-red-100 text-red-700'
                    : 'bg-blue-100 text-blue-700'
                  }`}>
                  {((appointment.status || '').toUpperCase()) === 'COMPLETED' && <CheckCircle className="h-3 w-3 mr-1" />}
                  {((appointment.status || '').toUpperCase()) === 'CANCELLED' && <XCircle className="h-3 w-3 mr-1" />}
                  {(['UPCOMING', 'SCHEDULED'].includes(((appointment.status || '').toUpperCase()))) && <AlertCircle className="h-3 w-3 mr-1" />}
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

      {/* Reschedule Dialog */}
      <Dialog open={rescheduleDialog.open} onOpenChange={(open) => setRescheduleDialog(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Pick a new date and time for your appointment
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label htmlFor="reschedule-date">Date</Label>
              <Input
                id="reschedule-date"
                type="date"
                value={rescheduleDialog.date}
                onChange={(e) => setRescheduleDialog(prev => ({ ...prev, date: e.target.value }))}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <Label htmlFor="reschedule-time">Time</Label>
              <Select value={rescheduleDialog.time} onValueChange={(value) => setRescheduleDialog(prev => ({ ...prev, time: value }))}>
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

            <div className="flex gap-2">
              <Button
                onClick={async () => {
                  if (!rescheduleDialog.date || !rescheduleDialog.time) {
                    toast.error('Select a date and time');
                    return;
                  }
                  const d = new Date(rescheduleDialog.date);
                  const [h, m] = rescheduleDialog.time.split(':');
                  d.setHours(parseInt(h), parseInt(m), 0, 0);
                  await handleRescheduleAppointment(rescheduleDialog.appointmentId, d.toISOString());
                  setRescheduleDialog({ open: false, appointmentId: '', date: '', time: '' });
                }}
                disabled={!rescheduleDialog.date || !rescheduleDialog.time}
                className="flex-1"
              >
                Save
              </Button>
              <Button
                variant="outline"
                onClick={() => setRescheduleDialog({ open: false, appointmentId: '', date: '', time: '' })}
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
