-- ========================================================
-- MEDIVAULT: A CENTRALIZED DIGITAL HEALTHCARE MANAGEMENT SYSTEM
-- Supabase PostgreSQL Schema with Row Level Security & Indexes
-- ========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ========================================================
-- 1. ENUMS & DOMAINS
-- ========================================================
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('patient', 'doctor', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE appointment_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE progress_status_type AS ENUM ('Improving', 'Stable', 'Needs Attention', 'Worsening');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ========================================================
-- 2. USERS TABLE
-- ========================================================
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('patient', 'doctor', 'admin')),
    phone VARCHAR(50),
    gender VARCHAR(20),
    date_of_birth DATE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ========================================================
-- 3. PATIENT PROFILES
-- ========================================================
CREATE TABLE IF NOT EXISTS patient_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    blood_group VARCHAR(10),
    allergies TEXT,
    existing_conditions TEXT,
    address TEXT,
    emergency_contact VARCHAR(100),
    profile_image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_patient_profiles_user ON patient_profiles(user_id);

-- ========================================================
-- 4. DOCTOR PROFILES
-- ========================================================
CREATE TABLE IF NOT EXISTS doctor_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialization VARCHAR(255) NOT NULL,
    qualification VARCHAR(255) NOT NULL,
    experience INTEGER DEFAULT 1,
    license_number VARCHAR(100) NOT NULL,
    hospital VARCHAR(255),
    address TEXT,
    profile_image TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_doctor_profiles_user ON doctor_profiles(user_id);

-- ========================================================
-- 5. APPOINTMENTS
-- ========================================================
CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    appointment_time VARCHAR(20) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    reason TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_doctor_timeslot UNIQUE(doctor_id, appointment_date, appointment_time)
);

CREATE INDEX IF NOT EXISTS idx_appointments_patient ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- ========================================================
-- 6. CONSULTATIONS
-- ========================================================
CREATE TABLE IF NOT EXISTS consultations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    consultation_date TIMESTAMPTZ DEFAULT NOW(),
    symptoms TEXT,
    observations TEXT,
    diagnosis TEXT NOT NULL,
    doctor_notes TEXT,
    follow_up_date DATE,
    status VARCHAR(50) DEFAULT 'completed',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_consultations_patient ON consultations(patient_id);
CREATE INDEX IF NOT EXISTS idx_consultations_doctor ON consultations(doctor_id);
CREATE INDEX IF NOT EXISTS idx_consultations_appointment ON consultations(appointment_id);

-- ========================================================
-- 7. PRESCRIPTIONS
-- ========================================================
CREATE TABLE IF NOT EXISTS prescriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    diagnosis TEXT,
    instructions TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_prescriptions_patient ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_consultation ON prescriptions(consultation_id);

-- ========================================================
-- 8. PRESCRIPTION ITEMS
-- ========================================================
CREATE TABLE IF NOT EXISTS prescription_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    medicine_name VARCHAR(255) NOT NULL,
    dosage VARCHAR(100) NOT NULL,
    frequency VARCHAR(100) NOT NULL,
    duration VARCHAR(100) NOT NULL,
    instructions TEXT
);

CREATE INDEX IF NOT EXISTS idx_prescription_items_prescription ON prescription_items(prescription_id);

-- ========================================================
-- 9. PATIENT HEALTH PROGRESS RECORDS (KEY FEATURE: APPEND-ONLY)
-- ========================================================
CREATE TABLE IF NOT EXISTS progress_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    consultation_id UUID REFERENCES consultations(id) ON DELETE SET NULL,
    appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
    review_date TIMESTAMPTZ DEFAULT NOW(),
    weight NUMERIC(5,2),             -- in kg
    height NUMERIC(5,2),             -- in cm or m
    bmi NUMERIC(4,1),                -- kg/m^2
    heart_rate INTEGER,              -- bpm
    systolic_bp INTEGER,             -- mmHg
    diastolic_bp INTEGER,            -- mmHg
    blood_sugar NUMERIC(5,1),        -- mg/dL
    temperature NUMERIC(4,1),        -- °C or °F
    oxygen_saturation NUMERIC(4,1),  -- %
    progress_status VARCHAR(50) NOT NULL CHECK (progress_status IN ('Improving', 'Stable', 'Needs Attention', 'Worsening')),
    symptoms_status TEXT,
    treatment_adherence TEXT,
    patient_reported_improvement TEXT,
    doctor_progress_notes TEXT,
    follow_up_date DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_progress_records_patient ON progress_records(patient_id);
CREATE INDEX IF NOT EXISTS idx_progress_records_doctor ON progress_records(doctor_id);
CREATE INDEX IF NOT EXISTS idx_progress_records_review_date ON progress_records(review_date);

-- ========================================================
-- 10. MEDICAL RECORDS
-- ========================================================
CREATE TABLE IF NOT EXISTS medical_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    patient_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    doctor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    record_type VARCHAR(100) NOT NULL, -- Lab Report, Imaging, Discharge Summary, Clinical Note
    title VARCHAR(255) NOT NULL,
    description TEXT,
    record_date DATE NOT NULL DEFAULT CURRENT_DATE,
    file_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_medical_records_patient ON medical_records(patient_id);

-- ========================================================
-- 11. NOTIFICATIONS
-- ========================================================
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- appointment_booked, appointment_confirmed, appointment_cancelled, prescription_created, review_completed, follow_up
    is_read BOOLEAN DEFAULT FALSE,
    link VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- ========================================================
-- 12. AUTOMATIC UPDATED_AT TRIGGER
-- ========================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER trigger_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER trigger_patient_profiles_updated_at
BEFORE UPDATE ON patient_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER trigger_doctor_profiles_updated_at
BEFORE UPDATE ON doctor_profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER trigger_appointments_updated_at
BEFORE UPDATE ON appointments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER trigger_consultations_updated_at
BEFORE UPDATE ON consultations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ========================================================
-- 13. ROW LEVEL SECURITY (RLS) POLICIES FOR SUPABASE
-- ========================================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE doctor_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescription_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Backend Service Role Bypass (The Express backend runs with full access)
CREATE POLICY service_role_all_users ON users FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_patient_profiles ON patient_profiles FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_doctor_profiles ON doctor_profiles FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_appointments ON appointments FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_consultations ON consultations FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_prescriptions ON prescriptions FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_prescription_items ON prescription_items FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_progress_records ON progress_records FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_medical_records ON medical_records FOR ALL TO service_role USING (true);
CREATE POLICY service_role_all_notifications ON notifications FOR ALL TO service_role USING (true);
