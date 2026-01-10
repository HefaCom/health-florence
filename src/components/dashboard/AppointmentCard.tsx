
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Clock, MapPin, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

type Appointment = {
  id: string;
  title: string;
  doctor: string;
  location: string;
  date: string;
  time: string;
};

interface AppointmentCardProps {
  appointments: Appointment[];
  className?: string;
}

export function AppointmentCard({
  appointments,
  className,
}: AppointmentCardProps) {
  return (
    <Card className={cn("p-4 rounded-florence overflow-hidden card-glow", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Upcoming Appointments</h3>
        <Button variant="outline" size="sm" className="rounded-full text-xs">
          <CalendarIcon className="mr-1 h-3 w-3" />
          Schedule
        </Button>
      </div>

      <div className="space-y-3">
        {appointments.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No upcoming appointments
          </div>
        ) : (
          appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="p-3 rounded-2xl border border-border bg-card/50"
            >
              <h4 className="font-medium mb-2">{appointment.title}</h4>

              <div className="space-y-2 text-sm">
                <div className="flex items-center text-muted-foreground">
                  <UserRound className="h-4 w-4 mr-2" />
                  {appointment.doctor}
                </div>

                <div className="flex items-center text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2" />
                  {appointment.location}
                </div>

                <div className="flex items-center text-muted-foreground">
                  <Clock className="h-4 w-4 mr-2" />
                  {appointment.date} • {appointment.time}
                </div>
              </div>

              {/* <div className="mt-3 grid grid-cols-2 gap-2">
                <Button variant="outline" size="sm" className="rounded-full text-xs">
                  Reschedule
                </Button>
                <Button size="sm" className="rounded-full text-xs">
                  Details
                </Button>
              </div> */}
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
