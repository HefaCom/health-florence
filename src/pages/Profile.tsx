
import { useState } from "react";
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
  
  const [formData, setFormData] = useState({
    firstName: "John",
    lastName: "Doe",
    email: user?.email || "",
    phone: "(555) 123-4567",
    dateOfBirth: "1985-05-15",
    address: "123 Main St",
    city: "San Francisco",
    state: "CA",
    zipCode: "94103",
    emergencyContact: "Jane Doe",
    emergencyPhone: "(555) 987-6543",
    allergies: "Penicillin",
    medicalConditions: "None",
    currentMedications: "None"
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <Input
                    id="currentPassword"
                    type="password"
                    className="rounded-md"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    className="rounded-md"
                    placeholder="••••••••"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    className="rounded-md"
                    placeholder="••••••••"
                  />
                </div>
              </div>
              
              <Button className="mt-4 rounded-full">
                <Lock className="h-4 w-4 mr-2" />
                Update Password
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Account Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                    <User className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-lg">{formData.firstName} {formData.lastName}</p>
                    <p className="text-sm text-muted-foreground">Patient</p>
                  </div>
                </div>
                
                <div className="pt-2">
                  <ul className="space-y-3">
                    <li className="flex items-center text-sm">
                      <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                      <span>{formData.email}</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <Phone className="h-4 w-4 mr-3 text-muted-foreground" />
                      <span>{formData.phone}</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <MapPin className="h-4 w-4 mr-3 text-muted-foreground" />
                      <span>{formData.address}, {formData.city}, {formData.state} {formData.zipCode}</span>
                    </li>
                    <li className="flex items-center text-sm">
                      <Calendar className="h-4 w-4 mr-3 text-muted-foreground" />
                      <span>DOB: {formData.dateOfBirth}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Plan Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 mr-3 text-primary" />
                  <div>
                    <p className="font-medium">HealthGuard Insurance</p>
                    <p className="text-sm text-muted-foreground">Premium Health Plus</p>
                  </div>
                </div>
                <div className="text-sm">
                  <p className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Policy Number:</span>
                    <span className="font-medium">HGP-12345678</span>
                  </p>
                  <p className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground">Coverage:</span>
                    <span className="font-medium">Active</span>
                  </p>
                  <p className="flex justify-between py-1">
                    <span className="text-muted-foreground">Renewal Date:</span>
                    <span className="font-medium">Dec 31, 2023</span>
                  </p>
                </div>
                <Button variant="outline" className="w-full mt-2 rounded-full">
                  View Insurance Details
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle>Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                <div className="p-4">
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Annual Physical Checkup</p>
                      <p className="text-sm text-muted-foreground">Dr. Sarah Johnson</p>
                      <div className="flex items-center mt-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>May 15, 2023</span>
                        <Clock className="h-3 w-3 ml-2 mr-1" />
                        <span>10:30 AM</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-start">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Dental Cleaning</p>
                      <p className="text-sm text-muted-foreground">Dr. Michael Chen</p>
                      <div className="flex items-center mt-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        <span>May 22, 2023</span>
                        <Clock className="h-3 w-3 ml-2 mr-1" />
                        <span>2:00 PM</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <CardFooter className="border-t px-4 py-3">
                <Button variant="link" className="h-auto p-0">
                  View all appointments
                </Button>
              </CardFooter>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
