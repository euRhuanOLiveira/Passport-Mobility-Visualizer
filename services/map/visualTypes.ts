export type Visibility = 'visible' | 'dimmed' | 'hidden';
export type Emphasis = 'none' | 'highlight' | 'focus';

export interface CountryVisualState {
  iso2: string;
  visibility: Visibility;
  color: string | null;
  opacity: number;
  emphasis: Emphasis;
  reasons: string[];
}
