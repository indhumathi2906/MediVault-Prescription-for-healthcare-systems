import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { doctorAPI } from '../../services/api.js';
import { Badge, getProgressStatusVariant } from '../../components/common/Badge.js';
import { Activity, Search, Calendar, User, ArrowRight } from 'lucide-react';

export const DoctorReviews: React.FC = () => {
  const [reviews, setReviews] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const res = await doctorAPI.getDashboard();
        if (res.data.success) {
          setReviews(res.data.data.recentReviews || []);
        }
      } catch (err) {
        console.error('Failed to load doctor reviews:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, []);

  const filtered = reviews.filter((r) => {
    const q = search.toLowerCase();
    return (
      r.patient_name?.toLowerCase().includes(q) ||
      r.progress_status?.toLowerCase().includes(q) ||
      r.doctor_progress_notes?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Health Progress Reviews Log</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit log of all immutable patient health assessments conducted by your practice
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reviews..."
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-blue-500"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Activity className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No reviews found</h3>
          <p className="text-xs text-slate-400 mt-1">Conduct reviews via your patient appointments.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((rev) => (
            <div
              key={rev.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h4 className="font-bold text-slate-900 text-sm">{rev.patient_name}</h4>
                  <Badge variant={getProgressStatusVariant(rev.progress_status)}>
                    {rev.progress_status}
                  </Badge>
                  <span className="text-xs text-slate-400">
                    {new Date(rev.review_date).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-xs text-slate-600">
                  {rev.weight && <span>Weight: <strong className="text-slate-800">{rev.weight} kg</strong></span>}
                  {rev.bmi && <span>BMI: <strong className="text-indigo-600">{rev.bmi}</strong></span>}
                  {rev.systolic_bp && rev.diastolic_bp && (
                    <span>BP: <strong className="text-slate-800">{rev.systolic_bp}/{rev.diastolic_bp} mmHg</strong></span>
                  )}
                  {rev.heart_rate && <span>HR: <strong className="text-slate-800">{rev.heart_rate} bpm</strong></span>}
                  {rev.blood_sugar && <span>Glucose: <strong className="text-slate-800">{rev.blood_sugar} mg/dL</strong></span>}
                </div>

                {rev.doctor_progress_notes && (
                  <p className="text-xs text-slate-600 italic max-w-2xl bg-slate-50 p-2 rounded-lg border border-slate-100">
                    "{rev.doctor_progress_notes}"
                  </p>
                )}
              </div>

              <Link
                to={`/doctor/patients/${rev.patient_id}`}
                className="inline-flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0 shadow-2xs"
              >
                View Patient Chart <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
