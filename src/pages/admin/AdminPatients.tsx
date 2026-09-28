import React, { useEffect, useState } from 'react';
import { adminAPI } from '../../services/api.js';
import { Users, Search, Activity, Droplets } from 'lucide-react';

export const AdminPatients: React.FC = () => {
  const [patients, setPatients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        const res = await adminAPI.getPatients();
        if (res.data.success) {
          setPatients(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load patients:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const filtered = patients.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.full_name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.profile?.blood_group?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patient Population Registry</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Centralized registry of all patients enrolled in the MEDIVAULT health network
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search patients..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-teal-500 shadow-2xs"
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
              <tr>
                <th className="p-3.5">Patient Name</th>
                <th className="p-3.5">Contact</th>
                <th className="p-3.5">Blood Group</th>
                <th className="p-3.5">Consultations</th>
                <th className="p-3.5">Progress Milestones</th>
                <th className="p-3.5">Allergies / Conditions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <div className="w-6 h-6 border-2 border-teal-600 border-t-transparent rounded-full animate-spin mx-auto" />
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No patients found.
                  </td>
                </tr>
              ) : (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="p-3.5">
                      <p className="font-bold text-slate-900">{p.full_name}</p>
                      <p className="text-slate-500 text-[11px]">{p.gender} • {p.date_of_birth || 'N/A'}</p>
                    </td>

                    <td className="p-3.5">
                      <p className="text-slate-800">{p.email}</p>
                      <p className="text-slate-500 text-[11px]">{p.phone || 'No phone'}</p>
                    </td>

                    <td className="p-3.5">
                      <span className="font-bold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-100">
                        {p.profile?.blood_group || 'O+'}
                      </span>
                    </td>

                    <td className="p-3.5 font-semibold text-slate-700">
                      {p.consultationCount || 0} visits
                    </td>

                    <td className="p-3.5">
                      <span className="font-bold text-indigo-700">
                        {p.progressCount || 0} reviews logged
                      </span>
                    </td>

                    <td className="p-3.5 text-slate-600 max-w-xs">
                      {p.profile?.allergies && (
                        <p className="text-rose-600 font-medium">Allergies: {p.profile.allergies}</p>
                      )}
                      {p.profile?.existing_conditions && (
                        <p className="text-slate-500 text-[11px] truncate">{p.profile.existing_conditions}</p>
                      )}
                      {!p.profile?.allergies && !p.profile?.existing_conditions && (
                        <span className="text-slate-400">None noted</span>
                      )}
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
