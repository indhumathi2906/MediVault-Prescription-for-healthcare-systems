import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.js';
import { ThemeProvider } from './context/ThemeContext.js';
import { ProtectedRoute } from './routes/ProtectedRoute.js';

// Layouts
import { PublicLayout } from './layouts/PublicLayout.js';
import { PatientLayout } from './layouts/PatientLayout.js';
import { DoctorLayout } from './layouts/DoctorLayout.js';
import { AdminLayout } from './layouts/AdminLayout.js';

// Public Pages
import { LandingPage } from './pages/public/LandingPage.js';
import { LoginPage } from './pages/public/LoginPage.js';
import { RegisterPage } from './pages/public/RegisterPage.js';

// Patient Pages
import { PatientDashboard } from './pages/patient/PatientDashboard.js';
import { PatientProgressPage } from './pages/patient/PatientProgressPage.js';
import { PatientAppointments } from './pages/patient/PatientAppointments.js';
import { PatientPrescriptions } from './pages/patient/PatientPrescriptions.js';
import { PatientMedicalHistory } from './pages/patient/PatientMedicalHistory.js';
import { PatientProfile } from './pages/patient/PatientProfile.js';

// Doctor Pages
import { DoctorDashboard } from './pages/doctor/DoctorDashboard.js';
import { DoctorAppointments } from './pages/doctor/DoctorAppointments.js';
import { DoctorPatients } from './pages/doctor/DoctorPatients.js';
import { DoctorPatientDetail } from './pages/doctor/DoctorPatientDetail.js';
import { DoctorReviews } from './pages/doctor/DoctorReviews.js';
import { DoctorPrescriptions } from './pages/doctor/DoctorPrescriptions.js';
import { DoctorProfile } from './pages/doctor/DoctorProfile.js';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard.js';
import { AdminUsers } from './pages/admin/AdminUsers.js';
import { AdminPatients } from './pages/admin/AdminPatients.js';
import { AdminDoctors } from './pages/admin/AdminDoctors.js';
import { AdminAppointments } from './pages/admin/AdminAppointments.js';

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
          {/* Public Routes */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
          </Route>

          {/* Patient Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <PatientLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route path="/patient/progress" element={<PatientProgressPage />} />
            <Route path="/patient/appointments" element={<PatientAppointments />} />
            <Route path="/patient/prescriptions" element={<PatientPrescriptions />} />
            <Route path="/patient/medical-history" element={<PatientMedicalHistory />} />
            <Route path="/patient/profile" element={<PatientProfile />} />
          </Route>

          {/* Doctor Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DoctorLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor/appointments" element={<DoctorAppointments />} />
            <Route path="/doctor/patients" element={<DoctorPatients />} />
            <Route path="/doctor/patients/:id" element={<DoctorPatientDetail />} />
            <Route path="/doctor/reviews" element={<DoctorReviews />} />
            <Route path="/doctor/prescriptions" element={<DoctorPrescriptions />} />
            <Route path="/doctor/profile" element={<DoctorProfile />} />
          </Route>

          {/* Admin Routes */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/patients" element={<AdminPatients />} />
            <Route path="/admin/doctors" element={<AdminDoctors />} />
            <Route path="/admin/appointments" element={<AdminAppointments />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
