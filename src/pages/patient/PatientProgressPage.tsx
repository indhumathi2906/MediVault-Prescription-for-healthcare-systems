import React, { useEffect, useState } from 'react';
import { progressAPI } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.js';
import { ProgressSummary, ProgressRecord, ChartMetricPoint } from '../../types/index.js';
import { StatCard } from '../../components/common/StatCard.js';
import { ProgressComparisonCard } from '../../components/progress/ProgressComparisonCard.js';
import { ProgressCharts } from '../../components/progress/ProgressCharts.js';
import { ProgressTimeline } from '../../components/progress/ProgressTimeline.js';
import { Activity, Calendar, Clock, User, ShieldCheck } from 'lucide-react';

export const PatientProgressPage: React.FC = () => {
  const { user } = useAuth();
  const [summary, setSummary] = useState<ProgressSummary | null>(null);
  const [records, setRecords] = useState<ProgressRecord[]>([]);
  const [metrics, setMetrics] = useState<ChartMetricPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchProgressData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [sumRes, recRes, metRes] = await Promise.all([
        progressAPI.getPatientProgressSummary(user.id),
        progressAPI.getPatientProgress(user.id),
        progressAPI.getPatientProgressMetrics(user.id),
      ]);

      if (sumRes.data.success) setSummary(sumRes.data.data);
      if (recRes.data.success) setRecords(recRes.data.data);
      if (metRes.data.success) setMetrics(metRes.data.data);
    } catch (err) {
      console.error('Failed to fetch patient progress data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgressData();
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const latestDateFormatted = summary?.latestReviewDate
    ? new Date(summary.latestReviewDate).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'No reviews yet';

  const nextFollowUpFormatted = summary?.nextFollowUp
    ? new Date(summary.nextFollowUp).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'As scheduled';

  return (
    <div className="space-y-8 pb-10">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 sm:p-7 text-white shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-400">
              Longitudinal Healthcare Record
            </span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            <span className="text-[11px] text-slate-300 font-mono">
              Append-Only Trajectory
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-heading font-extrabold tracking-tight">
            Patient Health Progress Tracking
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
            Every clinical review conducted by your attending physician appends a permanent historical entry.
            Follow your recovery metrics, BMI trends, and clinical assessments over time.
          </p>
        </div>

        <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center p-3.5 bg-slate-800 rounded-lg border border-slate-700 shrink-0">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            Verified Records
          </span>
          <span className="text-xl font-heading font-bold text-white tabular-nums">
            {summary?.totalReviews || 0} Reviews
          </span>
        </div>
      </div>

      {/* Top 4 Progress KPI Cards (Section 15, 16) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Progress Reviews"
          value={summary?.totalReviews || 0}
          subtitle="Preserved historical records"
          icon={ShieldCheck}
          variant="teal"
        />
        <StatCard
          title="Latest Review Date"
          value={latestDateFormatted}
          subtitle={summary?.latestDoctorName ? `By ${summary.latestDoctorName}` : 'No reviews'}
          icon={Calendar}
          variant="blue"
        />
        <StatCard
          title="Current Health Status"
          value={summary?.currentStatus || 'Stable'}
          subtitle="Clinical evaluation"
          icon={Activity}
          variant="emerald"
        />
        <StatCard
          title="Next Review / Follow-up"
          value={nextFollowUpFormatted}
          subtitle="Recommended physician visit"
          icon={Clock}
          variant="purple"
        />
      </div>

      {/* SECTION 22: DYNAMIC PREVIOUS VS CURRENT COMPARISON CARD */}
      <section>
        <ProgressComparisonCard
          latestRecord={summary?.latestRecord || null}
          previousRecord={summary?.previousRecord || null}
          comparisons={summary?.comparisons || []}
        />
      </section>

      {/* SECTION 23: RECHARTS INTERACTIVE CHARTS */}
      <section>
        <ProgressCharts metrics={metrics} />
      </section>

      {/* SECTION 25: CHRONOLOGICAL VISUAL TIMELINE */}
      <section>
        <ProgressTimeline records={records} />
      </section>
    </div>
  );
};
