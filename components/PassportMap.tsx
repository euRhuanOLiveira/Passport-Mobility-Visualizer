import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Feature } from 'geojson';
import { CountryGeoJSON, MobilityMap } from '../types';
import Tooltip from './Tooltip';

interface PassportMapProps {
  geoData: CountryGeoJSON;
  mobilityData: MobilityMap;
  selectedPassport: string;
  highlightedCountry?: string | null;
}

const getISO = (feature: Feature): string => {
  const props: any = feature.properties || {};
  const iso = String(props.ISO_A2 || props.iso_a2 || '').toLowerCase();
  return iso.length === 2 && iso !== '-99' ? iso : '';
};

const PassportMap: React.FC<PassportMapProps> = ({
  geoData,
  mobilityData,
  selectedPassport,
  highlightedCountry,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hover, setHover] = useState<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const obs = new ResizeObserver(([e]) =>
      setDimensions({ width: e.contentRect.width, height: e.contentRect.height })
    );
    obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!svgRef.current) return;
    const svg = d3.select(svgRef.current);
    const g = svg.select('.map-content');

    svg.call(
      d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([1, 8])
        .translateExtent([
          [-dimensions.width, -dimensions.height],
          [dimensions.width * 2, dimensions.height * 2],
        ])
        .on('zoom', (e) => g.attr('transform', e.transform))
    );
  }, [dimensions]);

  const pathGenerator = useMemo(() => {
    if (!dimensions.width) return null;
    return d3.geoPath().projection(
      d3.geoNaturalEarth1().fitSize(
        [dimensions.width, dimensions.height],
        geoData
      )
    );
  }, [dimensions, geoData]);

  const centroid = (f: Feature) =>
    pathGenerator?.centroid(f as any) ?? null;

  const origin = geoData.features.find(
    (f) => getISO(f as Feature) === selectedPassport
  );
  const dest = geoData.features.find(
    (f) => highlightedCountry && getISO(f as Feature) === highlightedCountry
  );

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height}>
        <rect width="100%" height="100%" fill="#cfe8f3" />

        <g className="map-content">
          {origin && dest && (
            <path
              d={(() => {
                const o = centroid(origin)!;
                const d = centroid(dest)!;
                return `
                  M ${o[0]} ${o[1]}
                  Q ${(o[0] + d[0]) / 2} ${Math.min(o[1], d[1]) - 140}
                    ${d[0]} ${d[1]}
                `;
              })()}
              fill="none"
              stroke="#2563eb"
              strokeWidth={2.5}
              strokeDasharray="6 6"
              className="flight-path"
            />
          )}

          {geoData.features.map((f, i) => {
            const d = pathGenerator?.(f as any);
            if (!d) return null;

            const iso = getISO(f as Feature);
            const status = mobilityData.get(iso);
            const dimmed =
              highlightedCountry &&
              iso !== selectedPassport &&
              iso !== highlightedCountry;

            let fill = '#cbd5e1';
            if (iso === selectedPassport) fill = '#2563eb';
            else if (status) fill = status.can_enter ? '#22c55e' : '#ef4444';

            return (
              <path
                key={i}
                d={d}
                fill={fill}
                opacity={dimmed ? 0.15 : 1}
                stroke="#ffffff"
                strokeWidth={0.5}
                className="transition-all duration-500"
                onMouseMove={(e) => setHover({ x: e.clientX, y: e.clientY, f })}
                onMouseLeave={() => setHover(null)}
              />
            );
          })}
        </g>
      </svg>

      {hover && (
        <Tooltip
          x={hover.x}
          y={hover.y}
          visible
          countryName={(hover.f.properties as any)?.NAME}
          status={mobilityData.get(getISO(hover.f))}
          isHome={getISO(hover.f) === selectedPassport}
        />
      )}
    </div>
  );
};

export default PassportMap;
