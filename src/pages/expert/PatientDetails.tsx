import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft,
  User,
  Mail,
  Phone,
  Calendar,
  Heart,
  Activity,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Droplets,
  Weight,
  Ruler,
  Users,
  FileText,
  Pill,
  Target,
  Trophy,
  Apple,
  Utensils,
  UserCheck,
  ClipboardList,
  BarChart3,
  Stethoscope
} from "lucide-react";
import { generateClient } from 'aws-amplify/api';
import { getUser, listHealthConditions, listHealthGoals, listDietaryPlans, listHAICRewards, listAppointments } from '@/graphql/queries';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface PatientData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  height?: number;
  weight?: number;
  bloodType?: string;
  allergies?: string;
  medicalConditions?: string;
  currentMedications?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  createdAt: string;
  lastLoginAt?: string;
}

interface HealthCondition {
  id: string;
  name: string;
  severity: string;
  status: string;
  diagnosedDate: string;
  description: string;
  medications?: string;
}

interface HealthGoal {
  id: string;
  title: string;
  description: string;
  category: string;
  target: number;
  current: number;
  unit: string;
  deadline: string;
  isCompleted: boolean;
  priority: string;
  reward: number;
}

interface DietaryPlan {
  id: string;
  name: string;
  category: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  isCompleted: boolean;
  time?: string;
  reason?: string;
}

interface HAICReward {
  id: string;
  amount: number;
  reason: string;
  category: string;
  createdAt: string;
}

interface Appointment {
  id: string;
  userId: string;
  expertId: string;
  date: string;
  status: string;
  type: string;
  duration?: number;
  notes?: string;
  symptoms?: string;
  diagnosis?: string;
  prescription?: string;
  followUpDate?: string;
  createdAt: string;
  updatedAt: string;
  owner?: string;
}

export default function PatientDetails() {
  const { patientId } = useParams<{ patientId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const client = generateClient({ authMode: 'apiKey' });
  
  const [isLoading, setIsLoading] = useState(true);
  const [patientData, setPatientData] = useState<PatientData | null>(null);
  const [healthConditions, setHealthConditions] = useState<HealthCondition[]>([]);
  const [healthGoals, setHealthGoals] = useState<HealthGoal[]>([]);
  const [dietaryPlans, setDietaryPlans] = useState<DietaryPlan[]>([]);
  const [haicRewards, setHaicRewards] = useState<HAICReward[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    if (patientId) {
      fetchPatientData();
    }
  }, [patientId]);

  const fetchPatientData = async () => {
    if (!patientId) return;

    try {
      setIsLoading(true);
      
      // Fetch patient basic information
      const patientResponse = await client.graphql({
        query: getUser,
        variables: { id: patientId }
      });

      if (patientResponse.data.getUser) {
        setPatientData(patientResponse.data.getUser as PatientData);
      }

      // Fetch health conditions
      const healthConditionsResponse = await client.graphql({
        query: listHealthConditions,
        variables: { filter: { userId: { eq: patientId } } }
      });

      if (healthConditionsResponse.data.listHealthConditions?.items) {
        setHealthConditions(healthConditionsResponse.data.listHealthConditions.items as HealthCondition[]);
      }

      // Fetch health goals
      const healthGoalsResponse = await client.graphql({
        query: listHealthGoals,
        variables: { filter: { userId: { eq: patientId } } }
      });

      if (healthGoalsResponse.data.listHealthGoals?.items) {
        setHealthGoals(healthGoalsResponse.data.listHealthGoals.items as HealthGoal[]);
      }

      // Fetch dietary plans
      const dietaryPlansResponse = await client.graphql({
        query: listDietaryPlans,
        variables: { filter: { userId: { eq: patientId } } }
      });

      if (dietaryPlansResponse.data.listDietaryPlans?.items) {
        setDietaryPlans(dietaryPlansResponse.data.listDietaryPlans.items as DietaryPlan[]);
      }

      // Fetch HAIC rewards
      const haicRewardsResponse = await client.graphql({
        query: listHAICRewards,
        variables: { filter: { userId: { eq: patientId } } }
      });

      if (haicRewardsResponse.data.listHAICRewards?.items) {
        setHaicRewards(haicRewardsResponse.data.listHAICRewards.items as HAICReward[]);
      }

      // Fetch appointments
      const appointmentsResponse = await client.graphql({
        query: listAppointments,
        variables: { filter: { userId: { eq: patientId } } }
      });

      if (appointmentsResponse.data.listAppointments?.items) {
        setAppointments(appointmentsResponse.data.listAppointments.items as Appointment[]);
      }

    } catch (error) {
      console.error('Error fetching patient data:', error);
      toast.error('Failed to load patient data');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  const calculateBMI = (height: number, weight: number): number => {
    const heightInMeters = height / 100;
    return Math.round((weight / (heightInMeters * heightInMeters)) * 10) / 10;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600 dark:text-blue-400' };
    if (bmi < 25) return { category: 'Normal', color: 'text-green-600 dark:text-green-400' };
    if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-600 dark:text-yellow-400' };
    return { category: 'Obese', color: 'text-red-600 dark:text-red-400' };
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300';
      case 'meal': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300';
      case 'snack': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-4 text-lg text-gray-600 dark:text-gray-300">Loading patient details...</span>
        </div>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Patient Not Found</h1>
          <Button onClick={() => navigate("/expert/dashboard/patients")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Patients
          </Button>
        </div>
      </div>
    );
  }

  const age = calculateAge(patientData.dateOfBirth || '');
  const bmi = patientData.height && patientData.weight ? calculateBMI(patientData.height, patientData.weight) : 'N/A';
  const bmiCategory = typeof bmi === 'number' ? getBMICategory(bmi) : null;
  const allergies = patientData.allergies ? patientData.allergies.split(',').map(a => a.trim()).filter(a => a) : [];
  const medicalConditions = patientData.medicalConditions ? patientData.medicalConditions.split(',').map(c => c.trim()).filter(c => c) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button
            variant="outline"
            onClick={() => navigate("/expert/dashboard/patients")}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Patients</span>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {patientData.firstName} {patientData.lastName}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">Patient Details & Health Information</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <UserCheck className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center space-x-2">
            <Heart className="h-4 w-4" />
            <span>Health Profile</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center space-x-2">
            <Target className="h-4 w-4" />
            <span>Health Goals</span>
          </TabsTrigger>
          <TabsTrigger value="appointments" className="flex items-center space-x-2">
            <Calendar className="h-4 w-4" />
            <span>Appointments</span>
          </TabsTrigger>
          {/* <TabsTrigger value="rewards" className="flex items-center space-x-2">
            <Trophy className="h-4 w-4" />
            <span>Rewards</span>
          </TabsTrigger> */}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Patient Summary Card */}
            <Card className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <User className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {patientData.firstName} {patientData.lastName}
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">{age} years old • {patientData.gender || 'Not specified'}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-900 dark:text-white">{patientData.email}</span>
                </div>
                
                {patientData.phoneNumber && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900 dark:text-white">{patientData.phoneNumber}</span>
                  </div>
                )}

                {patientData.bloodType && (
                  <div className="flex items-center space-x-3">
                    <Droplets className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-900 dark:text-white">Blood Type: {patientData.bloodType}</span>
                  </div>
                )}
              </div>
            </Card>

            {/* Quick Stats */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{healthGoals.length}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">Health Goals</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">{appointments.length}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">Appointments</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{allergies.length}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">Allergies</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{haicRewards.length}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-300">HAIC Rewards</div>
                </div>
              </div>
            </Card>

            {/* Critical Health Info */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                Critical Health Info
              </h3>
              <div className="space-y-3">
                {allergies.length > 0 ? (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Allergies:</p>
                    <div className="flex flex-wrap gap-1">
                      {allergies.slice(0, 3).map((allergy, index) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {allergy}
                        </Badge>
                      ))}
                      {allergies.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{allergies.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No known allergies</p>
                )}

                {medicalConditions.length > 0 ? (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Medical Conditions:</p>
                    <div className="flex flex-wrap gap-1">
                      {medicalConditions.slice(0, 3).map((condition, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {condition}
                        </Badge>
                      ))}
                      {medicalConditions.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{medicalConditions.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No medical conditions recorded</p>
                )}
              </div>
            </Card>

            {/* Recent Activity */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-blue-500" />
                Recent Activity
              </h3>
              <div className="space-y-3">
                {appointments.length > 0 ? (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Latest Appointment:</p>
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {new Date(appointments[0].date).toLocaleDateString()}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-300">
                        {appointments[0].type} • <Badge className={getStatusColor(appointments[0].status)} variant="outline">
                          {appointments[0].status}
                        </Badge>
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No recent appointments</p>
                )}

                {healthGoals.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Active Goals:</p>
                    <div className="space-y-2">
                      {healthGoals.filter(goal => !goal.isCompleted).slice(0, 2).map((goal) => (
                        <div key={goal.id} className="p-2 bg-gray-50 dark:bg-gray-800 rounded">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{goal.title}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Progress value={Math.round((goal.current / goal.target) * 100)} className="h-1 flex-1" />
                            <span className="text-xs text-gray-500">{Math.round((goal.current / goal.target) * 100)}%</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Allergies */}
            {allergies.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 text-red-500" />
                  Allergies
                </h3>
                <div className="flex flex-wrap gap-2">
                  {allergies.map((allergy, index) => (
                    <Badge key={index} variant="destructive" className="text-sm">
                      {allergy}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Medical Conditions */}
            {medicalConditions.length > 0 && (
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-500" />
                  Medical Conditions
                </h3>
                <div className="flex flex-wrap gap-2">
                  {medicalConditions.map((condition, index) => (
                    <Badge key={index} variant="secondary" className="text-sm">
                      {condition}
                    </Badge>
                  ))}
                </div>
              </Card>
            )}

            {/* Current Medications */}
            {patientData.currentMedications && (
              <Card className="p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Pill className="h-5 w-5 mr-2 text-green-500" />
                  Current Medications
                </h3>
                <p className="text-gray-700 dark:text-gray-300">{patientData.currentMedications}</p>
              </Card>
            )}

            {/* Health Conditions from Database */}
            {healthConditions.length > 0 && (
              <Card className="p-6 lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Stethoscope className="h-5 w-5 mr-2 text-purple-500" />
                  Detailed Health Conditions
                </h3>
                <div className="space-y-4">
                  {healthConditions.map((condition) => (
                    <div key={condition.id} className="border-l-4 border-purple-200 dark:border-purple-800 pl-4">
                      <h4 className="font-medium text-gray-900 dark:text-white">{condition.name}</h4>
                      {condition.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{condition.description}</p>
                      )}
                      {condition.medications && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                          <strong>Medications:</strong> {condition.medications}
                        </p>
                      )}
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge variant="outline" className="text-xs">
                          {condition.severity}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          Diagnosed: {new Date(condition.diagnosedDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6">
          {healthGoals.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {healthGoals.map((goal) => (
                <Card key={goal.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-semibold text-gray-900 dark:text-white">{goal.title}</h3>
                    <Badge className={goal.isCompleted ? "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300" : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300"}>
                      {goal.isCompleted ? "Completed" : "In Progress"}
                    </Badge>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{goal.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-300">Progress</span>
                      <span className="text-gray-900 dark:text-white">{Math.round((goal.current / goal.target) * 100)}%</span>
                    </div>
                    <Progress value={Math.round((goal.current / goal.target) * 100)} className="h-2" />
                  </div>
                  <div className="mt-4 text-xs text-gray-500">
                    Target: {new Date(goal.deadline).toLocaleDateString()}
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Health Goals</h3>
              <p className="text-gray-600 dark:text-gray-300">This patient hasn't set any health goals yet.</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          {appointments.length > 0 ? (
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-blue-500" />
                Recent Appointments
              </h3>
              <div className="space-y-4">
                {appointments.slice(0, 10).map((appointment) => (
                  <div key={appointment.id} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {new Date(appointment.date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {appointment.type} - {appointment.notes || 'No notes'}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(appointment.status)}>
                      {appointment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            <Card className="p-8 text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Appointments</h3>
              <p className="text-gray-600 dark:text-gray-300">This patient hasn't scheduled any appointments yet.</p>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="rewards" className="space-y-6">
          {haicRewards.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {haicRewards.map((reward) => (
                <Card key={reward.id} className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center">
                      <Trophy className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300">
                      {reward.category}
                    </Badge>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">{reward.reason}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">HAIC Reward</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Amount: {reward.amount}</span>
                    <span className="text-gray-500">
                      {new Date(reward.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-8 text-center">
              <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">No Rewards Yet</h3>
              <p className="text-gray-600 dark:text-gray-300">This patient hasn't earned any HAIC rewards yet.</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}