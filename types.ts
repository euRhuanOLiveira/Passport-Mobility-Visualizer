import { FeatureCollection, Geometry } from 'geojson';

export interface CountryProperties {
  name: string;
  iso_a2: string; // ISO Alpha-2 code (e.g., "BR", "US")
  [key: string]: any;
}

export type CountryGeoJSON = FeatureCollection<Geometry, CountryProperties>;

export interface PassportDestination {
  to: string; // Destination ISO code (lowercase)
  can_enter: boolean;
  category: string;
  source?: string;
  year?: number;
}

export type MobilityMap = Map<string, PassportDestination>;

// A normalized country object for selectors
export interface CountryOption {
  code: string; // lowercase iso code
  name: string;
}

export interface CountryVisualState {
  iso2: string;
  color?: string;
  opacity: number;
  reasons?: string[];
}
