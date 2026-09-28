import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api.js';
import { StatCard } from '../../components/common/StatCard.js';
import { Users, Stethoscope, Calendar, Activity, CheckCircle2, ShieldAlert, Clock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const res = await adminAPI.getDashboard();
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { stats = {}, recentActivities = [] } = data || {};

  return (
    <div className="space-y-6 pb-10">
      {/* Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-7 text-white shadow-sm">
        <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-blue-400">
          <span>System Governance</span>
          <span aria-hidden="true" className="text-slate-600">·</span>
          <span>Security & Compliance</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-heading font-extrabold mt-1 tracking-tight">
          MEDIVAULT Administrative Console
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-2xl leading-relaxed">
          Comprehensive oversight of digital health infrastructure, user access controls, appointment schedules, and continuous clinical audit events.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Registered Patients"
          value={stats.totalPatients || 0}
          subtitle="Patient profiles"
          icon={Users}
          variant="teal"
        />
        <StatCard
          title="Verified Physicians"
          value={stats.totalDoctors || 0}
          subtitle="Licensed medical staff"
          icon={Stethoscope}
          variant="blue"
        />
        <StatCard
          title="Scheduled Appointments"
          value={stats.totalAppointments || 0}
          subtitle="Platform visits"
          icon={Calendar}
          variant="purple"
        />
        <StatCard
          title="Consultations Completed"
          value={stats.totalConsultations || 0}
          subtitle="Documented encounters"
          icon={CheckCircle2}
          variant="emerald"
        />
        <StatCard
          title="Health Progress Reviews"
          value={stats.totalProgressReviews || 0}
          subtitle="Longitudinal milestones"
          icon={Activity}
          variant="teal"
        />
        <StatCard
          title="Active System Accounts"
          value={stats.activeUsers || 0}
          subtitle="Active access status"
          icon={ShieldAlert}
          variant="amber"
        />
      </div>

      {/* Quick Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/admin/users"
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-purple-300 hover:shadow-md transition-all group"
        >
          <h4 className="font-bold text-slate-900 text-sm flex items-center justify-between">
            Manage User Accounts
            <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Toggle active/inactive status, audit accounts, and inspect roles.
          </p>
        </Link>

        <Link
          to="/admin/patients"
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-teal-300 hover:shadow-md transition-all group"
        >
          <h4 className="font-bold text-slate-900 text-sm flex items-center justify-between">
            Patient Registry
            <ArrowRight className="w-4 h-4 text-teal-600 group-hover:translate-x-1 transition-transform" />
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Inspect patient medical records and longitudinal progress logs.
          </p>
        </Link>

        <Link
          to="/admin/doctors"
          className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-md transition-all group"
        >
          <h4 className="font-bold text-slate-900 text-sm flex items-center justify-between">
            Physicians Roster
            <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-1 transition-transform" />
          </h4>
          <p className="text-xs text-slate-500 mt-1">
            Verify medical licenses, hospitals, and consultation loads.
          </p>
        </Link>
      </div>

      {/* Recent System Activities Feed */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">Real-Time Clinical Activity Feed</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live immutable stream of clinical consultations, progress updates, and appointments
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 bg-purple-50 text-purple-700 font-bold rounded-full">
            System Live
          </span>
        </div>

        <div className="divide-y divide-slate-100 mt-2">
          {recentActivities.length === 0 ? (
            <p className="py-6 text-center text-xs text-slate-400">No recent activity detected.</p>
          ) : (
            recentActivities.map((act: any) => (
              <div key={act.id} className="py-3 flex items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-3">
                  <span
                    className={`px-2 py-0.5 rounded-md font-bold text-[10px] uppercase ${
                      act.type === 'Progress Review'
                        ? 'bg-teal-50 text-teal-700 border border-teal-200'
                        : act.type === 'Consultation'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}
                  >
                    {act.type}
                  </span>
                  <span className="text-slate-800 font-medium">{act.description}</span>
                </div>
                <span className="text-slate-400 text-[11px] whitespace-nowrap">
                  {new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} •{' '}
                  {new Date(act.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
