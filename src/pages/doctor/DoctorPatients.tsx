import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { doctorAPI } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { Badge, getProgressStatusVariant } from '../../components/common/Badge.js';
import { Users, Search, Activity, ArrowRight, Phone, Mail, Droplets } from 'lucide-react';

export const DoctorPatients: React.FC = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPatients = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const res = await doctorAPI.getDoctorPatients(user.id);
        if (res.data.success) {
          setPatients(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load doctor patients:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, [user]);

  const filteredPatients = patients.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.full_name?.toLowerCase().includes(q) ||
      p.email?.toLowerCase().includes(q) ||
      p.profile?.blood_group?.toLowerCase().includes(q) ||
      p.latestProgressStatus?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Patient Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Access complete medical records, historical consultations, and record health progress assessments
          </p>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, blood group, status..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-blue-500 focus:border-blue-500 shadow-2xs"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No patients found</h3>
          <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPatients.map((patient) => (
            <div
              key={patient.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-700 flex items-center justify-center font-extrabold text-sm border border-teal-100">
                      {patient.full_name?.charAt(0) || 'P'}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{patient.full_name}</h4>
                      <p className="text-xs text-slate-500">{patient.email}</p>
                    </div>
                  </div>

                  <Badge variant={getProgressStatusVariant(patient.latestProgressStatus)}>
                    {patient.latestProgressStatus || 'Unassessed'}
                  </Badge>
                </div>

                <div className="py-3 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Blood Group:</span>
                    <span className="font-bold text-teal-700">
                      {patient.profile?.blood_group || 'O+'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Gender / Age:</span>
                    <span className="font-medium text-slate-800">
                      {patient.gender || 'N/A'} • {patient.date_of_birth || 'N/A'}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Progress Reviews:</span>
                    <span className="font-bold text-slate-800">
                      {patient.totalReviews} reviews logged
                    </span>
                  </div>

                  {patient.profile?.allergies && (
                    <div className="text-[11px] text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-100 font-medium">
                      Allergies: {patient.profile.allergies}
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  Last review: {patient.lastReviewDate ? new Date(patient.lastReviewDate).toLocaleDateString() : 'None'}
                </span>

                <Link
                  to={`/doctor/patients/${patient.id}`}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
                >
                  Clinical Chart <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
