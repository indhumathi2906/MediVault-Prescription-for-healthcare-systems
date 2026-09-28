import React, { useState, useEffect } from 'react';
import { appointmentAPI, doctorAPI } from '../../services/api.js';
import { Appointment, User } from '../../types/index.js';
import { Badge, getAppointmentStatusVariant } from '../../components/common/Badge.js';
import { Modal } from '../../components/common/Modal.js';
import { Calendar, Plus, Clock, User as UserIcon, AlertCircle, CheckCircle2, Ban } from 'lucide-react';

export const PatientAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [doctors, setDoctors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');

  // Booking modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [appointmentDate, setAppointmentDate] = useState('');
  const [appointmentTime, setAppointmentTime] = useState('10:00');
  const [reason, setReason] = useState('');
  const [bookingError, setBookingError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [apptRes, docRes] = await Promise.all([
        appointmentAPI.getAppointments(),
        doctorAPI.getDoctors(),
      ]);
      if (apptRes.data.success) setAppointments(apptRes.data.data);
      if (docRes.data.success) {
        setDoctors(docRes.data.data);
        if (docRes.data.data.length > 0) {
          setSelectedDoctorId(docRes.data.data[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load appointments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setBookingError('');
    setIsSubmitting(true);

    try {
      const res = await appointmentAPI.createAppointment({
        doctor_id: selectedDoctorId,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        reason,
      });

      if (res.data.success) {
        setIsModalOpen(false);
        setReason('');
        fetchData();
      }
    } catch (err: any) {
      // Handles double booking conflict error 409
      setBookingError(err.response?.data?.message || 'Failed to book appointment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAppointment = async (id: string) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      await appointmentAPI.cancelAppointment(id);
      fetchData();
    } catch (err) {
      console.error('Failed to cancel appointment:', err);
    }
  };

  const filteredAppointments = appointments.filter((a) => {
    if (filter === 'all') return true;
    return a.status === filter;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Appointments</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your doctor consultations, schedule follow-ups, and review booking statuses
          </p>
        </div>

        <button
          onClick={() => {
            setBookingError('');
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" /> Book New Appointment
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all whitespace-nowrap ${
              filter === tab
                ? 'bg-teal-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Appointments Grid / List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No appointments found</h3>
          <p className="text-xs text-slate-400 mt-1">
            {filter === 'all'
              ? 'You have not booked any appointments yet.'
              : `No appointments with status "${filter}".`}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAppointments.map((appt) => (
            <div
              key={appt.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-teal-600 tracking-wider">
                      Consultant
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{appt.doctor_name}</h4>
                    <p className="text-xs text-slate-500">{appt.doctor_specialization}</p>
                    {appt.doctor_hospital && (
                      <p className="text-[11px] text-slate-400 mt-0.5">{appt.doctor_hospital}</p>
                    )}
                  </div>
                  <Badge variant={getAppointmentStatusVariant(appt.status)}>{appt.status}</Badge>
                </div>

                <div className="py-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-3.5 h-3.5 text-teal-600" />
                    <span>Date: <strong className="text-slate-900">{appt.appointment_date}</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Time: <strong className="text-slate-900">{appt.appointment_time}</strong></span>
                  </div>
                  {appt.reason && (
                    <div className="pt-2 text-slate-700">
                      <span className="font-semibold text-slate-800">Reason:</span> {appt.reason}
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400">
                  Booked: {new Date(appt.created_at).toLocaleDateString()}
                </span>

                {(appt.status === 'pending' || appt.status === 'confirmed') && (
                  <button
                    onClick={() => handleCancelAppointment(appt.id)}
                    className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 hover:underline"
                  >
                    <Ban className="w-3 h-3" /> Cancel
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Book Appointment Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Schedule Clinical Appointment"
        subtitle="Select a verified doctor, date, and preferred time slot."
        maxWidth="md"
      >
        <form onSubmit={handleBookAppointment} className="space-y-4">
          {bookingError && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{bookingError}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Doctor</label>
            <select
              value={selectedDoctorId}
              onChange={(e) => setSelectedDoctorId(e.target.value)}
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-teal-500 focus:border-teal-500 bg-slate-50"
            >
              {doctors.map((doc: any) => (
                <option key={doc.id} value={doc.id}>
                  {doc.full_name} — {doc.profile?.specialization || 'Specialist'} ({doc.profile?.hospital || 'Central'})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Date</label>
              <input
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                value={appointmentDate}
                onChange={(e) => setAppointmentDate(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-teal-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Time Slot</label>
              <select
                value={appointmentTime}
                onChange={(e) => setAppointmentTime(e.target.value)}
                className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-teal-500 bg-slate-50"
              >
                <option value="09:00">09:00 AM</option>
                <option value="09:30">09:30 AM</option>
                <option value="10:00">10:00 AM</option>
                <option value="10:30">10:30 AM</option>
                <option value="11:00">11:00 AM</option>
                <option value="11:30">11:30 AM</option>
                <option value="14:00">02:00 PM</option>
                <option value="14:30">02:30 PM</option>
                <option value="15:00">03:00 PM</option>
                <option value="15:30">03:30 PM</option>
                <option value="16:00">04:00 PM</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Reason for Visit</label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Hypertension follow-up review, prescription renewal, persistent coughing..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-teal-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !appointmentDate}
              className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs disabled:opacity-50 flex items-center gap-1.5"
            >
              {isSubmitting ? (
                'Checking Availability...'
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" /> Confirm Booking
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
