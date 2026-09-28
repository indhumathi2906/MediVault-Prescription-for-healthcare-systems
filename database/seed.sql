-- ========================================================
-- MEDIVAULT DEMO SEED DATA
-- Default password for all demo users: Password123!
-- Bcrypt hash: $2a$10$w8T0M9w3hCqJ6uI7tN.wteV1m5i2g9tX8qXfM2k7R0kU3eZ6wH6O6
-- ========================================================

-- Insert Demo Users
INSERT INTO users (id, full_name, email, password_hash, role, phone, gender, date_of_birth, is_active)
VALUES
  ('a0000000-0000-0000-0000-000000000001', 'System Administrator', 'admin@medivault.com', '$2a$10$w8T0M9w3hCqJ6uI7tN.wteV1m5i2g9tX8qXfM2k7R0kU3eZ6wH6O6', 'admin', '+1-555-0100', 'other', '1985-05-15', true),
  ('d0000000-0000-0000-0000-000000000001', 'Dr. Sarah Jenkins, MD', 'doctor@medivault.com', '$2a$10$w8T0M9w3hCqJ6uI7tN.wteV1m5i2g9tX8qXfM2k7R0kU3eZ6wH6O6', 'doctor', '+1-555-0201', 'female', '1980-11-20', true),
  ('d0000000-0000-0000-0000-000000000002', 'Dr. Marcus Vance, MD', 'marcus.vance@medivault.com', '$2a$10$w8T0M9w3hCqJ6uI7tN.wteV1m5i2g9tX8qXfM2k7R0kU3eZ6wH6O6', 'doctor', '+1-555-0202', 'male', '1976-03-12', true),
  ('p0000000-0000-0000-0000-000000000001', 'Alex Mercer', 'patient@medivault.com', '$2a$10$w8T0M9w3hCqJ6uI7tN.wteV1m5i2g9tX8qXfM2k7R0kU3eZ6wH6O6', 'patient', '+1-555-0301', 'male', '1992-08-14', true)
ON CONFLICT (email) DO NOTHING;

-- Insert Doctor Profiles
INSERT INTO doctor_profiles (id, user_id, specialization, qualification, experience, license_number, hospital, address, profile_image)
VALUES
  ('df000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Cardiologist & Internal Medicine', 'MBBS, MD (Cardiology), FACC', 14, 'MED-LIC-84920', 'Metro Health Medical Center', '742 Evergreen Terrace, Suite 400', 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&q=80&w=300'),
  ('df000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'Endocrinologist & Metabolic Care', 'MBBS, MD, FACE', 18, 'MED-LIC-99124', 'Apex University Hospital', '100 Innovation Blvd, Floor 6', 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&q=80&w=300')
ON CONFLICT (user_id) DO NOTHING;

-- Insert Patient Profile
INSERT INTO patient_profiles (id, user_id, blood_group, allergies, existing_conditions, address, emergency_contact, profile_image)
VALUES
  ('pf000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'O+', 'Penicillin, Shellfish', 'Hypertension (stage 1), Mild Hyperglycemia', '412 Oakwood Lane, Seattle, WA', 'Emily Mercer (Spouse) - +1-555-0399', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=300')
ON CONFLICT (user_id) DO NOTHING;

-- Insert Appointments
INSERT INTO appointments (id, patient_id, doctor_id, appointment_date, appointment_time, status, reason, notes)
VALUES
  ('ap000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', '2026-08-01', '09:00 AM', 'completed', 'Initial cardiovascular checkup and recurrent dizziness', 'Patient complained of elevated stress and dizziness.'),
  ('ap000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', '2026-08-15', '10:30 AM', 'completed', 'Two-week hypertension follow-up', 'Assessing reaction to antihypertensive medication.'),
  ('ap000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', '2026-08-29', '11:00 AM', 'completed', 'Monthly lifestyle & diet evaluation', 'Patient started aerobic walking routine.'),
  ('ap000000-0000-0000-0000-000000000004', 'p0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', '2026-09-12', '09:30 AM', 'completed', 'Bi-weekly routine clinical review', 'Good recovery pattern.'),
  ('ap000000-0000-0000-0000-000000000005', 'p0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', '2026-09-24', '10:00 AM', 'confirmed', 'Comprehensive Progress Evaluation & Lab Review', 'Upcoming checkup.'),
  ('ap000000-0000-0000-0000-000000000006', 'p0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000002', '2026-10-05', '02:00 PM', 'pending', 'Endocrine & Metabolic Consult for HbA1c review', 'Routine consultation')
ON CONFLICT (id) DO NOTHING;

-- Insert Consultations
INSERT INTO consultations (id, appointment_id, patient_id, doctor_id, consultation_date, symptoms, observations, diagnosis, doctor_notes, follow_up_date, status)
VALUES
  ('cn000000-0000-0000-0000-000000000001', 'ap000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', '2026-08-01 09:30:00+00', 'Occasional morning headaches, palpitations after stairs', 'High systolic pressure detected, anxious state', 'Stage 1 Essential Hypertension, Overweight', 'Start low sodium diet and lifestyle log.', '2026-08-15', 'completed'),
  ('cn000000-0000-0000-0000-000000000002', 'ap000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', '2026-08-15 11:00:00+00', 'Fewer headaches, mild afternoon fatigue', 'BP slightly reduced. Medication tolerated well.', 'Controlled Hypertension, Improving', 'Continue current regimen.', '2026-08-29', 'completed'),
  ('cn000000-0000-0000-0000-000000000003', 'ap000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', '2026-08-29 11:30:00+00', 'Energetic, no headaches for past 10 days', 'Heart sounds clear, weight trending down', 'Hypertension under good management', 'Encouraged continued exercise and hydration.', '2026-09-12', 'completed'),
  ('cn000000-0000-0000-0000-000000000004', 'ap000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', '2026-09-12 10:00:00+00', 'Feeling well, stable sleep and appetite', 'Normal resting pulse, optimal respiratory rhythm', 'Normalizing blood pressure indices', 'Maintain healthy low-carb and low-sodium nutrition.', '2026-09-24', 'completed')
ON CONFLICT (id) DO NOTHING;

-- Insert Prescriptions & Prescription Items
INSERT INTO prescriptions (id, consultation_id, patient_id, doctor_id, diagnosis, instructions, created_at)
VALUES
  ('pr000000-0000-0000-0000-000000000001', 'cn000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Stage 1 Essential Hypertension', 'Take medications strictly after breakfast. Record blood pressure log daily.', '2026-08-01 09:45:00+00'),
  ('pr000000-0000-0000-0000-000000000002', 'cn000000-0000-0000-0000-000000000004', 'p0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Controlled Hypertension & Metabolic Stability', 'Maintenance therapy. Daily hydration (2.5L) and 30 mins brisk walking.', '2026-09-12 10:15:00+00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO prescription_items (id, prescription_id, medicine_name, dosage, frequency, duration, instructions)
VALUES
  ('pi000000-0000-0000-0000-000000000001', 'pr000000-0000-0000-0000-000000000001', 'Amlodipine Besylate', '5mg', 'Once daily', '30 days', 'Take in morning with a full glass of water'),
  ('pi000000-0000-0000-0000-000000000002', 'pr000000-0000-0000-0000-000000000001', 'Omega-3 Fish Oil', '1000mg', 'Once daily', '60 days', 'Take with evening meal'),
  ('pi000000-0000-0000-0000-000000000003', 'pr000000-0000-0000-0000-000000000002', 'Amlodipine Besylate', '2.5mg', 'Once daily', '90 days', 'Reduced dosage as BP has normalized'),
  ('pi000000-0000-0000-0000-000000000004', 'pr000000-0000-0000-0000-000000000002', 'CoQ10 Cardiovascular Support', '100mg', 'Once daily', '60 days', 'With breakfast')
ON CONFLICT (id) DO NOTHING;

-- ========================================================
-- 5 HISTORICAL PROGRESS RECORDS (EXACT DEMO SPECIFICATION)
-- Review 1: Weight 78 kg, BP 140/90, Heart Rate 92, Blood Sugar 145, Needs Attention
-- Review 2: Weight 76 kg, BP 135/87, Heart Rate 88, Blood Sugar 138, Stable
-- Review 3: Weight 75 kg, BP 130/84, Heart Rate 84, Blood Sugar 130, Improving
-- Review 4: Weight 73 kg, BP 125/82, Heart Rate 80, Blood Sugar 122, Improving
-- Review 5: Weight 72 kg, BP 120/80, Heart Rate 76, Blood Sugar 115, Improving
-- ========================================================
INSERT INTO progress_records (
  id, patient_id, doctor_id, consultation_id, appointment_id, review_date,
  weight, height, bmi, heart_rate, systolic_bp, diastolic_bp, blood_sugar,
  temperature, oxygen_saturation, progress_status, symptoms_status,
  treatment_adherence, patient_reported_improvement, doctor_progress_notes, follow_up_date
) VALUES
  (
    'pg000000-0000-0000-0000-000000000001',
    'p0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    'cn000000-0000-0000-0000-000000000001',
    'ap000000-0000-0000-0000-000000000001',
    '2026-08-01 10:00:00+00',
    78.0, 1.75, 25.5, 92, 140, 90, 145.0, 98.6, 97.0,
    'Needs Attention',
    'Frequent morning headaches, mild dizziness when transitioning to standing.',
    'Just initiating prescribed regimen.',
    'Feeling anxious about high blood pressure numbers.',
    'Baseline evaluation. Initiated Amlodipine 5mg and sodium restriction below 2000mg/day.',
    '2026-08-15'
  ),
  (
    'pg000000-0000-0000-0000-000000000002',
    'p0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    'cn000000-0000-0000-0000-000000000002',
    'ap000000-0000-0000-0000-000000000002',
    '2026-08-15 11:15:00+00',
    76.0, 1.75, 24.8, 88, 135, 87, 138.0, 98.4, 98.0,
    'Stable',
    'Headaches diminished in frequency. Sleep has improved noticeably.',
    '100% medication compliance. Patient logged blood pressure twice daily.',
    'Noticed less fatigue after stairs.',
    'Weight reduced by 2kg through dietary changes. Blood pressure stabilizing.',
    '2026-08-29'
  ),
  (
    'pg000000-0000-0000-0000-000000000003',
    'p0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    'cn000000-0000-0000-0000-000000000003',
    'ap000000-0000-0000-0000-000000000003',
    '2026-08-29 11:45:00+00',
    75.0, 1.75, 24.5, 84, 130, 84, 130.0, 98.5, 98.5,
    'Improving',
    'No headaches reported in past 10 days. Good cardiovascular stamina.',
    'Excellent adherence to both pharmacological and non-pharmacological directives.',
    'Reports significantly better focus and restful sleep.',
    'Vascular resistance decreasing. Patient is walking 8,000 steps daily.',
    '2026-09-12'
  ),
  (
    'pg000000-0000-0000-0000-000000000004',
    'p0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    'cn000000-0000-0000-0000-000000000004',
    'ap000000-0000-0000-0000-000000000004',
    '2026-09-12 10:30:00+00',
    73.0, 1.75, 23.8, 80, 125, 82, 122.0, 98.3, 99.0,
    'Improving',
    'Completely asymptomatic. Heart rate and blood sugar trending into optimal range.',
    'Consistent compliance without side effects.',
    'Reports feeling energized throughout the day.',
    'Systolic/Diastolic reading near normal target. BMI dropped from 25.5 to 23.8.',
    '2026-09-24'
  ),
  (
    'pg000000-0000-0000-0000-000000000005',
    'p0000000-0000-0000-0000-000000000001',
    'd0000000-0000-0000-0000-000000000001',
    NULL,
    'ap000000-0000-0000-0000-000000000005',
    '2026-09-24 10:30:00+00',
    72.0, 1.75, 23.5, 76, 120, 80, 115.0, 98.4, 99.0,
    'Improving',
    'No symptoms. Blood pressure at perfect 120/80 target, resting HR down to 76 bpm.',
    'Fully committed to lifestyle modifications and prescribed supplements.',
    'Patient feels healthier than anytime in the past 5 years.',
    'Outstanding progress. Down 6kg total from initial visit. Reduced Amlodipine dosage to 2.5mg maintenance.',
    '2026-10-08'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert Medical Records
INSERT INTO medical_records (id, patient_id, doctor_id, record_type, title, description, record_date, file_url)
VALUES
  ('mr000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Lab Report', 'Comprehensive Metabolic Panel & Lipid Profile', 'Fasting glucose: 115 mg/dL. Total cholesterol: 185 mg/dL. HDL: 52 mg/dL. LDL: 110 mg/dL.', '2026-08-01', 'https://example.com/reports/cmp-alex-mercer.pdf'),
  ('mr000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Clinical Note', '12-Lead Resting Electrocardiogram (ECG)', 'Normal sinus rhythm, heart rate 80 bpm, no acute ST-T changes or signs of ischemia.', '2026-08-29', 'https://example.com/reports/ecg-alex-mercer.pdf')
ON CONFLICT (id) DO NOTHING;

-- Insert Notifications
INSERT INTO notifications (id, user_id, title, message, type, is_read, link)
VALUES
  ('nt000000-0000-0000-0000-000000000001', 'p0000000-0000-0000-0000-000000000001', 'Doctor Review Completed', 'Dr. Sarah Jenkins has published your latest health progress assessment.', 'review_completed', false, '/patient/progress'),
  ('nt000000-0000-0000-0000-000000000002', 'p0000000-0000-0000-0000-000000000001', 'New Prescription Available', 'Prescription for Amlodipine Besylate (2.5mg) is ready for download.', 'prescription_created', false, '/patient/prescriptions'),
  ('nt000000-0000-0000-0000-000000000003', 'p0000000-0000-0000-0000-000000000001', 'Upcoming Follow-up Scheduled', 'Your next cardiovascular review is scheduled for October 08, 2026.', 'follow_up', true, '/patient/appointments'),
  ('nt000000-0000-0000-0000-000000000004', 'd0000000-0000-0000-0000-000000000001', 'New Appointment Request', 'Alex Mercer booked an appointment for tomorrow at 10:00 AM.', 'appointment_booked', false, '/doctor/appointments')
ON CONFLICT (id) DO NOTHING;
