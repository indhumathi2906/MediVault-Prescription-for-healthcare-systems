export type UserRole = 'patient' | 'doctor' | 'admin';

export interface User {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  phone?: string;
  gender?: string;
  date_of_birth?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  profile?: PatientProfile | DoctorProfile | null;
}

export interface PatientProfile {
  id: string;
  user_id: string;
  blood_group?: string;
  allergies?: string;
  existing_conditions?: string;
  address?: string;
  emergency_contact?: string;
  profile_image?: string;
  created_at: string;
  updated_at: string;
}

export interface DoctorProfile {
  id: string;
  user_id: string;
  specialization: string;
  qualification: string;
  experience: number;
  license_number: string;
  hospital?: string;
  address?: string;
  profile_image?: string;
  created_at: string;
  updated_at: string;
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  status: AppointmentStatus;
  reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  patient_name?: string;
  patient_email?: string;
  patient_phone?: string;
  doctor_name?: string;
  doctor_specialization?: string;
  doctor_hospital?: string;
}

export interface Consultation {
  id: string;
  appointment_id?: string;
  patient_id: string;
  doctor_id: string;
  consultation_date: string;
  symptoms?: string;
  observations?: string;
  diagnosis: string;
  doctor_notes?: string;
  follow_up_date?: string;
  status: string;
  created_at: string;
  updated_at: string;
  doctor_name?: string;
  doctor_specialization?: string;
  prescription?: Prescription | null;
}

export interface PrescriptionItem {
  id: string;
  prescription_id: string;
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
}

export interface Prescription {
  id: string;
  consultation_id?: string;
  patient_id: string;
  doctor_id: string;
  diagnosis?: string;
  instructions?: string;
  created_at: string;
  items?: PrescriptionItem[];
  doctor_name?: string;
  doctor_specialization?: string;
  doctor_hospital?: string;
  doctor_license?: string;
}

export type ProgressStatus = 'Improving' | 'Stable' | 'Needs Attention' | 'Worsening';

export interface ProgressRecord {
  id: string;
  patient_id: string;
  doctor_id: string;
  consultation_id?: string;
  appointment_id?: string;
  review_date: string;
  weight?: number;
  height?: number;
  bmi?: number;
  heart_rate?: number;
  systolic_bp?: number;
  diastolic_bp?: number;
  blood_sugar?: number;
  temperature?: number;
  oxygen_saturation?: number;
  progress_status: ProgressStatus;
  symptoms_status?: string;
  treatment_adherence?: string;
  patient_reported_improvement?: string;
  doctor_progress_notes?: string;
  follow_up_date?: string;
  created_at: string;
  doctor_name?: string;
  doctor_specialization?: string;
  patient_name?: string;
}

export interface MetricComparison {
  metric: string;
  unit: string;
  current: number | null;
  previous: number | null;
  change: number | null;
  direction: 'improved' | 'declined' | 'stable' | 'neutral';
  formatted: string;
}

export interface ProgressSummary {
  totalReviews: number;
  latestReviewDate: string | null;
  currentStatus: string;
  nextFollowUp: string | null;
  latestDoctorName: string | null;
  latestRecord: ProgressRecord | null;
  previousRecord: ProgressRecord | null;
  comparisons: MetricComparison[];
}

export interface ChartMetricPoint {
  id: string;
  reviewNumber: string;
  reviewDate: string;
  fullDate: string;
  weight: number | null;
  bmi: number | null;
  heart_rate: number | null;
  systolic_bp: number | null;
  diastolic_bp: number | null;
  blood_sugar: number | null;
  temperature: number | null;
  oxygen_saturation: number | null;
  progress_status: ProgressStatus;
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  doctor_id?: string;
  record_type: string;
  title: string;
  description?: string;
  record_date: string;
  file_url?: string;
  created_at: string;
}

export interface AppNotification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link?: string;
  created_at: string;
}
