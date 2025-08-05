import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Users,
  Calendar,
  FileText,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  UserPlus,
  Activity,
  MessageSquare
} from "lucide-react";

export default function ExpertDashboard() {
  // Mock data
  const stats = [
    {
      title: "Total Patients",
      value: "1,247",
      change: "+12%",
      changeType: "positive",
      icon: <Users className="h-6 w-6" />
    },
    {
      title: "Today's Appointments",
      value: "18",
      change: "+3",
      changeType: "positive",
      icon: <Calendar className="h-6 w-6" />
    },
    {
      title: "Pending Records",
      value: "23",
      change: "-5",
      changeType: "negative",
      icon: <FileText className="h-6 w-6" />
    },
    {
      title: "Patient Satisfaction",
      value: "94%",
      change: "+2%",
      changeType: "positive",
      icon: <TrendingUp className="h-6 w-6" />
    }
  ];

  const recentPatients = [
    {
      id: 1,
      name: "John Smith",
      age: 45,
      condition: "Hypertension",
      status: "Active",
      lastVisit: "2 days ago"
    },
    {
      id: 2,
      name: "Sarah Wilson",
      age: 32,
      condition: "Diabetes Type 2",
      status: "Follow-up",
      lastVisit: "1 week ago"
    },
    {
      id: 3,
      name: "Michael Brown",
      age: 58,
      condition: "Heart Disease",
      status: "Critical",
      lastVisit: "3 days ago"
    },
    {
      id: 4,
      name: "Emily Davis",
      age: 29,
      condition: "Asthma",
      status: "Stable",
      lastVisit: "2 weeks ago"
    }
  ];

  const upcomingAppointments = [
    {
      id: 1,
      patient: "John Smith",
      time: "09:00 AM",
      type: "Follow-up",
      status: "Confirmed"
    },
    {
      id: 2,
      patient: "Sarah Wilson",
      time: "10:30 AM",
      type: "Consultation",
      status: "Confirmed"
    },
    {
      id: 3,
      patient: "Michael Brown",
      time: "02:00 PM",
      type: "Emergency",
      status: "Pending"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'confirmed':
      case 'stable':
        return 'bg-green-100 text-green-800';
      case 'critical':
      case 'emergency':
        return 'bg-red-100 text-red-800';
      case 'follow-up':
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-2">
          Welcome back, Dr. Sarah Johnson. Here's your overview for today.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                <p className={`text-sm mt-1 ${
                  stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change} from last month
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                {stat.icon}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Patients */}
        <Card className="lg:col-span-2 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Recent Patients</h2>
            <Button variant="outline" size="sm">
              <UserPlus className="h-4 w-4 mr-2" />
              Add Patient
            </Button>
          </div>
          
          <div className="space-y-4">
            {recentPatients.map((patient) => (
              <div key={patient.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{patient.name}</p>
                    <p className="text-sm text-gray-500">{patient.age} years • {patient.condition}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getStatusColor(patient.status)}>
                    {patient.status}
                  </Badge>
                  <p className="text-xs text-gray-500 mt-1">{patient.lastVisit}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Appointments */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Today's Schedule</h2>
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
          
          <div className="space-y-4">
            {upcomingAppointments.map((appointment) => (
              <div key={appointment.id} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium text-gray-900">{appointment.patient}</p>
                  <Badge className={getStatusColor(appointment.status)}>
                    {appointment.status}
                  </Badge>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-500">
                  <Clock className="h-4 w-4" />
                  <span>{appointment.time}</span>
                  <span>•</span>
                  <span>{appointment.type}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
            <UserPlus className="h-6 w-6" />
            <span className="text-sm">New Patient</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
            <Calendar className="h-6 w-6" />
            <span className="text-sm">Schedule</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
            <FileText className="h-6 w-6" />
            <span className="text-sm">Records</span>
          </Button>
          <Button variant="outline" className="h-20 flex flex-col items-center justify-center space-y-2">
            <MessageSquare className="h-6 w-6" />
            <span className="text-sm">Messages</span>
          </Button>
        </div>
      </Card>
    </div>
  );
} 