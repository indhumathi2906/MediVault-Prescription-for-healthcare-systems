import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import {
  HeartPulse,
  Activity,
  ShieldCheck,
  CalendarCheck,
  FileText,
  Users,
  ArrowRight,
  TrendingUp,
  Clock,
  Sparkles,
  Lock,
  Stethoscope,
  Building2,
  CheckCircle2,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const handleQuickDemoLogin = async (role: 'patient' | 'doctor' | 'admin') => {
    try {
      const email = `${role}@medivault.com`;
      const loggedUser = await login(email, 'Password123!');
      if (loggedUser.role === 'patient') navigate('/patient/dashboard');
      else if (loggedUser.role === 'doctor') navigate('/doctor/dashboard');
      else if (loggedUser.role === 'admin') navigate('/admin/dashboard');
    } catch (err) {
      console.error('Quick login failed:', err);
    }
  };

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-white border-b border-slate-200 pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Metadata Kicker without static pill */}
          <div className="flex items-center justify-center gap-2 text-xs font-semibold tracking-wider uppercase text-blue-700 mb-5">
            <span>Enterprise Healthcare</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Electronic Health Records</span>
            <span aria-hidden="true" className="text-slate-300">·</span>
            <span>Longitudinal Tracking</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none text-balance">
            A Centralized Digital Healthcare Management System
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed text-balance">
            Eliminate fragmented physical records, lost prescriptions, and disconnected patient history.
            <strong className="text-slate-900 font-semibold"> MEDIVAULT</strong> introduces continuous,
            longitudinal <span className="text-blue-700 font-semibold">Patient Health Progress Tracking</span> with
            immutable chronological audit logs.
          </p>

          {/* Action buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {user ? (
              <Link
                to={`/${user.role}/dashboard`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-900 hover:bg-blue-600 text-white font-semibold text-sm shadow-sm transition-all"
              >
                Go to My Dashboard <ArrowRight className="w-4 h-4" />
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-900 hover:bg-blue-600 text-white font-semibold text-sm shadow-sm transition-all"
                >
                  Access Clinical Portal <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white hover:bg-slate-50 text-slate-700 font-semibold text-sm border border-slate-300 shadow-xs transition-all"
                >
                  Register Credentialed Account
                </Link>
              </>
            )}
          </div>

          {/* Quick Demo Access Console */}
          <div className="mt-12 max-w-2xl mx-auto p-4 rounded-xl bg-slate-50 border border-slate-200 shadow-xs text-left">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-blue-600" /> One-Click Clinical Demo Access
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Preloaded verified records</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-3">
              <button
                onClick={() => handleQuickDemoLogin('patient')}
                className="flex items-center justify-between p-3 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-900 transition-all text-left group shadow-2xs"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">Patient Demo</p>
                  <p className="text-[11px] text-slate-500">Johnathan Doe</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => handleQuickDemoLogin('doctor')}
                className="flex items-center justify-between p-3 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-900 transition-all text-left group shadow-2xs"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">Doctor Demo</p>
                  <p className="text-[11px] text-slate-500">Dr. Sarah Jenkins</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </button>

              <button
                onClick={() => handleQuickDemoLogin('admin')}
                className="flex items-center justify-between p-3 rounded-lg bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 text-slate-900 transition-all text-left group shadow-2xs"
              >
                <div>
                  <p className="text-xs font-bold text-slate-900">Admin Demo</p>
                  <p className="text-[11px] text-slate-500">System Admin</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Feature Highlight: Patient Health Progress Tracking */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl p-8 sm:p-12 border border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <div className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-2">
                Longitudinal Health Architecture
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight text-balance">
                Continuous Patient Health Progress Tracking
              </h2>
              <p className="mt-4 text-slate-600 text-sm leading-relaxed">
                Traditional healthcare databases overwrite prior vitals, losing irreplaceable context on chronic conditions.
                MEDIVAULT records progression as an <strong>append-only longitudinal ledger</strong>, creating an indelible timeline across every clinical touchpoint.
              </p>

              <div className="mt-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-700 shrink-0 mt-0.5 border border-slate-200">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Immutable Chronological Milestones</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Each physician assessment registers a distinct review record (Review 1 → Baseline, Review 2 → Progress). Historical metrics are preserved immutably.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-700 shrink-0 mt-0.5 border border-slate-200">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Dynamic Biometric Delta Calculations</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Contrasts current metrics against previous baselines for Weight, BMI, Systolic/Diastolic BP, Glucose, Heart Rate, and SpO2 with instant clinical variance reporting.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-slate-100 text-slate-700 shrink-0 mt-0.5 border border-slate-200">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900">Automated BMI Computation & Clinical Trajectory</h4>
                    <p className="text-xs text-slate-500 mt-1">
                      Integrated formula with standardized clinical classifications: Improving, Stable, Needs Attention, or Worsening.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visual Progress Milestone Card */}
            <div className="bg-slate-900 rounded-xl p-6 text-white shadow-xl border border-slate-800">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div>
                  <span className="text-[10px] text-blue-400 font-mono font-semibold uppercase tracking-wider">
                    CLINICAL TRAJECTORY MONITOR
                  </span>
                  <h4 className="text-sm font-bold text-white mt-0.5 font-heading">
                    Hypertension & Metabolic Progress Evaluation
                  </h4>
                </div>
                <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950 text-emerald-300 border border-emerald-800">
                  Improving
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 my-4">
                <div className="bg-slate-800/90 p-3 rounded-lg border border-slate-700/80">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Weight</p>
                  <p className="text-xl font-bold font-mono text-white mt-0.5 tabular-nums">72.0 kg</p>
                  <p className="text-[10px] text-emerald-400 mt-1 font-mono">Δ -3.0 kg vs baseline</p>
                </div>

                <div className="bg-slate-800/90 p-3 rounded-lg border border-slate-700/80">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Blood Pressure</p>
                  <p className="text-xl font-bold font-mono text-white mt-0.5 tabular-nums">120 / 80</p>
                  <p className="text-[10px] text-emerald-400 mt-1 font-mono">Δ -10 mmHg systolic</p>
                </div>

                <div className="bg-slate-800/90 p-3 rounded-lg border border-slate-700/80">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Body Mass Index</p>
                  <p className="text-xl font-bold font-mono text-white mt-0.5 tabular-nums">23.5</p>
                  <p className="text-[10px] text-emerald-400 mt-1 font-mono">Normal Healthy Range</p>
                </div>

                <div className="bg-slate-800/90 p-3 rounded-lg border border-slate-700/80">
                  <p className="text-[10px] uppercase font-bold text-slate-400">Resting Pulse</p>
                  <p className="text-xl font-bold font-mono text-white mt-0.5 tabular-nums">72 bpm</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">Sinus rhythm verified</p>
                </div>
              </div>

              <div className="p-3 bg-slate-800/60 rounded-lg border border-slate-700/60 text-xs text-slate-300">
                <span className="font-semibold text-blue-400">Physician Note:</span> "Marked improvement observed across metabolic markers. Continued maintenance plan effective."
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Pillars Role Architecture */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <p className="text-xs font-bold text-blue-700 uppercase tracking-wider">Role-Based System Governance</p>
          <h2 className="text-2xl sm:text-3xl font-heading font-bold text-slate-900 mt-1 text-balance">
            Tailored Experiences for Patients, Physicians, and System Administrators
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Patients */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-700 border border-blue-100 flex items-center justify-center mb-4">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-heading">For Patients</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Centralized dashboard with complete consultation timelines, upcoming visits, prescription downloads, and longitudinal health charts tracking your recovery.
              </p>
            </div>
            <ul className="mt-5 space-y-2 text-xs text-slate-600 pt-4 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Book appointments with verified doctors</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Printable & downloadable digital prescriptions</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                <span>Full visual health progress timeline</span>
              </li>
            </ul>
          </div>

          {/* Doctors */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center mb-4">
                <Stethoscope className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-heading">For Physicians</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Comprehensive clinical cockpit. Review patient historical charts, conduct structured consultations, generate itemized digital prescriptions, and record progress assessments.
              </p>
            </div>
            <ul className="mt-5 space-y-2 text-xs text-slate-600 pt-4 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Rapid consultation recording & diagnosis</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Automated BMI calculation & biometrics</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>Prevents conflicting appointment schedules</span>
              </li>
            </ul>
          </div>

          {/* Administrators */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 hover:border-slate-300 shadow-xs transition-all flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-800 border border-slate-200 flex items-center justify-center mb-4">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900 font-heading">For Administrators</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Holistic platform governance. Oversee physician credentials, patient accounts, monitor appointment schedules, activate/deactivate users, and inspect clinical audit trails.
              </p>
            </div>
            <ul className="mt-5 space-y-2 text-xs text-slate-600 pt-4 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                <span>Unified user role administration</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                <span>Real-time clinical activity feed</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-slate-700 shrink-0" />
                <span>Platform-wide appointment monitoring</span>
              </li>
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
};
