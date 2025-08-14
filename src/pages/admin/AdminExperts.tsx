import { useEffect, useMemo, useState } from "react";
import { generateClient } from "aws-amplify/api";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { listExpertPatients, listAppointments, listUsers, getUser } from "@/graphql/queries";

// Custom query to get experts with user data
const LIST_EXPERTS_WITH_USER = /* GraphQL */ `
  query ListExpertsWithUser($filter: ModelExpertFilterInput, $limit: Int, $nextToken: String) {
    listExperts(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        userId
        specialization
        user {
          id
          email
          firstName
          lastName
        }
      }
      nextToken
    }
  }
`;
import { 
  Stethoscope,
  Users,
  Calendar,
  ChevronDown,
  ChevronUp,
  Search,
  Mail,
  Phone,
  Clock,
  User,
  Activity
} from "lucide-react";

type ExpertSummary = {
  id: string;
  name: string;
  specialization?: string;
  email?: string;
  patientsCount: number;
  appointmentsCount: number;
};

type PatientLite = {
  id: string;
  name: string;
  email?: string;
  phoneNumber?: string;
};

type AppointmentLite = {
  id: string;
  userName?: string;
  date?: string;
  status?: string;
  type?: string;
};

export default function AdminExperts() {
  const client = generateClient({ authMode: "apiKey" });
  const [isLoading, setIsLoading] = useState(true);
  const [experts, setExperts] = useState<ExpertSummary[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [detailsLoading, setDetailsLoading] = useState<Record<string, boolean>>({});
  const [patientsByExpert, setPatientsByExpert] = useState<Record<string, PatientLite[]>>({});
  const [appointmentsByExpert, setAppointmentsByExpert] = useState<Record<string, AppointmentLite[]>>({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadExperts = async () => {
      setIsLoading(true);
      try {
        const res: any = await client.graphql({
          query: LIST_EXPERTS_WITH_USER,
          variables: { limit: 200 },
          authMode: "apiKey"
        });
        const items: any[] = res?.data?.listExperts?.items || [];

        // For each expert, precompute patient and appointment counts
        const summaries: ExpertSummary[] = [];
        for (const ex of items) {
          const expertId = ex?.id;
          if (!expertId) continue;

          // Patients count
          let patientsCount = 0;
          try {
            const epRes: any = await client.graphql({
              query: listExpertPatients,
              variables: { filter: { expertId: { eq: expertId } }, limit: 1 },
              authMode: "apiKey"
            });
            patientsCount = (epRes?.data?.listExpertPatients?.items || []).length;
            // If only 1 due to limit, attempt to get a better estimate by fetching more
            if (patientsCount === 1) {
              const epRes2: any = await client.graphql({
                query: listExpertPatients,
                variables: { filter: { expertId: { eq: expertId } }, limit: 1000 },
                authMode: "apiKey"
              });
              patientsCount = (epRes2?.data?.listExpertPatients?.items || []).length;
            }
          } catch (_) {}

          // Appointments count
          let appointmentsCount = 0;
          try {
            const apRes: any = await client.graphql({
              query: listAppointments,
              variables: { filter: { expertId: { eq: expertId } }, limit: 1 },
              authMode: "apiKey"
            });
            appointmentsCount = (apRes?.data?.listAppointments?.items || []).length;
            if (appointmentsCount === 1) {
              const apRes2: any = await client.graphql({
                query: listAppointments,
                variables: { filter: { expertId: { eq: expertId } }, limit: 1000 },
                authMode: "apiKey"
              });
              appointmentsCount = (apRes2?.data?.listAppointments?.items || []).length;
            }
          } catch (_) {}

          const firstName = ex?.user?.firstName?.trim();
          const lastName = ex?.user?.lastName?.trim();
          const name = [firstName, lastName].filter(Boolean).join(" ") || ex?.user?.email || "Unknown Expert";
          summaries.push({
            id: expertId,
            name,
            specialization: ex?.specialization,
            email: ex?.user?.email,
            patientsCount,
            appointmentsCount
          });
        }
        setExperts(summaries);
      } catch (e) {
        console.error("Failed to load experts", e);
        toast.error("Failed to load experts");
      } finally {
        setIsLoading(false);
      }
    };
    loadExperts();
  }, []);

  const toggleExpand = async (expertId: string) => {
    setExpanded(prev => ({ ...prev, [expertId]: !prev[expertId] }));
    const willExpand = !expanded[expertId];
    if (!willExpand) return;
    if (patientsByExpert[expertId] && appointmentsByExpert[expertId]) return;

    setDetailsLoading(prev => ({ ...prev, [expertId]: true }));
    try {
      // Patients: get ExpertPatient -> userIds -> users
      let epItems: any[] = [];
      try {
        const epRes: any = await client.graphql({
          query: listExpertPatients,
          variables: { filter: { expertId: { eq: expertId } }, limit: 500 },
          authMode: "apiKey"
        });
        epItems = epRes?.data?.listExpertPatients?.items || [];
      } catch (e) {
        console.warn("listExpertPatients failed", e);
      }
      const userIds = Array.from(new Set(epItems.map((x: any) => x.userId).filter(Boolean)));
      const patients: PatientLite[] = [];
      if (userIds.length) {
        try {
          const luRes: any = await client.graphql({ query: listUsers, variables: { limit: 1000 }, authMode: "apiKey" });
          const allUsers: any[] = luRes?.data?.listUsers?.items || [];
          const selected = allUsers.filter((u: any) => userIds.includes(u.id));
          for (const u of selected) {
            const patientFirstName = u.firstName?.trim();
            const patientLastName = u.lastName?.trim();
            patients.push({
              id: u.id,
              name: [patientFirstName, patientLastName].filter(Boolean).join(" ") || u.email || "User",
              email: u.email,
              phoneNumber: u.phoneNumber
            });
          }
        } catch (bulkErr) {
          console.warn("bulk listUsers failed, falling back to getUser", bulkErr);
          for (const uid of userIds) {
            try {
              const uRes: any = await client.graphql({ query: getUser, variables: { id: uid }, authMode: "apiKey" });
              const u = uRes?.data?.getUser;
              if (u) {
                const patientFirstName = u.firstName?.trim();
                const patientLastName = u.lastName?.trim();
                patients.push({
                  id: u.id,
                  name: [patientFirstName, patientLastName].filter(Boolean).join(" ") || u.email || "User",
                  email: u.email,
                  phoneNumber: u.phoneNumber
                });
              }
            } catch (_) {}
          }
        }
      }

      // Appointments
      let apItems: any[] = [];
      try {
        const apRes: any = await client.graphql({
          query: listAppointments,
          variables: { filter: { expertId: { eq: expertId } }, limit: 200 },
          authMode: "apiKey"
        });
        apItems = apRes?.data?.listAppointments?.items || [];
      } catch (e) {
        console.warn("listAppointments failed", e);
      }
      const appointmentLites: AppointmentLite[] = apItems
        .map((a: any) => {
          const appointmentUserFirstName = a.user?.firstName?.trim();
          const appointmentUserLastName = a.user?.lastName?.trim();
          return {
            id: a.id,
            userName: a.user ? ([appointmentUserFirstName, appointmentUserLastName].filter(Boolean).join(" ") || a.user.email) : undefined,
            date: a.date,
            status: a.status,
            type: a.type
          };
        })
        .sort((a: any, b: any) => (new Date(b.date || 0).getTime() - new Date(a.date || 0).getTime()))
        .slice(0, 20);

      setPatientsByExpert(prev => ({ ...prev, [expertId]: patients }));
      setAppointmentsByExpert(prev => ({ ...prev, [expertId]: appointmentLites }));
    } finally {
      setDetailsLoading(prev => ({ ...prev, [expertId]: false }));
    }
  };

  const filteredExperts = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return experts;
    return experts.filter(ex =>
      ex.name.toLowerCase().includes(q) ||
      (ex.specialization || "").toLowerCase().includes(q) ||
      (ex.email || "").toLowerCase().includes(q)
    );
  }, [experts, search]);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Experts Management</h1>
          <p className="text-muted-foreground">
            Browse healthcare experts and view their patient relationships and appointment history
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="px-3 py-1">
            <Activity className="h-3 w-3 mr-1" />
            {filteredExperts.length} Experts
          </Badge>
        </div>
      </div>

      {/* Search Section */}
      <Card className="border-0 shadow-sm bg-gradient-to-r from-background to-muted/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search experts by name, email, or specialization..."
                className="pl-10 h-11 bg-background/50 backdrop-blur-sm border-muted-foreground/20 focus:border-primary/50"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="grid grid-cols-1  gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="overflow-hidden border-0 shadow-sm">
              <CardHeader className="pb-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-10 h-10 rounded-lg" />
                      <Skeleton className="h-5 w-32" />
                    </div>
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <div className="flex gap-2">
                    <Skeleton className="h-6 w-12 rounded-full" />
                    <Skeleton className="h-6 w-12 rounded-full" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-8 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : filteredExperts.length === 0 ? (
        <Card className="border-0 shadow-sm bg-gradient-to-r from-muted/20 to-muted/40">
          <CardContent className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
              <Stethoscope className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No experts found</h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              {search ? "Try adjusting your search criteria" : "No healthcare experts are currently registered"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredExperts.map((ex) => {
            const isOpen = !!expanded[ex.id];
            const loadingDetails = !!detailsLoading[ex.id];
            const patients = patientsByExpert[ex.id] || [];
            const appointments = appointmentsByExpert[ex.id] || [];
            return (
              <Card key={ex.id} className="overflow-hidden border-0 shadow-sm hover:shadow-md transition-all duration-200 group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-primary/10 to-primary/20 flex items-center justify-center group-hover:from-primary/20 group-hover:to-primary/30 transition-all duration-200">
                          <Stethoscope className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <span className="text-foreground">{ex.name}</span>
                          <div className="text-sm font-normal text-muted-foreground mt-0.5">
                            {ex.specialization || "Healthcare Specialist"}
                          </div>
                        </div>
                      </CardTitle>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <div className="flex items-center gap-1.5">
                        <Badge variant="outline" className="px-2.5 py-1 text-xs font-medium bg-primary/5 border-primary/20 text-primary">
                          <Users className="h-3 w-3 mr-1" />
                          {ex.patientsCount}
                        </Badge>
                        <Badge variant="outline" className="px-2.5 py-1 text-xs font-medium bg-blue-500/5 border-blue-500/20 text-blue-600">
                          <Calendar className="h-3 w-3 mr-1" />
                          {ex.appointmentsCount}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <span className="truncate">{ex.email}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleExpand(ex.id)}
                      className="gap-1.5 h-8 px-3 text-xs font-medium hover:bg-primary/10 hover:text-primary transition-colors"
                    >
                      {isOpen ? "Hide Details" : "View Details"}
                      {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </Button>
                  </div>

                  {isOpen && (
                    <div className="pt-4 space-y-6 border-t border-border/50">
                      {loadingDetails ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <Skeleton className="h-5 w-20" />
                            <Skeleton className="h-5 w-8" />
                          </div>
                          <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                              <div key={i} className="flex items-center gap-3">
                                <Skeleton className="w-8 h-8 rounded-full" />
                                <div className="space-y-1 flex-1">
                                  <Skeleton className="h-4 w-24" />
                                  <Skeleton className="h-3 w-32" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 gap-6">
                          {/* Patients Section */}
                          <div className="bg-muted/30 rounded-xl p-5 border border-border/50">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                  <Users className="h-4 w-4 text-primary" />
                                </div>
                                <h3 className="font-semibold text-foreground">Patients</h3>
                              </div>
                              <Badge variant="secondary" className="px-2.5 py-1 text-xs">
                                {patients.length}
                              </Badge>
                            </div>
                            {patients.length === 0 ? (
                              <div className="text-center py-6">
                                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                                  <User className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground">No patients linked to this expert</p>
                              </div>
                            ) : (
                              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                {patients.map((p) => (
                                  <div key={p.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-background/50 transition-colors">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500/10 to-blue-600/20 flex items-center justify-center flex-shrink-0">
                                      <User className="h-5 w-5 text-blue-600" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium text-foreground truncate">{p.name}</p>
                                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                        {p.email && (
                                          <span className="inline-flex items-center gap-1">
                                            <Mail className="h-3 w-3" />
                                            <span className="truncate max-w-32">{p.email}</span>
                                          </span>
                                        )}
                                        {p.phoneNumber && (
                                          <span className="inline-flex items-center gap-1">
                                            <Phone className="h-3 w-3" />
                                            <span className="truncate">{p.phoneNumber}</span>
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>

                          {/* Appointments Section */}
                          <div className="bg-muted/30 rounded-xl p-5 border border-border/50">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                  <Calendar className="h-4 w-4 text-blue-600" />
                                </div>
                                <h3 className="font-semibold text-foreground">Recent Appointments</h3>
                              </div>
                              <Badge variant="secondary" className="px-2.5 py-1 text-xs">
                                {appointments.length}
                              </Badge>
                            </div>
                            {appointments.length === 0 ? (
                              <div className="text-center py-6">
                                <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-muted flex items-center justify-center">
                                  <Calendar className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <p className="text-sm text-muted-foreground">No appointments found</p>
                              </div>
                            ) : (
                              <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                                {appointments.map((a) => (
                                  <div key={a.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-background/50 transition-colors">
                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-green-500/10 to-green-600/20 flex items-center justify-center flex-shrink-0">
                                      <Clock className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <p className="text-sm font-medium text-foreground truncate">
                                        {a.userName || "Patient"}
                                      </p>
                                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                                        <Badge variant="outline" className="px-1.5 py-0.5 text-xs font-medium bg-green-500/5 border-green-500/20 text-green-600">
                                          {a.type || "Consultation"}
                                        </Badge>
                                        {a.date && (
                                          <span className="inline-flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            <span>{new Date(a.date).toLocaleDateString()}</span>
                                          </span>
                                        )}
                                        {a.status && (
                                          <Badge 
                                            variant="outline" 
                                            className={`px-1.5 py-0.5 text-xs font-medium ${
                                              a.status === 'COMPLETED' ? 'bg-green-500/5 border-green-500/20 text-green-600' :
                                              a.status === 'CANCELLED' ? 'bg-red-500/5 border-red-500/20 text-red-600' :
                                              'bg-yellow-500/5 border-yellow-500/20 text-yellow-600'
                                            }`}
                                          >
                                            {a.status}
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}


