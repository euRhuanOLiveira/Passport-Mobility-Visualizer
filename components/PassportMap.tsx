import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { Feature } from 'geojson';
import { CountryGeoJSON, MobilityMap } from '../types';
import Tooltip from './Tooltip';

interface PassportMapProps {
  geoData: CountryGeoJSON;
  mobilityData: MobilityMap;              // Passport A
  compareMobilityData?: MobilityMap;      // Passport B
  selectedPassport: string;
  comparePassport?: string | null;
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
  compareMobilityData,
  selectedPassport,
  comparePassport,
  highlightedCountry,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement | null>(null);

  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [hover, setHover] = useState<any>(null);

  // -----------------------------
  // RESIZE
  // -----------------------------
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

  // -----------------------------
  // ZOOM / PAN
  // -----------------------------
  useEffect(() => {
    if (!svgRef.current || !gRef.current) return;

    const svg = d3.select(svgRef.current);
    const g = d3.select(gRef.current);

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

  // -----------------------------
  // PROJECTION
  // -----------------------------
  const projection = useMemo(() => {
    if (!dimensions.width) return null;
    return d3
      .geoNaturalEarth1()
      .fitSize([dimensions.width, dimensions.height], geoData);
  }, [dimensions, geoData]);

  const pathGenerator = useMemo(() => {
    if (!projection) return null;
    return d3.geoPath().projection(projection);
  }, [projection]);

  const centroid = (f: Feature) =>
    pathGenerator?.centroid(f as any) ?? null;

  // -----------------------------
  // FIND FEATURES
  // -----------------------------
  const passportAFeature = geoData.features.find(
    (f) => getISO(f as Feature) === selectedPassport
  );

  const passportBFeature = comparePassport
    ? geoData.features.find(
        (f) => getISO(f as Feature) === comparePassport
      )
    : null;

  const destinationFeature = highlightedCountry
    ? geoData.features.find(
        (f) => getISO(f as Feature) === highlightedCountry
      )
    : null;

  // -----------------------------
  // DRAW FLIGHT PATHS
  // -----------------------------
  useEffect(() => {
    if (!gRef.current) return;
    const g = d3.select(gRef.current);

    g.selectAll('.flight-path').remove();

    if (!destinationFeature || !pathGenerator) return;

    const dest = centroid(destinationFeature);
    if (!dest) return;

    const drawPath = (from: Feature, color: string) => {
      const o = centroid(from);
      if (!o) return;

      const d = `
        M ${o[0]} ${o[1]}
        Q ${(o[0] + dest[0]) / 2} ${Math.min(o[1], dest[1]) - 160}
          ${dest[0]} ${dest[1]}
      `;

      g.append('path')
        .attr('class', 'flight-path')
        .attr('d', d)
        .attr('fill', 'none')
        .attr('stroke', color)
        .attr('stroke-width', 2.5)
        .attr('stroke-dasharray', '6 6')
        .attr('opacity', 0.9)
        .attr('stroke-dashoffset', 120)
        .transition()
        .duration(1200)
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', 0);
    };

    if (passportAFeature) {
      drawPath(passportAFeature, '#2563eb');
    }

    if (passportBFeature) {
      drawPath(passportBFeature, '#2563eb');
    }
  }, [
    highlightedCountry,
    passportAFeature,
    passportBFeature,
    pathGenerator,
  ]);

  // -----------------------------
  // COLOR RESOLUTION
  // -----------------------------
  const resolveColor = (iso: string): string => {
    if (!iso) return '#cbd5e1';

    if (iso === selectedPassport || iso === comparePassport) {
      return '#2563eb'; // azul
    }

    const a = mobilityData.get(iso)?.can_enter;
    const b = comparePassport
      ? compareMobilityData?.get(iso)?.can_enter
      : undefined;

    if (comparePassport) {
      if (a === true && b === true) return '#22c55e';   // ambos entram
      if (a === false && b === false) return '#ef4444';// ambos não entram
      if (a !== b) return '#f97316';                    // conflito
    }

    if (a === true) return '#22c55e';
    if (a === false) return '#ef4444';

    return '#cbd5e1';
  };

  // -----------------------------
  // RENDER
  // -----------------------------
  if (!dimensions.width || !pathGenerator) {
    return <div ref={containerRef} className="w-full h-full" />;
  }

  return (
    <div ref={containerRef} className="w-full h-full relative">
      <svg ref={svgRef} width={dimensions.width} height={dimensions.height}>
        {/* Ocean */}
        <rect width="100%" height="100%" fill="#cfe8f3" />

        <g ref={gRef}>
          {geoData.features.map((f, i) => {
            const d = pathGenerator(f as any);
            if (!d) return null;

            const iso = getISO(f as Feature);

            const dimmed =
              highlightedCountry &&
              iso !== selectedPassport &&
              iso !== comparePassport &&
              iso !== highlightedCountry;

            return (
              <path
                key={i}
                d={d}
                fill={resolveColor(iso)}
                opacity={dimmed ? 0.18 : 1}
                stroke="#ffffff"
                strokeWidth={0.5}
                className="transition-all duration-500"
                onMouseMove={(e) =>
                  setHover({ x: e.clientX, y: e.clientY, f })
                }
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
          isHome={
            getISO(hover.f) === selectedPassport ||
            getISO(hover.f) === comparePassport
          }
        />
      )}
    </div>
  );
};

export default PassportMap;
