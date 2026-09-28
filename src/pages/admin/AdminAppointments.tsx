import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api.js';
import { Badge, getAppointmentStatusVariant } from '../../components/common/Badge.js';
import { Calendar, Clock, Search } from 'lucide-react';

export const AdminAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchAppts = async () => {
      try {
        setLoading(true);
        const res = await adminAPI.getAppointments();
        if (res.data.success) {
          setAppointments(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load appointments:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppts();
  }, []);

  const filtered = appointments.filter((a) => {
    const matchFilter = filter === 'all' || a.status === filter;
    const q = search.toLowerCase();
    const matchSearch =
      a.patient_name?.toLowerCase().includes(q) ||
      a.doctor_name?.toLowerCase().includes(q) ||
      a.reason?.toLowerCase().includes(q);
    return matchFilter && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Platform Clinical Appointments</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            System-wide monitoring of patient-doctor scheduling, double-booking prevention, and visit statuses
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by doctor, patient, reason..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-purple-500 shadow-2xs"
          />
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap ${
              filter === tab
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
              <tr>
                <th className="p-3.5">Schedule</th>
                <th className="p-3.5">Patient</th>
                <th className="p-3.5">Attending Doctor</th>
                <th className="p-3.5">Clinical Reason</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Created</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No appointments found matching "{filter}".
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-purple-600" />
                        <span className="font-bold text-slate-900">{a.appointment_date}</span>
                      </div>
                      <div className="flex items-center gap-2 text-slate-500 text-[11px] mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{a.appointment_time}</span>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <p className="font-bold text-slate-900">{a.patient_name}</p>
                      <p className="text-slate-500 text-[11px]">{a.patient_email}</p>
                    </td>

                    <td className="p-3.5">
                      <p className="font-bold text-slate-900">{a.doctor_name}</p>
                      <p className="text-slate-500 text-[11px]">{a.doctor_specialization}</p>
                    </td>

                    <td className="p-3.5 text-slate-700 max-w-xs truncate">
                      {a.reason || 'General Consultation'}
                    </td>

                    <td className="p-3.5">
                      <Badge variant={getAppointmentStatusVariant(a.status)}>{a.status}</Badge>
                    </td>

                    <td className="p-3.5 text-slate-400 text-[11px]">
                      {new Date(a.created_at).toLocaleDateString()}
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
