import React from 'react';
import { ConfidenceLevel } from '../types/basketball';

interface MetricBadgeProps {
  status?: ConfidenceLevel;
  confidence?: number;
  size?: 'sm' | 'md';
}

export const MetricBadge: React.FC<MetricBadgeProps> = ({
  status = 'measured',
  confidence,
  size = 'sm'
}) => {
  const config = {
    measured: {
      label: 'Measured',
      bg: 'bg-emerald-500/15',
      text: 'text-emerald-400',
      border: 'border-emerald-500/30',
      dot: 'bg-emerald-500'
    },
    estimated: {
      label: 'Estimated',
      bg: 'bg-amber-500/15',
      text: 'text-amber-400',
      border: 'border-amber-500/30',
      dot: 'bg-amber-500'
    },
    insufficient_data: {
      label: 'Insufficient Data',
      bg: 'bg-slate-500/15',
      text: 'text-slate-400',
      border: 'border-slate-500/30',
      dot: 'bg-slate-400'
    }
  }[status];

  const sizeClasses = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1';

  return (
    <div
      className={`inline-flex items-center gap-1.5 rounded-full font-medium border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}
      title={confidence ? `Confidence Score: ${confidence}% (${config.label})` : config.label}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot} animate-pulse`} />
      <span>{config.label}</span>
      {confidence !== undefined && (
        <span className="opacity-75 font-mono text-[9px]">({confidence.toFixed(1)}%)</span>
      )}
    </div>
  );
};
