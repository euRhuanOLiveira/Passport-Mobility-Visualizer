import { CountryVisualState } from '../../types';

export function createInitialVisualState(
  iso2: string
): CountryVisualState {
  return {
    iso2,
    color: undefined,
    opacity: 1,
    reasons: [],
  };
}
