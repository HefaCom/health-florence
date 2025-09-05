import { useState, useEffect } from "react";
import { generateClient } from 'aws-amplify/api';
import { useAuth } from "@/contexts/AuthContext";
import { expertService } from "@/services/expert.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, User, Plus, CheckCircle, XCircle, AlertCircle, Phone, Mail, MapPin, Stethoscope, CalendarDays, Timer, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import { listAppointments } from "@/graphql/queries";
import { updateAppointment } from "@/graphql/mutations";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

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
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
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
      
      // Create a simplified query that includes user data
      const listAppointmentsWithUser = /* GraphQL */ `
        query ListAppointmentsWithUser($filter: ModelAppointmentFilterInput, $limit: Int) {
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
              createdAt
              updatedAt
              user {
                id
                firstName
                lastName
                email
                phoneNumber
              }
            }
          }
        }
      `;

      const response = await client.graphql({
        query: listAppointmentsWithUser,
        variables: { filter: { expertId: { eq: resolvedExpertId } }, limit: 500 }
      });

      const items = (response as any).data?.listAppointments?.items || [];
      console.log('[ExpertAppointments] Found appointments:', items.length);
      
      // If user data is missing, fetch it separately
      const appointmentsWithUserData = await Promise.all(
        items.map(async (appointment: any) => {
          if (!appointment.user && appointment.userId) {
            try {
              const userResponse = await client.graphql({
                query: /* GraphQL */ `
                  query GetUser($id: ID!) {
                    getUser(id: $id) {
                      id
                      firstName
                      lastName
                      email
                      phoneNumber
                    }
                  }
                `,
                variables: { id: appointment.userId }
              });
              appointment.user = (userResponse as any).data?.getUser;
            } catch (error) {
              console.warn('Failed to fetch user data for appointment:', appointment.id, error);
            }
          }
          return appointment;
        })
      );
      
      setAppointments(appointmentsWithUserData as AppointmentType[]);
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
      // Use a simplified mutation to avoid authorization errors
      const updateAppointmentSimple = /* GraphQL */ `
        mutation UpdateAppointmentSimple($input: UpdateAppointmentInput!) {
          updateAppointment(input: $input) {
            id
            status
            updatedAt
          }
        }
      `;

      const result = await client.graphql({
        query: updateAppointmentSimple,
        variables: {
          input: {
            id: appointmentId,
            status: newStatus
          }
        }
      });

      console.log('Appointment updated successfully:', result);
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

  const toggleCardExpansion = (appointmentId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(appointmentId)) {
        newSet.delete(appointmentId);
      } else {
        newSet.add(appointmentId);
      }
      return newSet;
    });
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 border border-blue-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <CalendarDays className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Appointments</h1>
              <p className="text-gray-600 mt-1">
                Manage your patient appointments and consultations
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{filteredAppointments.length}</div>
            <div className="text-sm text-gray-500">
              {filter === "all" ? "Total Appointments" : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Appointments`}
            </div>
          </div>
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        <Button 
          variant={filter === "all" ? "default" : "outline"} 
          size="sm"
          onClick={() => setFilter("all")}
          className="rounded-full text-xs sm:text-sm"
        >
          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">All</span>
          <span className="sm:hidden">All</span>
          <span className="ml-1">({appointments.length})</span>
        </Button>
        <Button 
          variant={filter === "scheduled" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("scheduled")}
          className="rounded-full text-xs sm:text-sm"
        >
          <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Scheduled</span>
          <span className="sm:hidden">Sched</span>
          <span className="ml-1">({appointments.filter(app => (app.status || '').toLowerCase() === 'scheduled').length})</span>
        </Button>
        <Button 
          variant={filter === "completed" ? "default" : "outline"} 
          size="sm"
          onClick={() => setFilter("completed")}
          className="rounded-full text-xs sm:text-sm"
        >
          <CheckCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Completed</span>
          <span className="sm:hidden">Done</span>
          <span className="ml-1">({appointments.filter(app => (app.status || '').toLowerCase() === 'completed').length})</span>
        </Button>
        <Button 
          variant={filter === "cancelled" ? "default" : "outline"} 
          size="sm"
          onClick={() => setFilter("cancelled")}
          className="rounded-full text-xs sm:text-sm"
        >
          <XCircle className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
          <span className="hidden sm:inline">Cancelled</span>
          <span className="sm:hidden">Cancel</span>
          <span className="ml-1">({appointments.filter(app => (app.status || '').toLowerCase() === 'cancelled').length})</span>
        </Button>
      </div>

      {isLoading ? (
        <Card className="border-0 shadow-lg bg-white">
          <div className="text-center py-16">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Loading appointments...</h3>
            <p className="text-gray-600">Please wait while we fetch your schedule</p>
          </div>
        </Card>
      ) : filteredAppointments.length === 0 ? (
        <Card className="border-0 shadow-lg bg-white">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Calendar className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              {filter === "all" ? "No appointments scheduled" : `No ${filter} appointments`}
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {filter === "all" 
                ? "You don't have any appointments scheduled yet. New appointments will appear here." 
                : `You don't have any ${filter} appointments at the moment.`
              }
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-gray-500">
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span>Scheduled</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>Completed</span>
              </div>
              <div className="flex items-center space-x-1">
                <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                <span>Cancelled</span>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredAppointments.map((appointment) => {
            const isExpanded = expandedCards.has(appointment.id);
            return (
              <Card key={appointment.id} className="group hover:shadow-lg transition-all duration-300 border border-gray-200 bg-white">
                <CardContent className="p-0">
                  {/* Compact Header - Always Visible */}
                  <div className="p-3 sm:p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-0">
                      {/* Left Side - Patient Info */}
                      <div className="flex items-center space-x-3 sm:space-x-4 flex-1 min-w-0">
                        <div className="relative flex-shrink-0">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xs sm:text-sm shadow-md">
                            {appointment.user ? 
                              `${appointment.user.firstName?.[0] || ''}${appointment.user.lastName?.[0] || ''}`.toUpperCase() :
                              'P'
                            }
                          </div>
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-white rounded-full flex items-center justify-center shadow-sm">
                            {getStatusIcon(appointment.status)}
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
                            {appointment.user ? `${appointment.user.firstName} ${appointment.user.lastName}` : 'Unknown Patient'}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600 mt-1">
                            <div className="flex items-center space-x-1">
                              <Stethoscope className="h-3 w-3" />
                              <span className="truncate">{appointment.type}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Timer className="h-3 w-3" />
                              <span>{appointment.duration} min</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Center - Date & Time */}
                      <div className="flex items-center justify-between sm:justify-center sm:space-x-3">
                        <div className="text-center">
                          <div className="text-xs sm:text-sm font-medium text-gray-900">
                            {new Date(appointment.date).toLocaleDateString('en-US', { 
                              weekday: 'short', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(appointment.date).toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit',
                              hour12: true 
                            })}
                          </div>
                        </div>

                        {/* Right Side - Status & Actions */}
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          <Badge className={`${getStatusColor(appointment.status)} px-2 py-1 sm:px-3 sm:py-1 text-xs font-medium rounded-full`}>
                            <span className="hidden sm:inline">{appointment.status}</span>
                            <span className="sm:hidden">{appointment.status.slice(0, 3)}</span>
                          </Badge>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => toggleCardExpansion(appointment.id)}
                            className="text-gray-400 hover:text-gray-600 p-1"
                          >
                            <MoreVertical className={`h-4 w-4 transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Expandable Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50">
                      <div className="p-4 space-y-4">
                        {/* Patient Notes */}
                        {appointment.notes && (
                          <div className="p-3 bg-white rounded-lg border-l-4 border-blue-500">
                            <h4 className="font-medium text-gray-800 mb-2 flex items-center text-sm">
                              <User className="h-4 w-4 mr-2" />
                              Patient Notes
                            </h4>
                            <p className="text-gray-700 text-sm leading-relaxed">{appointment.notes}</p>
                          </div>
                        )}
                        
                        {/* Contact Information */}
                        {appointment.user && (
                          <div className="p-3 bg-white rounded-lg">
                            <h4 className="font-medium text-gray-800 mb-3 flex items-center text-sm">
                              <Phone className="h-4 w-4 mr-2" />
                              Contact Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                              <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                  <Mail className="h-4 w-4 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-xs text-gray-500">Email</p>
                                  <p className="font-medium text-gray-900 text-sm">{appointment.user.email}</p>
                                </div>
                              </div>
                              {appointment.user.phoneNumber && (
                                <div className="flex items-center space-x-2">
                                  <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Phone className="h-4 w-4 text-green-600" />
                                  </div>
                                  <div>
                                    <p className="text-xs text-gray-500">Phone</p>
                                    <p className="font-medium text-gray-900 text-sm">{appointment.user.phoneNumber}</p>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Action Buttons */}
                        {appointment.status === 'SCHEDULED' && (
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between pt-3 border-t border-gray-200 gap-3 sm:gap-0">
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                              <Button
                                size="sm"
                                onClick={() => handleUpdateStatus(appointment.id, 'COMPLETED')}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-full font-medium text-sm flex-1 sm:flex-none"
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Complete
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUpdateStatus(appointment.id, 'CANCELLED')}
                                className="border-red-200 text-red-600 hover:bg-red-50 px-4 py-2 rounded-full font-medium text-sm flex-1 sm:flex-none"
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setReschedule({ open: true, id: appointment.id, date: '', time: '' })}
                                className="border-blue-200 text-blue-600 hover:bg-blue-50 px-4 py-2 rounded-full font-medium text-sm flex-1 sm:flex-none"
                              >
                                <Calendar className="h-4 w-4 mr-1" />
                                Reschedule
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
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