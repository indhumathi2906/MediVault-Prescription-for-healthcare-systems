import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { patientAPI } from '../../services/api.js';
import { StatCard } from '../../components/common/StatCard.js';
import { Badge, getProgressStatusVariant, getAppointmentStatusVariant } from '../../components/common/Badge.js';
import {
  Activity,
  Calendar,
  FileText,
  Clock,
  ArrowRight,
  TrendingUp,
  User,
  HeartPulse,
  AlertCircle,
} from 'lucide-react';

export const PatientDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await patientAPI.getDashboard();
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch patient dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const {
    patient_name,
    upcomingAppointments = [],
    pastAppointments = [],
    currentPrescriptions = [],
    recentMedicalRecords = [],
    latestConsultation,
    healthProgress,
  } = data || {};

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-7 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-blue-400">
            <span>Clinical Healthcare Portal</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span>Electronic Patient Record</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold mt-1 tracking-tight">
            Welcome back, {patient_name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
            Your centralized clinical dashboard is fully up to date. Monitor physician assessments, active digital prescriptions, and longitudinal health recovery charts.
          </p>
        </div>
        <div className="hidden sm:block absolute right-6 -bottom-6 text-slate-800/40 pointer-events-none">
          <HeartPulse className="w-44 h-44" />
        </div>
      </div>

      {/* Top 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Health Progress Status"
          value={healthProgress?.currentStatus || 'Stable'}
          subtitle={`${healthProgress?.totalReviews || 0} reviews recorded`}
          icon={Activity}
          variant="blue"
        />
        <StatCard
          title="Upcoming Appointments"
          value={upcomingAppointments.length}
          subtitle={upcomingAppointments[0] ? `Next: ${upcomingAppointments[0].appointment_date}` : 'No visits scheduled'}
          icon={Calendar}
          variant="blue"
        />
        <StatCard
          title="Active Prescriptions"
          value={currentPrescriptions.length}
          subtitle="Digitally verifiable"
          icon={FileText}
          variant="emerald"
        />
        <StatCard
          title="Next Follow-up"
          value={
            healthProgress?.nextFollowUp
              ? new Date(healthProgress.nextFollowUp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
              : 'As needed'
          }
          subtitle="Clinical directive"
          icon={Clock}
          variant="amber"
        />
      </div>

      {/* CROWN FEATURE: HEALTH PROGRESS HIGHLIGHT CARD */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                Core Trajectory Tracking
              </span>
              <Badge variant={getProgressStatusVariant(healthProgress?.currentStatus)}>
                {healthProgress?.currentStatus || 'Stable'}
              </Badge>
            </div>
            <h2 className="text-lg font-heading font-bold text-slate-900 mt-1">
              Patient Health Progress Overview
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Continuously analyzed across {healthProgress?.totalReviews || 0} completed clinical consultations
            </p>
          </div>

          <Link
            to="/patient/progress"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-blue-600 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            View Complete Health Progress & Charts <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Dynamic Vitals Preview */}
        {healthProgress?.latestRecord ? (
          <div className="mt-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500">Current Weight</span>
                <p className="text-lg font-bold font-mono text-slate-900 mt-1 tabular-nums">
                  {healthProgress.latestRecord.weight ? `${healthProgress.latestRecord.weight} kg` : '--'}
                </p>
                <span className="text-[11px] text-blue-700 font-semibold font-mono">
                  BMI: {healthProgress.latestRecord.bmi ? `${healthProgress.latestRecord.bmi} kg/m²` : '--'}
                </span>
              </div>

              <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200">
                <span className="text-[10px] uppercase font-bold text-slate-500">Blood Pressure</span>
                <p className="text-lg font-bold font-mono text-slate-900 mt-1 tabular-nums">
                  {healthProgress.latestRecord.systolic_bp && healthProgress.latestRecord.diastolic_bp
                    ? `${healthProgress.latestRecord.systolic_bp}/${healthProgress.latestRecord.diastolic_bp}`
                    : '--'}
                </p>
                <span className="text-[11px] text-slate-500 font-semibold">mmHg</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Heart Rate</span>
                <p className="text-xl font-bold text-slate-900 mt-1">
                  {healthProgress.latestRecord.heart_rate ? `${healthProgress.latestRecord.heart_rate} bpm` : '--'}
                </p>
                <span className="text-[11px] text-slate-500 font-semibold">Resting pulse</span>
              </div>

              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Blood Sugar</span>
                <p className="text-xl font-bold text-slate-900 mt-1">
                  {healthProgress.latestRecord.blood_sugar ? `${healthProgress.latestRecord.blood_sugar} mg/dL` : '--'}
                </p>
                <span className="text-[11px] text-slate-500 font-semibold">Fasting glucose</span>
              </div>
            </div>

            {healthProgress.latestRecord.doctor_progress_notes && (
              <div className="mt-4 p-3.5 bg-teal-50/70 border border-teal-100 rounded-xl text-xs text-slate-700">
                <strong className="text-teal-900 font-bold">Latest Doctor Clinical Observation:</strong>{' '}
                "{healthProgress.latestRecord.doctor_progress_notes}"
              </div>
            )}
          </div>
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs">
            No health progress reviews recorded yet. Attend your next doctor consultation to establish your baseline.
          </div>
        )}
      </div>

      {/* Grid: Upcoming Appointments & Latest Prescriptions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Appointments */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Upcoming Appointments</h3>
              <Link
                to="/patient/appointments"
                className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                Book / View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {upcomingAppointments.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No upcoming appointments scheduled.
                </div>
              ) : (
                upcomingAppointments.slice(0, 3).map((appt: any) => (
                  <div key={appt.id} className="py-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                        {appt.appointment_time.slice(0, 5)}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{appt.doctor_name}</p>
                        <p className="text-[11px] text-slate-500">{appt.doctor_specialization}</p>
                        <p className="text-[11px] text-teal-700 font-medium">{appt.appointment_date}</p>
                      </div>
                    </div>
                    <Badge variant={getAppointmentStatusVariant(appt.status)}>{appt.status}</Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            to="/patient/appointments"
            className="mt-4 block text-center py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
          >
            Schedule New Doctor Appointment
          </Link>
        </div>

        {/* Digital Prescriptions */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h3 className="font-bold text-base text-slate-900">Digital Prescriptions</h3>
              <Link
                to="/patient/prescriptions"
                className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                View Full Rx <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {currentPrescriptions.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No digital prescriptions issued yet.
                </div>
              ) : (
                currentPrescriptions.slice(0, 3).map((rx: any) => (
                  <div key={rx.id} className="py-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-sm shrink-0">
                        ℞
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {rx.diagnosis || 'Prescribed Care Plan'}
                        </p>
                        <p className="text-[11px] text-slate-500">By {rx.doctor_name}</p>
                        <p className="text-[11px] text-slate-400">
                          {rx.items?.length || 0} medications • {new Date(rx.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Link
                      to="/patient/prescriptions"
                      className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                    >
                      View
                    </Link>
                  </div>
                ))
              )}
            </div>
          </div>

          <Link
            to="/patient/medical-history"
            className="mt-4 block text-center py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors"
          >
            View Complete Medical History
          </Link>
        </div>
      </div>
    </div>
  );
};
