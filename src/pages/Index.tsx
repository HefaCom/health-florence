import { useState, useEffect } from "react";
import { ChatInterface } from "@/components/ChatInterface";
import { HealthMetric } from "@/components/dashboard/HealthMetric";
import { MedicationReminder } from "@/components/dashboard/MedicationReminder";
import HAICWallet from "@/components/dashboard/HAICWallet";
import { AppointmentCard } from "@/components/dashboard/AppointmentCard";

import { Activity, Footprints, Heart, Timer, Apple, Target, UserCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FloLogo } from "@/components/FloLogo";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services/user.service";
import { healthMetricsService } from "@/services/health-metrics.service";
import { generateClient } from "aws-amplify/api";
import { toast } from "sonner";

const Index = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);

  // Real data for medications from user profile
  const [medications, setMedications] = useState([]);

  // Real appointments from database
  const [appointments, setAppointments] = useState([]);

  // Health metrics state
  const [healthMetrics, setHealthMetrics] = useState({
    heartRate: { value: 72, target: 80 },
    steps: { value: 8500, target: 10000 },
    activity: { value: 45, target: 60 },
    sleep: { value: 7, target: 8 }
  });
  const [currentMetricsId, setCurrentMetricsId] = useState<string | null>(null);

  // Load today's health metrics
  const loadTodaysHealthMetrics = async () => {
    if (user?.id) {
      try {
        const todaysMetrics = await healthMetricsService.getTodaysHealthMetrics(user.id);
        if (todaysMetrics) {
          setHealthMetrics({
            heartRate: { value: todaysMetrics.heartRate, target: todaysMetrics.heartRateTarget },
            steps: { value: todaysMetrics.steps, target: todaysMetrics.stepsTarget },
            activity: { value: todaysMetrics.activityMinutes, target: todaysMetrics.activityTarget },
            sleep: { value: todaysMetrics.sleepHours, target: todaysMetrics.sleepTarget }
          });
          setCurrentMetricsId(todaysMetrics.id);
        }
      } catch (error) {
        console.error('Error loading today\'s health metrics:', error);
        // Continue with default values if loading fails
        console.log('Using default health metrics values');
      }
    }
  };

  // Fetch user data and appointments
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (user?.email) {
        try {
          setIsLoading(true);

          // Fetch user data
          const userProfile = await userService.getUserByEmail(user.email);
          if (userProfile) {
            setUserData(userProfile);

            // Load today's health metrics
            await loadTodaysHealthMetrics();

            // Parse medications from user data
            if (userProfile.currentMedications) {
              const medList = userProfile.currentMedications.split(',').map((med, index) => ({
                id: `med_${index}`,
                name: med.trim(),
                time: "As prescribed",
                taken: false,
                dosage: "As prescribed",
              }));
              setMedications(medList.length > 0 ? medList : medications);
            }
          }

          // Fetch appointments
          const client = generateClient();
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
              filter: { userId: { eq: user.id } },
              limit: 5
            }
          }) as any;

          if (response.data?.listAppointments?.items) {
            const upcomingAppointments = response.data.listAppointments.items
              .filter((apt: any) => new Date(apt.date) > new Date())
              .slice(0, 3)
              .map((apt: any) => ({
                id: apt.id,
                title: apt.type || 'Consultation',
                doctor: apt.expert?.user ? `${apt.expert.user.firstName} ${apt.expert.user.lastName}` : apt.expert?.specialization || 'Unknown Expert',
                location: apt.expert?.practiceName || 'Virtual',
                date: new Date(apt.date).toLocaleDateString(),
                time: new Date(apt.date).toLocaleTimeString(),
              }));

            if (upcomingAppointments.length > 0) {
              setAppointments(upcomingAppointments);
            }
          }
        } catch (error) {
          console.error('Error fetching dashboard data:', error);
          toast.error("Failed to load dashboard data");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchDashboardData();
  }, [user?.email, user?.id]);

  const handleMarkTaken = (id: string) => {
    setMedications((prev) =>
      prev.map((med) => (med.id === id ? { ...med, taken: true } : med))
    );
  };

  // Save health metrics to database
  const saveHealthMetrics = async (updatedMetrics: typeof healthMetrics) => {
    if (!user?.id) return;

    try {
      const today = new Date().toISOString().split('T')[0];

      if (currentMetricsId) {
        // Update existing metrics
        await healthMetricsService.updateHealthMetrics({
          id: currentMetricsId,
          heartRate: updatedMetrics.heartRate.value,
          heartRateTarget: updatedMetrics.heartRate.target,
          steps: updatedMetrics.steps.value,
          stepsTarget: updatedMetrics.steps.target,
          activityMinutes: updatedMetrics.activity.value,
          activityTarget: updatedMetrics.activity.target,
          sleepHours: updatedMetrics.sleep.value,
          sleepTarget: updatedMetrics.sleep.target,
          date: today
        });
        console.log('Health metrics updated successfully');
      } else {
        // Create new metrics
        const newMetrics = await healthMetricsService.createHealthMetrics({
          userId: user.id,
          heartRate: updatedMetrics.heartRate.value,
          heartRateTarget: updatedMetrics.heartRate.target,
          steps: updatedMetrics.steps.value,
          stepsTarget: updatedMetrics.steps.target,
          activityMinutes: updatedMetrics.activity.value,
          activityTarget: updatedMetrics.activity.target,
          sleepHours: updatedMetrics.sleep.value,
          sleepTarget: updatedMetrics.sleep.target,
          date: today
        });
        setCurrentMetricsId(newMetrics.id);
        console.log('Health metrics created successfully');
      }
    } catch (error) {
      console.error('Error saving health metrics:', error);
      toast.error('Failed to save health metrics to database');
    }
  };

  // Health metrics update handlers
  const handleHeartRateChange = async (newValue: number) => {
    const updatedMetrics = {
      ...healthMetrics,
      heartRate: { ...healthMetrics.heartRate, value: newValue }
    };
    setHealthMetrics(updatedMetrics);
    await saveHealthMetrics(updatedMetrics);
    toast.success(`Heart rate updated to ${newValue} bpm`);
  };

  const handleHeartRateTargetChange = async (newTarget: number) => {
    const updatedMetrics = {
      ...healthMetrics,
      heartRate: { ...healthMetrics.heartRate, target: newTarget }
    };
    setHealthMetrics(updatedMetrics);
    await saveHealthMetrics(updatedMetrics);
    toast.success(`Heart rate target updated to ${newTarget} bpm`);
  };

  const handleStepsChange = async (newValue: number) => {
    const updatedMetrics = {
      ...healthMetrics,
      steps: { ...healthMetrics.steps, value: newValue }
    };
    setHealthMetrics(updatedMetrics);
    await saveHealthMetrics(updatedMetrics);
    toast.success(`Steps updated to ${newValue.toLocaleString()}`);
  };

  const handleStepsTargetChange = async (newTarget: number) => {
    const updatedMetrics = {
      ...healthMetrics,
      steps: { ...healthMetrics.steps, target: newTarget }
    };
    setHealthMetrics(updatedMetrics);
    await saveHealthMetrics(updatedMetrics);
    toast.success(`Steps target updated to ${newTarget.toLocaleString()}`);
  };

  const handleActivityChange = async (newValue: number) => {
    const updatedMetrics = {
      ...healthMetrics,
      activity: { ...healthMetrics.activity, value: newValue }
    };
    setHealthMetrics(updatedMetrics);
    await saveHealthMetrics(updatedMetrics);
    toast.success(`Activity updated to ${newValue} minutes`);
  };

  const handleActivityTargetChange = async (newTarget: number) => {
    const updatedMetrics = {
      ...healthMetrics,
      activity: { ...healthMetrics.activity, target: newTarget }
    };
    setHealthMetrics(updatedMetrics);
    await saveHealthMetrics(updatedMetrics);
    toast.success(`Activity target updated to ${newTarget} minutes`);
  };

  const handleSleepChange = async (newValue: number) => {
    const updatedMetrics = {
      ...healthMetrics,
      sleep: { ...healthMetrics.sleep, value: newValue }
    };
    setHealthMetrics(updatedMetrics);
    await saveHealthMetrics(updatedMetrics);
    toast.success(`Sleep updated to ${newValue} hours`);
  };

  const handleSleepTargetChange = async (newTarget: number) => {
    const updatedMetrics = {
      ...healthMetrics,
      sleep: { ...healthMetrics.sleep, target: newTarget }
    };
    setHealthMetrics(updatedMetrics);
    await saveHealthMetrics(updatedMetrics);
    toast.success(`Sleep target updated to ${newTarget} hours`);
  };

  if (isLoading) {
    return (
      <div className="flex-1">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading your dashboard...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">
                Welcome{userData?.firstName ? ` ${userData.firstName}` : ''} to Nurse Help Me<span className="text-primary">.</span>
              </h1>
              <p className="text-muted-foreground">
                Your personal health assistant and medical connector
              </p>
            </div>

            <div className="mb-6 md:hidden">
              <Card className="p-4 rounded-florence text-center card-glow">
                <div className="mb-3 flex justify-center">
                  <FloLogo className="w-24 h-24" />
                </div>
                <h3 className="font-semibold text-lg mb-1">Need Help?</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Chat with Florence, your AI health assistant
                </p>
                <div className=" h-[400px]">
                  <ChatInterface />
                </div>
              </Card>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <HealthMetric
                title="Heart Rate"
                value={healthMetrics.heartRate.value}
                target={healthMetrics.heartRate.target}
                unit="bpm"
                icon={<Heart className="h-5 w-5" />}
                color="text-red-500"
                onValueChange={handleHeartRateChange}
                onTargetChange={handleHeartRateTargetChange}
                isEditable={true}
              />
              <HealthMetric
                title="Steps"
                value={healthMetrics.steps.value}
                target={healthMetrics.steps.target}
                unit="steps"
                icon={<Footprints className="h-5 w-5" />}
                color="text-blue-500"
                onValueChange={handleStepsChange}
                onTargetChange={handleStepsTargetChange}
                isEditable={true}
              />
              <HealthMetric
                title="Activity"
                value={healthMetrics.activity.value}
                target={healthMetrics.activity.target}
                unit="min"
                icon={<Activity className="h-5 w-5" />}
                color="text-green-500"
                onValueChange={handleActivityChange}
                onTargetChange={handleActivityTargetChange}
                isEditable={true}
              />
              <HealthMetric
                title="Sleep"
                value={healthMetrics.sleep.value}
                target={healthMetrics.sleep.target}
                unit="hours"
                icon={<Timer className="h-5 w-5" />}
                color="text-purple-500"
                onValueChange={handleSleepChange}
                onTargetChange={handleSleepTargetChange}
                isEditable={true}
              />
            </div>

            <div className="grid grid-cols-1 gap-4">
              <MedicationReminder
                medications={medications}
                onMarkTaken={handleMarkTaken}
              />
              <AppointmentCard appointments={appointments} />

              {/* Quick Access to New Features */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <Card className="p-4 rounded-florence card-glow cursor-pointer" onClick={() => window.location.href = '/dietary-plan'}>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Apple className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Dietary Plan</h3>
                      <p className="text-sm text-muted-foreground">AI-powered nutrition recommendations</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 rounded-florence card-glow cursor-pointer" onClick={() => window.location.href = '/health-goals'}>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Target className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Health Goals</h3>
                      <p className="text-sm text-muted-foreground">Track progress and earn HAIC rewards</p>
                    </div>
                  </div>
                </Card>

                <Card className="p-4 rounded-florence card-glow cursor-pointer" onClick={() => window.location.href = '/health-profile'}>
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <UserCheck className="h-6 w-6 text-purple-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Health Profile</h3>
                      <p className="text-sm text-muted-foreground">Manage your health information</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          <div className="md:col-span-1 space-y-6">
            <Card className="hidden md:block p-4 rounded-florence text-center card-glow">
              <div className="mb-3 flex justify-center">
                <FloLogo className="w-24 h-24" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Need Help?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Chat with Florence, your AI health assistant
              </p>
              <div className="hidden md:block  h-[400px]">
                <ChatInterface />
              </div>
            </Card>
            <HAICWallet />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
