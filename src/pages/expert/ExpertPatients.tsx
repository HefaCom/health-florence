import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Filter, 
  UserPlus, 
  MoreHorizontal,
  Users,
  Phone,
  Mail,
  Eye
} from "lucide-react";
import { generateClient } from 'aws-amplify/api';
import { listPatientRecords, listExperts, listAppointments, listExpertPatients, getUser, listUsers, listHealthConditions } from '@/graphql/queries';
import { createPatientRecord } from '@/graphql/mutations';
import { useAuth } from '@/contexts/AuthContext';
import { expertService } from '@/services/expert.service';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function ExpertPatients() {
  const navigate = useNavigate();
  const client = generateClient({ authMode: 'apiKey' });
  // Minimal mutation to avoid nested expert selection which can fail auth
  const CREATE_PATIENT_RECORD_MIN = /* GraphQL */ `mutation CreatePatientRecordMin($input: CreatePatientRecordInput!, $condition: ModelPatientRecordConditionInput) {
    createPatientRecord(input: $input, condition: $condition) {
      id
      expertId
      firstName
      lastName
      dateOfBirth
      gender
      phoneNumber
      email
      medicalHistory
      notes
      createdAt
      updatedAt
    }
  }`;
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [patients, setPatients] = useState<Array<{
    id: string;
    name: string;
    email?: string;
    phone?: string;
    age?: number;
    condition?: string;
    status?: string;
    lastVisit?: string;
  }>>([]);
  const [expertId, setExpertId] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    dateOfBirth: '',
    gender: '',
    condition: '',
    notes: ''
  });

  useEffect(() => {
    const load = async () => {
      if (!user) return;
      setIsLoading(true);
      try {
        console.log('[ExpertPatients] start load, user.id:', user.id, 'email:', user.email);
        // Resolve Expert.id for this user using expert service
        let resolvedExpertId = expertId;
        if (!resolvedExpertId) {
          try {
            const expert = await expertService.getExpertByUserId(user.id);
            resolvedExpertId = expert?.id || null;
            setExpertId(resolvedExpertId);
            console.log('[ExpertPatients] resolvedExpertId via service:', resolvedExpertId);
          } catch (error) {
            console.error('[ExpertPatients] Failed to resolve expert ID:', error);
            resolvedExpertId = null;
          }
        }

        // For this view, ignore external PatientRecord list. Only show system users who added the expert.
        let mapped: any[] | null = null;
        console.log('[ExpertPatients] skipping PatientRecord listing for this view');

        if (!mapped) {
          // Fallback 2: patients who added this expert (ExpertPatient relationship)
          try {
            let expRes: any;
            // Try with expert.id, then fallback to user.id if data may have been stored that way
            const tryFetchExpertPatients = async (expertKey: string) => {
              try {
                return await client.graphql({
                  query: listExpertPatients,
                  variables: { filter: { expertId: { eq: expertKey } }, limit: 500 },
                  authMode: 'userPool'
                });
              } catch (_e) {
                return await client.graphql({
                  query: listExpertPatients,
                  variables: { filter: { expertId: { eq: expertKey } }, limit: 500 },
                  authMode: 'apiKey'
                });
              }
            };
            const candidates = Array.from(new Set([resolvedExpertId, user?.id].filter(Boolean))) as string[];
            console.log('[ExpertPatients] trying ExpertPatient candidates:', candidates);
            let items: any[] = [];
            for (const key of candidates) {
              expRes = await tryFetchExpertPatients(key);
              items = (expRes as any).data?.listExpertPatients?.items || [];
              console.log('[ExpertPatients] listExpertPatients for key', key, 'items:', items.length);
              if (items.length) break;
            }
            // Last-chance fallback: scan all expert-patient links and filter locally
            if (!items.length) {
              try {
                const scanAll: any = await client.graphql({
                  query: listExpertPatients,
                  variables: { limit: 1000 },
                  authMode: 'apiKey'
                });
                const allEP: any[] = scanAll?.data?.listExpertPatients?.items || [];
                const keys = new Set(candidates);
                const filtered = allEP.filter((ep: any) => keys.has(ep.expertId));
                console.log('[ExpertPatients] scanned all ExpertPatients, matched:', filtered.length);
                items = filtered;
              } catch (e) {
                console.warn('[ExpertPatients] scan ExpertPatients failed', e);
              }
            }
            const expertPatients = items;
            const userIds: string[] = Array.from(new Set(expertPatients.map((ep: any) => ep.userId).filter(Boolean)));
            console.log('[ExpertPatients] userIds from ExpertPatient:', userIds.length);
            let users: any[] = [];
            if (userIds.length) {
              try {
                const luRes: any = await client.graphql({ query: listUsers, variables: { limit: 1000 }, authMode: 'apiKey' });
                const allUsers: any[] = luRes?.data?.listUsers?.items || [];
                users = allUsers.filter((u: any) => userIds.includes(u.id));
              } catch (e) {
                console.warn('[ExpertPatients] listUsers failed, falling back to per-id fetch');
                const fetched: any[] = [];
                for (const uid of userIds) {
                  try {
                    let uRes: any;
                    try { uRes = await client.graphql({ query: getUser, variables: { id: uid }, authMode: 'apiKey' }); }
                    catch { uRes = await client.graphql({ query: getUser, variables: { id: uid }, authMode: 'userPool' }); }
                    const u = (uRes as any).data?.getUser; if (u) fetched.push(u);
                  } catch {}
                }
                users = fetched;
              }
            }
            console.log('[ExpertPatients] fetched users from ExpertPatient:', users.length);
            if (users.length > 0) {
              // Fetch additional data for each patient
              const enrichedPatients = await Promise.all(users.map(async (u) => {
                const age = u.dateOfBirth ? (new Date().getFullYear() - new Date(u.dateOfBirth).getFullYear()) : undefined;
                
                // Fetch health conditions for this patient
                let condition = 'No conditions recorded';
                try {
                  const conditionsRes = await client.graphql({
                    query: listHealthConditions,
                    variables: { filter: { userId: { eq: u.id } } },
                    authMode: 'apiKey'
                  });
                  const conditions = conditionsRes.data?.listHealthConditions?.items || [];
                  if (conditions.length > 0) {
                    condition = conditions[0].name; // Show the first condition
                    if (conditions.length > 1) {
                      condition += ` (+${conditions.length - 1} more)`;
                    }
                  }
                } catch (error) {
                  console.warn('Failed to fetch health conditions for patient:', u.id, error);
                }

                // Fetch last appointment for this patient
                let lastVisit = 'No visits';
                try {
                  const appointmentsRes = await client.graphql({
                    query: listAppointments,
                    variables: { 
                      filter: { userId: { eq: u.id } },
                      limit: 1
                    },
                    authMode: 'apiKey'
                  });
                  const appointments = appointmentsRes.data?.listAppointments?.items || [];
                  if (appointments.length > 0) {
                    const lastAppointment = appointments[0];
                    lastVisit = new Date(lastAppointment.date).toLocaleDateString();
                  }
                } catch (error) {
                  console.warn('Failed to fetch appointments for patient:', u.id, error);
                }

                return {
                  id: u.id,
                  name: [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email || 'Unknown',
                  email: u.email,
                  phone: u.phoneNumber,
                  age,
                  condition,
                  lastVisit,
                  status: 'Active'
                };
              }));

              mapped = enrichedPatients;
            } else {
              // If no expert-patient links, do not fallback to appointments. Show none per requirement.
              mapped = [];
            }
          } catch (e) {
            // ignore and try next fallback
          }
        }

        // Do not use appointments fallback; only patients who explicitly added this expert should be listed

        console.log('[ExpertPatients] final mapped length:', (mapped || []).length);
        setPatients(mapped || []);
      } catch (e) {
        console.error('Failed to load patients', e);
        // Avoid noisy toasts on authorization-only failures
        setPatients([]);
      } finally {
        setIsLoading(false);
        console.log('[ExpertPatients] load finished');
      }
    };
    load();
  }, [user]);

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'stable':
        return 'bg-green-100 text-green-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'follow-up':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return patients;
    return patients.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.email || '').toLowerCase().includes(q) ||
      (p.condition || '').toLowerCase().includes(q)
    );
  }, [search, patients]);

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 md:p-8 border border-blue-100">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-600 rounded-xl">
              <Users className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">My Patients</h1>
              <p className="text-gray-600 mt-1">
                Manage your patient records and information
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-600">{filtered.length}</div>
            <div className="text-sm text-gray-500">Total Patients</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <Card className="p-4 md:p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search patients by name, email, or condition..."
              className="pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button variant="outline" className="w-full sm:w-auto">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </Card>

      {/* Patients List */}
      {isLoading ? (
        <Card className="border-0 shadow-lg bg-white">
          <div className="text-center py-16">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Loading patients...</h3>
            <p className="text-gray-600">Please wait while we fetch your patient list</p>
          </div>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="border-0 shadow-lg bg-white">
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Users className="h-12 w-12 text-blue-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No patients found</h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              {search ? "No patients match your search criteria. Try adjusting your search terms." : "You don't have any patients yet. Patients will appear here when they add you as their expert."}
            </p>
          </div>
        </Card>
      ) : (
        <>
          {/* Desktop Table View */}
          <Card className="hidden lg:block p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Patient</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Contact</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Age</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Condition</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Last Visit</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-900">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((patient) => (
                    <tr key={patient.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{patient.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{patient.email}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-gray-400" />
                            <span className="text-sm">{patient.phone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-900">{patient.age !== undefined ? `${patient.age} years` : 'N/A'}</span>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-900">{patient.condition || 'No conditions recorded'}</span>
                      </td>
                      <td className="py-4 px-4">
                        <Badge className={getStatusColor(patient.status || 'active')}>
                          {patient.status || 'Active'}
                        </Badge>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-sm text-gray-500">{patient.lastVisit || 'No visits'}</span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => navigate(`/expert/dashboard/patient/${patient.id}`)}
                            className="flex items-center space-x-1"
                          >
                            <Eye className="h-4 w-4" />
                            <span>View Details</span>
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile Card View */}
          <div className="lg:hidden space-y-4">
            {filtered.map((patient) => (
              <Card key={patient.id} className="p-4 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-md">
                      {patient.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{patient.name}</h3>
                      <p className="text-sm text-gray-500">{patient.age !== undefined ? `${patient.age} years old` : 'Age not specified'}</p>
                    </div>
                  </div>
                  <Badge className={getStatusColor(patient.status || 'active')}>
                    {patient.status || 'Active'}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {/* Contact Info */}
                  <div className="grid grid-cols-1 gap-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Mail className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{patient.email}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-gray-600">{patient.phone}</span>
                    </div>
                  </div>

                  {/* Condition */}
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1">Condition</p>
                    <p className="text-sm text-gray-900">{patient.condition || 'No conditions recorded'}</p>
                  </div>

                  {/* Last Visit */}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Last Visit:</span>
                    <span className="text-gray-900">{patient.lastVisit || 'No visits'}</span>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => navigate(`/expert/dashboard/patient/${patient.id}`)}
                      className="flex-1 flex items-center justify-center space-x-1"
                    >
                      <Eye className="h-4 w-4" />
                      <span>View Details</span>
                    </Button>
                    <Button variant="ghost" size="sm" className="px-3">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Add Patient Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Patient</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstName">First Name</Label>
                <Input id="firstName" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="lastName">Last Name</Label>
                <Input id="lastName" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email (optional)</Label>
                <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="phone">Phone (optional)</Label>
                <Input id="phone" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
              </div>
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Input id="gender" placeholder="e.g., male/female/other" value={form.gender} onChange={(e) => setForm({ ...form, gender: e.target.value })} />
              </div>
            </div>
            <div>
              <Label htmlFor="condition">Primary Condition (optional)</Label>
              <Input id="condition" value={form.condition} onChange={(e) => setForm({ ...form, condition: e.target.value })} />
            </div>
            <div>
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" rows={3} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </div>
            <div className="flex gap-2">
              <Button
                className="flex-1"
                disabled={isSaving || !form.firstName || !form.lastName}
                onClick={async () => {
                  if (!user) return;
                  setIsSaving(true);
                  try {
                    // ensure expert id
                    let resolved = expertId;
                    if (!resolved) {
                      const expertsRes = await client.graphql({
                        query: listExperts,
                        variables: { filter: { userId: { eq: user.id } }, limit: 1 }
                      });
                      const expert = (expertsRes as any).data?.listExperts?.items?.[0];
                      resolved = expert?.id || null;
                      setExpertId(resolved);
                    }
                    if (!resolved) {
                      toast.error('Expert profile not found');
                      setIsSaving(false);
                      return;
                    }
                    // Generate a deterministic client id if backend doesn't assign one
                    const generatedId = `patient_${resolved}_${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
                    const input: any = {
                      id: generatedId,
                      expertId: resolved,
                      firstName: form.firstName,
                      lastName: form.lastName,
                      email: form.email || undefined,
                      phoneNumber: form.phoneNumber || undefined,
                      dateOfBirth: form.dateOfBirth || undefined,
                      gender: form.gender || undefined,
                      medicalHistory: form.condition || undefined,
                      notes: form.notes || undefined
                    };
                    const res = await client.graphql({
                      // Use minimal mutation to avoid resolving nested expert field under userPool auth
                      query: CREATE_PATIENT_RECORD_MIN as any,
                      variables: { input },
                      authMode: 'userPool'
                    });
                    const created = (res as any).data?.createPatientRecord;
                    if (created) {
                      const createdId = created.id || generatedId;
                      const age = created.dateOfBirth ? (new Date().getFullYear() - new Date(created.dateOfBirth).getFullYear()) : undefined;
                      setPatients(prev => ([
                        ...prev,
                        {
                          id: createdId,
                          name: [created.firstName, created.lastName].filter(Boolean).join(' ') || 'Unknown',
                          email: created.email,
                          phone: created.phoneNumber,
                          age,
                          condition: Array.isArray(created.medicalHistory) ? created.medicalHistory[0] : created.medicalHistory,
                          status: 'Active',
                          lastVisit: created.createdAt ? String(created.createdAt).split('T')[0] : undefined
                        }
                      ]));
                      toast.success('Patient added');
                      setAddOpen(false);
                      setForm({ firstName: '', lastName: '', email: '', phoneNumber: '', dateOfBirth: '', gender: '', condition: '', notes: '' });
                    } else {
                      toast.error('Failed to add patient');
                    }
                  } catch (e: any) {
                    const msg = e?.errors?.[0]?.message || e?.message || 'Failed to add patient';
                    toast.error(msg);
                  } finally {
                    setIsSaving(false);
                  }
                }}
              >
                {isSaving ? 'Saving...' : 'Save Patient'}
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setAddOpen(false)}>Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
} 