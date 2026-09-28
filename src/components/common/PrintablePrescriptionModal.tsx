import React from 'react';
import { Modal } from './Modal.js';
import { Printer, HeartPulse, ShieldCheck } from 'lucide-react';

interface PrescriptionDetailsProps {
  isOpen: boolean;
  onClose: () => void;
  prescription: any;
}

export const PrintablePrescriptionModal: React.FC<PrescriptionDetailsProps> = ({
  isOpen,
  onClose,
  prescription,
}) => {
  if (!prescription) return null;

  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(prescription.created_at).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Digital Prescription"
      subtitle={`Rx Record ID: ${prescription.id.slice(0, 8)}`}
      maxWidth="2xl"
    >
      <div className="space-y-6">
        {/* Print Button Bar */}
        <div className="flex justify-end no-print">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" /> Print / Export PDF
          </button>
        </div>

        {/* Prescription Printable Sheet */}
        <div className="p-6 sm:p-8 bg-white border border-slate-200 rounded-2xl shadow-xs printable-area text-slate-800 font-sans">
          {/* Header */}
          <div className="flex items-start justify-between border-b-2 border-teal-600 pb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-black text-xl">
                <HeartPulse className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-xl font-extrabold tracking-tight text-slate-900 leading-tight">
                  MEDIVAULT
                </h1>
                <p className="text-[11px] font-semibold tracking-wider text-teal-600 uppercase">
                  Centralized Digital Healthcare System
                </p>
              </div>
            </div>

            <div className="text-right">
              <span className="text-2xl font-serif font-black text-teal-700 block">℞</span>
              <p className="text-xs text-slate-500 mt-0.5">Date: <span className="font-semibold text-slate-800">{formattedDate}</span></p>
            </div>
          </div>

          {/* Doctor & Patient Information Grid */}
          <div className="grid grid-cols-2 gap-6 my-6 text-xs">
            {/* Doctor */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block mb-1">
                Attending Physician
              </span>
              <p className="text-sm font-bold text-slate-900">{prescription.doctor?.name || prescription.doctor_name || 'Dr. Specialist'}</p>
              <p className="text-slate-600 mt-0.5">{prescription.doctor?.specialization || prescription.doctor_specialization}</p>
              <p className="text-slate-500">{prescription.doctor?.hospital || prescription.doctor_hospital}</p>
              <p className="text-[11px] text-slate-400 mt-1">License: {prescription.doctor?.license_number || prescription.doctor_license || 'MED-VERIFIED'}</p>
            </div>

            {/* Patient */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider block mb-1">
                Patient Credentials
              </span>
              <p className="text-sm font-bold text-slate-900">{prescription.patient?.name || prescription.patient_name || 'Registered Patient'}</p>
              <p className="text-slate-600 mt-0.5">
                Gender: {prescription.patient?.gender || 'N/A'} • DOB: {prescription.patient?.date_of_birth || 'N/A'}
              </p>
              <p className="text-slate-500">Blood Group: <span className="font-bold text-teal-700">{prescription.patient?.blood_group || 'O+'}</span></p>
              {prescription.patient?.allergies && (
                <p className="text-rose-600 font-semibold mt-1">Allergies: {prescription.patient.allergies}</p>
              )}
            </div>
          </div>

          {/* Diagnosis */}
          {prescription.diagnosis && (
            <div className="mb-6 p-3 bg-teal-50/50 rounded-xl border border-teal-100/80 text-xs">
              <span className="font-bold text-teal-900 uppercase tracking-wider text-[10px] block mb-0.5">
                Clinical Diagnosis:
              </span>
              <p className="text-slate-800 font-semibold text-sm">{prescription.diagnosis}</p>
            </div>
          )}

          {/* Medicines Table */}
          <div className="mb-6">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Prescribed Medications & Dosages
            </span>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-3">#</th>
                    <th className="p-3">Medicine Name</th>
                    <th className="p-3">Dosage</th>
                    <th className="p-3">Frequency</th>
                    <th className="p-3">Duration</th>
                    <th className="p-3">Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(prescription.items || []).map((item: any, idx: number) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/60">
                      <td className="p-3 font-bold text-slate-400">{idx + 1}</td>
                      <td className="p-3 font-bold text-slate-900">{item.medicine_name}</td>
                      <td className="p-3 font-semibold text-teal-700">{item.dosage}</td>
                      <td className="p-3 text-slate-700">{item.frequency}</td>
                      <td className="p-3 text-slate-700">{item.duration}</td>
                      <td className="p-3 text-slate-600 italic">{item.instructions || 'As directed'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* General Directions */}
          {prescription.instructions && (
            <div className="mb-6 text-xs text-slate-700 p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="font-bold text-slate-900 uppercase text-[10px] tracking-wider block mb-1">
                General Instructions:
              </span>
              <p className="leading-relaxed">{prescription.instructions}</p>
            </div>
          )}

          {/* Footer & Signature */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex items-end justify-between">
            <div className="text-[11px] text-slate-400 space-y-1">
              <div className="flex items-center gap-1 text-teal-600 font-bold">
                <ShieldCheck className="w-4 h-4" /> Medivault Digitally Authenticated Prescription
              </div>
              <p>Generated securely on the MEDIVAULT Centralized Clinical System</p>
            </div>

            <div className="text-right">
              <div className="w-36 border-b border-slate-400 pb-1 mb-1 font-serif text-slate-800 text-xs italic">
                {prescription.doctor?.name || prescription.doctor_name || 'Dr. Attending'}
              </div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Physician Signature
              </span>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
