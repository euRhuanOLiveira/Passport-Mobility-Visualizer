import React from 'react';

/**
 * Map legend with contextual explanation.
 */
const Legend: React.FC = () => {
  return (
    <div
      className="
        flex flex-col gap-3
        text-xs font-medium text-slate-600
        bg-white/90 backdrop-blur-sm
        p-3 rounded-lg
        border border-slate-200
        shadow-sm
        max-w-xs
      "
      aria-label="Map legend"
    >
      {/* Color legend */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <span className="block w-3 h-3 rounded-full bg-blue-600 ring-2 ring-blue-100" />
          <span>Selected passport</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="block w-3 h-3 rounded-full bg-emerald-500" />
          <span>Visa-free access</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="block w-3 h-3 rounded-full bg-rose-500" />
          <span>Visa required</span>
        </div>

        <div className="flex items-center gap-2">
          <span className="block w-3 h-3 rounded-full bg-slate-300" />
          <span>No data available</span>
        </div>
      </div>

      {/* Contextual note */}
      <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-500 leading-snug">
        <span className="font-semibold text-slate-600">Travel context:</span>{' '}
        Colors represent general short-term tourist travel rules. Entry
        conditions may vary by duration or purpose.
      </div>
    </div>
  );
};

export default Legend;
