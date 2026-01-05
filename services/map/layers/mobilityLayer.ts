import { Layer } from './types';

export const mobilityLayer: Layer = (iso2, state, context) => {
  const { passport, mobilityData } = context;
  const { visaFilter } = context.ui || {};

  if (!mobilityData) return state;

  // 🔵 País do passaporte
  if (passport && iso2 === passport) {
    return {
      ...state,
      color: '#2563eb',
      opacity: 1,
      reasons: [...state.reasons, 'País do passaporte'],
    };
  }

  const record = mobilityData[iso2];

  // Sem dados
  if (!record) {
    return {
      ...state,
      opacity: 0.4,
      reasons: [...state.reasons, 'Sem dados de mobilidade'],
    };
  }

  const canEnter = record.can_enter === true;

  // 🔎 FILTRO DE VISTO (só se usuário ativou)
  if (visaFilter === 'visa_free' && !canEnter) {
    return {
      ...state,
      opacity: 0.1,
      reasons: [...state.reasons, 'Filtrado: visto exigido'],
    };
  }

  if (visaFilter === 'visa_required' && canEnter) {
    return {
      ...state,
      opacity: 0.1,
      reasons: [...state.reasons, 'Filtrado: visa-free'],
    };
  }

  // 🎨 Pintura padrão
  return {
    ...state,
    color: canEnter ? '#22c55e' : '#ef4444',
    opacity: 1,
    reasons: [
      ...state.reasons,
      canEnter ? 'Entrada permitida' : 'Visto exigido',
    ],
  };
};
