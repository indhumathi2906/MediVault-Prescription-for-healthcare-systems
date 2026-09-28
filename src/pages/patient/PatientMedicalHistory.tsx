import React, { useEffect, useState } from 'react';
import { patientAPI } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { PrintablePrescriptionModal } from '../../components/common/PrintablePrescriptionModal.js';
import { History, Calendar, User, FileText, Stethoscope, Clock, Printer } from 'lucide-react';

export const PatientMedicalHistory: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState<any | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      if (!user) return;
      try {
        setLoading(true);
        const res = await patientAPI.getHistory(user.id);
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (err) {
        console.error('Failed to load patient medical history:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const { consultations = [], progressRecords = [] } = data || {};

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Comprehensive Medical History</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Centralized longitudinal clinical consultations, diagnoses, and physician observations
        </p>
      </div>

      {consultations.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No Consultations Recorded</h3>
          <p className="text-xs text-slate-400 mt-1">
            Clinical consultations conducted by your doctors will be permanently archived here.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {consultations.map((consult: any, index: number) => {
            const dateStr = new Date(consult.consultation_date).toLocaleDateString('en-US', {
              month: 'long',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div
                key={consult.id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden"
              >
                {/* Consultation Header */}
                <div className="bg-slate-50/80 px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-extrabold text-sm">
                      #{consultations.length - index}
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-teal-600 tracking-wider">
                        Clinical Consultation
                      </span>
                      <h3 className="text-base font-bold text-slate-900">
                        {consult.diagnosis}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-teal-600" />
                      <span>{dateStr}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-blue-600" />
                      <span className="font-semibold text-slate-800">{consult.doctor_name}</span>
                    </div>
                  </div>
                </div>

                {/* Consultation Body */}
                <div className="p-6 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Symptoms */}
                    {consult.symptoms && (
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Symptoms / Chief Complaints
                        </span>
                        <p className="text-xs text-slate-700 leading-relaxed">{consult.symptoms}</p>
                      </div>
                    )}

                    {/* Observations */}
                    {consult.observations && (
                      <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          Clinical Observations & Findings
                        </span>
                        <p className="text-xs text-slate-700 leading-relaxed">{consult.observations}</p>
                      </div>
                    )}
                  </div>

                  {/* Doctor Notes */}
                  {consult.doctor_notes && (
                    <div className="p-4 bg-teal-50/50 rounded-xl border border-teal-100/80">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-teal-900 block mb-1">
                        Attending Physician Directives & Notes
                      </span>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        "{consult.doctor_notes}"
                      </p>
                    </div>
                  )}

                  {/* Attached Digital Prescription if available */}
                  {consult.prescription && (
                    <div className="p-4 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block">
                          Associated Digital Prescription
                        </span>
                        <p className="text-xs font-bold text-slate-900 mt-0.5">
                          {consult.prescription.items?.length || 0} Medications Prescribed
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {consult.prescription.instructions || 'Standard dosage plan'}
                        </p>
                      </div>

                      <button
                        onClick={() => setSelectedPrescription(consult.prescription)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors shrink-0"
                      >
                        <Printer className="w-3.5 h-3.5" /> View / Print Prescription
                      </button>
                    </div>
                  )}

                  {/* Follow-up recommendation */}
                  {consult.follow_up_date && (
                    <div className="pt-2 text-xs font-semibold text-teal-700 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        Recommended Follow-up Date:{' '}
                        {new Date(consult.follow_up_date).toLocaleDateString('en-US', {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Prescription Modal */}
      {selectedPrescription && (
        <PrintablePrescriptionModal
          isOpen={Boolean(selectedPrescription)}
          onClose={() => setSelectedPrescription(null)}
          prescription={selectedPrescription}
        />
      )}
    </div>
  );
};
