import { useState, useEffect } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Shield, 
  Lock, 
  Save,
  Clock
} from "lucide-react";

const Profile = () => {
  const { user } = useAuth();
  
  // Get user's name from email or attributes
  const getUserName = () => {
    if (user?.attributes?.name) {
      return user.attributes.name;
    }
    
    // Extract name from email if available
    if (user?.email) {
      const emailName = user.email.split('@')[0];
      // Capitalize first letter of each word
      return emailName
        .split(/[._-]/)
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    }
    
    return "User";
  };
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: user?.email || "",
    phone: "",
    dateOfBirth: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    emergencyContact: "",
    emergencyPhone: "",
    allergies: "",
    medicalConditions: "",
    currentMedications: ""
  });
  
  // Initialize form data with user information when component mounts
  useEffect(() => {
    if (user) {
      const userName = getUserName();
      const nameParts = userName.split(' ');
      
      setFormData(prev => ({
        ...prev,
        firstName: nameParts[0] || "",
        lastName: nameParts.slice(1).join(' ') || "",
        email: user.email || "",
        // If we have user attributes, use them
        ...(user.attributes && {
          phone: user.attributes.phone_number || "",
          address: user.attributes.address || "",
          // Add other attributes as needed
        })
      }));
    }
  }, [user]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here you would typically update the user profile in your backend
    // For now, we'll just show a success message
    toast.success("Profile information updated successfully");
  };

  return (
    <div className="space-y-6 px-4 mt-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">My Profile</h1>
          <p className="text-muted-foreground">Manage your personal information and preferences</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>
                Update your personal information and contact details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input
                      id="dateOfBirth"
                      name="dateOfBirth"
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      className="rounded-md"
                    />
                  </div>
                </div>
                
                <h3 className="font-medium mb-3">Address</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2 sm:col-span-2">
                    <Label htmlFor="address">Street Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="state">State</Label>
                    <Input
                      id="state"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zipCode">ZIP Code</Label>
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className="rounded-md"
                    />
                  </div>
                </div>
                
                <h3 className="font-medium mb-3">Emergency Contact</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyContact">Contact Name</Label>
                    <Input
                      id="emergencyContact"
                      name="emergencyContact"
                      value={formData.emergencyContact}
                      onChange={handleChange}
                      className="rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Contact Phone</Label>
                    <Input
                      id="emergencyPhone"
                      name="emergencyPhone"
                      value={formData.emergencyPhone}
                      onChange={handleChange}
                      className="rounded-md"
                    />
                  </div>
                </div>
                
                <h3 className="font-medium mb-3">Medical Information</h3>
                <div className="grid grid-cols-1 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="allergies">Allergies</Label>
                    <Input
                      id="allergies"
                      name="allergies"
                      value={formData.allergies}
                      onChange={handleChange}
                      className="rounded-md"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="medicalConditions">Medical Conditions</Label>
                    <Textarea
                      id="medicalConditions"
                      name="medicalConditions"
                      value={formData.medicalConditions}
                      onChange={handleChange}
                      className="rounded-md min-h-[80px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="currentMedications">Current Medications</Label>
                    <Textarea
                      id="currentMedications"
                      name="currentMedications"
                      value={formData.currentMedications}
                      onChange={handleChange}
                      className="rounded-md min-h-[80px]"
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <Button type="submit" className="rounded-full">
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your password and security preferences
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Lock className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Password</h3>
                      <p className="text-sm text-muted-foreground">Change your password</p>
                    </div>
                  </div>
                  <Button variant="outline" className="rounded-full">Change</Button>
                </div>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-primary/10 rounded-full">
                      <Shield className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium">Two-Factor Authentication</h3>
                      <p className="text-sm text-muted-foreground">Add an extra layer of security</p>
                    </div>
                  </div>
                  <Button variant="outline" className="rounded-full">Enable</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Overview</CardTitle>
              <CardDescription>
                Your account details and activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Account Type</p>
                    <p className="font-medium">{user?.role || "Standard User"}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-medium">{user?.email || "Not provided"}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Member Since</p>
                    <p className="font-medium">
                      {user?.attributes?.created_at 
                        ? new Date(user.attributes.created_at).toLocaleDateString() 
                        : "Not available"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>
                Your recent account activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-primary/10 rounded-full mt-1">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Profile Updated</p>
                    <p className="text-sm text-muted-foreground">You updated your profile information</p>
                    <p className="text-xs text-muted-foreground mt-1">Today</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="p-2 bg-primary/10 rounded-full mt-1">
                    <Clock className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">Account Created</p>
                    <p className="text-sm text-muted-foreground">You created your account</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {user?.attributes?.created_at 
                        ? new Date(user.attributes.created_at).toLocaleDateString() 
                        : "Not available"}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
