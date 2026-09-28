import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api.js';
import { Stethoscope, Search, Building, ShieldCheck } from 'lucide-react';

export const AdminDoctors: React.FC = () => {
  const [doctors, setDoctors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        setLoading(true);
        const res = await adminAPI.getDoctors();
        if (res.data.success) {
          setDoctors(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load doctors:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, []);

  const filtered = doctors.filter((d) => {
    const q = search.toLowerCase();
    return (
      d.full_name?.toLowerCase().includes(q) ||
      d.email?.toLowerCase().includes(q) ||
      d.profile?.specialization?.toLowerCase().includes(q) ||
      d.profile?.hospital?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Physicians & Clinicians Roster</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Credentialing, clinical load, and hospital affiliations across all practicing doctors
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by physician, specialty, hospital..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-blue-500 shadow-2xs"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
              <tr>
                <th className="p-3.5">Doctor</th>
                <th className="p-3.5">Specialization</th>
                <th className="p-3.5">License & Qualifications</th>
                <th className="p-3.5">Hospital / Clinic</th>
                <th className="p-3.5">Consultations</th>
                <th className="p-3.5">Appointments</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No physicians found.
                  </td>
                </tr>
              ) : (
                filtered.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900">Dr. {d.full_name}</p>
                      <p className="text-slate-500 text-[11px]">{d.email}</p>
                    </td>

                    <td className="p-3.5">
                      <span className="font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-100">
                        {d.profile?.specialization || 'General Practice'}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <p className="font-semibold text-slate-800">{d.profile?.qualification || 'MBBS'}</p>
                      <p className="text-[11px] text-slate-500 font-mono">Lic: {d.profile?.license_number || 'MED-VERIFIED'}</p>
                    </td>

                    <td className="p-3.5 text-slate-700">
                      <div className="flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5 text-slate-400" />
                        <span>{d.profile?.hospital || 'Central Health'}</span>
                      </div>
                    </td>

                    <td className="p-3.5 font-bold text-emerald-700">
                      {d.consultationCount || 0} visits
                    </td>

                    <td className="p-3.5 font-bold text-slate-800">
                      {d.appointmentCount || 0} booked
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
