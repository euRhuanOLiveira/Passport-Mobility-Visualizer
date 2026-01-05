import { Layer } from './layers/types';
import { CountryVisualState } from '../../types';

export function applyLayers(
  iso2: string,
  baseState: CountryVisualState,
  layers: Layer[],
  context: any
): CountryVisualState {
  let state = baseState;

  for (const layer of layers) {
    const patch = layer(iso2, state, context);
    if (!patch) continue;

    state = {
      ...state,
      ...patch,
      reasons: [
        ...(state.reasons || []),
        ...(patch.reasons || []),
      ],
    };
  }

  return state;
}
