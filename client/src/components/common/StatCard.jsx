import React from 'react';
import { ArrowUpRight } from 'lucide-react';

export const StatCard = ({
  title,
  subtitle,
  mainValue,
  unit = '',
  utilizationPercent,
  metrics = [],
  icon: Icon,
  actionText,
  onAction,
}) => {
  return (
    <div className="bg-white rounded-xl border border-silverGrey p-5 shadow-subtle hover:shadow-card transition-all duration-200 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2.5">
            {Icon && (
              <div className="w-9 h-9 rounded-lg bg-slateBlue/10 border border-slateBlue/20 flex items-center justify-center text-slateBlue">
                <Icon className="w-5 h-5" />
              </div>
            )}
            <div>
              <h4 className="text-sm font-semibold text-charcoal">{title}</h4>
              {subtitle && <p className="text-xs text-charcoal/60">{subtitle}</p>}
            </div>
          </div>
          {onAction && (
            <button
              onClick={onAction}
              className="text-xs font-medium text-slateBlue hover:text-slateBlue-dark flex items-center gap-0.5 hover:underline"
            >
              {actionText || 'Manage'}
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Main Stat & Progress */}
        <div className="my-3">
          <div className="flex items-baseline justify-between mb-1.5">
            <div className="text-2xl font-semibold text-charcoal tracking-tight">
              {mainValue} <span className="text-sm font-medium text-charcoal/60">{unit}</span>
            </div>
            {utilizationPercent !== undefined && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slateBlue/10 text-slateBlue border border-slateBlue/25">
                {utilizationPercent}% Load
              </span>
            )}
          </div>

          {utilizationPercent !== undefined && (
            <div className="w-full h-2 bg-silverGrey/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-slateBlue rounded-full transition-all duration-500 ease-out"
                style={{ width: `${Math.min(100, Math.max(0, utilizationPercent))}%` }}
              />
            </div>
          )}
        </div>
      </div>

      {/* Metric Breakdown Grid */}
      {metrics && metrics.length > 0 && (
        <div className="grid grid-cols-2 gap-2 pt-3 mt-1 border-t border-silverGrey/50 text-xs">
          {metrics.map((m, idx) => (
            <div key={idx} className="flex flex-col">
              <span className="text-charcoal/60 text-[11px]">{m.label}</span>
              <span className="font-semibold text-charcoal mt-0.5">{m.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StatCard;
