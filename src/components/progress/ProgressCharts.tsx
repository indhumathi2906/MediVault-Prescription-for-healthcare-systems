import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { ChartMetricPoint } from '../../types/index.js';
import { Scale, Heart, Gauge, Droplets, Thermometer, Activity } from 'lucide-react';

interface ProgressChartsProps {
  metrics: ChartMetricPoint[];
}

export const ProgressCharts: React.FC<ProgressChartsProps> = ({ metrics }) => {
  const [activeTab, setActiveTab] = useState<'weight_bmi' | 'bp' | 'heart_rate' | 'blood_sugar' | 'vitals'>('weight_bmi');

  // Verify if sufficient data exists (minimum 1 data point with valid values, recommended >= 2 for trend line)
  const hasWeightData = metrics.some((m) => m.weight !== null && m.weight !== undefined);
  const hasBPData = metrics.some((m) => m.systolic_bp !== null && m.diastolic_bp !== null);
  const hasHRData = metrics.some((m) => m.heart_rate !== null && m.heart_rate !== undefined);
  const hasBloodSugarData = metrics.some((m) => m.blood_sugar !== null && m.blood_sugar !== undefined);
  const hasVitalsData = metrics.some((m) => m.temperature !== null || m.oxygen_saturation !== null);

  if (metrics.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-8 border border-slate-200 text-center">
        <Activity className="w-10 h-10 text-slate-300 mx-auto mb-2" />
        <h4 className="text-sm font-bold text-slate-700">No Historical Progress Data</h4>
        <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
          Health trend charts will populate automatically as your physician records historical reviews.
        </p>
      </div>
    );
  }

  const tabs = [
    { id: 'weight_bmi', label: 'Weight & BMI', icon: Scale, available: hasWeightData },
    { id: 'bp', label: 'Blood Pressure', icon: Gauge, available: hasBPData },
    { id: 'heart_rate', label: 'Heart Rate', icon: Heart, available: hasHRData },
    { id: 'blood_sugar', label: 'Blood Sugar', icon: Droplets, available: hasBloodSugarData },
    { id: 'vitals', label: 'SpO2 & Temperature', icon: Thermometer, available: hasVitalsData },
  ];

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
        <div>
          <h3 className="text-base font-bold text-slate-900">Health Progress Trend Analysis</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time biometric progression across all completed doctor reviews
          </p>
        </div>

        {/* Tab buttons */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-xl">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            if (!tab.available) return null;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-teal-700 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="pt-6">
        {activeTab === 'weight_bmi' && hasWeightData && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-600">Weight (kg) vs Body Mass Index (BMI)</span>
              <span className="text-xs text-slate-400">Total Reviews: {metrics.length}</span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="reviewDate" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#0d9488" fontSize={12} domain={['dataMin - 2', 'dataMax + 2']} />
                  <YAxis yAxisId="right" orientation="right" stroke="#6366f1" fontSize={12} domain={['dataMin - 1', 'dataMax + 1']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="weight"
                    name="Weight (kg)"
                    stroke="#0d9488"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#0d9488' }}
                    activeDot={{ r: 7 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="bmi"
                    name="BMI (kg/m²)"
                    stroke="#6366f1"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={{ r: 4, fill: '#6366f1' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'bp' && hasBPData && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-600">Blood Pressure Progression (Systolic / Diastolic mmHg)</span>
              <span className="text-xs text-slate-400">Target Range: 120 / 80 mmHg</span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="reviewDate" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} domain={['dataMin - 10', 'dataMax + 10']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Line
                    type="monotone"
                    dataKey="systolic_bp"
                    name="Systolic (mmHg)"
                    stroke="#e11d48"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#e11d48' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="diastolic_bp"
                    name="Diastolic (mmHg)"
                    stroke="#2563eb"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#2563eb' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'heart_rate' && hasHRData && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-600">Resting Heart Rate (BPM)</span>
              <span className="text-xs text-slate-400">Normal Range: 60 - 100 bpm</span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="reviewDate" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#f43f5e" fontSize={12} domain={['dataMin - 5', 'dataMax + 5']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="heart_rate"
                    name="Heart Rate (bpm)"
                    stroke="#f43f5e"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#f43f5e' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'blood_sugar' && hasBloodSugarData && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-600">Fasting Blood Glucose (mg/dL)</span>
              <span className="text-xs text-slate-400">Optimal: 70 - 100 mg/dL</span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="reviewDate" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis stroke="#d97706" fontSize={12} domain={['dataMin - 10', 'dataMax + 10']} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="blood_sugar"
                    name="Blood Sugar (mg/dL)"
                    stroke="#d97706"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#d97706' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeTab === 'vitals' && hasVitalsData && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-semibold text-slate-600">Oxygen Saturation (%) & Temperature (°F)</span>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={metrics} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="reviewDate" stroke="#94a3b8" fontSize={12} tickLine={false} />
                  <YAxis yAxisId="left" stroke="#06b6d4" fontSize={12} domain={[90, 100]} />
                  <YAxis yAxisId="right" orientation="right" stroke="#f97316" fontSize={12} domain={[96, 103]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0' }}
                  />
                  <Legend verticalAlign="top" height={36} />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="oxygen_saturation"
                    name="Oxygen Saturation (%)"
                    stroke="#06b6d4"
                    strokeWidth={3}
                    dot={{ r: 5, fill: '#06b6d4' }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="temperature"
                    name="Temperature (°F)"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={{ r: 4, fill: '#f97316' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
