import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { expertService } from '@/services/expert.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Stethoscope, 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X,
  DollarSign,
  Clock,
  Star,
  CheckCircle
} from 'lucide-react';

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number; // in minutes
  price: number;
  isActive: boolean;
}

const DEFAULT_SERVICES = [
  {
    id: 'general_consultation',
    name: 'General Consultation',
    description: 'Comprehensive health assessment and consultation',
    duration: 30,
    price: 150,
    isActive: true
  },
  {
    id: 'follow_up',
    name: 'Follow-up Visit',
    description: 'Follow-up appointment for ongoing care',
    duration: 15,
    price: 75,
    isActive: true
  },
  {
    id: 'emergency_consultation',
    name: 'Emergency Consultation',
    description: 'Urgent medical consultation and advice',
    duration: 20,
    price: 200,
    isActive: true
  }
];

export default function ExpertServices() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newService, setNewService] = useState<Partial<Service>>({
    name: '',
    description: '',
    duration: 30,
    price: 0,
    isActive: true
  });

  useEffect(() => {
    loadServices();
  }, [user]);

  const loadServices = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const expert = await expertService.getExpertByUserId(user.id);
      
      if (expert?.services) {
        // If services is an array of strings, convert to Service objects
        if (typeof expert.services[0] === 'string') {
          const serviceObjects = expert.services.map((serviceName: string, index: number) => ({
            id: `service_${index}`,
            name: serviceName,
            description: `Professional ${serviceName.toLowerCase()} service`,
            duration: 30,
            price: 150,
            isActive: true
          }));
          setServices(serviceObjects);
        } else {
          setServices(expert.services as Service[]);
        }
      } else {
        // Use default services if none exist
        setServices(DEFAULT_SERVICES);
      }
    } catch (error) {
      console.error('Error loading services:', error);
      toast.error('Failed to load services');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveServices = async () => {
    if (!user) return;

    try {
      setIsSaving(true);
      const expert = await expertService.getExpertByUserId(user.id);
      
      if (!expert) {
        toast.error('Expert profile not found');
        return;
      }

      // Convert services to the format expected by the backend
      const serviceNames = services.map(service => service.name);

      await expertService.updateExpertSimple({
        id: expert.id,
        services: serviceNames
      });

      toast.success('Services updated successfully!');
    } catch (error: any) {
      console.error('Error saving services:', error);
      toast.error(error.message || 'Failed to save services');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddService = () => {
    if (!newService.name || !newService.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    const service: Service = {
      id: `service_${Date.now()}`,
      name: newService.name,
      description: newService.description,
      duration: newService.duration || 30,
      price: newService.price || 0,
      isActive: true
    };

    setServices(prev => [...prev, service]);
    setNewService({
      name: '',
      description: '',
      duration: 30,
      price: 0,
      isActive: true
    });
    setIsAddingNew(false);
    toast.success('Service added successfully!');
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
  };

  const handleUpdateService = (updatedService: Service) => {
    setServices(prev => prev.map(service => 
      service.id === updatedService.id ? updatedService : service
    ));
    setEditingService(null);
    toast.success('Service updated successfully!');
  };

  const handleDeleteService = (serviceId: string) => {
    setServices(prev => prev.filter(service => service.id !== serviceId));
    toast.success('Service deleted successfully!');
  };

  const handleToggleService = (serviceId: string) => {
    setServices(prev => prev.map(service => 
      service.id === serviceId ? { ...service, isActive: !service.isActive } : service
    ));
  };

  const getActiveServicesCount = () => {
    return services.filter(service => service.isActive).length;
  };

  const getAveragePrice = () => {
    const activeServices = services.filter(service => service.isActive);
    if (activeServices.length === 0) return 0;
    
    const totalPrice = activeServices.reduce((sum, service) => sum + service.price, 0);
    return totalPrice / activeServices.length;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading services...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Services Management</h1>
          <p className="text-gray-600">Define and manage your consultation services and pricing</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsAddingNew(true)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Service
          </Button>
          <Button 
            onClick={handleSaveServices}
            disabled={isSaving}
            className="flex items-center gap-2"
          >
            <Save className="h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Stethoscope className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Total Services</p>
                <p className="text-2xl font-bold">{services.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Active Services</p>
                <p className="text-2xl font-bold">{getActiveServicesCount()}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Average Price</p>
                <p className="text-2xl font-bold">${getAveragePrice().toFixed(0)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add New Service Form */}
      {isAddingNew && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Add New Service
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="serviceName">Service Name *</Label>
                <Input
                  id="serviceName"
                  value={newService.name}
                  onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., General Consultation"
                />
              </div>
              <div>
                <Label htmlFor="serviceDuration">Duration (minutes) *</Label>
                <Input
                  id="serviceDuration"
                  type="number"
                  value={newService.duration}
                  onChange={(e) => setNewService(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                  placeholder="30"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="serviceDescription">Description *</Label>
              <Textarea
                id="serviceDescription"
                value={newService.description}
                onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this service includes..."
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="servicePrice">Price ($) *</Label>
              <Input
                id="servicePrice"
                type="number"
                value={newService.price}
                onChange={(e) => setNewService(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
                placeholder="150"
                step="0.01"
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={handleAddService}>
                <Save className="h-4 w-4 mr-2" />
                Add Service
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAddingNew(false);
                  setNewService({
                    name: '',
                    description: '',
                    duration: 30,
                    price: 0,
                    isActive: true
                  });
                }}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Services List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Stethoscope className="h-5 w-5" />
            Your Services
          </CardTitle>
          <CardDescription>
            Manage your consultation services and their details
          </CardDescription>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <div className="text-center py-8">
              <Stethoscope className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No services defined</h3>
              <p className="text-gray-600 mb-4">
                Add your first service to start accepting appointments
              </p>
              <Button 
                onClick={() => setIsAddingNew(true)}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Your First Service
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {services.map((service) => (
                <div key={service.id} className="p-4 border rounded-lg">
                  {editingService?.id === service.id ? (
                    <EditServiceForm 
                      service={service} 
                      onSave={handleUpdateService}
                      onCancel={() => setEditingService(null)}
                    />
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{service.name}</h3>
                          <Badge variant={service.isActive ? "default" : "secondary"}>
                            {service.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-gray-600 mb-2">{service.description}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>{service.duration} minutes</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            <span>${service.price}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleToggleService(service.id)}
                        >
                          {service.isActive ? "Deactivate" : "Activate"}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleEditService(service)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleDeleteService(service.id)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Edit Service Form Component
function EditServiceForm({ 
  service, 
  onSave, 
  onCancel 
}: { 
  service: Service; 
  onSave: (service: Service) => void; 
  onCancel: () => void; 
}) {
  const [editedService, setEditedService] = useState<Service>(service);

  const handleSave = () => {
    onSave(editedService);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="editServiceName">Service Name</Label>
          <Input
            id="editServiceName"
            value={editedService.name}
            onChange={(e) => setEditedService(prev => ({ ...prev, name: e.target.value }))}
          />
        </div>
        <div>
          <Label htmlFor="editServiceDuration">Duration (minutes)</Label>
          <Input
            id="editServiceDuration"
            type="number"
            value={editedService.duration}
            onChange={(e) => setEditedService(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
          />
        </div>
      </div>
      
      <div>
        <Label htmlFor="editServiceDescription">Description</Label>
        <Textarea
          id="editServiceDescription"
          value={editedService.description}
          onChange={(e) => setEditedService(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
      </div>
      
      <div>
        <Label htmlFor="editServicePrice">Price ($)</Label>
        <Input
          id="editServicePrice"
          type="number"
          value={editedService.price}
          onChange={(e) => setEditedService(prev => ({ ...prev, price: parseFloat(e.target.value) }))}
          step="0.01"
        />
      </div>
      
      <div className="flex gap-2">
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Changes
        </Button>
        <Button variant="outline" onClick={onCancel}>
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      </div>
    </div>
  );
}
