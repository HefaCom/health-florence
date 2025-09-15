import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { expertService } from '@/services/expert.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Clock, 
  Save, 
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';

interface AvailabilitySchedule {
  start: string;
  end: string;
  available: boolean;
}

interface Availability {
  monday: AvailabilitySchedule;
  tuesday: AvailabilitySchedule;
  wednesday: AvailabilitySchedule;
  thursday: AvailabilitySchedule;
  friday: AvailabilitySchedule;
  saturday: AvailabilitySchedule;
  sunday: AvailabilitySchedule;
}

const DAYS = [
  { key: 'monday', label: 'Monday' },
  { key: 'tuesday', label: 'Tuesday' },
  { key: 'wednesday', label: 'Wednesday' },
  { key: 'thursday', label: 'Thursday' },
  { key: 'friday', label: 'Friday' },
  { key: 'saturday', label: 'Saturday' },
  { key: 'sunday', label: 'Sunday' }
];

export default function ExpertAvailability() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [availability, setAvailability] = useState<Availability>({
    monday: { start: '09:00', end: '17:00', available: true },
    tuesday: { start: '09:00', end: '17:00', available: true },
    wednesday: { start: '09:00', end: '17:00', available: true },
    thursday: { start: '09:00', end: '17:00', available: true },
    friday: { start: '09:00', end: '17:00', available: true },
    saturday: { start: '09:00', end: '13:00', available: false },
    sunday: { start: '09:00', end: '13:00', available: false }
  });

  useEffect(() => {
    loadAvailability();
  }, [user]);

  const loadAvailability = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const expert = await expertService.getExpertByUserId(user.id);
      
      if (expert?.availability) {
        try {
          const availability = typeof expert.availability === 'string' 
            ? JSON.parse(expert.availability) 
            : expert.availability;
          setAvailability(availability as Availability);
        } catch (error) {
          console.error('Error parsing availability:', error);
          // Keep default availability if parsing fails
        }
      }
    } catch (error) {
      console.error('Error loading availability:', error);
      toast.error('Failed to load availability settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvailabilityChange = (day: string, field: keyof AvailabilitySchedule, value: any) => {
    setAvailability(prev => ({
      ...prev,
      [day]: {
        ...prev[day as keyof Availability],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    try {
      setIsSaving(true);
      const expert = await expertService.getExpertByUserId(user.id);
      
      if (!expert) {
        toast.error('Expert profile not found');
        return;
      }

      await expertService.updateExpertSimple({
        id: expert.id,
        availability: JSON.stringify(availability)
      });

      toast.success('Availability settings saved successfully!');
    } catch (error: any) {
      console.error('Error saving availability:', error);
      toast.error(error.message || 'Failed to save availability settings');
    } finally {
      setIsSaving(false);
    }
  };

  const getAvailableDaysCount = () => {
    return Object.values(availability).filter(day => day.available).length;
  };

  const getTotalHours = () => {
    return Object.values(availability).reduce((total, day) => {
      if (!day.available) return total;
      
      const start = new Date(`2000-01-01T${day.start}`);
      const end = new Date(`2000-01-01T${day.end}`);
      const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60);
      
      return total + hours;
    }, 0);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading availability settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Availability Settings</h1>
          <p className="text-gray-600">Configure your working hours and availability for consultations</p>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          <Save className="h-4 w-4" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Available Days</p>
                <p className="text-2xl font-bold">{getAvailableDaysCount()}/7</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Hours/Week</p>
                <p className="text-2xl font-bold">{getTotalHours().toFixed(1)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Status</p>
                <Badge variant="default" className="mt-1">
                  {getAvailableDaysCount() > 0 ? 'Available' : 'Unavailable'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Availability Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Weekly Schedule
          </CardTitle>
          <CardDescription>
            Set your availability for each day of the week. Patients will only be able to book appointments during your available hours.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {DAYS.map(({ key, label }) => {
            const daySchedule = availability[key as keyof Availability];
            
            return (
              <div key={key} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="w-24">
                  <Label className="font-medium">{label}</Label>
                </div>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={daySchedule.available}
                    onChange={(e) => handleAvailabilityChange(key, 'available', e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-600">Available</span>
                </div>
                
                {daySchedule.available && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="time"
                      value={daySchedule.start}
                      onChange={(e) => handleAvailabilityChange(key, 'start', e.target.value)}
                      className="w-32"
                    />
                    <span className="text-gray-500">to</span>
                    <Input
                      type="time"
                      value={daySchedule.end}
                      onChange={(e) => handleAvailabilityChange(key, 'end', e.target.value)}
                      className="w-32"
                    />
                  </div>
                )}
                
                <div className="ml-auto">
                  {daySchedule.available ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Available
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-600">
                      <XCircle className="h-3 w-3 mr-1" />
                      Unavailable
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Tips */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h3 className="font-semibold text-blue-900 mb-2">Tips for Setting Availability</h3>
              <ul className="space-y-1 text-sm text-blue-800">
                <li>• Set realistic hours that you can consistently maintain</li>
                <li>• Consider time zones if you serve patients in different regions</li>
                <li>• Leave buffer time between appointments for documentation</li>
                <li>• Update your availability if your schedule changes</li>
                <li>• You can always block specific time slots for personal time</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
