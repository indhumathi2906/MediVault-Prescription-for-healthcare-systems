import React from 'react';
import { MetricComparison, ProgressRecord } from '../../types/index.js';
import { ArrowDown, ArrowUp, Minus, Activity, Heart, Scale, Gauge, Thermometer, Droplets } from 'lucide-react';
import { Badge, getProgressStatusVariant } from '../common/Badge.js';

interface ProgressComparisonCardProps {
  latestRecord: ProgressRecord | null;
  previousRecord: ProgressRecord | null;
  comparisons: MetricComparison[];
}

export const ProgressComparisonCard: React.FC<ProgressComparisonCardProps> = ({
  latestRecord,
  previousRecord,
  comparisons,
}) => {
  if (!latestRecord) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-slate-200 text-center text-slate-500">
        No progress measurements recorded yet.
      </div>
    );
  }

  const getMetricIcon = (metric: string) => {
    switch (metric.toLowerCase()) {
      case 'weight':
      case 'bmi':
        return <Scale className="w-4 h-4 text-teal-600" />;
      case 'heart rate':
        return <Heart className="w-4 h-4 text-rose-500" />;
      case 'systolic bp':
      case 'diastolic bp':
        return <Gauge className="w-4 h-4 text-blue-600" />;
      case 'blood sugar':
        return <Droplets className="w-4 h-4 text-amber-600" />;
      case 'body temperature':
        return <Thermometer className="w-4 h-4 text-orange-600" />;
      case 'oxygen saturation':
        return <Activity className="w-4 h-4 text-cyan-600" />;
      default:
        return <Activity className="w-4 h-4 text-teal-600" />;
    }
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Header Banner */}
      <div className="bg-slate-900 border-b border-slate-800 px-6 py-4 text-white flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase font-bold tracking-wider text-blue-400">
              Biometric Delta Evaluation
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium">
              Current vs Baseline
            </span>
          </div>
          <h3 className="text-base font-heading font-bold mt-0.5">
            Clinical Milestone Comparison
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-teal-100">Overall Status:</span>
          <Badge variant={getProgressStatusVariant(latestRecord.progress_status)}>
            {latestRecord.progress_status}
          </Badge>
        </div>
      </div>

      {/* Comparison Grid */}
      <div className="p-6">
        {comparisons.length === 0 ? (
          <p className="text-sm text-slate-500 italic">
            Initial review recorded. Subsequent reviews will automatically calculate dynamic changes and deltas.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {comparisons.map((comp) => {
              const hasPrevious = comp.previous !== null;
              const isImproved = comp.direction === 'improved';
              const isDeclined = comp.direction === 'declined';
              const isStable = comp.direction === 'stable';

              return (
                <div
                  key={comp.metric}
                  className="p-4 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 text-slate-700 font-semibold text-xs uppercase tracking-wide">
                      {getMetricIcon(comp.metric)}
                      <span>{comp.metric}</span>
                    </div>

                    {hasPrevious && comp.change !== null && (
                      <span
                        className={`inline-flex items-center text-[11px] font-bold px-1.5 py-0.5 rounded-md ${
                          isImproved
                            ? 'bg-emerald-100 text-emerald-800'
                            : isDeclined
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-200 text-slate-700'
                        }`}
                      >
                        {comp.change > 0 ? (
                          <ArrowUp className="w-3 h-3 mr-0.5" />
                        ) : comp.change < 0 ? (
                          <ArrowDown className="w-3 h-3 mr-0.5" />
                        ) : (
                          <Minus className="w-3 h-3 mr-0.5" />
                        )}
                        {comp.change > 0 ? `+${comp.change}` : comp.change} {comp.unit}
                      </span>
                    )}
                  </div>

                  {/* Values */}
                  <div className="mt-1">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-2xl font-bold text-slate-900">
                        {comp.current}
                      </span>
                      <span className="text-xs text-slate-500 font-medium">{comp.unit}</span>
                    </div>

                    {hasPrevious ? (
                      <p className="text-xs text-slate-500 mt-1">
                        Previous: <span className="font-semibold text-slate-700">{comp.previous} {comp.unit}</span>
                      </p>
                    ) : (
                      <p className="text-[11px] text-slate-400 mt-1">First baseline record</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Doctor Progress Notes from Latest Review */}
        {latestRecord.doctor_progress_notes && (
          <div className="mt-5 p-4 rounded-xl bg-teal-50/60 border border-teal-100 flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 text-xs font-bold mt-0.5">
              Dr
            </div>
            <div>
              <p className="text-xs font-bold text-teal-900 uppercase tracking-wider">
                Attending Doctor Progress Assessment
              </p>
              <p className="text-sm text-slate-700 mt-1 leading-relaxed">
                "{latestRecord.doctor_progress_notes}"
              </p>
              {latestRecord.follow_up_date && (
                <p className="text-xs font-semibold text-teal-700 mt-2">
                  Recommended Next Follow-up: {new Date(latestRecord.follow_up_date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
