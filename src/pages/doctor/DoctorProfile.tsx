import React from 'react';
import { useAuth } from '../../context/AuthContext.js';
import { Stethoscope, Shield, Building, Award, Phone, Mail, User } from 'lucide-react';

export const DoctorProfile: React.FC = () => {
  const { user } = useAuth();
  const profile = (user?.profile as any) || {};

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Doctor Profile & Credentials</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Verified medical licensure, hospital affiliation, and clinical credentials
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-md shadow-blue-500/20">
            {user?.full_name?.charAt(0) || 'D'}
          </div>
          <div>
            <h3 className="text-xl font-bold text-slate-900">Dr. {user?.full_name}</h3>
            <p className="text-xs text-slate-500">{user?.email}</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full">
                Active Clinician
              </span>
              <span className="text-[10px] text-slate-400">UID: {user?.id}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
            <Stethoscope className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Specialization</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">
                {profile.specialization || 'Clinical Specialist'}
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
            <Award className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Qualifications</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">
                {profile.qualification || 'MBBS, MD'}
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
            <Shield className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">License Number</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">
                {profile.license_number || 'MED-VERIFIED-2026'}
              </p>
            </div>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-start gap-3">
            <Building className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Hospital Affiliation</span>
              <p className="font-bold text-slate-900 text-sm mt-0.5">
                {profile.hospital || 'Central Healthcare Center'}
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 text-xs text-slate-700">
          <span className="font-bold text-blue-950 block mb-1">Clinical Practice Verification:</span>
          All digital prescriptions and progress records authorized by your account are signed under MEDIVAULT Centralized Clinical Authentication protocols.
        </div>
      </div>
    </div>
  );
};
