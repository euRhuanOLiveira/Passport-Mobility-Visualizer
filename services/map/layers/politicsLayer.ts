import { Layer } from './types';

export const politicsLayer: Layer = (iso2, state, context) => {
  const {
    politicsEnabled,
    democracyFilters = [],
  } = context.ui || {};

  if (!politicsEnabled) return state;

  const politics = context.politicsData?.[iso2];
  if (!politics) {
    return {
      ...state,
      opacity: 0.2,
      reasons: [...state.reasons, 'Sem dados políticos'],
    };
  }

  const DEMOCRACY_COLORS: Record<string, string> = {
    'Full democracy': '#16a34a',
    'Flawed democracy': '#84cc16',
    'Hybrid regime': '#facc15',
    'Authoritarian': '#dc2626',
  };

  // 🔎 Filtro político (só se usuário marcou)
  if (
    democracyFilters.length > 0 &&
    !democracyFilters.includes(politics.democracy_type)
  ) {
    return {
      ...state,
      opacity: 0.08,
      reasons: [...state.reasons, 'Filtrado por regime político'],
    };
  }

  // 🧠 Política pura (sem mobilidade forçada)
  return {
    ...state,
    color: DEMOCRACY_COLORS[politics.democracy_type] ?? state.color,
    opacity: 1,
    reasons: [...state.reasons, 'Mapa político'],
  };
};
