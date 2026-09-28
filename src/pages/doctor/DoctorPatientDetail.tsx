import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { patientAPI, progressAPI, consultationAPI, prescriptionAPI } from '../../services/api.js';
import { ProgressSummary, ProgressRecord, ChartMetricPoint } from '../../types/index.js';
import { ProgressComparisonCard } from '../../components/progress/ProgressComparisonCard.js';
import { ProgressCharts } from '../../components/progress/ProgressCharts.js';
import { ProgressTimeline } from '../../components/progress/ProgressTimeline.js';
import { AddProgressModal } from '../../components/progress/AddProgressModal.js';
import { PrintablePrescriptionModal } from '../../components/common/PrintablePrescriptionModal.js';
import { Modal } from '../../components/common/Modal.js';
import {
  ArrowLeft,
  Activity,
  Plus,
  FileText,
  Calendar,
  Clock,
  User,
  Heart,
  Pill,
  CheckCircle2,
  AlertCircle,
  Printer,
} from 'lucide-react';

export const DoctorPatientDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointmentId') || undefined;

  const [historyData, setHistoryData] = useState<any>(null);
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [metrics, setMetrics] = useState<ChartMetricPoint[]>([]);
  const [records, setRecords] = useState<ProgressRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isAddProgressOpen, setIsAddProgressOpen] = useState(false);
  const [isNewConsultationOpen, setIsNewConsultationOpen] = useState(false);
  const [isNewPrescriptionOpen, setIsNewPrescriptionOpen] = useState(false);
  const [selectedPrescription, setSelectedPrescription] = useState<any | null>(null);

  // New Consultation Form State
  const [consultDiagnosis, setConsultDiagnosis] = useState('');
  const [consultSymptoms, setConsultSymptoms] = useState('');
  const [consultObservations, setConsultObservations] = useState('');
  const [consultNotes, setConsultNotes] = useState('');
  const [consultFollowUp, setConsultFollowUp] = useState('');
  const [consultSubmitting, setConsultSubmitting] = useState(false);

  // New Prescription Form State
  const [rxDiagnosis, setRxDiagnosis] = useState('');
  const [rxInstructions, setRxInstructions] = useState('');
  const [rxItems, setRxItems] = useState([
    { medicine_name: '', dosage: '', frequency: 'Once daily', duration: '14 days', instructions: 'Take after meals' },
  ]);
  const [rxSubmitting, setRxSubmitting] = useState(false);

  const fetchPatientDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [histRes, sumRes, recRes, metRes] = await Promise.all([
        patientAPI.getHistory(id),
        progressAPI.getPatientProgressSummary(id),
        progressAPI.getPatientProgress(id),
        progressAPI.getPatientProgressMetrics(id),
      ]);

      if (histRes.data.success) setHistoryData(histRes.data.data);
      if (sumRes.data.success) setSummary(sumRes.data.data);
      if (recRes.data.success) setRecords(recRes.data.data);
      if (metRes.data.success) setMetrics(metRes.data.data);
    } catch (err) {
      console.error('Failed to load patient file:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatientDetails();
  }, [id]);

  const handleAddConsultation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setConsultSubmitting(true);
    try {
      await consultationAPI.createConsultation({
        patient_id: id,
        appointment_id: appointmentId,
        diagnosis: consultDiagnosis,
        symptoms: consultSymptoms,
        observations: consultObservations,
        doctor_notes: consultNotes,
        follow_up_date: consultFollowUp || undefined,
      });
      setIsNewConsultationOpen(false);
      setConsultDiagnosis('');
      setConsultSymptoms('');
      setConsultObservations('');
      setConsultNotes('');
      fetchPatientDetails();
    } catch (err) {
      console.error('Failed to add consultation:', err);
    } finally {
      setConsultSubmitting(false);
    }
  };

  const handleAddPrescriptionItem = () => {
    setRxItems((prev) => [
      ...prev,
      { medicine_name: '', dosage: '', frequency: 'Twice daily', duration: '7 days', instructions: 'Take after meals' },
    ]);
  };

  const handleRxItemChange = (index: number, field: string, val: string) => {
    setRxItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: val };
      return updated;
    });
  };

  const handleRemoveRxItem = (index: number) => {
    if (rxItems.length <= 1) return;
    setRxItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddPrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setRxSubmitting(true);
    try {
      await prescriptionAPI.createPrescription({
        patient_id: id,
        diagnosis: rxDiagnosis || consultDiagnosis || 'Clinical Regimen',
        instructions: rxInstructions,
        items: rxItems.filter((i) => i.medicine_name.trim() !== ''),
      });
      setIsNewPrescriptionOpen(false);
      fetchPatientDetails();
    } catch (err) {
      console.error('Failed to create prescription:', err);
    } finally {
      setRxSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const patient = historyData?.patient;
  const profile = patient?.profile;
  const consultations = historyData?.consultations || [];

  return (
    <div className="space-y-6 pb-12">
      {/* Back button & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link
            to="/doctor/patients"
            className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-blue-600">
              Clinical Workspace
            </span>
            <h1 className="text-2xl font-bold text-slate-900">
              {patient?.full_name || 'Patient Chart'}
            </h1>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsNewConsultationOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
          >
            <Plus className="w-3.5 h-3.5" /> Log Consultation
          </button>

          <button
            onClick={() => setIsNewPrescriptionOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs"
          >
            <Pill className="w-3.5 h-3.5" /> Issue Digital Rx
          </button>

          {/* CRITICAL BUTTON: RECORD PROGRESS REVIEW (AUTO BMI) */}
          <button
            onClick={() => setIsAddProgressOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white rounded-xl text-xs font-extrabold transition-all shadow-md shadow-teal-600/20 hover:scale-105"
          >
            <Activity className="w-4 h-4" /> Record Health Progress Review
          </button>
        </div>
      </div>

      {/* Patient Demographic Summary Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs">
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Gender & Age</span>
            <p className="font-bold text-slate-900 text-sm mt-0.5">
              {patient?.gender || 'N/A'} • {patient?.date_of_birth || 'N/A'}
            </p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Blood Group</span>
            <p className="font-bold text-teal-700 text-sm mt-0.5">{profile?.blood_group || 'O+'}</p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Phone</span>
            <p className="font-medium text-slate-700 mt-0.5">{patient?.phone || 'N/A'}</p>
          </div>

          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Reviews</span>
            <p className="font-bold text-slate-900 text-sm mt-0.5">{summary?.totalReviews || 0} logged</p>
          </div>

          <div className="col-span-2">
            <span className="text-[10px] uppercase font-bold text-slate-400">Allergies & Contraindications</span>
            <p className="text-rose-600 font-semibold mt-0.5">
              {profile?.allergies || 'No known allergies reported'}
            </p>
          </div>
        </div>

        {profile?.existing_conditions && (
          <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
            <span className="font-bold text-slate-800">Existing Conditions:</span>{' '}
            {profile.existing_conditions}
          </div>
        )}
      </div>

      {/* CROWN FEATURE: DYNAMIC PREVIOUS VS CURRENT COMPARISON */}
      <section>
        <ProgressComparisonCard
          latestRecord={summary?.latestRecord || null}
          previousRecord={summary?.previousRecord || null}
          comparisons={summary?.comparisons || []}
        />
      </section>

      {/* RECHARTS TREND VISUALIZATION */}
      <section>
        <ProgressCharts metrics={metrics} />
      </section>

      {/* HISTORICAL REVIEWS TIMELINE (APPEND-ONLY VERIFICATION) */}
      <section>
        <ProgressTimeline records={records} />
      </section>

      {/* CONSULTATIONS LIST */}
      <section className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">Clinical Consultations History</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              All previous clinical examinations and recorded diagnoses
            </p>
          </div>
          <span className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 font-bold rounded-full">
            {consultations.length} Consultations
          </span>
        </div>

        <div className="space-y-4">
          {consultations.length === 0 ? (
            <p className="text-xs text-slate-400 text-center py-6">No previous consultations recorded.</p>
          ) : (
            consultations.map((c: any) => (
              <div key={c.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{c.diagnosis}</span>
                  <span className="text-slate-500 font-medium">
                    {new Date(c.consultation_date).toLocaleDateString()}
                  </span>
                </div>
                {c.symptoms && (
                  <p className="text-slate-600"><span className="font-semibold text-slate-800">Symptoms:</span> {c.symptoms}</p>
                )}
                {c.observations && (
                  <p className="text-slate-600"><span className="font-semibold text-slate-800">Observations:</span> {c.observations}</p>
                )}
                {c.doctor_notes && (
                  <p className="text-teal-900 bg-teal-50 p-2 rounded-lg border border-teal-100"><span className="font-bold">Doctor Notes:</span> {c.doctor_notes}</p>
                )}
                {c.prescription && (
                  <div className="pt-2 flex items-center justify-between border-t border-slate-200/60">
                    <span className="text-teal-700 font-bold">Attached Prescription ({c.prescription.items?.length || 0} meds)</span>
                    <button
                      onClick={() => setSelectedPrescription(c.prescription)}
                      className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-slate-800 transition-colors flex items-center gap-1"
                    >
                      <Printer className="w-3 h-3" /> View Rx
                    </button>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* ADD PROGRESS REVIEW MODAL */}
      {patient && (
        <AddProgressModal
          isOpen={isAddProgressOpen}
          onClose={() => setIsAddProgressOpen(false)}
          patient={patient}
          appointmentId={appointmentId}
          onSuccess={fetchPatientDetails}
        />
      )}

      {/* LOG CONSULTATION MODAL */}
      <Modal
        isOpen={isNewConsultationOpen}
        onClose={() => setIsNewConsultationOpen(false)}
        title="Conduct Clinical Consultation"
        subtitle={`Patient: ${patient?.full_name}`}
        maxWidth="xl"
      >
        <form onSubmit={handleAddConsultation} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Primary Diagnosis *</label>
            <input
              type="text"
              required
              value={consultDiagnosis}
              onChange={(e) => setConsultDiagnosis(e.target.value)}
              placeholder="e.g. Stage 1 Hypertension with metabolic improvement"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Symptoms / Chief Complaint</label>
            <input
              type="text"
              value={consultSymptoms}
              onChange={(e) => setConsultSymptoms(e.target.value)}
              placeholder="e.g. Mild headache, no chest pain, normal sleep..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Clinical Observations & Physical Exam</label>
            <textarea
              rows={2}
              value={consultObservations}
              onChange={(e) => setConsultObservations(e.target.value)}
              placeholder="e.g. Heart sounds S1/S2 normal, chest clear, no pedal edema..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Doctor Notes & Plan</label>
            <textarea
              rows={3}
              value={consultNotes}
              onChange={(e) => setConsultNotes(e.target.value)}
              placeholder="e.g. Continue lifestyle changes. Low-sodium diet. Review in 14 days."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Recommended Next Follow-up Date</label>
            <input
              type="date"
              value={consultFollowUp}
              onChange={(e) => setConsultFollowUp(e.target.value)}
              className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNewConsultationOpen(false)}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={consultSubmitting}
              className="px-5 py-2 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl disabled:opacity-50"
            >
              {consultSubmitting ? 'Saving...' : 'Save Consultation Record'}
            </button>
          </div>
        </form>
      </Modal>

      {/* ISSUE DIGITAL PRESCRIPTION MODAL */}
      <Modal
        isOpen={isNewPrescriptionOpen}
        onClose={() => setIsNewPrescriptionOpen(false)}
        title="Issue Digital Prescription"
        subtitle={`Patient: ${patient?.full_name}`}
        maxWidth="2xl"
      >
        <form onSubmit={handleAddPrescription} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Clinical Diagnosis</label>
            <input
              type="text"
              value={rxDiagnosis}
              onChange={(e) => setRxDiagnosis(e.target.value)}
              placeholder="e.g. Essential Hypertension"
              className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-teal-500"
            />
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 uppercase tracking-wider text-[10px]">
                Prescription Items
              </span>
              <button
                type="button"
                onClick={handleAddPrescriptionItem}
                className="text-xs font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" /> Add Medicine
              </button>
            </div>

            {rxItems.map((item, index) => (
              <div key={index} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Medicine Name *</label>
                    <input
                      type="text"
                      required
                      value={item.medicine_name}
                      onChange={(e) => handleRxItemChange(index, 'medicine_name', e.target.value)}
                      placeholder="e.g. Amlodipine"
                      className="w-full text-xs px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Dosage</label>
                    <input
                      type="text"
                      required
                      value={item.dosage}
                      onChange={(e) => handleRxItemChange(index, 'dosage', e.target.value)}
                      placeholder="e.g. 5mg"
                      className="w-full text-xs px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Frequency</label>
                    <input
                      type="text"
                      value={item.frequency}
                      onChange={(e) => handleRxItemChange(index, 'frequency', e.target.value)}
                      placeholder="e.g. Once daily in morning"
                      className="w-full text-xs px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 focus:ring-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Duration</label>
                    <input
                      type="text"
                      value={item.duration}
                      onChange={(e) => handleRxItemChange(index, 'duration', e.target.value)}
                      placeholder="e.g. 30 days"
                      className="w-full text-xs px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 focus:ring-teal-500"
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Directions</label>
                      <input
                        type="text"
                        value={item.instructions}
                        onChange={(e) => handleRxItemChange(index, 'instructions', e.target.value)}
                        placeholder="e.g. After breakfast with water"
                        className="w-full text-xs px-2.5 py-1.5 bg-white rounded-lg border border-slate-200 focus:ring-teal-500"
                      />
                    </div>
                    {rxItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveRxItem(index)}
                        className="px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 rounded-lg font-bold"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">General Dietary / Lifestyle Instructions</label>
            <textarea
              rows={2}
              value={rxInstructions}
              onChange={(e) => setRxInstructions(e.target.value)}
              placeholder="e.g. Maintain low-sodium diet, drink 2.5L water daily, monitor blood pressure weekly..."
              className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-teal-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsNewPrescriptionOpen(false)}
              className="px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={rxSubmitting}
              className="px-5 py-2 font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl disabled:opacity-50"
            >
              {rxSubmitting ? 'Generating Rx...' : 'Generate & Issue Prescription'}
            </button>
          </div>
        </form>
      </Modal>

      {/* PRINTABLE RX MODAL */}
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
