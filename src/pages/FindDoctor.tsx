
import { useState } from "react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter,
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Search, 
  Star, 
  MapPin, 
  Calendar,
  Filter,
  Phone
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Sample data
const doctors = [
  {
    id: 1,
    name: "Dr. Sarah Johnson",
    specialty: "Cardiologist",
    hospital: "Memorial Hospital",
    location: "123 Medical Center Dr, New York, NY",
    rating: 4.9,
    reviews: 124,
    experience: "15 years",
    availability: ["Mon", "Wed", "Fri"],
    image: "https://randomuser.me/api/portraits/women/68.jpg"
  },
  {
    id: 2,
    name: "Dr. Michael Chen",
    specialty: "Dermatologist",
    hospital: "City Medical Center",
    location: "456 Health Ave, Boston, MA",
    rating: 4.7,
    reviews: 98,
    experience: "10 years",
    availability: ["Tue", "Thu", "Sat"],
    image: "https://randomuser.me/api/portraits/men/35.jpg"
  },
  {
    id: 3,
    name: "Dr. Emily Rodriguez",
    specialty: "Pediatrician",
    hospital: "Children's Hospital",
    location: "789 Care Street, Chicago, IL",
    rating: 4.8,
    reviews: 156,
    experience: "12 years",
    availability: ["Mon", "Tue", "Thu", "Fri"],
    image: "https://randomuser.me/api/portraits/women/45.jpg"
  },
  {
    id: 4,
    name: "Dr. James Wilson",
    specialty: "Neurologist",
    hospital: "Neuroscience Center",
    location: "321 Brain Way, San Francisco, CA",
    rating: 4.6,
    reviews: 87,
    experience: "20 years",
    availability: ["Wed", "Fri"],
    image: "https://randomuser.me/api/portraits/men/22.jpg"
  },
  {
    id: 5,
    name: "Dr. Lisa Patel",
    specialty: "Orthopedic Surgeon",
    hospital: "Orthopedic Institute",
    location: "555 Bone Street, Dallas, TX",
    rating: 4.9,
    reviews: 210,
    experience: "18 years",
    availability: ["Mon", "Thu", "Sat"],
    image: "https://randomuser.me/api/portraits/women/33.jpg"
  }
];

const specialties = [
  "All Specialties",
  "Cardiologist",
  "Dermatologist", 
  "Pediatrician", 
  "Neurologist", 
  "Orthopedic Surgeon",
  "Gynecologist",
  "Ophthalmologist",
  "Psychiatrist"
];

const FindDoctor = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [specialty, setSpecialty] = useState("All Specialties");
  
  const filteredDoctors = doctors.filter(doctor => {
    const matchesSearch = 
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      doctor.hospital.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSpecialty = 
      specialty === "All Specialties" || doctor.specialty === specialty;
    
    return matchesSearch && matchesSpecialty;
  });

  return (
    <div className="space-y-6 px-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Find a Doctor</h1>
          <p className="text-muted-foreground">Discover and connect with healthcare professionals</p>
        </div>
      </div>
      
      {/* Search and Filter */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, hospital, or location"
                className="pl-9 rounded-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="w-full md:w-64">
              <Select value={specialty} onValueChange={setSpecialty}>
                <SelectTrigger className="rounded-full">
                  <SelectValue placeholder="Select Specialty" />
                </SelectTrigger>
                <SelectContent>
                  {specialties.map((spec) => (
                    <SelectItem key={spec} value={spec}>
                      {spec}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button className="rounded-full">
              <Filter className="mr-2 h-4 w-4" />
              Advanced Filters
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Doctor List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredDoctors.map((doctor) => (
          <Card key={doctor.id} className="overflow-hidden transition-shadow hover:shadow-md">
            <CardHeader className="pb-2">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-full overflow-hidden bg-muted">
                  <img src={doctor.image} alt={doctor.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-lg">{doctor.name}</CardTitle>
                  <CardDescription>{doctor.specialty}</CardDescription>
                  <div className="flex items-center mt-1">
                    <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                    <span className="ml-1 text-sm font-medium">{doctor.rating}</span>
                    <span className="ml-1 text-sm text-muted-foreground">({doctor.reviews} reviews)</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{doctor.hospital}</span>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-0.5 text-muted-foreground" />
                  <span className="flex-1">{doctor.location}</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>Available: {doctor.availability.join(", ")}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex gap-2 pt-0">
              <Button variant="outline" size="sm" className="rounded-full flex-1">
                <Phone className="h-4 w-4 mr-2" />
                Call
              </Button>
              <Button size="sm" className="rounded-full flex-1">
                <Calendar className="h-4 w-4 mr-2" />
                Book
              </Button>
            </CardFooter>
          </Card>
        ))}
        
        {filteredDoctors.length === 0 && (
          <Card className="p-6 text-center col-span-full">
            <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium">No doctors found</h3>
            <p className="text-muted-foreground mt-2">
              Try adjusting your search or filter criteria.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FindDoctor;
