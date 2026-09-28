import React, { useState, useEffect } from 'react';
import { Modal } from '../common/Modal.js';
import { progressAPI, consultationAPI } from '../../services/api.js';
import { User, Appointment, ProgressStatus } from '../../types/index.js';
import { Calculator, AlertCircle, CheckCircle2, Heart, Scale, Gauge, Thermometer, Droplets, Activity } from 'lucide-react';

interface AddProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: User | { id: string; full_name: string; email?: string; phone?: string; profile?: any };
  appointmentId?: string;
  onSuccess?: () => void;
}

export const AddProgressModal: React.FC<AddProgressModalProps> = ({
  isOpen,
  onClose,
  patient,
  appointmentId,
  onSuccess,
}) => {
  const [weight, setWeight] = useState<string>('');
  const [height, setHeight] = useState<string>('');
  const [bmi, setBmi] = useState<string>('');
  const [heartRate, setHeartRate] = useState<string>('');
  const [systolicBp, setSystolicBp] = useState<string>('');
  const [diastolicBp, setDiastolicBp] = useState<string>('');
  const [bloodSugar, setBloodSugar] = useState<string>('');
  const [temperature, setTemperature] = useState<string>('');
  const [oxygenSaturation, setOxygenSaturation] = useState<string>('');

  const [progressStatus, setProgressStatus] = useState<ProgressStatus>('Improving');
  const [symptomsStatus, setSymptomsStatus] = useState<string>('');
  const [treatmentAdherence, setTreatmentAdherence] = useState<string>('High compliance with prescribed regimen');
  const [patientReportedImprovement, setPatientReportedImprovement] = useState<string>('');
  const [doctorNotes, setDoctorNotes] = useState<string>('');
  const [followUpDate, setFollowUpDate] = useState<string>('');

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Automatic BMI Calculation: BMI = weight(kg) / (height(m))^2
  useEffect(() => {
    const w = parseFloat(weight);
    const h = parseFloat(height);

    if (w > 0 && h > 0) {
      const heightInMeters = h > 3 ? h / 100 : h;
      const calculated = w / (heightInMeters * heightInMeters);
      setBmi(calculated.toFixed(1));
    } else {
      setBmi('');
    }
  }, [weight, height]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    try {
      await progressAPI.createProgressRecord({
        patient_id: patient.id,
        appointment_id: appointmentId,
        weight: weight ? parseFloat(weight) : undefined,
        height: height ? parseFloat(height) : undefined,
        heart_rate: heartRate ? parseInt(heartRate) : undefined,
        systolic_bp: systolicBp ? parseInt(systolicBp) : undefined,
        diastolic_bp: diastolicBp ? parseInt(diastolicBp) : undefined,
        blood_sugar: bloodSugar ? parseFloat(bloodSugar) : undefined,
        temperature: temperature ? parseFloat(temperature) : undefined,
        oxygen_saturation: oxygenSaturation ? parseFloat(oxygenSaturation) : undefined,
        progress_status: progressStatus,
        symptoms_status: symptomsStatus,
        treatment_adherence: treatmentAdherence,
        patient_reported_improvement: patientReportedImprovement,
        doctor_progress_notes: doctorNotes,
        follow_up_date: followUpDate || undefined,
      });

      if (onSuccess) onSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to save health progress assessment.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Add Patient Health Progress Review"
      subtitle="Every review creates a new immutable historical record for continuous tracking."
      maxWidth="2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {errorMsg && (
          <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* 1. PATIENT INFORMATION */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/70">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Section 1: Patient Information
          </span>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900 text-sm">{patient.full_name}</p>
              <p className="text-xs text-slate-500">{patient.email || 'Registered Patient'}</p>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 bg-white rounded-lg border text-teal-700">
              ID: {patient.id.slice(0, 8)}...
            </span>
          </div>
        </div>

        {/* 2. CURRENT SYMPTOMS & CLINICAL OBSERVATIONS */}
        <div className="space-y-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Section 2: Clinical Observations & Symptoms
          </span>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Current Symptoms / Patient Complaints
            </label>
            <input
              type="text"
              value={symptomsStatus}
              onChange={(e) => setSymptomsStatus(e.target.value)}
              placeholder="e.g. Asymptomatic, mild morning headache resolved, good stamina..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Treatment Adherence
              </label>
              <input
                type="text"
                value={treatmentAdherence}
                onChange={(e) => setTreatmentAdherence(e.target.value)}
                placeholder="e.g. 100% adherence to medication & diet..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Patient-Reported Improvement
              </label>
              <input
                type="text"
                value={patientReportedImprovement}
                onChange={(e) => setPatientReportedImprovement(e.target.value)}
                placeholder="e.g. Feels significantly more energetic, sleeps 8 hours..."
                className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* 3. HEALTH METRICS (OPTIONAL AS PER SPEC) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Section 3: Health Metrics (Optional - Enter Available)
            </span>
            <span className="text-[10px] text-teal-600 font-semibold flex items-center gap-1">
              <Calculator className="w-3 h-3" /> Auto BMI Enabled
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Weight */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-teal-600" /> Weight (kg)
              </label>
              <input
                type="number"
                step="0.1"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="e.g. 72.5"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {/* Height */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Height (m or cm)
              </label>
              <input
                type="number"
                step="0.01"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="e.g. 1.75 or 175"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {/* Automatic BMI */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calculator className="w-3.5 h-3.5 text-indigo-600" /> BMI (Auto)
              </label>
              <input
                type="text"
                value={bmi ? `${bmi} kg/m²` : '--'}
                readOnly
                className="w-full text-xs px-3 py-2 rounded-xl border border-indigo-100 bg-indigo-50/50 font-bold text-indigo-700"
              />
            </div>

            {/* Systolic BP */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-blue-600" /> Systolic BP (mmHg)
              </label>
              <input
                type="number"
                value={systolicBp}
                onChange={(e) => setSystolicBp(e.target.value)}
                placeholder="e.g. 120"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {/* Diastolic BP */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                Diastolic BP (mmHg)
              </label>
              <input
                type="number"
                value={diastolicBp}
                onChange={(e) => setDiastolicBp(e.target.value)}
                placeholder="e.g. 80"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {/* Heart Rate */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-500" /> Heart Rate (bpm)
              </label>
              <input
                type="number"
                value={heartRate}
                onChange={(e) => setHeartRate(e.target.value)}
                placeholder="e.g. 74"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {/* Blood Sugar */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Droplets className="w-3.5 h-3.5 text-amber-600" /> Fasting Glucose
              </label>
              <input
                type="number"
                step="0.1"
                value={bloodSugar}
                onChange={(e) => setBloodSugar(e.target.value)}
                placeholder="e.g. 110 mg/dL"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {/* Temperature */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-orange-600" /> Temperature (°F)
              </label>
              <input
                type="number"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(e.target.value)}
                placeholder="e.g. 98.6"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            {/* Oxygen Saturation */}
            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-cyan-600" /> SpO2 (%)
              </label>
              <input
                type="number"
                step="0.1"
                value={oxygenSaturation}
                onChange={(e) => setOxygenSaturation(e.target.value)}
                placeholder="e.g. 99"
                className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
          </div>
        </div>

        {/* 4. PROGRESS ASSESSMENT (SECTION 19) */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Section 4: Clinical Progress Assessment Status *
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['Improving', 'Stable', 'Needs Attention', 'Worsening'] as ProgressStatus[]).map((st) => (
              <button
                type="button"
                key={st}
                onClick={() => setProgressStatus(st)}
                className={`py-2 px-3 text-xs font-bold rounded-xl border text-center transition-all ${
                  progressStatus === st
                    ? st === 'Improving'
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                      : st === 'Stable'
                      ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                      : st === 'Needs Attention'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                      : 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* 5. DOCTOR NOTES & FOLLOW-UP */}
        <div className="space-y-3">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Section 5: Doctor Progress Notes & Next Follow-Up
          </span>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Physician Summary Notes & Directives
            </label>
            <textarea
              rows={3}
              value={doctorNotes}
              onChange={(e) => setDoctorNotes(e.target.value)}
              placeholder="e.g. Outstanding vascular improvement. Blood pressure normalized. Reduced dosage to 2.5mg maintenance..."
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Next Review / Follow-up Date
            </label>
            <input
              type="date"
              value={followUpDate}
              onChange={(e) => setFollowUpDate(e.target.value)}
              className="w-full text-xs px-3.5 py-2 rounded-xl border border-slate-200 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl transition-colors shadow-xs disabled:opacity-50 flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <>Saving Assessment...</>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> Save Progress Review
              </>
            )}
          </button>
        </div>
      </form>
    </Modal>
  );
};
