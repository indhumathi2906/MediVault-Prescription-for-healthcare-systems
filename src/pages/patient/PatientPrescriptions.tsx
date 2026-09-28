import React, { useState, useEffect } from 'react';
import { prescriptionAPI } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { Prescription } from '../../types/index.js';
import { PrintablePrescriptionModal } from '../../components/common/PrintablePrescriptionModal.js';
import { FileText, Printer, Calendar, User, Eye, Pill } from 'lucide-react';

export const PatientPrescriptions: React.FC = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState<any | null>(null);

  const fetchPrescriptions = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const res = await prescriptionAPI.getPrescriptionsByPatient(user.id);
      if (res.data.success) {
        setPrescriptions(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load prescriptions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrescriptions();
  }, [user]);

  const handleOpenPrescription = async (id: string) => {
    try {
      const res = await prescriptionAPI.getPrescriptionById(id);
      if (res.data.success) {
        setSelectedPrescription(res.data.data);
      }
    } catch (err) {
      console.error('Failed to open prescription:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Digital Prescriptions</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Access, view, and print legally verified digital prescriptions issued by your doctors
          </p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No Prescriptions Issued</h3>
          <p className="text-xs text-slate-400 mt-1">
            When your doctor issues a digital prescription during a consultation, it will appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {prescriptions.map((rx) => (
            <div
              key={rx.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center font-bold text-base shrink-0">
                      ℞
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">
                        {rx.diagnosis || 'Clinical Treatment Plan'}
                      </h4>
                      <p className="text-xs text-slate-500">By {rx.doctor_name}</p>
                    </div>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">
                    ID: {rx.id.slice(0, 8)}
                  </span>
                </div>

                {/* Medications preview */}
                <div className="py-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
                    Medications ({rx.items?.length || 0} items)
                  </span>
                  <div className="space-y-1.5">
                    {(rx.items || []).map((item, idx) => (
                      <div
                        key={item.id || idx}
                        className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-50 border border-slate-100"
                      >
                        <div className="flex items-center gap-2">
                          <Pill className="w-3.5 h-3.5 text-teal-600" />
                          <span className="font-bold text-slate-800">{item.medicine_name}</span>
                          <span className="text-teal-700 font-semibold">({item.dosage})</span>
                        </div>
                        <span className="text-[11px] text-slate-500">{item.frequency}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {rx.instructions && (
                  <p className="text-xs text-slate-600 italic bg-amber-50/50 p-2.5 rounded-lg border border-amber-100">
                    "{rx.instructions}"
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between mt-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{new Date(rx.created_at).toLocaleDateString()}</span>
                </div>

                <button
                  onClick={() => handleOpenPrescription(rx.id)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" /> View / Print Rx
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Printable Prescription Modal */}
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
