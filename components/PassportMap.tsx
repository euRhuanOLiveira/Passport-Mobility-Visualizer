import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Feature } from 'geojson';

import { CountryGeoJSON, MobilityMap } from '../types';
import { applyLayers } from '../services/map/applyLayers';
import { createInitialVisualState } from '../services/map/initialVisualState';

import { mobilityLayer } from '../services/map/layers/mobilityLayer';
import { comparisonLayer } from '../services/map/layers/comparisonLayer';
import { politicsLayer } from '../services/map/layers/politicsLayer';
import { focusLayer } from '../services/map/layers/focusLayer';

interface PassportMapProps {
  geoData: CountryGeoJSON;
  mobilityData: MobilityMap;
  compareMobilityData?: MobilityMap;
  selectedPassport: string | null;
  comparePassport?: string | null;
  highlightedCountry?: string | null;
  politicsEnabled: boolean;
  politicsData?: Record<string, any>;
  democracyFilters?: string[];
  visaFilter?: 'visa_free' | 'visa_required' | null;
}

const getISO = (feature: Feature): string => {
  const iso = (feature.properties as any)?.ISO_A2;
  return iso ? String(iso).toLowerCase() : '';
};

const PassportMap: React.FC<PassportMapProps> = ({
  geoData,
  mobilityData,
  compareMobilityData,
  selectedPassport,
  comparePassport,
  highlightedCountry,
  politicsEnabled,
  politicsData,
  democracyFilters = [],
  visaFilter = null,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(([e]) =>
      setDimensions({
        width: e.contentRect.width,
        height: e.contentRect.height,
      })
    );
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  const projection = useMemo(() => {
    if (!dimensions.width) return null;
    return d3.geoNaturalEarth1().fitSize(
      [dimensions.width, dimensions.height],
      geoData
    );
  }, [dimensions, geoData]);

  const pathGenerator = useMemo(() => {
    if (!projection) return null;
    return d3.geoPath().projection(projection);
  }, [projection]);

  const layerContext = useMemo(() => ({
    passport: selectedPassport,
    comparePassport,
    mobilityData: Object.fromEntries(mobilityData),
    compareMobilityData: compareMobilityData
      ? Object.fromEntries(compareMobilityData)
      : undefined,
    politicsData,
    ui: {
      politicsEnabled,
      democracyFilters,
      visaFilter,
      highlightedCountry,
    },
  }), [
    selectedPassport,
    comparePassport,
    mobilityData,
    compareMobilityData,
    politicsData,
    politicsEnabled,
    democracyFilters,
    visaFilter,
    highlightedCountry,
  ]);

  const layers = [
    mobilityLayer,
    comparisonLayer,
    politicsEnabled ? politicsLayer : null,
    focusLayer,
  ].filter(Boolean);

  if (!dimensions.width || !pathGenerator) {
    return <div ref={containerRef} className="w-full h-full" />;
  }

  return (
    <div ref={containerRef} className="w-full h-full">
      <svg width={dimensions.width} height={dimensions.height}>
        <g>
          {geoData.features.map((f, i) => {
            const d = pathGenerator(f as any);
            if (!d) return null;

            const iso = getISO(f as Feature);

            const visualState = applyLayers(
              iso,
              createInitialVisualState(iso),
              layers as any,
              layerContext
            );

            return (
              <path
                key={i}
                d={d}
                fill={visualState.color ?? '#cbd5e1'}
                opacity={visualState.opacity}
                stroke="#fff"
                strokeWidth={0.5}
              />
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default PassportMap;
