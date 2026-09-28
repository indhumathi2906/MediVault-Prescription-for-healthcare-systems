import axios from 'axios';
import {
  User,
  Appointment,
  Consultation,
  Prescription,
  ProgressRecord,
  ProgressSummary,
  ChartMetricPoint,
  AppNotification,
} from '../types/index.js';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: attach Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('medivault_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // If unauthorized and not already on login/register page
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        localStorage.removeItem('medivault_token');
        localStorage.removeItem('medivault_user');
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  register: (data: any) => api.post('/auth/register', data),
  getMe: () => api.get<{ success: boolean; user: User }>('/auth/me'),
};

// Patient API
export const patientAPI = {
  getProfile: () => api.get('/patients/profile'),
  updateProfile: (data: any) => api.put('/patients/profile', data),
  getDashboard: () => api.get('/patients/dashboard'),
  getHistory: (patientId?: string) => api.get(`/patients/${patientId || 'me'}/history`),
};

// Doctor API
export const doctorAPI = {
  getDoctors: (params?: { search?: string; specialization?: string }) =>
    api.get<{ success: boolean; data: User[] }>('/doctors', { params }),
  getDoctorById: (id: string) => api.get<{ success: boolean; data: User }>(`/doctors/${id}`),
  getDashboard: () => api.get('/doctors/dashboard'),
  getDoctorPatients: (doctorId: string) => api.get(`/doctors/${doctorId}/patients`),
};

// Appointment API
export const appointmentAPI = {
  createAppointment: (data: {
    doctor_id: string;
    appointment_date: string;
    appointment_time: string;
    reason?: string;
    notes?: string;
  }) => api.post<{ success: boolean; data: Appointment; message: string }>('/appointments', data),
  getAppointments: () => api.get<{ success: boolean; data: Appointment[] }>('/appointments'),
  getAppointmentById: (id: string) => api.get<{ success: boolean; data: Appointment }>(`/appointments/${id}`),
  updateAppointment: (id: string, data: { status?: string; notes?: string; appointment_date?: string; appointment_time?: string }) =>
    api.put<{ success: boolean; data: Appointment }>(`/appointments/${id}`, data),
  cancelAppointment: (id: string) => api.delete(`/appointments/${id}`),
};

// Consultation API
export const consultationAPI = {
  createConsultation: (data: {
    appointment_id?: string;
    patient_id: string;
    symptoms?: string;
    observations?: string;
    diagnosis: string;
    doctor_notes?: string;
    follow_up_date?: string;
  }) => api.post<{ success: boolean; data: Consultation }>('/consultations', data),
  getConsultationsByPatient: (patientId: string) =>
    api.get<{ success: boolean; data: Consultation[] }>(`/consultations/patient/${patientId}`),
  getConsultationById: (id: string) => api.get<{ success: boolean; data: Consultation }>(`/consultations/${id}`),
};

// Prescription API
export const prescriptionAPI = {
  createPrescription: (data: {
    consultation_id?: string;
    patient_id: string;
    diagnosis?: string;
    instructions?: string;
    items: Array<{
      medicine_name: string;
      dosage: string;
      frequency: string;
      duration: string;
      instructions?: string;
    }>;
  }) => api.post<{ success: boolean; data: Prescription }>('/prescriptions', data),
  getPrescriptionsByPatient: (patientId: string) =>
    api.get<{ success: boolean; data: Prescription[] }>(`/prescriptions/patient/${patientId}`),
  getPrescriptionById: (id: string) => api.get<{ success: boolean; data: any }>(`/prescriptions/${id}`),
};

// Progress API (Key Feature)
export const progressAPI = {
  createProgressRecord: (data: {
    patient_id: string;
    consultation_id?: string;
    appointment_id?: string;
    review_date?: string;
    weight?: number;
    height?: number;
    heart_rate?: number;
    systolic_bp?: number;
    diastolic_bp?: number;
    blood_sugar?: number;
    temperature?: number;
    oxygen_saturation?: number;
    progress_status: string;
    symptoms_status?: string;
    treatment_adherence?: string;
    patient_reported_improvement?: string;
    doctor_progress_notes?: string;
    follow_up_date?: string;
  }) => api.post<{ success: boolean; data: ProgressRecord; message: string }>('/progress', data),

  getPatientProgress: (patientId: string) =>
    api.get<{ success: boolean; data: ProgressRecord[] }>(`/progress/patient/${patientId}`),

  getPatientProgressSummary: (patientId: string) =>
    api.get<{ success: boolean; data: ProgressSummary }>(`/progress/patient/${patientId}/summary`),

  getPatientProgressMetrics: (patientId: string) =>
    api.get<{ success: boolean; data: ChartMetricPoint[] }>(`/progress/patient/${patientId}/metrics`),

  getProgressById: (id: string) => api.get<{ success: boolean; data: ProgressRecord }>(`/progress/${id}`),
};

// Admin API
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getUsers: (params?: { role?: string }) => api.get<{ success: boolean; data: User[] }>('/admin/users', { params }),
  updateUserStatus: (id: string, is_active: boolean) =>
    api.put(`/admin/users/${id}/status`, { is_active }),
  toggleUserStatus: (id: string, is_active: boolean) =>
    api.put(`/admin/users/${id}/status`, { is_active }),
  getPatients: () => api.get('/admin/patients'),
  getDoctors: () => api.get('/admin/doctors'),
  getAppointments: () => api.get('/admin/appointments'),
};

// Notification API
export const notificationAPI = {
  getNotifications: () =>
    api.get<{ success: boolean; data: { notifications: AppNotification[]; unreadCount: number } }>('/notifications'),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
};

export default api;
