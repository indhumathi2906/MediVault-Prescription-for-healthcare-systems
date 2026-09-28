# MEDIVAULT: A CENTRALIZED DIGITAL HEALTHCARE MANAGEMENT SYSTEM

MEDIVAULT is a centralized digital healthcare management platform designed to eliminate paper prescriptions, centralize fragmented patient histories, and provide continuous, longitudinal **Patient Health Progress Tracking**.

---

## 1. Features

- **Role-Based Access Control (RBAC):**
  - **Patients:** View dashboard, manage profile, discover & book doctors, inspect medical history, download digital prescriptions, and monitor health progress trends over time.
  - **Doctors:** Access appointment schedules, view clinical history, conduct consultations, generate digital prescriptions, and conduct multi-metric health progress reviews.
  - **Administrators:** Oversee user accounts, activate/deactivate accounts, monitor appointments, review platform metrics and real-time audit logs.
- **Patient Health Progress Tracking (Core Feature):**
  - **Append-Only History:** Every doctor review creates a new immutable progress record. Historical reviews are NEVER overwritten.
  - **Dynamic Progress Comparison:** Automatically compares current readings with previous reviews (Weight change, BP, Heart Rate, Blood Sugar, BMI, Oxygen Saturation, Temperature).
  - **Auto-Calculated BMI:** Formula `BMI = weight(kg) / (height(m))^2` calculated automatically upon measurement entry.
  - **Recharts Interactive Trends:** Visual multi-series tracking with clean conditional rendering.
  - **Progress Assessment Status:** Tracking through standard clinical states: `Improving`, `Stable`, `Needs Attention`, `Worsening`.
- **Prevent Double-Booking:** Automatic time slot conflict detection preventing overlapping appointments with the same doctor.
- **Printable Digital Prescriptions:** Clean prescription layout ready for print or PDF export with complete doctor credentials, diagnosis, itemized dosages, and administration directions.
- **Real-Time Notifications:** Dynamic alert system notifying users of appointment status changes, new reviews, follow-up scheduling, and issued prescriptions.

---

## 2. Tech Stack

- **Frontend:** React 19, Vite, Tailwind CSS 4, React Router 7, Axios, Recharts, Lucide React, Framer Motion
- **Backend:** Node.js, Express.js, TypeScript
- **Database:** Supabase PostgreSQL (UUID primary keys, foreign keys, timestamps, indexes, RLS policies)
- **Authentication:** JSON Web Tokens (JWT) with HTTP Bearer authorization, bcrypt password hashing

---

## 3. Project Structure

```
medivault/
│
├── client/ (and src/ frontend)
│   ├── src/
│   │   ├── components/       # UI elements, Modals, Navbar, Sidebar, ProgressCharts, ComparisonCard
│   │   ├── pages/            # Role-specific dashboards, appointments, progress, prescriptions, auth
│   │   ├── layouts/          # PatientLayout, DoctorLayout, AdminLayout, PublicLayout
│   │   ├── context/          # AuthContext with token persistence and role enforcement
│   │   ├── services/         # Axios API clients for Auth, Patients, Doctors, Appointments, Progress
│   │   ├── types/            # TypeScript interfaces for all domain entities
│   │   ├── App.tsx           # React Router route registry with ProtectedRoute guards
│   │   └── main.tsx          # Application entry point
│   ├── package.json
│   └── .env.example
│
├── server/
│   ├── config/
│   │   └── db.ts             # Supabase client & relational store with complete seeded demo data
│   ├── controllers/         # Auth, Patient, Doctor, Appointment, Consultation, Prescription, Progress, Admin
│   ├── middleware/          # JWT authentication, role authorization, error handling
│   ├── routes/              # Express route definitions for all REST endpoints
│   ├── services/            # Progress calculation, dynamic comparison, and metric generation
│   ├── utils/               # JWT token creation and verification utilities
│   ├── package.json
│   └── .env.example
│
├── database/
│   ├── schema.sql           # Full Supabase PostgreSQL schema with RLS and triggers
│   └── seed.sql             # SQL seed script with realistic demo patients, doctors, and 5 progress reviews
│
├── server.ts                 # Full-stack dev & production server hosting Express API & Vite
└── README.md
```

---

## 4. Supabase Setup & Database Configuration

1. Log in to [Supabase](https://supabase.com) and create a new project.
2. In the Supabase dashboard, navigate to the **SQL Editor**.
3. Paste the contents of `database/schema.sql` and run the script. This creates all tables (`users`, `patient_profiles`, `doctor_profiles`, `appointments`, `consultations`, `prescriptions`, `prescription_items`, `progress_records`, `medical_records`, `notifications`) along with triggers, indexes, and RLS policies.
4. Optional: Run `database/seed.sql` to populate demo data directly into your Supabase database.
5. In your Supabase Project Settings -> API, copy:
   - Project URL (`SUPABASE_URL`)
   - anon/public key (`SUPABASE_ANON_KEY`)
   - service_role key (`SUPABASE_SERVICE_ROLE_KEY`)
6. Place these keys in your `.env` file.

*Note: The system includes a built-in relational database store initialized with the exact demo seed data, allowing the application to function immediately even before connecting external Supabase credentials.*

---

## 5. Demo Credentials

| Role | Email | Password |
| :--- | :--- | :--- |
| **Patient** | `patient@medivault.com` | `Password123!` |
| **Doctor** | `doctor@medivault.com` | `Password123!` |
| **Admin** | `admin@medivault.com` | `Password123!` |

*(You can also register a new patient or doctor account directly via `/register`)*

---

## 6. Patient Health Progress Feature Workflow

1. **Doctor conducts consultation & review:**
   - The doctor selects an appointment or patient.
   - Doctor fills out the review form: symptoms, clinical observations, health metrics (weight, height, blood pressure, heart rate, blood sugar, temp, SpO2).
   - BMI is calculated automatically: `BMI = weight / (height)^2`.
   - Doctor designates clinical progress: `Improving`, `Stable`, `Needs Attention`, or `Worsening`.
2. **Append-Only Database Integrity:**
   - The backend records a **new** row in `progress_records`.
   - Prior reviews remain unaltered, building an uncorrupted audit trail of patient health over time.
3. **Dynamic Comparison & Trend Analysis:**
   - When the patient opens `/patient/progress`, the system computes the delta from the immediate prior review.
   - For example: *Weight: 75 kg (Previous: 78 kg, Change: -3.0 kg)*.
   - Recharts visualizes historical trend lines for Weight, BMI, Blood Pressure, Heart Rate, and Blood Sugar.
   - The chronological timeline details every past consultation and notes.
