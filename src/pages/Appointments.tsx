
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";

// Sample data
const appointments = [
  {
    id: 1,
    title: "Annual Physical Checkup",
    doctor: "Dr. Sarah Johnson",
    specialty: "General Practitioner",
    location: "Memorial Hospital",
    date: "May 15, 2023",
    time: "10:30 AM",
    status: "Scheduled"
  },
  {
    id: 2,
    title: "Dental Cleaning",
    doctor: "Dr. Michael Chen",
    specialty: "Dentist",
    location: "Bright Smile Dental Clinic",
    date: "May 22, 2023",
    time: "2:00 PM",
    status: "Scheduled"
  },
  {
    id: 3,
    title: "Follow-up Consultation",
    doctor: "Dr. Emily Rodriguez",
    specialty: "Cardiologist",
    location: "Heart Care Center",
    date: "June 5, 2023",
    time: "11:15 AM",
    status: "Pending"
  }
];

const Appointments = () => {
  const [filter, setFilter] = useState("all");
  
  const filteredAppointments = filter === "all" 
    ? appointments 
    : appointments.filter(app => app.status.toLowerCase() === filter);

  return (
    <div className="space-y-6 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ">
        <div>
          <h1 className="text-3xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">Manage and schedule your medical appointments</p>
        </div>
        <Button className="rounded-full">
          Schedule New Appointment
        </Button>
      </div>
      
      <div className="flex overflow-x-auto py-2 gap-2">
        <Button 
          variant={filter === "all" ? "default" : "outline"} 
          className="rounded-full" 
          onClick={() => setFilter("all")}
        >
          All
        </Button>
        <Button 
          variant={filter === "scheduled" ? "default" : "outline"} 
          className="rounded-full" 
          onClick={() => setFilter("scheduled")}
        >
          Scheduled
        </Button>
        <Button 
          variant={filter === "pending" ? "default" : "outline"} 
          className="rounded-full" 
          onClick={() => setFilter("pending")}
        >
          Pending
        </Button>
        <Button 
          variant={filter === "completed" ? "default" : "outline"} 
          className="rounded-full" 
          onClick={() => setFilter("completed")}
        >
          Completed
        </Button>
        <Button 
          variant={filter === "cancelled" ? "default" : "outline"} 
          className="rounded-full" 
          onClick={() => setFilter("cancelled")}
        >
          Cancelled
        </Button>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {filteredAppointments.map((appointment) => (
          <Card key={appointment.id} className="overflow-hidden transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{appointment.title}</CardTitle>
                  <CardDescription>Appointment #{appointment.id}</CardDescription>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  appointment.status === 'Scheduled' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                  appointment.status === 'Completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                  appointment.status === 'Cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' :
                  'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}>
                  {appointment.status}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center text-sm">
                  <User className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{appointment.doctor}</span>
                  <span className="text-muted-foreground ml-1">({appointment.specialty})</span>
                </div>
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{appointment.location}</span>
                </div>
                <div className="flex items-center text-sm">
                  <CalendarIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{appointment.date}</span>
                </div>
                <div className="flex items-center text-sm">
                  <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{appointment.time}</span>
                </div>
              </div>
              
              <div className="flex gap-2 mt-4">
                <Button variant="outline" className="flex-1 rounded-full">Reschedule</Button>
                <Button variant="outline" className="flex-1 rounded-full text-destructive hover:text-destructive-foreground hover:bg-destructive">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredAppointments.length === 0 && (
          <Card className="p-6 text-center">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <CalendarIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No appointments found</h3>
            <p className="text-muted-foreground mt-2">
              You don't have any {filter !== 'all' ? filter : ''} appointments.
            </p>
            <Button className="mt-4 rounded-full">Schedule an Appointment</Button>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Appointments;
