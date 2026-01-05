import { Layer } from './types';

export const comparisonLayer: Layer = (iso2, state, context) => {
  const {
    passport,
    comparePassport,
    mobilityData,
    compareMobilityData,
  } = context;

  // Só compara se houver 2 passaportes
  if (!passport || !comparePassport || !compareMobilityData) {
    return state;
  }

  // 🔵 Países dos passaportes
  if (iso2 === passport || iso2 === comparePassport) {
    return {
      ...state,
      color: '#2563eb',
      opacity: 1,
      reasons: [...state.reasons, 'Passaporte selecionado'],
    };
  }

  const a = mobilityData?.[iso2];
  const b = compareMobilityData?.[iso2];

  if (!a && !b) return state;

  const aCan = a?.can_enter === true;
  const bCan = b?.can_enter === true;

  // 🟩 Ambos entram
  if (aCan && bCan) {
    return {
      ...state,
      color: '#22c55e',
      reasons: [...state.reasons, 'Ambos podem entrar'],
    };
  }

  // 🟥 Nenhum entra
  if (!aCan && !bCan) {
    return {
      ...state,
      color: '#ef4444',
      reasons: [...state.reasons, 'Nenhum pode entrar'],
    };
  }

  // 🟧 Apenas um entra
  return {
    ...state,
    color: '#f97316',
    reasons: [...state.reasons, 'Apenas um pode entrar'],
  };
};
