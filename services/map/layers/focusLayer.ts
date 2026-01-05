import { Layer } from './types';

export const focusLayer: Layer = (iso2, state, context) => {
  const highlighted = context.ui?.highlightedCountry;

  // Sem país em foco → não interfere
  if (!highlighted) {
    return state;
  }

  const isPassport =
    iso2 === context.passport ||
    iso2 === context.comparePassport;

  const isDestination = iso2 === highlighted;

  // 🔵 Passaportes e destino ficam em foco
  if (isPassport || isDestination) {
    return {
      ...state,
      opacity: 1,
      emphasis: 'focus',
      reasons: [...state.reasons, 'Em foco'],
    };
  }

  // 🌫️ Todo o resto perde destaque
  return {
    ...state,
    opacity: 0.15,
    emphasis: 'none',
    reasons: [...state.reasons, 'Fora do foco'],
  };
};
