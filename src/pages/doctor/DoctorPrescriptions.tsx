import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { prescriptionAPI, doctorAPI } from '../../services/api.js';
import { PrintablePrescriptionModal } from '../../components/common/PrintablePrescriptionModal.js';
import { FileText, Printer, Calendar, User, Search, Pill } from 'lucide-react';

export const DoctorPrescriptions: React.FC = () => {
  const { user } = useAuth();
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrescription, setSelectedPrescription] = useState<any | null>(null);
  const [search, setSearch] = useState('');

  const fetchPrescriptions = async () => {
    if (!user) return;
    try {
      setLoading(true);
      // Fetch patients first, then compile prescriptions
      const pRes = await doctorAPI.getDoctorPatients(user.id);
      if (pRes.data.success) {
        const patients = pRes.data.data;
        const allRx: any[] = [];
        for (const p of patients) {
          try {
            const rxRes = await prescriptionAPI.getPrescriptionsByPatient(p.id);
            if (rxRes.data.success) {
              rxRes.data.data.forEach((r: any) => {
                allRx.push({ ...r, patient_name: p.full_name });
              });
            }
          } catch {}
        }
        setPrescriptions(allRx);
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
      console.error('Failed to load prescription detail:', err);
    }
  };

  const filtered = prescriptions.filter((p) => {
    const q = search.toLowerCase();
    return (
      p.patient_name?.toLowerCase().includes(q) ||
      p.diagnosis?.toLowerCase().includes(q) ||
      p.items?.some((i: any) => i.medicine_name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Issued Digital Prescriptions</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Verified electronic prescriptions issued to patients under your care
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient or medicine..."
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
          <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-700">No prescriptions found</h3>
          <p className="text-xs text-slate-400 mt-1">
            Issue prescriptions from the patient clinical chart workspace.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((rx) => (
            <div
              key={rx.id}
              className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
            >
              <div>
                <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-600">
                      Patient
                    </span>
                    <h4 className="font-bold text-slate-900 text-sm">{rx.patient_name}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{rx.diagnosis}</p>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-semibold">
                    ID: {rx.id.slice(0, 8)}
                  </span>
                </div>

                <div className="py-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                    Prescribed Items ({rx.items?.length || 0})
                  </span>
                  <div className="space-y-1">
                    {(rx.items || []).map((item: any, idx: number) => (
                      <div
                        key={item.id || idx}
                        className="flex items-center justify-between text-xs p-1.5 bg-slate-50 rounded-lg"
                      >
                        <span className="font-bold text-slate-800">{item.medicine_name}</span>
                        <span className="text-teal-700">{item.dosage} • {item.frequency}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs text-slate-400">
                  {new Date(rx.created_at).toLocaleDateString()}
                </span>
                <button
                  onClick={() => handleOpenPrescription(rx.id)}
                  className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shadow-2xs"
                >
                  <Printer className="w-3.5 h-3.5" /> Printable View
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
