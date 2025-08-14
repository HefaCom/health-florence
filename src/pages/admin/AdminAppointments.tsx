
import { useEffect, useState } from "react";
import { 
  Calendar, 
  Clock, 
  User, 
  ChevronRight,
  Check,
  X
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { generateClient } from "aws-amplify/api";
import { getAppointment } from "@/graphql/queries";

// Custom query to get appointments with expert user data
const LIST_APPOINTMENTS_WITH_EXPERT_USER = /* GraphQL */ `
  query ListAppointmentsWithExpertUser($filter: ModelAppointmentFilterInput, $limit: Int, $nextToken: String) {
    listAppointments(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        userId
        expertId
        date
        status
        type
        user {
          id
          email
          firstName
          lastName
        }
        expert {
          id
          specialization
          user {
            id
            email
            firstName
            lastName
          }
        }
      }
      nextToken
    }
  }
`;
import { updateAppointment } from "@/graphql/mutations";
import { toast } from "sonner";

const client = generateClient();

type AppointmentStatus = 'SCHEDULED' | 'COMPLETED' | 'CANCELLED';

interface AdminAppointment {
  id: string;
  patientName: string;
  patientEmail?: string;
  date: string; // formatted date
  time: string; // formatted time
  doctor: string;
  specialty?: string;
  status: AppointmentStatus;
  notes?: string;
}

const AppointmentCard = ({ appointment }: { appointment: AdminAppointment }) => {
  const navigate = useNavigate();
  
  const statusColors = {
    SCHEDULED: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    COMPLETED: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
  };

  return (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-lg">{appointment.patientName}</h3>
            <div className="text-muted-foreground text-sm">{appointment.patientEmail}</div>
            
            <div className="flex items-center mt-2 text-sm">
              <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
              <span>{appointment.date}</span>
              <Clock className="h-4 w-4 ml-3 mr-1 text-muted-foreground" />
              <span>{appointment.time}</span>
            </div>
            
            <div className="flex items-center mt-1 text-sm">
              <User className="h-4 w-4 mr-1 text-muted-foreground" />
              <span>{appointment.doctor} ({appointment.specialty})</span>
            </div>
            
            <div className="mt-3">
              <Badge 
                className={`${statusColors[appointment.status]} bg-opacity-20`}
              >
                {appointment.status}
              </Badge>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex items-center"
              onClick={() => navigate(`/admin/appointments/${appointment.id}`)}
            >
              View <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AdminAppointments = () => {
  const [activeTab, setActiveTab] = useState<string>("all");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [appointments, setAppointments] = useState<AdminAppointment[]>([]);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await client.graphql({ query: LIST_APPOINTMENTS_WITH_EXPERT_USER });
      const items = (res as any).data?.listAppointments?.items || [];
      const mapped: AdminAppointment[] = items.map((a: any) => {
        const patientName = a.user ? `${a.user.firstName} ${a.user.lastName}` : a.userId;
        const patientEmail = a.user?.email;
        const doctorName = a.expert?.user ? `${a.expert.user.firstName?.trim()} ${a.expert.user.lastName?.trim()}` : a.expert?.specialization || 'Expert';
        const specialty = a.expert?.specialization;
        const d = new Date(a.date);
        return {
          id: a.id,
          patientName,
          patientEmail,
          date: d.toLocaleDateString(),
          time: d.toLocaleTimeString(),
          doctor: doctorName,
          specialty,
          status: (a.status as AppointmentStatus) || 'SCHEDULED',
          notes: a.notes || ''
        };
      });
      setAppointments(mapped);
    } catch (e) {
      console.error('Failed to load appointments', e);
      toast.error('Failed to load appointments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const filteredAppointments = activeTab === 'all' 
    ? appointments 
    : appointments.filter(a => a.status === activeTab);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight">Appointments</h1>
        <Button>+ New Appointment</Button>
      </div>
      
      <Tabs defaultValue="all" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="SCHEDULED">Scheduled</TabsTrigger>
          <TabsTrigger value="COMPLETED">Completed</TabsTrigger>
          <TabsTrigger value="CANCELLED">Cancelled</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-center text-muted-foreground">Loading appointments...</p>
              </CardContent>
            </Card>
          ) : filteredAppointments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <p className="text-center text-muted-foreground">No appointments found</p>
              </CardContent>
            </Card>
          ) : (
            <div>
              {filteredAppointments.map(appointment => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAppointments;
