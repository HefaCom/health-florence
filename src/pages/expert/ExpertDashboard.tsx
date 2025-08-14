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
import { listAppointments, listExperts } from '@/graphql/queries';
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
  TrendingUp
} from 'lucide-react';

export default function ExpertDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hasProfile, setHasProfile] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [apps, setApps] = useState<any[]>([]);
  const [expertId, setExpertId] = useState<string | null>(null);
  const client = generateClient();

  useEffect(() => {
    checkProfileStatus();
  }, [user]);

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
        const expertsRes = await client.graphql({
          query: listExperts,
          variables: { filter: { userId: { eq: user.id } }, limit: 1 }
        });
        const expert = (expertsRes as any).data?.listExperts?.items?.[0];
        if (expert?.id) {
          setExpertId(expert.id);
          const res = await client.graphql({
            query: listAppointments,
            variables: { filter: { expertId: { eq: expert.id } }, limit: 500 }
          });
          setApps((res as any).data?.listAppointments?.items || []);
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

  const todayStats = useMemo(() => {
    const today = new Date();
    const dayKey = today.toDateString();
    const todays = apps.filter(a => new Date(a.date).toDateString() === dayKey);
    const upcoming = todays.filter(a => (a.status || '').toUpperCase() === 'SCHEDULED').length;
    return { todayCount: todays.length, upcoming };
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
          <div className="text-right">
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
            <div className="text-2xl font-bold">{new Set(apps.map(a => a.userId)).size}</div>
            <p className="text-xs text-muted-foreground">Unique patients</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Appointments Today</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.todayCount}</div>
            <p className="text-xs text-muted-foreground">{todayStats.upcoming} scheduled</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">Coming soon</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">—</div>
            <p className="text-xs text-muted-foreground">No reviews yet</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <Button onClick={() => navigate('/expert/appointments')}>
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
                  onClick={() => navigate('/expert/patients')}
                  className="w-full"
                >
                  View Patients
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate('/expert/patients/external')}
                  className="w-full"
                >
                  Add External Patient
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
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-600">No recent activity</p>
            <p className="text-sm text-gray-500 mt-1">
              Your activity will appear here as you interact with patients
            </p>
          </div>
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
              <Button variant="outline" size="sm">
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
              <Button variant="outline" size="sm">
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
              <Button variant="outline" size="sm">
                Upload
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 