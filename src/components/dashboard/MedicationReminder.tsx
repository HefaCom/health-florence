
import { Card } from "@/components/ui/card";
import { Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Medication = {
  id: string;
  name: string;
  time: string;
  taken: boolean;
  dosage: string;
};

interface MedicationReminderProps {
  medications: Medication[];
  onMarkTaken: (id: string) => void;
  className?: string;
}

export function MedicationReminder({
  medications,
  onMarkTaken,
  className,
}: MedicationReminderProps) {
  return (
    <Card className={cn("p-4 rounded-florence overflow-hidden card-glow", className)}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold">Today's Medications</h3>
        <Button variant="outline" size="sm" className="rounded-full text-xs">
          View All
        </Button>
      </div>
      
      <div className="space-y-3">
        {medications.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No medications recorded
          </div>
        ) : (
          medications.map((med) => (
          <div
            key={med.id}
            className={cn(
              "flex items-center justify-between p-3 rounded-2xl border transition-colors",
              med.taken
                ? "bg-muted/30 border-muted"
                : "bg-background border-primary/20"
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  med.taken
                    ? "bg-muted text-muted-foreground"
                    : "bg-primary/10 text-primary"
                )}
              >
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium">{med.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {med.dosage} • {med.time}
                </p>
              </div>
            </div>
            
            <Button
              variant={med.taken ? "ghost" : "outline"}
              size="sm"
              onClick={() => onMarkTaken(med.id)}
              disabled={med.taken}
              className="rounded-full"
            >
              {med.taken ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : (
                "Take"
              )}
            </Button>
          </div>
          ))
        )}
      </div>
    </Card>
  );
}
