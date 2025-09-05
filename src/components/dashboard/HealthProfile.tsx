import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  User, 
  Shield, 
  Edit3, 
  Eye, 
  EyeOff, 
  Heart,
  Activity,
  Calendar,
  Scale,
  Ruler,
  AlertTriangle,
  CheckCircle,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services/user.service";
import { toast } from "sonner";

interface HealthCondition {
  id: string;
  name: string;
  severity: "mild" | "moderate" | "severe";
  status: "active" | "managed" | "resolved";
  diagnosedDate: string;
  description: string;
  medications?: string[];
}

interface HealthProfileProps {
  className?: string;
}

export function HealthProfile({ className }: HealthProfileProps) {
  const { user } = useAuth();
  const [isPrivate, setIsPrivate] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Basic health information from database
  const [healthData, setHealthData] = useState({
    height: 0, // cm
    weight: 0, // kg
    gender: "",
    dateOfBirth: "",
    bloodType: "",
    allergies: [] as string[],
    emergencyContact: {
      name: "",
      relationship: "",
      phone: ""
    }
  });

  const [healthConditions, setHealthConditions] = useState<HealthCondition[]>([]);

  // Fetch user health data from database
  useEffect(() => {
    const fetchHealthData = async () => {
      if (user?.email) {
        try {
          setIsLoading(true);
          const userData = await userService.getUserByEmail(user.email);
          
          if (userData) {
            // Parse health data from user record
            const allergies = userData.allergies ? userData.allergies.split(',').map(a => a.trim()).filter(a => a) : [];
            const medicalConditions = userData.medicalConditions ? userData.medicalConditions.split(',').map(c => c.trim()).filter(c => c) : [];
            const currentMedications = userData.currentMedications ? userData.currentMedications.split(',').map(m => m.trim()).filter(m => m) : [];

            setHealthData({
              height: userData.height || 0,
              weight: userData.weight || 0,
              gender: userData.gender || "",
              dateOfBirth: userData.dateOfBirth || "",
              bloodType: userData.bloodType || "",
              allergies: allergies,
              emergencyContact: {
                name: userData.emergencyContactName || "",
                relationship: "Emergency Contact",
                phone: userData.emergencyContactPhone || ""
              }
            });

            // Convert medical conditions to health conditions format
            const conditions: HealthCondition[] = medicalConditions.map((condition, index) => ({
              id: `condition_${index}`,
              name: condition,
              severity: "moderate" as const,
              status: "active" as const,
              diagnosedDate: userData.createdAt || new Date().toISOString(),
              description: `Medical condition: ${condition}`,
              medications: currentMedications
            }));

            setHealthConditions(conditions);
          }
        } catch (error) {
          console.error('Error fetching health data:', error);
          toast.error("Failed to load health profile data");
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchHealthData();
  }, [user?.email]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "mild": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      case "moderate": return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300";
      case "severe": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
      case "managed": return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300";
      case "resolved": return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300";
      default: return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active": return <AlertTriangle className="h-3 w-3" />;
      case "managed": return <CheckCircle className="h-3 w-3" />;
      case "resolved": return <CheckCircle className="h-3 w-3" />;
      default: return <Activity className="h-3 w-3" />;
    }
  };

  const calculateBMI = () => {
    const heightInMeters = healthData.height / 100;
    const bmi = healthData.weight / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: "Underweight", color: "text-blue-600 dark:text-blue-400" };
    if (bmi < 25) return { category: "Normal", color: "text-green-600 dark:text-green-400" };
    if (bmi < 30) return { category: "Overweight", color: "text-yellow-600 dark:text-yellow-400" };
    return { category: "Obese", color: "text-red-600 dark:text-red-400" };
  };

  const bmi = calculateBMI();
  const bmiCategory = getBMICategory(parseFloat(bmi));

  if (isLoading) {
    return (
      <Card className={cn("rounded-florence overflow-hidden card-glow", className)}>
        <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
            <span className="ml-2 text-muted-foreground">Loading health profile...</span>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={cn("rounded-florence overflow-hidden card-glow", className)}>
      <div className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
              <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Health Profile</h3>
              <p className="text-sm text-muted-foreground">
                Your health information and conditions
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPrivate(!isPrivate)}
              className="rounded-full"
            >
              {isPrivate ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
              {isPrivate ? "Private" : "Public"}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(!isEditing)}
              className="rounded-full"
            >
              <Edit3 className="h-4 w-4 mr-2" />
              {isEditing ? "Done" : "Edit"}
            </Button>
          </div>
        </div>

        {!isPrivate && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">{healthData.height}cm</div>
              <div className="text-xs text-muted-foreground">Height</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">{healthData.weight}kg</div>
              <div className="text-xs text-muted-foreground">Weight</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{bmi}</div>
              <div className={cn("text-xs", bmiCategory.color)}>{bmiCategory.category}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600 dark:text-green-400">{healthConditions.length}</div>
              <div className="text-xs text-muted-foreground">Conditions</div>
            </div>
          </div>
        )}
      </div>

      <ScrollArea className="h-[400px] p-4">
        <div className="space-y-4">
          {/* Basic Information */}
          <div className="p-4 rounded-lg border bg-white dark:bg-card">
            <h4 className="font-medium mb-3 flex items-center">
              <User className="h-4 w-4 mr-2" />
              Basic Information
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Height</div>
                <div className="font-medium flex items-center">
                  <Ruler className="h-3 w-3 mr-1" />
                  {isPrivate ? "***" : `${healthData.height} cm`}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Weight</div>
                <div className="font-medium flex items-center">
                  <Scale className="h-3 w-3 mr-1" />
                  {isPrivate ? "***" : `${healthData.weight} kg`}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Gender</div>
                <div className="font-medium">{isPrivate ? "***" : healthData.gender}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Date of Birth</div>
                <div className="font-medium flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {isPrivate ? "***" : new Date(healthData.dateOfBirth).toLocaleDateString()}
                </div>
              </div>
            </div>
            {!isPrivate && (
              <div className="mt-3 pt-3 border-t">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Blood Type</div>
                    <div className="font-medium flex items-center">
                      <Heart className="h-3 w-3 mr-1" />
                      {healthData.bloodType}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">BMI</div>
                    <div className={cn("font-medium", bmiCategory.color)}>
                      {bmi} ({bmiCategory.category})
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Allergies */}
          <div className="p-4 rounded-lg border bg-white dark:bg-card">
            <h4 className="font-medium mb-3">Allergies</h4>
            <div className="flex flex-wrap gap-2">
              {healthData.allergies.map((allergy, index) => (
                <Badge key={index} variant="outline" className="text-red-700 border-red-300 dark:text-red-300 dark:border-red-600">
                  <AlertTriangle className="h-3 w-3 mr-1" />
                  {allergy}
                </Badge>
              ))}
            </div>
          </div>

          {/* Health Conditions */}
          <div className="p-4 rounded-lg border bg-white dark:bg-card">
            <h4 className="font-medium mb-3">Health Conditions</h4>
            <div className="space-y-3">
              {healthConditions.map((condition) => (
                <div key={condition.id} className="p-3 rounded-lg border bg-gray-50 dark:bg-muted/50">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h5 className="font-medium">{condition.name}</h5>
                      <Badge 
                        variant="secondary" 
                        className={cn("text-xs", getSeverityColor(condition.severity))}
                      >
                        {condition.severity}
                      </Badge>
                      <Badge 
                        variant="outline" 
                        className={cn("text-xs", getStatusColor(condition.status))}
                      >
                        {getStatusIcon(condition.status)}
                        <span className="ml-1">{condition.status}</span>
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {condition.description}
                  </p>
                  
                  <div className="text-xs text-muted-foreground mb-2">
                    Diagnosed: {new Date(condition.diagnosedDate).toLocaleDateString()}
                  </div>
                  
                  {condition.medications && condition.medications.length > 0 && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Medications:
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {condition.medications.map((med, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {med}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Emergency Contact */}
          {!isPrivate && (
            <div className="p-4 rounded-lg border bg-white dark:bg-card">
              <h4 className="font-medium mb-3">Emergency Contact</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Name</div>
                  <div className="font-medium">{healthData.emergencyContact.name}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Relationship</div>
                  <div className="font-medium">{healthData.emergencyContact.relationship}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Phone</div>
                  <div className="font-medium">{healthData.emergencyContact.phone}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t bg-gray-50 dark:bg-muted/50">
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full rounded-full"
          onClick={() => {
            // This would trigger Florence to update health profile
            console.log("Requesting health profile updates from Florence");
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ask Florence to Update Health Profile
        </Button>
      </div>
    </Card>
  );
} 