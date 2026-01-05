export type VisaFilter = 'visa_free' | 'visa_required' | null;

export type LayerContext = {
  passport?: string | null;
  comparePassport?: string | null;

  mobilityData?: Record<string, any>;
  compareMobilityData?: Record<string, any>;
  politicsData?: Record<string, any>;

  ui?: {
    politicsEnabled?: boolean;
    democracyFilters?: string[];
    visaFilter?: VisaFilter;
    highlightedCountry?: string | null;
  };
};


export type CountryVisualState = {
  color?: string;
  opacity?: number;
  emphasis?: 'focus' | 'none';
  reasons: string[];
};

export type Layer = (
  iso2: string,
  state: CountryVisualState,
  context: LayerContext
) => CountryVisualState;
