import { useState, useEffect } from "react";
import { generateClient } from 'aws-amplify/api';
import { useAuth } from "@/contexts/AuthContext";
import { expertService } from "@/services/expert.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Plus, CheckCircle, XCircle, AlertCircle, Phone, Mail } from "lucide-react";
import { toast } from "sonner";
import { listAppointments } from "@/graphql/queries";
import { updateAppointment } from "@/graphql/mutations";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
  const [reschedule, setReschedule] = useState<{open: boolean; id: string; date: string; time: string}>({ open: false, id: '', date: '', time: '' });
  const [expertId, setExpertId] = useState<string | null>(null);
  const client = generateClient();

  const fetchAppointments = async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      // Resolve Expert.id for this user using expert service
      let resolvedExpertId = expertId;
      if (!resolvedExpertId) {
        try {
          const expert = await expertService.getExpertByUserId(user.id);
          resolvedExpertId = expert?.id || null;
          setExpertId(resolvedExpertId);
          console.log('[ExpertAppointments] resolvedExpertId via service:', resolvedExpertId);
        } catch (error) {
          console.error('[ExpertAppointments] Failed to resolve expert ID:', error);
          resolvedExpertId = null;
        }
      }

      if (!resolvedExpertId) {
        console.log('[ExpertAppointments] No expert ID found, setting empty appointments');
        setAppointments([]);
        return;
      }

      console.log('[ExpertAppointments] Fetching appointments for expertId:', resolvedExpertId);
      const response = await client.graphql({
        query: listAppointments,
        variables: { filter: { expertId: { eq: resolvedExpertId } }, limit: 500 }
      });

      const items = (response as any).data?.listAppointments?.items || [];
      console.log('[ExpertAppointments] Found appointments:', items.length);
      setAppointments(items as AppointmentType[]);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      toast.error("Failed to load appointments");
      setAppointments([]);
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

  const availableTimes = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  const filteredAppointments = filter === "all" 
    ? appointments 
    : appointments.filter(app => (app.status || '').toLowerCase() === filter);

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
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setReschedule({ open: true, id: appointment.id, date: '', time: '' })}
                    >
                      Reschedule
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Reschedule Dialog */}
      <Dialog open={reschedule.open} onOpenChange={(open) => setReschedule(prev => ({ ...prev, open }))}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <Input type="date" value={reschedule.date} onChange={(e) => setReschedule(prev => ({ ...prev, date: e.target.value }))} min={new Date().toISOString().split('T')[0]} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Time</label>
              <Select value={reschedule.time} onValueChange={(v) => setReschedule(prev => ({ ...prev, time: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time" />
                </SelectTrigger>
                <SelectContent>
                  {availableTimes.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                onClick={async () => {
                  if (!reschedule.date || !reschedule.time) {
                    toast.error('Select a date and time');
                    return;
                  }
                  const d = new Date(reschedule.date);
                  const [h, m] = reschedule.time.split(':');
                  d.setHours(parseInt(h), parseInt(m), 0, 0);
                  try {
                    await client.graphql({
                      query: /* GraphQL */ `mutation UpdateAppointment($input: UpdateAppointmentInput!, $condition: ModelAppointmentConditionInput) { updateAppointment(input: $input, condition: $condition) { id date status updatedAt } }`,
                      variables: { input: { id: reschedule.id, date: d.toISOString() } }
                    });
                    toast.success('Appointment rescheduled');
                    setReschedule({ open: false, id: '', date: '', time: '' });
                    fetchAppointments();
                  } catch (e) {
                    console.error('Failed to reschedule', e);
                    toast.error('Failed to reschedule');
                  }
                }}
                disabled={!reschedule.date || !reschedule.time}
              >
                Save
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setReschedule({ open: false, id: '', date: '', time: '' })}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 