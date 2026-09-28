import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { appointmentAPI } from '../../services/api.js';
import { Appointment } from '../../types/index.js';
import { Badge, getAppointmentStatusVariant } from '../../components/common/Badge.js';
import { Calendar, Clock, Check, X, Stethoscope, AlertCircle, ArrowRight } from 'lucide-react';

export const DoctorAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const navigate = useNavigate();

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      const res = await appointmentAPI.getAppointments();
      if (res.data.success) {
        setAppointments(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await appointmentAPI.updateAppointment(id, { status });
      fetchAppointments();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const filtered = appointments.filter((a) => {
    if (filter === 'all') return true;
    return a.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Doctor Clinical Appointments</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Review booked patient visits, manage appointment statuses, and initiate medical reviews
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap ${
              filter === tab
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No appointments found</h3>
          <p className="text-xs text-slate-400 mt-1">
            No patient appointments found for filter "{filter}".
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((appt) => (
            <div
              key={appt.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400">Patient</span>
                    <h4 className="font-bold text-slate-900 text-sm">{appt.patient_name}</h4>
                    <p className="text-xs text-slate-500">{appt.patient_email}</p>
                    {appt.patient_phone && (
                      <p className="text-[11px] text-slate-400">{appt.patient_phone}</p>
                    )}
                  </div>
                  <Badge variant={getAppointmentStatusVariant(appt.status)}>{appt.status}</Badge>
                </div>

                <div className="py-3 space-y-1 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>Date: <strong className="text-slate-900">{appt.appointment_date}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-teal-600" />
                    <span>Time: <strong className="text-slate-900">{appt.appointment_time}</strong></span>
                  </div>
                  {appt.reason && (
                    <div className="pt-2 text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-100 text-xs">
                      <span className="font-bold text-slate-900">Reason:</span> {appt.reason}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  {appt.status === 'pending' && (
                    <button
                      onClick={() => handleStatusChange(appt.id, 'confirmed')}
                      className="px-2.5 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Confirm
                    </button>
                  )}
                  {appt.status !== 'cancelled' && appt.status !== 'completed' && (
                    <button
                      onClick={() => handleStatusChange(appt.id, 'cancelled')}
                      className="px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                  )}
                </div>

                <button
                  onClick={() => navigate(`/doctor/patients/${appt.patient_id}?appointmentId=${appt.id}`)}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition-colors flex items-center gap-1 shadow-2xs"
                >
                  <Stethoscope className="w-3.5 h-3.5" /> Open Chart & Review
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
