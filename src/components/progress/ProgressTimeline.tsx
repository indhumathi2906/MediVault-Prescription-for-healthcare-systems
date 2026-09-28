import React from 'react';
import { ProgressRecord } from '../../types/index.js';
import { Badge, getProgressStatusVariant } from '../common/Badge.js';
import { Calendar, User, Clock, ArrowDown, Activity, FileText } from 'lucide-react';

interface ProgressTimelineProps {
  records: ProgressRecord[];
}

export const ProgressTimeline: React.FC<ProgressTimelineProps> = ({ records }) => {
  if (!records || records.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center text-slate-500">
        No historical reviews found. Every completed doctor review will append an entry to this clinical timeline.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">Historical Health Progress Timeline</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Immutable chronological progression record ({records.length} total reviews logged)
          </p>
        </div>
        <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold">
          Chronological Audit
        </span>
      </div>

      <div className="relative pl-6 sm:pl-8 space-y-8 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
        {records.map((record, index) => {
          const dateObj = new Date(record.review_date);
          const formattedDate = dateObj.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
          });

          return (
            <div key={record.id} className="relative group">
              {/* Timeline marker node */}
              <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white border-2 border-slate-900 flex items-center justify-center text-slate-900 shadow-xs font-mono">
                <span className="text-[10px] font-bold">{records.length - index}</span>
              </div>

              {/* Review Card */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-xs transition-all">
                {/* Card Top */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-900">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" />
                      <span>{formattedDate}</span>
                    </div>
                    <span className="text-slate-300">•</span>
                    <div className="flex items-center gap-1 text-xs text-slate-600 font-medium">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{record.doctor_name || 'Dr. Attending Physician'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500 font-medium">Progress:</span>
                    <Badge variant={getProgressStatusVariant(record.progress_status)}>
                      {record.progress_status}
                    </Badge>
                  </div>
                </div>

                {/* Key Metrics Chips */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 my-4">
                  {record.weight !== undefined && record.weight !== null && (
                    <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Weight</span>
                      <p className="text-sm font-bold text-slate-800">{record.weight} kg</p>
                    </div>
                  )}

                  {record.bmi !== undefined && record.bmi !== null && (
                    <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">BMI</span>
                      <p className="text-sm font-bold text-slate-800">{record.bmi} kg/m²</p>
                    </div>
                  )}

                  {record.systolic_bp && record.diastolic_bp && (
                    <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Blood Pressure</span>
                      <p className="text-sm font-bold text-slate-800">
                        {record.systolic_bp} / {record.diastolic_bp} <span className="text-[10px] font-normal text-slate-400">mmHg</span>
                      </p>
                    </div>
                  )}

                  {record.heart_rate && (
                    <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Heart Rate</span>
                      <p className="text-sm font-bold text-slate-800">{record.heart_rate} bpm</p>
                    </div>
                  )}

                  {record.blood_sugar && (
                    <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Blood Sugar</span>
                      <p className="text-sm font-bold text-slate-800">{record.blood_sugar} mg/dL</p>
                    </div>
                  )}

                  {record.oxygen_saturation && (
                    <div className="bg-white p-2.5 rounded-xl border border-slate-100 shadow-2xs">
                      <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">SpO2</span>
                      <p className="text-sm font-bold text-slate-800">{record.oxygen_saturation}%</p>
                    </div>
                  )}
                </div>

                {/* Symptoms & Doctor Notes */}
                {(record.symptoms_status || record.doctor_progress_notes) && (
                  <div className="space-y-2 text-xs">
                    {record.symptoms_status && (
                      <div className="text-slate-600">
                        <span className="font-semibold text-slate-800">Symptoms Observed:</span>{' '}
                        {record.symptoms_status}
                      </div>
                    )}
                    {record.doctor_progress_notes && (
                      <div className="text-slate-700 bg-teal-50/40 p-2.5 rounded-lg border border-teal-100">
                        <span className="font-bold text-teal-900">Clinical Notes:</span>{' '}
                        {record.doctor_progress_notes}
                      </div>
                    )}
                  </div>
                )}

                {/* Next Follow-up */}
                {record.follow_up_date && (
                  <div className="mt-3 pt-2.5 border-t border-slate-200/60 flex items-center gap-1.5 text-xs text-teal-700 font-semibold">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Next Recommended Review: {new Date(record.follow_up_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                  </div>
                )}
              </div>

              {/* Arrow downwards separator between historical records */}
              {index < records.length - 1 && (
                <div className="flex justify-center my-1.5 text-slate-300">
                  <ArrowDown className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
