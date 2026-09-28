import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

dotenv.config();

// Interfaces matching Supabase PostgreSQL Schema
export interface User {
  id: string;
  full_name: string;
  email: string;
  password_hash: string;
  role: 'patient' | 'doctor' | 'admin';
  phone?: string;
  gender?: string;
  date_of_birth?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  appointment_date: string;
  appointment_time: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  reason?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
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
}

export interface ProgressRecord {
  id: string;
  patient_id: string;
  doctor_id: string;
  consultation_id?: string;
  appointment_id?: string;
  review_date: string;
  weight?: number; // kg
  height?: number; // m or cm
  bmi?: number;
  heart_rate?: number; // bpm
  systolic_bp?: number; // mmHg
  diastolic_bp?: number; // mmHg
  blood_sugar?: number; // mg/dL
  temperature?: number; // °F
  oxygen_saturation?: number; // %
  progress_status: 'Improving' | 'Stable' | 'Needs Attention' | 'Worsening';
  symptoms_status?: string;
  treatment_adherence?: string;
  patient_reported_improvement?: string;
  doctor_progress_notes?: string;
  follow_up_date?: string;
  created_at: string;
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

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  link?: string;
  created_at: string;
}

// Optional live Supabase Client
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || '';

export const supabase: SupabaseClient | null =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

// Built-in Database Data Store with UUID support and relational consistency
class RelationalDatabaseStore {
  users: User[] = [];
  patient_profiles: PatientProfile[] = [];
  doctor_profiles: DoctorProfile[] = [];
  appointments: Appointment[] = [];
  consultations: Consultation[] = [];
  prescriptions: Prescription[] = [];
  prescription_items: PrescriptionItem[] = [];
  progress_records: ProgressRecord[] = [];
  medical_records: MedicalRecord[] = [];
  notifications: Notification[] = [];

  constructor() {
    this.seedInitialData();
  }

  generateUUID(): string {
    return crypto.randomUUID();
  }

  private seedInitialData() {
    // Hash for 'Password123!'
    const defaultPasswordHash = bcrypt.hashSync('Password123!', 10);

    const adminId = 'a0000000-0000-0000-0000-000000000001';
    const doctor1Id = 'd0000000-0000-0000-0000-000000000001';
    const doctor2Id = 'd0000000-0000-0000-0000-000000000002';
    const patient1Id = 'p0000000-0000-0000-0000-000000000001';

    // Users
    this.users.push(
      {
        id: adminId,
        full_name: 'System Administrator',
        email: 'admin@medivault.com',
        password_hash: defaultPasswordHash,
        role: 'admin',
        phone: '+1-555-0100',
        gender: 'other',
        date_of_birth: '1985-05-15',
        is_active: true,
        created_at: '2026-07-01T00:00:00Z',
        updated_at: '2026-07-01T00:00:00Z',
      },
      {
        id: doctor1Id,
        full_name: 'Dr. Sarah Jenkins, MD',
        email: 'doctor@medivault.com',
        password_hash: defaultPasswordHash,
        role: 'doctor',
        phone: '+1-555-0201',
        gender: 'female',
        date_of_birth: '1980-11-20',
        is_active: true,
        created_at: '2026-07-05T00:00:00Z',
        updated_at: '2026-07-05T00:00:00Z',
      },
      {
        id: doctor2Id,
        full_name: 'Dr. Marcus Vance, MD',
        email: 'marcus.vance@medivault.com',
        password_hash: defaultPasswordHash,
        role: 'doctor',
        phone: '+1-555-0202',
        gender: 'male',
        date_of_birth: '1976-03-12',
        is_active: true,
        created_at: '2026-07-10T00:00:00Z',
        updated_at: '2026-07-10T00:00:00Z',
      },
      {
        id: patient1Id,
        full_name: 'Alex Mercer',
        email: 'patient@medivault.com',
        password_hash: defaultPasswordHash,
        role: 'patient',
        phone: '+1-555-0301',
        gender: 'male',
        date_of_birth: '1992-08-14',
        is_active: true,
        created_at: '2026-07-20T00:00:00Z',
        updated_at: '2026-07-20T00:00:00Z',
      }
    );

    // Patient Profile
    this.patient_profiles.push({
      id: 'pf000000-0000-0000-0000-000000000001',
      user_id: patient1Id,
      blood_group: 'O+',
      allergies: 'Penicillin, Shellfish',
      existing_conditions: 'Hypertension (stage 1), Mild Hyperglycemia',
      address: '412 Oakwood Lane, Seattle, WA',
      emergency_contact: 'Emily Mercer (Spouse) - +1-555-0399',
      profile_image: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300',
      created_at: '2026-07-20T00:00:00Z',
      updated_at: '2026-07-20T00:00:00Z',
    });

    // Doctor Profiles
    this.doctor_profiles.push(
      {
        id: 'df000000-0000-0000-0000-000000000001',
        user_id: doctor1Id,
        specialization: 'Cardiology & Internal Medicine',
        qualification: 'MBBS, MD (Cardiology), FACC',
        experience: 14,
        license_number: 'MED-LIC-84920',
        hospital: 'Metro Health Medical Center',
        address: '742 Evergreen Terrace, Suite 400',
        profile_image: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300',
        created_at: '2026-07-05T00:00:00Z',
        updated_at: '2026-07-05T00:00:00Z',
      },
      {
        id: 'df000000-0000-0000-0000-000000000002',
        user_id: doctor2Id,
        specialization: 'Endocrinology & Metabolic Care',
        qualification: 'MBBS, MD, FACE',
        experience: 18,
        license_number: 'MED-LIC-99124',
        hospital: 'Apex University Hospital',
        address: '100 Innovation Blvd, Floor 6',
        profile_image: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300',
        created_at: '2026-07-10T00:00:00Z',
        updated_at: '2026-07-10T00:00:00Z',
      }
    );

    // Appointments
    this.appointments.push(
      {
        id: 'ap000000-0000-0000-0000-000000000001',
        patient_id: patient1Id,
        doctor_id: doctor1Id,
        appointment_date: '2026-08-01',
        appointment_time: '09:00 AM',
        status: 'completed',
        reason: 'Initial cardiovascular checkup and recurrent dizziness',
        notes: 'Complaining of morning headaches and elevated blood pressure.',
        created_at: '2026-07-28T10:00:00Z',
        updated_at: '2026-08-01T10:00:00Z',
      },
      {
        id: 'ap000000-0000-0000-0000-000000000002',
        patient_id: patient1Id,
        doctor_id: doctor1Id,
        appointment_date: '2026-08-15',
        appointment_time: '10:30 AM',
        status: 'completed',
        reason: 'Two-week hypertension follow-up',
        notes: 'Assessing reaction to antihypertensive medication.',
        created_at: '2026-08-05T10:00:00Z',
        updated_at: '2026-08-15T11:15:00Z',
      },
      {
        id: 'ap000000-0000-0000-0000-000000000003',
        patient_id: patient1Id,
        doctor_id: doctor1Id,
        appointment_date: '2026-08-29',
        appointment_time: '11:00 AM',
        status: 'completed',
        reason: 'Monthly lifestyle & diet evaluation',
        notes: 'Patient started aerobic walking routine.',
        created_at: '2026-08-18T10:00:00Z',
        updated_at: '2026-08-29T11:45:00Z',
      },
      {
        id: 'ap000000-0000-0000-0000-000000000004',
        patient_id: patient1Id,
        doctor_id: doctor1Id,
        appointment_date: '2026-09-12',
        appointment_time: '09:30 AM',
        status: 'completed',
        reason: 'Bi-weekly routine clinical review',
        notes: 'Good recovery pattern. BP normalising.',
        created_at: '2026-09-01T10:00:00Z',
        updated_at: '2026-09-12T10:30:00Z',
      },
      {
        id: 'ap000000-0000-0000-0000-000000000005',
        patient_id: patient1Id,
        doctor_id: doctor1Id,
        appointment_date: '2026-09-24',
        appointment_time: '10:00 AM',
        status: 'confirmed',
        reason: 'Comprehensive Progress Evaluation & Lab Review',
        notes: 'Upcoming visit to consolidate lifestyle milestones.',
        created_at: '2026-09-15T10:00:00Z',
        updated_at: '2026-09-15T10:00:00Z',
      },
      {
        id: 'ap000000-0000-0000-0000-000000000006',
        patient_id: patient1Id,
        doctor_id: doctor2Id,
        appointment_date: '2026-10-05',
        appointment_time: '02:00 PM',
        status: 'pending',
        reason: 'Endocrine & Metabolic Consult for HbA1c review',
        notes: 'Annual metabolic checkup.',
        created_at: '2026-09-20T10:00:00Z',
        updated_at: '2026-09-20T10:00:00Z',
      }
    );

    // Consultations
    this.consultations.push(
      {
        id: 'cn000000-0000-0000-0000-000000000001',
        appointment_id: 'ap000000-0000-0000-0000-000000000001',
        patient_id: patient1Id,
        doctor_id: doctor1Id,
        consultation_date: '2026-08-01T09:30:00Z',
        symptoms: 'Occasional morning headaches, palpitations after climbing stairs.',
        observations: 'High systolic pressure detected. Mild peripheral vascular resistance.',
        diagnosis: 'Stage 1 Essential Hypertension, Overweight',
        doctor_notes: 'Initiate dietary sodium restriction (<2000mg/day) and low-dose Amlodipine.',
        follow_up_date: '2026-08-15',
        status: 'completed',
        created_at: '2026-08-01T09:45:00Z',
        updated_at: '2026-08-01T09:45:00Z',
      },
      {
        id: 'cn000000-0000-0000-0000-000000000002',
        appointment_id: 'ap000000-0000-0000-0000-000000000002',
        patient_id: patient1Id,
        doctor_id: doctor1Id,
        consultation_date: '2026-08-15T11:00:00Z',
        symptoms: 'Fewer headaches. Mild afternoon fatigue.',
        observations: 'Blood pressure slightly reduced from baseline. Medication tolerated well.',
        diagnosis: 'Controlled Hypertension, Improving',
        doctor_notes: 'Continue current regimen. Added daily 30-min walking routine.',
        follow_up_date: '2026-08-29',
        status: 'completed',
        created_at: '2026-08-15T11:15:00Z',
        updated_at: '2026-08-15T11:15:00Z',
      },
      {
        id: 'cn000000-0000-0000-0000-000000000003',
        appointment_id: 'ap000000-0000-0000-0000-000000000003',
        patient_id: patient1Id,
        doctor_id: doctor1Id,
        consultation_date: '2026-08-29T11:30:00Z',
        symptoms: 'Patient feels energetic, no headaches for past 10 days.',
        observations: 'Heart sounds clear, resting pulse stable, weight trending down.',
        diagnosis: 'Hypertension under good management',
        doctor_notes: 'Patient reports high adherence to walking and nutrition plan.',
        follow_up_date: '2026-09-12',
        status: 'completed',
        created_at: '2026-08-29T11:45:00Z',
        updated_at: '2026-08-29T11:45:00Z',
      },
      {
        id: 'cn000000-0000-0000-0000-000000000004',
        appointment_id: 'ap000000-0000-0000-0000-000000000004',
        patient_id: patient1Id,
        doctor_id: doctor1Id,
        consultation_date: '2026-09-12T10:00:00Z',
        symptoms: 'Feeling completely asymptomatic, good stamina and sleep.',
        observations: 'Normal resting pulse, optimal respiratory rhythm, blood glucose normalized.',
        diagnosis: 'Controlled Hypertension & Metabolic Stability',
        doctor_notes: 'Maintain healthy nutrition. Consider stepping down medication at next milestone.',
        follow_up_date: '2026-09-24',
        status: 'completed',
        created_at: '2026-09-12T10:15:00Z',
        updated_at: '2026-09-12T10:15:00Z',
      }
    );

    // Prescriptions
    this.prescriptions.push(
      {
        id: 'pr000000-0000-0000-0000-000000000001',
        consultation_id: 'cn000000-0000-0000-0000-000000000001',
        patient_id: patient1Id,
        doctor_id: doctor1Id,
        diagnosis: 'Stage 1 Essential Hypertension',
        instructions: 'Take medications strictly after breakfast. Record blood pressure log daily.',
        created_at: '2026-08-01T09:45:00Z',
      },
      {
        id: 'pr000000-0000-0000-0000-000000000002',
        consultation_id: 'cn000000-0000-0000-0000-000000000004',
        patient_id: patient1Id,
        doctor_id: doctor1Id,
        diagnosis: 'Controlled Hypertension & Metabolic Stability',
        instructions: 'Maintenance therapy. Daily hydration (2.5L) and 30 mins brisk walking.',
        created_at: '2026-09-12T10:15:00Z',
      }
    );

    // Prescription Items
    this.prescription_items.push(
      {
        id: 'pi000000-0000-0000-0000-000000000001',
        prescription_id: 'pr000000-0000-0000-0000-000000000001',
        medicine_name: 'Amlodipine Besylate',
        dosage: '5mg',
        frequency: 'Once daily',
        duration: '30 days',
        instructions: 'Take in morning with a full glass of water.',
      },
      {
        id: 'pi000000-0000-0000-0000-000000000002',
        prescription_id: 'pr000000-0000-0000-0000-000000000001',
        medicine_name: 'Omega-3 Fish Oil',
        dosage: '1000mg',
        frequency: 'Once daily',
        duration: '60 days',
        instructions: 'Take with evening meal.',
      },
      {
        id: 'pi000000-0000-0000-0000-000000000003',
        prescription_id: 'pr000000-0000-0000-0000-000000000002',
        medicine_name: 'Amlodipine Besylate',
        dosage: '2.5mg',
        frequency: 'Once daily',
        duration: '90 days',
        instructions: 'Reduced dosage as BP has reached optimal target range.',
      },
      {
        id: 'pi000000-0000-0000-0000-000000000004',
        prescription_id: 'pr000000-0000-0000-0000-000000000002',
        medicine_name: 'CoQ10 Cardiovascular Support',
        dosage: '100mg',
        frequency: 'Once daily',
        duration: '60 days',
        instructions: 'Take after breakfast.',
      }
    );

    // 5 HISTORICAL PROGRESS RECORDS (EXACT DEMO SPECIFICATION)
    // Review 1: Weight 78 kg, BP 140/90, Heart Rate 92, Blood Sugar 145, Needs Attention
    // Review 2: Weight 76 kg, BP 135/87, Heart Rate 88, Blood Sugar 138, Stable
    // Review 3: Weight 75 kg, BP 130/84, Heart Rate 84, Blood Sugar 130, Improving
    // Review 4: Weight 73 kg, BP 125/82, Heart Rate 80, Blood Sugar 122, Improving
    // Review 5: Weight 72 kg, BP 120/80, Heart Rate 76, Blood Sugar 115, Improving
    this.progress_records.push(
      {
        id: 'pg000000-0000-0000-0000-000000000001',
        patient_id: patient1Id,
        doctor_id: doctor1Id,
        consultation_id: 'cn000000-0000-0000-0000-000000000001',
        appointment_id: 'ap000000-0000-0000-0000-000000000001',
        review_date: '2026-08-01T10:00:00Z',
        weight: 78.0,
        height: 1.75,
        bmi: 25.5,
        heart_rate: 92,
        systolic_bp: 140,
        diastolic_bp: 90,
        blood_sugar: 145.0,
        temperature: 98.6,
        oxygen_saturation: 97.0,
        progress_status: 'Needs Attention',
        symptoms_status: 'Frequent morning headaches, mild dizziness when transitioning to standing.',
        treatment_adherence: 'Just initiating prescribed regimen.',
        patient_reported_improvement: 'Feeling anxious about high blood pressure numbers.',
        doctor_progress_notes: 'Baseline evaluation. Initiated Amlodipine 5mg and sodium restriction below 2000mg/day.',
        follow_up_date: '2026-08-15',
        created_at: '2026-08-01T10:00:00Z',
      },
      {
        id: 'pg000000-0000-0000-0000-000000000002',
        patient_id: patient1Id,
        doctor_id: doctor1Id,
        consultation_id: 'cn000000-0000-0000-0000-000000000002',
        appointment_id: 'ap000000-0000-0000-0000-000000000002',
        review_date: '2026-08-15T11:15:00Z',
        weight: 76.0,
        height: 1.75,
        bmi: 24.8,
        heart_rate: 88,
        systolic_bp: 135,
        diastolic_bp: 87,
        blood_sugar: 138.0,
        temperature: 98.4,
        oxygen_saturation: 98.0,
        progress_status: 'Stable',
        symptoms_status: 'Headaches diminished in frequency. Sleep has improved noticeably.',
        treatment_adherence: '100% medication compliance. Patient logged blood pressure twice daily.',
        patient_reported_improvement: 'Noticed less fatigue after climbing stairs.',
        doctor_progress_notes: 'Weight reduced by 2kg through dietary changes. Blood pressure stabilizing.',
        follow_up_date: '2026-08-29',
        created_at: '2026-08-15T11:15:00Z',
      },
      {
        id: 'pg000000-0000-0000-0000-000000000003',
        patient_id: patient1Id,
        doctor_id: doctor1Id,
        consultation_id: 'cn000000-0000-0000-0000-000000000003',
        appointment_id: 'ap000000-0000-0000-0000-000000000003',
        review_date: '2026-08-29T11:45:00Z',
        weight: 75.0,
        height: 1.75,
        bmi: 24.5,
        heart_rate: 84,
        systolic_bp: 130,
        diastolic_bp: 84,
        blood_sugar: 130.0,
        temperature: 98.5,
        oxygen_saturation: 98.5,
        progress_status: 'Improving',
        symptoms_status: 'No headaches reported in past 10 days. Good cardiovascular stamina.',
        treatment_adherence: 'Excellent adherence to both pharmacological and non-pharmacological directives.',
        patient_reported_improvement: 'Reports significantly better focus and restful sleep.',
        doctor_progress_notes: 'Vascular resistance decreasing. Patient is walking 8,000 steps daily.',
        follow_up_date: '2026-09-12',
        created_at: '2026-08-29T11:45:00Z',
      },
      {
        id: 'pg000000-0000-0000-0000-000000000004',
        patient_id: patient1Id,
        doctor_id: doctor1Id,
        consultation_id: 'cn000000-0000-0000-0000-000000000004',
        appointment_id: 'ap000000-0000-0000-0000-000000000004',
        review_date: '2026-09-12T10:30:00Z',
        weight: 73.0,
        height: 1.75,
        bmi: 23.8,
        heart_rate: 80,
        systolic_bp: 125,
        diastolic_bp: 82,
        blood_sugar: 122.0,
        temperature: 98.3,
        oxygen_saturation: 99.0,
        progress_status: 'Improving',
        symptoms_status: 'Completely asymptomatic. Heart rate and blood sugar trending into optimal range.',
        treatment_adherence: 'Consistent compliance without side effects.',
        patient_reported_improvement: 'Reports feeling energized throughout the day.',
        doctor_progress_notes: 'Systolic/Diastolic reading near normal target. BMI dropped from 25.5 to 23.8.',
        follow_up_date: '2026-09-24',
        created_at: '2026-09-12T10:30:00Z',
      },
      {
        id: 'pg000000-0000-0000-0000-000000000005',
        patient_id: patient1Id,
        doctor_id: doctor1Id,
        consultation_id: undefined,
        appointment_id: 'ap000000-0000-0000-0000-000000000005',
        review_date: '2026-09-24T10:30:00Z',
        weight: 72.0,
        height: 1.75,
        bmi: 23.5,
        heart_rate: 76,
        systolic_bp: 120,
        diastolic_bp: 80,
        blood_sugar: 115.0,
        temperature: 98.4,
        oxygen_saturation: 99.0,
        progress_status: 'Improving',
        symptoms_status: 'No symptoms. Blood pressure at perfect 120/80 target, resting HR down to 76 bpm.',
        treatment_adherence: 'Fully committed to lifestyle modifications and prescribed supplements.',
        patient_reported_improvement: 'Patient feels healthier than anytime in the past 5 years.',
        doctor_progress_notes: 'Outstanding progress. Down 6kg total from initial visit. Reduced Amlodipine dosage to 2.5mg maintenance.',
        follow_up_date: '2026-10-08',
        created_at: '2026-09-24T10:30:00Z',
      }
    );

    // Medical records
    this.medical_records.push(
      {
        id: 'mr000000-0000-0000-0000-000000000001',
        patient_id: patient1Id,
        doctor_id: doctor1Id,
        record_type: 'Lab Report',
        title: 'Comprehensive Metabolic Panel & Lipid Profile',
        description: 'Fasting glucose: 115 mg/dL. Total cholesterol: 185 mg/dL. HDL: 52 mg/dL. LDL: 110 mg/dL.',
        record_date: '2026-08-01',
        file_url: 'https://example.com/reports/cmp-alex-mercer.pdf',
        created_at: '2026-08-01T12:00:00Z',
      },
      {
        id: 'mr000000-0000-0000-0000-000000000002',
        patient_id: patient1Id,
        doctor_id: doctor1Id,
        record_type: 'Clinical Note',
        title: '12-Lead Resting Electrocardiogram (ECG)',
        description: 'Normal sinus rhythm, heart rate 80 bpm, no acute ST-T changes or signs of ischemia.',
        record_date: '2026-08-29',
        file_url: 'https://example.com/reports/ecg-alex-mercer.pdf',
        created_at: '2026-08-29T12:00:00Z',
      }
    );

    // Notifications
    this.notifications.push(
      {
        id: 'nt000000-0000-0000-0000-000000000001',
        user_id: patient1Id,
        title: 'Doctor Review Completed',
        message: 'Dr. Sarah Jenkins has published your latest health progress assessment.',
        type: 'review_completed',
        is_read: false,
        link: '/patient/progress',
        created_at: '2026-09-24T10:35:00Z',
      },
      {
        id: 'nt000000-0000-0000-0000-000000000002',
        user_id: patient1Id,
        title: 'New Prescription Available',
        message: 'Prescription for Amlodipine Besylate (2.5mg) is ready for download.',
        type: 'prescription_created',
        is_read: false,
        link: '/patient/prescriptions',
        created_at: '2026-09-12T10:18:00Z',
      },
      {
        id: 'nt000000-0000-0000-0000-000000000003',
        user_id: patient1Id,
        title: 'Upcoming Follow-up Scheduled',
        message: 'Your next cardiovascular review is scheduled for October 08, 2026.',
        type: 'follow_up',
        is_read: true,
        link: '/patient/appointments',
        created_at: '2026-09-24T10:36:00Z',
      },
      {
        id: 'nt000000-0000-0000-0000-000000000004',
        user_id: doctor1Id,
        title: 'New Appointment Booked',
        message: 'Alex Mercer booked an appointment for September 24 at 10:00 AM.',
        type: 'appointment_booked',
        is_read: false,
        link: '/doctor/appointments',
        created_at: '2026-09-15T10:01:00Z',
      }
    );
  }
}

export const db = new RelationalDatabaseStore();
