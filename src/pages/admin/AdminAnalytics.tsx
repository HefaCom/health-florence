
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import { generateClient } from "aws-amplify/api";
import { listAppointments } from "@/graphql/queries";
import { toast } from "sonner";

const client = generateClient();

const patientTypeData = [
  { name: "New Patients", value: 35 },
  { name: "Returning Patients", value: 65 },
];

const departmentData = [
  { name: "Cardiology", count: 128 },
  { name: "Neurology", count: 86 },
  { name: "Pediatrics", count: 107 },
  { name: "Dermatology", count: 95 },
  { name: "Orthopedics", count: 112 },
  { name: "Gynecology", count: 76 },
  { name: "Ophthalmology", count: 68 },
];

const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"] as const;

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FCBBA1"];

const AdminAnalytics = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [apps, setApps] = useState<any[]>([]);

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await client.graphql({ query: listAppointments });
        setApps((res as any).data?.listAppointments?.items || []);
      } catch (e) {
        console.error('Failed to load analytics data', e);
        toast.error('Failed to load analytics data');
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

  const appointmentData = useMemo(() => {
    const months = Array.from({ length: 12 }, (_, i) => ({ month: new Date(0, i).toLocaleString('en', { month: 'short' }), appointments: 0 }));
    apps.forEach(a => {
      const d = new Date(a.date);
      const m = d.getMonth();
      months[m].appointments += 1;
    });
    return months;
  }, [apps]);

  const weeklyPatients = useMemo(() => {
    const counts: Record<string, number> = { Sun:0, Mon:0, Tue:0, Wed:0, Thu:0, Fri:0, Sat:0 };
    apps.forEach(a => {
      const d = new Date(a.date);
      counts[dayNames[d.getDay()]] += 1;
    });
    return dayNames.map(day => ({ day, patients: counts[day] }));
  }, [apps]);

  const departmentData = useMemo(() => {
    const map: Record<string, number> = {};
    apps.forEach(a => {
      const dept = a.expert?.specialization || 'General';
      map[dept] = (map[dept] || 0) + 1;
    });
    return Object.entries(map).map(([name, count]) => ({ name, count }));
  }, [apps]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">View and analyze healthcare metrics and trends</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{isLoading ? '—' : new Set(apps.map(a => a.userId)).size}</div>
            <p className="text-xs text-muted-foreground mt-1">Unique users with appointments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{isLoading ? '—' : apps.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Total appointments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Doctors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{isLoading ? '—' : new Set(apps.map(a => a.expertId)).size}</div>
            <p className="text-xs text-muted-foreground mt-1">Experts with appointments</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">—</div>
            <p className="text-xs text-muted-foreground mt-1">Coming soon</p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="appointments">
        <TabsList className="mb-4">
          <TabsTrigger value="appointments">Appointments</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
        </TabsList>
        
        <TabsContent value="appointments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Appointments</CardTitle>
              <CardDescription>Appointment trends over the past year</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={appointmentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="appointments" fill="#3b82f6" name="Appointments" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Weekly Appointment Distribution</CardTitle>
                <CardDescription>Appointments by day of week</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyPatients} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="patients" stroke="#3b82f6" name="Patients" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Patient Types</CardTitle>
                <CardDescription>New vs Returning Patients</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[{ name: 'New Patients', value: 0 }, { name: 'Returning Patients', value: apps.length }]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {[{ name: 'New Patients', value: 0 }, { name: 'Returning Patients', value: apps.length }].map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="patients" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Patient Growth</CardTitle>
              <CardDescription>New patient registrations over time</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={appointmentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="appointments" stroke="#3b82f6" name="New Patients" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="departments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Department Performance</CardTitle>
              <CardDescription>Patient appointments by department</CardDescription>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={departmentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" fill="#3b82f6" name="Appointments" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;
