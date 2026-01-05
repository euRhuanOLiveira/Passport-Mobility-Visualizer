import React from 'react';

interface TooltipProps {
  x: number;
  y: number;
  visible: boolean;
  countryName: string;
  reasons?: string[];
}

/**
 * Tooltip explicável.
 * Ele NÃO decide nada.
 * Apenas mostra as decisões do motor de layers.
 */
const Tooltip: React.FC<TooltipProps> = ({
  x,
  y,
  visible,
  countryName,
  reasons,
}) => {
  if (!visible) return null;

  const style: React.CSSProperties = {
    left: x + 14,
    top: y + 14,
  };

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

      {reasons && reasons.length > 0 ? (
        <ul className="text-xs text-slate-700 space-y-0.5">
          {reasons.map((r, i) => (
            <li key={i}>• {r}</li>
          ))}
        </ul>
      ) : (
        <div className="text-xs text-slate-500">
          Sem informações adicionais
        </div>
      )}
    </div>
  );
};

export default Tooltip;
