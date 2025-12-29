import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { XRPLProvider } from "@/contexts/XRPLContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AdminLayout } from "@/components/AdminLayout";

// User pages
import Index from "./pages/Index";
import DietaryPlan from "./pages/DietaryPlan";
import HealthGoals from "./pages/HealthGoals";
import HealthProfile from "./pages/HealthProfile";
import Appointments from "./pages/Appointments";
import FindExpert from "./pages/FindExpert";
import Insurance from "./pages/Insurance";
import Profile from "./pages/Profile";
import FlorencePage from "./pages/Florence";

// Expert portal pages
import ExpertDashboard from "./pages/expert/ExpertDashboard";
import ExpertPatients from "./pages/expert/ExpertPatients";
import PatientDetails from "./pages/expert/PatientDetails";
import ExpertAppointments from "./pages/expert/ExpertAppointments";
import ExpertRecords from "./pages/expert/ExpertRecords";
import ExpertConsultations from "./pages/expert/ExpertConsultations";
import ExpertAnalytics from "./pages/expert/ExpertAnalytics";
import ExpertMessages from "./pages/expert/ExpertMessages";
import ExpertActivity from "./pages/expert/ExpertActivity";
import ExpertFlorence from "./pages/expert/ExpertFlorence";
import ExpertProfileSetup from "./pages/expert/ExpertProfileSetup";
import ExpertProfile from "./pages/expert/ExpertProfile";
import ExpertAvailability from "./pages/expert/ExpertAvailability";
import ExpertDocuments from "./pages/expert/ExpertDocuments";
import ExpertServices from "./pages/expert/ExpertServices";
import ExpertProfileView from "./pages/ExpertProfileView";
import { ExpertLayout } from "./components/expert/ExpertLayout";

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminExpertReview from "./pages/admin/AdminExpertReview";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AppointmentDetail from "./pages/admin/AppointmentDetail";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminAuditTrails from "./pages/admin/AdminAuditTrails";
import AdminExperts from "./pages/admin/AdminExperts";
import AdminFlorence from "./pages/admin/AdminFlorence";

// Error pages
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <NotificationsProvider>
              <XRPLProvider>
                <Routes>
                  {/* Auth Routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />

                  {/* User Routes */}
                  <Route path="/" element={
                    <ProtectedRoute allowedRoles={["user"]}>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<Index />} />
                    <Route path="dietary-plan" element={<DietaryPlan />} />
                    <Route path="health-goals" element={<HealthGoals />} />
                    <Route path="health-profile" element={<HealthProfile />} />
                    <Route path="appointments" element={<Appointments />} />
                    <Route path="find-doctor" element={<FindExpert />} />
                    <Route path="find-expert" element={<FindExpert />} />
                    <Route path="expert/:expertId" element={<FindExpert />} />
                    <Route path="expert-profile/:expertId" element={<ExpertProfileView />} />
                    <Route path="appointments/new" element={<Appointments />} />
                    <Route path="insurance" element={<Insurance />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="florence" element={<FlorencePage />} />
                  </Route>

                  {/* Admin Routes */}
                  <Route path="/admin" element={
                    <ProtectedRoute allowedRoles={["admin"]}>
                      <AdminLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<AdminDashboard />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="experts" element={<AdminExperts />} />
                    <Route path="expert-review" element={<AdminExpertReview />} />
                    <Route path="appointments" element={<AdminAppointments />} />
                    <Route path="appointments/:id" element={<AppointmentDetail />} />
                    <Route path="analytics" element={<AdminAnalytics />} />
                    <Route path="audit-trails" element={<AdminAuditTrails />} />
                    <Route path="florence" element={<AdminFlorence />} />
                    <Route path="settings" element={<AdminSettings />} />
                  </Route>

                  {/* Expert Portal Routes */}
                  <Route path="/expert" element={<Navigate to="/login" replace />} />
                  <Route path="/expert/profile-setup" element={
                    <ProtectedRoute allowedRoles={["expert"]}>
                      <ExpertProfileSetup />
                    </ProtectedRoute>
                  } />
                  <Route path="/expert/dashboard" element={
                    <ProtectedRoute allowedRoles={["expert"]}>
                      <ExpertLayout />
                    </ProtectedRoute>
                  }>
                    <Route index element={<ExpertDashboard />} />
                    <Route path="profile" element={<ExpertProfile />} />
                    <Route path="availability" element={<ExpertAvailability />} />
                    <Route path="documents" element={<ExpertDocuments />} />
                    <Route path="services" element={<ExpertServices />} />
                    <Route path="florence" element={<ExpertFlorence />} />
                    <Route path="patients" element={<ExpertPatients />} />
                    <Route path="patient/:patientId" element={<PatientDetails />} />
                    <Route path="appointments" element={<ExpertAppointments />} />
                    <Route path="records" element={<ExpertRecords />} />
                    <Route path="consultations" element={<ExpertConsultations />} />
                    <Route path="analytics" element={<ExpertAnalytics />} />
                    <Route path="messages" element={<ExpertMessages />} />
                    <Route path="activity" element={<ExpertActivity />} />
                  </Route>

                  {/* 404 Route */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </XRPLProvider>
            </NotificationsProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
