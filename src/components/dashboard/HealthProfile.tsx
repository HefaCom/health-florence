import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
  Plus,
  Trash2,
  Save,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { userService } from "@/services/user.service";
import { healthConditionService, HealthCondition as HealthConditionType } from "@/services/health-condition.service";
import { haicTokenService } from "@/services/haic-token.service";
import { toast } from "sonner";
import { FileUpload } from "@/components/common/FileUpload";
import { fileUploadService, UploadedFile } from "@/services/file-upload.service";

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
  const [editingCondition, setEditingCondition] = useState<string | null>(null);
  const [showAddCondition, setShowAddCondition] = useState(false);
  const [newCondition, setNewCondition] = useState({
    name: "",
    severity: "mild",
    status: "active",
    diagnosedDate: "",
    description: "",
    medications: ""
  });
  
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

  const [healthConditions, setHealthConditions] = useState<HealthConditionType[]>([]);
  const [medicalDocuments, setMedicalDocuments] = useState<UploadedFile[]>([]);

  // Fetch user health data from database
  useEffect(() => {
    const fetchHealthData = async () => {
      if (user?.email && user?.id) {
        try {
          setIsLoading(true);
          const userData = await userService.getUserByEmail(user.email);
          
          if (userData) {
            console.log('Fetched user data:', userData);
            // Parse health data from user record
            const allergies = userData.allergies ? userData.allergies.split(',').map(a => a.trim()).filter(a => a) : [];

            const healthDataToSet = {
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
            };
            
            console.log('Setting health data:', healthDataToSet);
            setHealthData(healthDataToSet);
          }

          // Fetch health conditions from the dedicated table
          const conditions = await healthConditionService.getHealthConditionsByUserId(user.id);
          setHealthConditions(conditions);

          // Load medical documents
          if (userData.medicalDocuments) {
            try {
              const documents = JSON.parse(userData.medicalDocuments);
              setMedicalDocuments(documents);
            } catch (error) {
              console.error('Error parsing medical documents:', error);
              setMedicalDocuments([]);
            }
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
  }, [user?.email, user?.id]);

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
    if (!healthData.height || !healthData.weight || healthData.height === 0 || healthData.weight === 0) {
      return null;
    }
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

  const handleEditCondition = (condition: HealthConditionType) => {
    setEditingCondition(condition.id);
  };

  const handleSaveCondition = async (condition: HealthConditionType) => {
    try {
      await healthConditionService.updateHealthCondition({
        id: condition.id,
        name: condition.name,
        severity: condition.severity,
        status: condition.status,
        diagnosedDate: condition.diagnosedDate,
        description: condition.description,
        medications: condition.medications
      });
      
      setHealthConditions(prev => 
        prev.map(c => c.id === condition.id ? condition : c)
      );
      setEditingCondition(null);
      toast.success("Health condition updated successfully!");
    } catch (error) {
      console.error('Error updating health condition:', error);
      toast.error("Failed to update health condition");
    }
  };

  const handleDeleteCondition = async (id: string) => {
    try {
      await healthConditionService.deleteHealthCondition(id);
      setHealthConditions(prev => prev.filter(condition => condition.id !== id));
      toast.success("Health condition deleted successfully!");
    } catch (error) {
      console.error('Error deleting health condition:', error);
      toast.error("Failed to delete health condition");
    }
  };

  const handleAddCondition = async () => {
    if (!user?.id) return;

    try {
      const newConditionData = await healthConditionService.createHealthCondition({
        userId: user.id,
        name: newCondition.name,
        severity: newCondition.severity,
        status: newCondition.status,
        diagnosedDate: newCondition.diagnosedDate,
        description: newCondition.description,
        medications: newCondition.medications
      });

      setHealthConditions(prev => [...prev, newConditionData]);
      setShowAddCondition(false);
      setNewCondition({
        name: "",
        severity: "mild",
        status: "active",
        diagnosedDate: "",
        description: "",
        medications: ""
      });
      toast.success("New health condition added successfully!");
    } catch (error) {
      console.error('Error adding health condition:', error);
      toast.error("Failed to add health condition");
    }
  };

  const handleSaveHealthData = async () => {
    if (!user?.id) return;

    try {
      await userService.updateUser({
        id: user.id,
        height: healthData.height,
        weight: healthData.weight,
        gender: healthData.gender,
        dateOfBirth: healthData.dateOfBirth,
        bloodType: healthData.bloodType,
        allergies: healthData.allergies.join(', '),
        emergencyContactName: healthData.emergencyContact.name,
        emergencyContactPhone: healthData.emergencyContact.phone
      });
      
      setIsEditing(false);

      // Award HAIC tokens for updating health profile
      try {
        await haicTokenService.distributeReward(
          user.id,
          15, // 15 HAIC tokens for updating health profile
          "Updated health profile information",
          "profile_completion"
        );
        toast.success("Health profile updated successfully! You earned 15 HAIC tokens! 🎉");
      } catch (error) {
        console.error('Error awarding HAIC tokens:', error);
        toast.success("Health profile updated successfully!");
      }
    } catch (error) {
      console.error('Error updating health profile:', error);
      toast.error("Failed to update health profile");
    }
  };

  const handleMedicalDocumentUpload = async (files: UploadedFile[]) => {
    if (files.length === 0) return;

    try {
      // Add new documents to existing ones
      const updatedDocuments = [...medicalDocuments, ...files];
      setMedicalDocuments(updatedDocuments);

      // Update user profile with new medical documents
      if (user?.id) {
        await userService.updateUser({
          id: user.id,
          medicalDocuments: JSON.stringify(updatedDocuments)
        });
      }

      toast.success(`Successfully uploaded ${files.length} medical document(s)`);
    } catch (error: any) {
      console.error('Error uploading medical documents:', error);
      toast.error(error.message || 'Failed to upload medical documents');
    }
  };

  const handleDeleteDocument = async (documentId: string) => {
    try {
      const updatedDocuments = medicalDocuments.filter(doc => doc.id !== documentId);
      setMedicalDocuments(updatedDocuments);

      // Update user profile
      if (user?.id) {
        await userService.updateUser({
          id: user.id,
          medicalDocuments: JSON.stringify(updatedDocuments)
        });
      }

      toast.success('Medical document deleted successfully');
    } catch (error: any) {
      console.error('Error deleting medical document:', error);
      toast.error('Failed to delete medical document');
    }
  };

  const bmi = calculateBMI();
  const bmiCategory = bmi ? getBMICategory(parseFloat(bmi)) : null;

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
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {healthData.height > 0 ? `${healthData.height}cm` : 'Not set'}
              </div>
              <div className="text-xs text-muted-foreground">Height</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-pink-600 dark:text-pink-400">
                {healthData.weight > 0 ? `${healthData.weight}kg` : 'Not set'}
              </div>
              <div className="text-xs text-muted-foreground">Weight</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {bmi || 'N/A'}
              </div>
              <div className={cn("text-xs", bmiCategory?.color || "text-muted-foreground")}>
                {bmiCategory?.category || 'BMI not calculated'}
              </div>
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
          {/* Call to Action for Empty Profile */}
          {(!healthData.height || !healthData.weight || !healthData.gender || !healthData.dateOfBirth) && (
            <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                  <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h4 className="font-medium text-blue-900 dark:text-blue-100">Complete Your Health Profile</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">
                    Add your height, weight, and other health information to get personalized recommendations from Florence AI.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Basic Information */}
          <div className="p-4 rounded-lg border bg-white dark:bg-card">
            <h4 className="font-medium mb-3 flex items-center">
              <User className="h-4 w-4 mr-2" />
              Basic Information
            </h4>
            {isEditing ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="height">Height (cm)</Label>
                    <Input
                      id="height"
                      type="number"
                      value={healthData.height}
                      onChange={(e) => setHealthData({ ...healthData, height: parseInt(e.target.value) || 0 })}
                      placeholder="Enter height in cm"
                    />
                  </div>
                  <div>
                    <Label htmlFor="weight">Weight (kg)</Label>
                    <Input
                      id="weight"
                      type="number"
                      value={healthData.weight}
                      onChange={(e) => setHealthData({ ...healthData, weight: parseInt(e.target.value) || 0 })}
                      placeholder="Enter weight in kg"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      value={healthData.gender}
                      onValueChange={(value) => setHealthData({ ...healthData, gender: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      type="date"
                      value={healthData.dateOfBirth}
                      onChange={(e) => setHealthData({ ...healthData, dateOfBirth: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bloodType">Blood Type</Label>
                    <Select
                      value={healthData.bloodType}
                      onValueChange={(value) => setHealthData({ ...healthData, bloodType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="allergies">Allergies (comma-separated)</Label>
                    <Input
                      id="allergies"
                      value={healthData.allergies.join(', ')}
                      onChange={(e) => setHealthData({ 
                        ...healthData, 
                        allergies: e.target.value.split(',').map(a => a.trim()).filter(a => a) 
                      })}
                      placeholder="Enter allergies separated by commas"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="emergencyContactName">Emergency Contact Name</Label>
                    <Input
                      id="emergencyContactName"
                      value={healthData.emergencyContact.name}
                      onChange={(e) => setHealthData({ 
                        ...healthData, 
                        emergencyContact: { ...healthData.emergencyContact, name: e.target.value }
                      })}
                      placeholder="Emergency contact name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="emergencyContactPhone">Emergency Contact Phone</Label>
                    <Input
                      id="emergencyContactPhone"
                      value={healthData.emergencyContact.phone}
                      onChange={(e) => setHealthData({ 
                        ...healthData, 
                        emergencyContact: { ...healthData.emergencyContact, phone: e.target.value }
                      })}
                      placeholder="Emergency contact phone"
                    />
                  </div>
                </div>
              </div>
            ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-muted-foreground">Height</div>
                <div className="font-medium flex items-center">
                  <Ruler className="h-3 w-3 mr-1" />
                  {isPrivate ? "***" : (healthData.height > 0 ? `${healthData.height} cm` : 'Not set')}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Weight</div>
                <div className="font-medium flex items-center">
                  <Scale className="h-3 w-3 mr-1" />
                  {isPrivate ? "***" : (healthData.weight > 0 ? `${healthData.weight} kg` : 'Not set')}
                </div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Gender</div>
                <div className="font-medium">{isPrivate ? "***" : (healthData.gender || 'Not set')}</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Date of Birth</div>
                <div className="font-medium flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  {isPrivate ? "***" : (healthData.dateOfBirth ? new Date(healthData.dateOfBirth).toLocaleDateString() : 'Not set')}
                </div>
              </div>
            </div>
            )}
            {!isPrivate && (
              <div className="mt-3 pt-3 border-t">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Blood Type</div>
                    <div className="font-medium flex items-center">
                      <Heart className="h-3 w-3 mr-1" />
                      {healthData.bloodType || 'Not set'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">BMI</div>
                    <div className={cn("font-medium", bmiCategory?.color || "text-muted-foreground")}>
                      {bmi ? `${bmi} (${bmiCategory?.category})` : 'Not calculated'}
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
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium">Health Conditions</h4>
              {isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddCondition(!showAddCondition)}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  {showAddCondition ? "Cancel" : "Add Condition"}
                </Button>
              )}
            </div>
            
            <div className="space-y-3">
              {healthConditions.map((condition) => (
                <div key={condition.id} className="p-3 rounded-lg border bg-gray-50 dark:bg-muted/50">
                  {editingCondition === condition.id ? (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`condition-name-${condition.id}`}>Condition Name</Label>
                          <Input
                            id={`condition-name-${condition.id}`}
                            value={condition.name}
                            onChange={(e) => {
                              const updatedCondition = { ...condition, name: e.target.value };
                              setHealthConditions(prev => 
                                prev.map(c => c.id === condition.id ? updatedCondition : c)
                              );
                            }}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`condition-severity-${condition.id}`}>Severity</Label>
                          <Select
                            value={condition.severity}
                            onValueChange={(value) => {
                              const updatedCondition = { ...condition, severity: value as "mild" | "moderate" | "severe" };
                              setHealthConditions(prev => 
                                prev.map(c => c.id === condition.id ? updatedCondition : c)
                              );
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="mild">Mild</SelectItem>
                              <SelectItem value="moderate">Moderate</SelectItem>
                              <SelectItem value="severe">Severe</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`condition-status-${condition.id}`}>Status</Label>
                          <Select
                            value={condition.status}
                            onValueChange={(value) => {
                              const updatedCondition = { ...condition, status: value as "active" | "managed" | "resolved" };
                              setHealthConditions(prev => 
                                prev.map(c => c.id === condition.id ? updatedCondition : c)
                              );
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Active</SelectItem>
                              <SelectItem value="managed">Managed</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor={`condition-date-${condition.id}`}>Diagnosed Date</Label>
                          <Input
                            id={`condition-date-${condition.id}`}
                            type="date"
                            value={condition.diagnosedDate}
                            onChange={(e) => {
                              const updatedCondition = { ...condition, diagnosedDate: e.target.value };
                              setHealthConditions(prev => 
                                prev.map(c => c.id === condition.id ? updatedCondition : c)
                              );
                            }}
                          />
                        </div>
                      </div>
                      
                      <div>
                        <Label htmlFor={`condition-description-${condition.id}`}>Description</Label>
                        <Textarea
                          id={`condition-description-${condition.id}`}
                          value={condition.description}
                          onChange={(e) => {
                            const updatedCondition = { ...condition, description: e.target.value };
                            setHealthConditions(prev => 
                              prev.map(c => c.id === condition.id ? updatedCondition : c)
                            );
                          }}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor={`condition-medications-${condition.id}`}>Medications</Label>
                        <Input
                          id={`condition-medications-${condition.id}`}
                          value={condition.medications || ""}
                          onChange={(e) => {
                            const updatedCondition = { ...condition, medications: e.target.value };
                            setHealthConditions(prev => 
                              prev.map(c => c.id === condition.id ? updatedCondition : c)
                            );
                          }}
                          placeholder="List medications separated by commas"
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setEditingCondition(null)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => handleSaveCondition(condition)}
                        >
                          <Save className="h-4 w-4 mr-1" />
                          Save
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
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
                        
                        {isEditing && (
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditCondition(condition)}
                              className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <Edit3 className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteCondition(condition.id)}
                              className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-2">
                    {condition.description}
                  </p>
                  
                  <div className="text-xs text-muted-foreground mb-2">
                    Diagnosed: {new Date(condition.diagnosedDate).toLocaleDateString()}
                  </div>
                  
                      {condition.medications && (
                    <div>
                      <div className="text-xs font-medium text-muted-foreground mb-1">
                        Medications:
                      </div>
                          <div className="text-sm text-muted-foreground">
                            {condition.medications}
                          </div>
                      </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
              
              {showAddCondition && (
                <div className="p-3 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
                  <div className="space-y-3">
                    <h5 className="font-medium">Add New Health Condition</h5>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="new-condition-name">Condition Name</Label>
                        <Input
                          id="new-condition-name"
                          value={newCondition.name}
                          onChange={(e) => setNewCondition(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="e.g., Diabetes Type 2"
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-condition-severity">Severity</Label>
                        <Select
                          value={newCondition.severity}
                          onValueChange={(value) => setNewCondition(prev => ({ ...prev, severity: value as "mild" | "moderate" | "severe" }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="mild">Mild</SelectItem>
                            <SelectItem value="moderate">Moderate</SelectItem>
                            <SelectItem value="severe">Severe</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="new-condition-status">Status</Label>
                        <Select
                          value={newCondition.status}
                          onValueChange={(value) => setNewCondition(prev => ({ ...prev, status: value as "active" | "managed" | "resolved" }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="managed">Managed</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="new-condition-date">Diagnosed Date</Label>
                        <Input
                          id="new-condition-date"
                          type="date"
                          value={newCondition.diagnosedDate}
                          onChange={(e) => setNewCondition(prev => ({ ...prev, diagnosedDate: e.target.value }))}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="new-condition-description">Description</Label>
                      <Textarea
                        id="new-condition-description"
                        value={newCondition.description}
                        onChange={(e) => setNewCondition(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Describe the condition..."
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="new-condition-medications">Medications</Label>
                      <Input
                        id="new-condition-medications"
                        value={newCondition.medications}
                        onChange={(e) => setNewCondition(prev => ({ ...prev, medications: e.target.value }))}
                        placeholder="List medications separated by commas"
                      />
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowAddCondition(false)}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleAddCondition}
                        disabled={!newCondition.name}
                      >
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              )}
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
        <div className="flex space-x-2">
          {isEditing && (
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1 rounded-full"
              onClick={handleSaveHealthData}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          )}
           {/* // This would trigger Florence to update health profile
           // TODO: Implement Florence integration for health profile updates */}
        {/* <Button 
          variant="outline" 
          size="sm" 
            className="flex-1 rounded-full"
          onClick={() => {
           
            toast.info("Florence integration for health profile updates coming soon!");
          }}
        >
          <Plus className="h-4 w-4 mr-2" />
          Ask Florence to Update Health Profile
        </Button> */}
        </div> 

        {/* Medical Documents */}
        <div className="p-4 rounded-lg border bg-white dark:bg-card">
          {/* <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Medical Documents</h4>
            <Badge variant="secondary" className="text-xs">
              {medicalDocuments.length} document(s)
            </Badge>
          </div> */}
          
          <div className="space-y-3">
            {/* {medicalDocuments.length === 0 ? (
              <div className="text-center py-4 text-gray-500">
                <p className="text-sm">No medical documents uploaded</p>
              </div>
            ) : (
              medicalDocuments.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 text-sm">📄</span>
                    </div>
                    <div>
                      <p className="text-sm font-medium">{doc.name}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(doc.url, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDocument(doc.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            )} */}
            
            {/* <FileUpload
              onUploadComplete={handleMedicalDocumentUpload}
              options={{
                category: 'medical-documents',
                maxSize: 10 * 1024 * 1024, // 10MB
                allowedTypes: [
                  'application/pdf',
                  'image/jpeg',
                  'image/png',
                  'application/msword',
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
                ]
              }}
              multiple={true}
              maxFiles={5}
              className="mt-3"
            /> */}
          </div>
        </div>
      </div>
    </Card>
  );
} 