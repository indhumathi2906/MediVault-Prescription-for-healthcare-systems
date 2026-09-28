import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { doctorAPI } from '../../services/api.js';
import { Badge, getProgressStatusVariant, getAppointmentStatusVariant } from '../../components/common/Badge.js';
import { formatDoctorWelcomeName } from '../../utils/doctorName.js';
import {
  Users,
  Calendar,
  Activity,
  CheckCircle2,
  Clock,
  ArrowRight,
  Stethoscope,
  FileText,
  CalendarCheck,
  ChevronRight,
  Plus,
  Search,
  Sparkles,
  ClipboardList,
} from 'lucide-react';

export const DoctorDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [scheduleFilter, setScheduleFilter] = useState<'today' | 'upcoming'>('today');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await doctorAPI.getDashboard();
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load doctor dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xs text-slate-500 font-medium">Loading clinical workspace...</p>
      </div>
    );
  }

  const {
    doctor_name,
    stats = {},
    todayAppointments = [],
    upcomingAppointments = [],
    recentReviews = [],
    patientsProgressOverview = [],
  } = data || {};

  // Formatted doctor name without "Dr. Dr." or degree suffixes in welcome heading
  const welcomeDoctorName = formatDoctorWelcomeName(doctor_name);

  // Formatted current date for clinical header
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="space-y-6 pb-12">
      {/* 1. HERO / WELCOME SECTION (Compact, Clinical, Premium) */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 sm:p-6 text-white shadow-sm relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="max-w-2xl">
            {/* Eyebrow Label */}
            <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-blue-400 mb-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
              <span>PHYSICIAN CLINICAL COCKPIT</span>
              <span aria-hidden="true" className="text-slate-600">·</span>
              <span className="text-slate-300 font-mono text-[10px]">{todayFormatted}</span>
            </div>

            {/* Main Welcome Heading (Normalized Name) */}
            <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight text-white">
              Welcome, {welcomeDoctorName}
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-sm text-slate-300 mt-1 leading-relaxed">
              Manage your appointments, patients, consultations, and prescriptions from one clinical workspace.
            </p>

            {/* Quick Actions Shortcuts */}
            <div className="flex flex-wrap items-center gap-2.5 mt-4 pt-3.5 border-t border-slate-800/80">
              <Link
                to="/doctor/appointments"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Appointment</span>
              </Link>
              <Link
                to="/doctor/prescriptions"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-blue-400" />
                <span>Issue Prescription</span>
              </Link>
              <Link
                to="/doctor/patients"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
              >
                <Users className="w-3.5 h-3.5 text-teal-400" />
                <span>Patient Roster</span>
              </Link>
            </div>
          </div>

          {/* Right Clinical ECG & Metrics Graphic */}
          <div className="hidden lg:flex flex-col items-end shrink-0 pointer-events-none select-none pl-4">
            {/* Minimal SVG Heartbeat / ECG Waveform Illustration */}
            <div className="w-48 h-14 relative opacity-80">
              <svg
                viewBox="0 0 200 60"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full stroke-blue-400"
              >
                <path
                  d="M0 30 H40 L48 30 L54 10 L62 50 L70 20 L76 35 L82 30 H120 L126 30 L132 15 L140 45 L146 25 L152 30 H200"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="opacity-70"
                />
                <circle cx="76" cy="35" r="3" className="fill-blue-400" />
              </svg>
            </div>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 mt-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>LIVE CLINICAL EHR SYNC</span>
              <span className="text-slate-600">|</span>
              <span>ACTIVE SESSION</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. FOUR STATISTICS CARDS (Consistent, Distinct, Polished) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Appointments (Blue) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:-translate-y-0.5 hover:shadow-md hover:border-blue-200 transition-all duration-200 group">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Today's Appointments
              </p>
              <p className="text-3xl font-heading font-extrabold text-slate-900 mt-1 tabular-nums tracking-tight">
                {stats.todayAppointmentsCount || 0}
              </p>
              <p className="text-xs text-blue-700 font-medium mt-1">
                Scheduled visits today
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 border border-blue-100 group-hover:bg-blue-600 group-hover:text-white transition-colors shrink-0">
              <Calendar className="w-5 h-5 stroke-[2]" />
            </div>
          </div>
        </div>

        {/* Card 2: Total Assigned Patients (Teal) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:-translate-y-0.5 hover:shadow-md hover:border-teal-200 transition-all duration-200 group">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Total Assigned Patients
              </p>
              <p className="text-3xl font-heading font-extrabold text-slate-900 mt-1 tabular-nums tracking-tight">
                {stats.totalPatientsCount || 0}
              </p>
              <p className="text-xs text-teal-700 font-medium mt-1">
                Clinical registry
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-teal-50 text-teal-600 border border-teal-100 group-hover:bg-teal-600 group-hover:text-white transition-colors shrink-0">
              <Users className="w-5 h-5 stroke-[2]" />
            </div>
          </div>
        </div>

        {/* Card 3: Completed Consultations (Green/Emerald) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:-translate-y-0.5 hover:shadow-md hover:border-emerald-200 transition-all duration-200 group">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Completed Consultations
              </p>
              <p className="text-3xl font-heading font-extrabold text-slate-900 mt-1 tabular-nums tracking-tight">
                {stats.completedConsultationsCount || 0}
              </p>
              <p className="text-xs text-emerald-700 font-medium mt-1">
                Documented visits
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white transition-colors shrink-0">
              <CheckCircle2 className="w-5 h-5 stroke-[2]" />
            </div>
          </div>
        </div>

        {/* Card 4: Upcoming in Queue (Purple/Indigo) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:-translate-y-0.5 hover:shadow-md hover:border-indigo-200 transition-all duration-200 group">
          <div className="flex items-start justify-between">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                Upcoming in Queue
              </p>
              <p className="text-3xl font-heading font-extrabold text-slate-900 mt-1 tabular-nums tracking-tight">
                {stats.upcomingAppointmentsCount || 0}
              </p>
              <p className="text-xs text-indigo-700 font-medium mt-1">
                Confirmed bookings
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white transition-colors shrink-0">
              <Clock className="w-5 h-5 stroke-[2]" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. LOWER DASHBOARD SECTION: TODAY'S SCHEDULE & RECENT CLINICAL ACTIVITY */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Today's Schedule & Queue */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            {/* Header & Segmented Filter Control */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                  <CalendarCheck className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900">
                    Today's Schedule
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    {todayAppointments.length} appointment{todayAppointments.length === 1 ? '' : 's'} scheduled for today
                  </p>
                </div>
              </div>

              {/* Segmented Control */}
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setScheduleFilter('today')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    scheduleFilter === 'today'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Today ({todayAppointments.length})
                </button>
                <button
                  type="button"
                  onClick={() => setScheduleFilter('upcoming')}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    scheduleFilter === 'upcoming'
                      ? 'bg-white text-slate-900 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Upcoming ({upcomingAppointments.length})
                </button>
              </div>
            </div>

            {/* List Content */}
            <div className="mt-2 divide-y divide-slate-100">
              {scheduleFilter === 'today' ? (
                todayAppointments.length === 0 ? (
                  /* Polished Empty State for Today */
                  <div className="py-12 px-4 text-center">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
                      <Calendar className="w-6 h-6 stroke-[1.8]" />
                    </div>
                    <h4 className="text-sm font-heading font-bold text-slate-800">
                      No appointments scheduled for today
                    </h4>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Your schedule is clear. You can review patient charts, issue digital prescriptions, or check upcoming queue slots.
                    </p>
                    <div className="mt-4 flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setScheduleFilter('upcoming')}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors"
                      >
                        Check Upcoming Queue ({upcomingAppointments.length})
                      </button>
                      <Link
                        to="/doctor/appointments"
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition-colors"
                      >
                        Manage Appointments
                      </Link>
                    </div>
                  </div>
                ) : (
                  todayAppointments.map((appt: any) => (
                    <div
                      key={appt.id}
                      className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 p-2.5 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-12 h-11 rounded-lg bg-blue-50 text-blue-800 border border-blue-100 flex flex-col items-center justify-center shrink-0 font-mono">
                          <span className="text-xs font-bold leading-none">{appt.appointment_time || '09:00'}</span>
                          <span className="text-[9px] text-blue-600 mt-0.5 uppercase tracking-wide">Visit</span>
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {appt.patient_name}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate flex items-center gap-1.5 mt-0.5">
                            <span>{appt.reason || 'General Consultation'}</span>
                            {appt.patient_blood_group && (
                              <>
                                <span aria-hidden="true" className="text-slate-300">·</span>
                                <span className="text-slate-600 font-mono">Blood: {appt.patient_blood_group}</span>
                              </>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                        <Badge variant={getAppointmentStatusVariant(appt.status)}>
                          {appt.status}
                        </Badge>
                        <Link
                          to={`/doctor/patients/${appt.patient_id}`}
                          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-semibold transition-colors shadow-2xs flex items-center gap-1"
                        >
                          <span>Start Review</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  ))
                )
              ) : upcomingAppointments.length === 0 ? (
                /* Empty State for Upcoming */
                <div className="py-10 text-center">
                  <p className="text-xs text-slate-400">No upcoming appointments in the pipeline.</p>
                </div>
              ) : (
                upcomingAppointments.slice(0, 5).map((appt: any) => (
                  <div
                    key={appt.id}
                    className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/70 p-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-12 h-11 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-100 flex flex-col items-center justify-center shrink-0 font-mono">
                        <span className="text-[11px] font-bold leading-none">
                          {appt.appointment_date ? new Date(appt.appointment_date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric' }) : '--'}
                        </span>
                        <span className="text-[9px] text-indigo-600 mt-0.5">{appt.appointment_time || 'AM'}</span>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate">{appt.patient_name}</p>
                        <p className="text-[11px] text-slate-500 truncate">{appt.reason || 'Follow-up Consultation'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <Badge variant={getAppointmentStatusVariant(appt.status)}>
                        {appt.status}
                      </Badge>
                      <Link
                        to={`/doctor/patients/${appt.patient_id}`}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-700 px-2 py-1"
                      >
                        View Chart
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Footer Navigation Link */}
          <div className="pt-3 border-t border-slate-100 mt-2">
            <Link
              to="/doctor/appointments"
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors border border-slate-200"
            >
              <span>View Full Appointment Calendar</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>

        {/* Right Column (5 cols): Recent Progress Assessments & Clinical Activity */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
                  <Activity className="w-4 h-4 stroke-[2.2]" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-base text-slate-900">
                    Recent Assessments
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Longitudinal health progress reviews
                  </p>
                </div>
              </div>
              <Link
                to="/doctor/reviews"
                className="text-xs font-semibold text-teal-700 hover:text-teal-800 flex items-center gap-0.5"
              >
                Log <ChevronRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="divide-y divide-slate-100 mt-2">
              {recentReviews.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  <ClipboardList className="w-8 h-8 mx-auto mb-2 text-slate-300 stroke-[1.5]" />
                  No health progress assessments recorded recently.
                </div>
              ) : (
                recentReviews.slice(0, 4).map((rev: any) => (
                  <div
                    key={rev.id}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/70 p-2 rounded-xl transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {rev.patient_name}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        {new Date(rev.review_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {rev.weight ? ` · ${rev.weight} kg` : ''}
                        {rev.systolic_bp && rev.diastolic_bp ? ` · ${rev.systolic_bp}/${rev.diastolic_bp}` : ''}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <Badge variant={getProgressStatusVariant(rev.progress_status)}>
                        {rev.progress_status}
                      </Badge>
                      <Link
                        to={`/doctor/patients/${rev.patient_id}`}
                        className="text-xs font-semibold text-teal-700 hover:text-teal-800"
                      >
                        Chart
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Roster Link */}
          <div className="pt-3 border-t border-slate-100 mt-2">
            <Link
              to="/doctor/reviews"
              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-slate-50 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition-colors border border-slate-200"
            >
              <span>Open Longitudinal Review History</span>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          </div>
        </div>
      </div>

      {/* 4. PATIENT HEALTH PROGRESS ROSTER TABLE */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <h3 className="font-heading font-bold text-base text-slate-900">
              Active Patient Health Progress Registry
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Longitudinal tracking status across active patients currently under your clinical care
            </p>
          </div>
          <Link
            to="/doctor/patients"
            className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
          >
            <span>View All Patients ({patientsProgressOverview.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto mt-3">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3">Patient Name</th>
                <th className="p-3">Clinical Trajectory</th>
                <th className="p-3">Last Evaluation</th>
                <th className="p-3">Weight</th>
                <th className="p-3">Body Mass Index</th>
                <th className="p-3">Blood Pressure</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {patientsProgressOverview.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No active patients with recorded evaluations.
                  </td>
                </tr>
              ) : (
                patientsProgressOverview.map((item: any) => (
                  <tr key={item.patient_id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3 font-semibold text-slate-900">
                      {item.patient_name}
                    </td>
                    <td className="p-3">
                      <Badge variant={getProgressStatusVariant(item.status)}>
                        {item.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-slate-600 font-mono text-[11px]">
                      {item.latestRecord?.review_date
                        ? new Date(item.latestRecord.review_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Unrecorded'}
                    </td>
                    <td className="p-3 font-mono tabular-nums text-slate-700">
                      {item.latestRecord?.weight ? `${item.latestRecord.weight} kg` : '--'}
                    </td>
                    <td className="p-3 font-mono tabular-nums font-semibold text-slate-800">
                      {item.latestRecord?.bmi ? `${item.latestRecord.bmi}` : '--'}
                    </td>
                    <td className="p-3 font-mono tabular-nums text-slate-700">
                      {item.latestRecord?.systolic_bp && item.latestRecord?.diastolic_bp
                        ? `${item.latestRecord.systolic_bp}/${item.latestRecord.diastolic_bp} mmHg`
                        : '--'}
                    </td>
                    <td className="p-3 text-right">
                      <Link
                        to={`/doctor/patients/${item.patient_id}`}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                      >
                        <span>Open Chart</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
