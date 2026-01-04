import React from 'react';

interface TooltipStatus {
  can_enter: boolean;
  category: string;
  source?: string;
}

interface TooltipProps {
  x: number;
  y: number;
  visible: boolean;
  countryName: string;
  status?: TooltipStatus;
  isHome: boolean;
}

/**
 * Simple, predictable tooltip for passport mobility visualization.
 * - Position is relative to the map container
 * - No interactivity (pointer-events disabled)
 * - Clear semantic colors
 */
const Tooltip: React.FC<TooltipProps> = ({
  x,
  y,
  visible,
  countryName,
  status,
  isHome,
}) => {
  if (!visible) return null;

  // Offset keeps tooltip away from cursor
  const style: React.CSSProperties = {
    left: x + 14,
    top: y + 14,
  };

  let statusText = 'Data unavailable';
  let statusColor = 'text-slate-500';

  if (isHome) {
    statusText = 'Passport issuer';
    statusColor = 'text-blue-600';
  } else if (status) {
    statusText = status.can_enter ? 'Visa-free access' : 'Visa required';
    statusColor = status.can_enter ? 'text-emerald-600' : 'text-rose-600';
  }

  return (
    <div
      className="
        fixed z-50 pointer-events-none
        bg-white rounded-lg shadow-xl
        border border-slate-200
        px-3 py-2 min-w-[180px]
        transition-opacity duration-150
      "
      style={style}
      role="tooltip"
    >
      <div className="text-sm font-semibold text-slate-800 mb-1">
        {countryName}
      </div>

      <div className={`text-xs font-semibold ${statusColor}`}>
        {statusText}
      </div>

      {!isHome && status?.category && (
        <div className="mt-1 text-[10px] text-slate-500 capitalize">
          {status.category.replace(/_/g, ' ')}
        </div>
      )}

      {!isHome && status?.source && (
        <div className="mt-2 pt-1 text-[10px] text-slate-400 border-t border-slate-100">
          Source: {status.source}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
