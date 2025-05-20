import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/contexts/AuthContext";
import { XRPLProvider } from "@/contexts/XRPLContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { DashboardLayout } from "@/components/DashboardLayout";
import { AdminLayout } from "@/components/AdminLayout";

// User pages
import Index from "./pages/Index";
import Appointments from "./pages/Appointments";
import FindDoctor from "./pages/FindDoctor";
import Insurance from "./pages/Insurance";
import Profile from "./pages/Profile";

// Auth pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";

// Admin pages
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAppointments from "./pages/admin/AdminAppointments";
import AppointmentDetail from "./pages/admin/AppointmentDetail";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminAuditTrails from "./pages/admin/AdminAuditTrails";

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
                  <Route path="appointments" element={<Appointments />} />
                  <Route path="find-doctor" element={<FindDoctor />} />
                  <Route path="insurance" element={<Insurance />} />
                  <Route path="profile" element={<Profile />} />
                </Route>
                
                {/* Admin Routes */}
                <Route path="/admin" element={
                  <ProtectedRoute allowedRoles={["admin"]}>
                    <AdminLayout />
                  </ProtectedRoute>
                }>
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="appointments" element={<AdminAppointments />} />
                  <Route path="appointments/:id" element={<AppointmentDetail />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="audit-trails" element={<AdminAuditTrails />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
                
                {/* 404 Route */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </XRPLProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
