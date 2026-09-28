import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'improving' | 'stable' | 'attention' | 'worsening' | 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'default';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default', className = '' }) => {
  const getStyle = () => {
    switch (variant) {
      case 'improving':
        return 'bg-emerald-50 text-emerald-800 border-emerald-200';
      case 'stable':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'attention':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'worsening':
        return 'bg-rose-50 text-rose-800 border-rose-200';
      case 'pending':
        return 'bg-amber-50 text-amber-800 border-amber-200';
      case 'confirmed':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-slate-100 text-slate-800 border-slate-300';
      case 'cancelled':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-md border tracking-tight transition-colors ${getStyle()} ${className}`}
    >
      {children}
    </span>
  );
};

export const getProgressStatusVariant = (status?: string): 'improving' | 'stable' | 'attention' | 'worsening' | 'default' => {
  if (!status) return 'default';
  const s = status.toLowerCase();
  if (s.includes('improving')) return 'improving';
  if (s.includes('stable')) return 'stable';
  if (s.includes('attention')) return 'attention';
  if (s.includes('worsening')) return 'worsening';
  return 'default';
};

export const getAppointmentStatusVariant = (status?: string): 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'default' => {
  if (!status) return 'default';
  const s = status.toLowerCase();
  if (s === 'pending') return 'pending';
  if (s === 'confirmed') return 'confirmed';
  if (s === 'completed') return 'completed';
  if (s === 'cancelled') return 'cancelled';
  return 'default';
};
