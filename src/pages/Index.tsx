
import { useState } from "react";
import { ChatInterface } from "@/components/ChatInterface";
import { HealthMetric } from "@/components/dashboard/HealthMetric";
import { MedicationReminder } from "@/components/dashboard/MedicationReminder";
import { TokenRewards } from "@/components/dashboard/TokenRewards";
import { AppointmentCard } from "@/components/dashboard/AppointmentCard";
import { Activity, Footprints, Heart, Timer } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FloLogo } from "@/components/FloLogo";

const Index = () => {
  // Sample data for medications
  const [medications, setMedications] = useState([
    {
      id: "1",
      name: "Lisinopril",
      time: "8:00 AM",
      taken: true,
      dosage: "10mg",
    },
    {
      id: "2",
      name: "Metformin",
      time: "12:30 PM",
      taken: false,
      dosage: "500mg",
    },
    {
      id: "3",
      name: "Simvastatin",
      time: "7:00 PM",
      taken: false,
      dosage: "20mg",
    },
  ]);

  // Sample appointments
  const appointments = [
    {
      id: "1",
      title: "Annual Physical Checkup",
      doctor: "Dr. Sarah Johnson",
      location: "Memorial Hospital",
      date: "May 15, 2023",
      time: "10:30 AM",
    },
  ];

  const handleMarkTaken = (id: string) => {
    setMedications((prev) =>
      prev.map((med) =>
        med.id === id ? { ...med, taken: true } : med
      )
    );
  };

  return (
    <div className="flex-1">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="md:col-span-2">
            <div className="mb-6">
              <h1 className="text-3xl font-bold">
                Welcome to Nurse Help Me<span className="text-primary">.</span>
              </h1>
              <p className="text-muted-foreground">
                Your personal health assistant and medical connector
              </p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <HealthMetric
                title="Steps Today"
                value={7450}
                target={10000}
                unit="steps"
                icon={<Footprints className="h-5 w-5 text-green-500" />}
                color="bg-green-500"
              />
              <HealthMetric
                title="Heart Rate"
                value={72}
                target={80}
                unit="bpm"
                icon={<Heart className="h-5 w-5 text-red-500" />}
                color="bg-red-500"
              />
              <HealthMetric
                title="Sleep"
                value={6.5}
                target={8}
                unit="hrs"
                icon={<Timer className="h-5 w-5 text-purple-500" />}
                color="bg-purple-500"
              />
              <HealthMetric
                title="Activity"
                value={35}
                target={60}
                unit="min"
                icon={<Activity className="h-5 w-5 text-blue-500" />}
                color="bg-blue-500"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <MedicationReminder
                medications={medications}
                onMarkTaken={handleMarkTaken}
              />
              <AppointmentCard appointments={appointments} />
            </div>
          </div>
          
          <div className="md:col-span-1 space-y-6">
            <Card className="p-4 rounded-florence text-center card-glow">
              <div className="mb-3 flex justify-center">
                <FloLogo className="w-24 h-24" />
              </div>
              <h3 className="font-semibold text-lg mb-1">Need Help?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Chat with Florence, your AI health assistant
              </p>
              <div className="h-[400px]">
                <ChatInterface />
              </div>
            </Card>
            <TokenRewards balance={250.75} />
            
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
