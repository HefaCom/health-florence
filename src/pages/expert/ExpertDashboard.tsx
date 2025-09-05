import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { expertService } from '@/services/expert.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { generateClient } from 'aws-amplify/api';
import { listAppointments } from '@/graphql/queries';
import { 
  User, 
  Calendar, 
  Users, 
  FileText, 
  Settings, 
  Plus,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
  Star,
  TrendingUp,
  Bot,
  RefreshCw
} from 'lucide-react';

export default function ExpertDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apps, setApps] = useState<any[]>([]);
  const [expertId, setExpertId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const client = generateClient();

  useEffect(() => {
    checkProfileStatus();
  }, [user]);

  // Add auto-refresh when component becomes visible or window gains focus
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && hasProfile) {
        checkProfileStatus();
      }
    };

    const handleFocus = () => {
      if (hasProfile) {
        checkProfileStatus();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [hasProfile]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await checkProfileStatus();
    setIsRefreshing(false);
    toast.success('Dashboard refreshed');
  };

  const checkProfileStatus = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      console.log('ExpertDashboard: Checking profile for user:', user.id, user.email);
      
      // First, clean up any duplicate profiles
      await expertService.cleanupDuplicateProfiles(user.id);
      
      const hasExpertProfile = await expertService.hasExpertProfile(user.id);
      console.log('ExpertDashboard: Has profile:', hasExpertProfile);
      setHasProfile(hasExpertProfile);

      if (!hasExpertProfile) {
        console.log('ExpertDashboard: No profile found, redirecting to setup');
        toast.info('Please complete your expert profile to get started');
        navigate('/expert/profile-setup');
        return;
      }

      // Resolve Expert.id for this user, then load appointments for expert stats
      try {
        const expert = await expertService.getExpertByUserId(user.id);
        if (expert?.id) {
          setExpertId(expert.id);
          console.log('[ExpertDashboard] resolvedExpertId via service:', expert.id);
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
                  user {
                    id
                    firstName
                    lastName
                    email
                  }
                }
              }
            }
          `;

          const res = await client.graphql({
            query: listAppointmentsWithUser,
            variables: { filter: { expertId: { eq: expert.id } }, limit: 500 }
          });
          const appointments = (res as any).data?.listAppointments?.items || [];
          console.log('[ExpertDashboard] Found appointments:', appointments.length);
          setApps(appointments);
        } else {
          setExpertId(null);
          setApps([]);
        }
      } catch (e) {
        console.warn('Failed to load expert or appointments', e);
        setApps([]);
      }
    } catch (error) {
      console.error('Error checking profile status:', error);
      toast.error('Failed to check profile status');
    } finally {
      setIsLoading(false);
    }
  };

  const dashboardStats = useMemo(() => {
    const today = new Date();
    const dayKey = today.toDateString();
    const todays = apps.filter(a => new Date(a.date).toDateString() === dayKey);
    const upcoming = todays.filter(a => (a.status || '').toUpperCase() === 'SCHEDULED').length;
    const totalPatients = new Set(apps.map(a => a.userId)).size;
    const totalAppointments = apps.length;
    const completedAppointments = apps.filter(a => (a.status || '').toUpperCase() === 'COMPLETED').length;
    
    return { 
      todayCount: todays.length, 
      upcoming,
      totalPatients,
      totalAppointments,
      completedAppointments
    };
  }, [apps]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!hasProfile) {
    return null; // Will redirect to profile setup
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold mb-2">
              Welcome back, {user?.firstName}!
            </h1>
            <p className="text-blue-100">
              Manage your patients, appointments, and practice from your expert dashboard
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="bg-white/10 border-white/30 text-white hover:bg-white/20"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              <CheckCircle className="h-4 w-4 mr-1" />
              Profile Complete
            </Badge>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">Unique patients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.todayCount}</div>
            <p className="text-xs text-muted-foreground">{dashboardStats.upcoming} scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dashboardStats.totalAppointments}</div>
            <p className="text-xs text-muted-foreground">{dashboardStats.completedAppointments} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dashboardStats.totalAppointments > 0 
                ? Math.round((dashboardStats.completedAppointments / dashboardStats.totalAppointments) * 100)
                : 0}%
            </div>
            <p className="text-xs text-muted-foreground">Appointments completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Appointments
            </CardTitle>
            <CardDescription>
              Manage your appointments and schedule
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-4">No appointments scheduled</p>
              <Button onClick={() => navigate('/expert/dashboard/appointments')}>
                View Appointments
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Patients
            </CardTitle>
            <CardDescription>
              Manage your patient relationships
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-4">No patients yet</p>
              <div className="space-y-2">
                <Button 
                  onClick={() => navigate('/expert/dashboard/patients')}
                  className="w-full"
                >
                  View Patients
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/expert/dashboard/florence')}
                  className="w-full"
                >
                  Florence AI Assistant
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Management
            </CardTitle>
            <CardDescription>
              Update your professional profile and information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <User className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-4">Keep your profile up to date</p>
              <Button 
                onClick={() => navigate('/expert/dashboard/profile')}
                className="w-full"
              >
                Manage Profile
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              Florence AI Assistant
            </CardTitle>
            <CardDescription>
              Get AI-powered insights and assistance
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center py-4">
              <Bot className="h-12 w-12 text-blue-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-4">AI-powered healthcare insights</p>
              <Button 
                onClick={() => navigate('/expert/dashboard/florence')}
                className="w-full"
              >
                Access Florence AI
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>
            Your latest activities and updates
          </CardDescription>
        </CardHeader>
        <CardContent>
          {apps.length > 0 ? (
            <div className="space-y-4">
              {apps.slice(0, 5).map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Calendar className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">
                        {appointment.user?.firstName && appointment.user?.lastName
                          ? `${appointment.user.firstName} ${appointment.user.lastName}`
                          : 'Patient'
                        }
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(appointment.date).toLocaleDateString()} - {appointment.type || 'Consultation'}
                      </p>
                    </div>
                  </div>
                  <Badge 
                    variant={appointment.status === 'COMPLETED' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {appointment.status || 'SCHEDULED'}
                  </Badge>
                </div>
              ))}
              {apps.length > 5 && (
                <div className="text-center pt-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate('/expert/dashboard/appointments')}
                  >
                    View All Appointments
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600">No recent activity</p>
              <p className="text-sm text-gray-500 mt-1">
                Your activity will appear here as you interact with patients
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Setup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Quick Setup
          </CardTitle>
          <CardDescription>
            Complete these steps to optimize your practice
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <h4 className="font-medium">Complete Profile</h4>
                  <p className="text-sm text-gray-600">Your profile is complete</p>
                </div>
              </div>
              <Badge variant="secondary" className="bg-green-100 text-green-800">
                Complete
              </Badge>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <h4 className="font-medium">Set Availability</h4>
                  <p className="text-sm text-gray-600">Configure your working hours</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/expert/dashboard/profile')}
              >
                Configure
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <h4 className="font-medium">Add Services</h4>
                  <p className="text-sm text-gray-600">Define your consultation services</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/expert/dashboard/profile')}
              >
                Add Services
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <h4 className="font-medium">Upload Documents</h4>
                  <p className="text-sm text-gray-600">Add licenses and certifications</p>
                </div>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate('/expert/dashboard/profile')}
              >
                Upload
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 