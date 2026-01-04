import * as d3 from 'd3';
import { Feature } from 'geojson';
import { MobilityMap } from '../types';

interface Props {
  features: Feature[];
  projection: d3.GeoProjection;
  passportA: string;
  passportB?: string | null;
  mobilityA: MobilityMap;
  mobilityB?: MobilityMap;
  destination?: string | null;
}

export function resolveCountryColor(
  iso: string,
  passportA: string,
  passportB: string | null,
  mobilityA: MobilityMap,
  mobilityB?: MobilityMap
): string {
  if (!iso) return '#e5e7eb';

  if (iso === passportA || iso === passportB) return '#2563eb'; // azul

  const a = mobilityA.get(iso)?.can_enter;
  const b = passportB ? mobilityB?.get(iso)?.can_enter : undefined;

  if (passportB) {
    if (a && b) return '#22c55e';       // ambos entram
    if (!a && !b) return '#ef4444';     // ambos não entram
    if (a !== b) return '#f97316';      // conflito
  }

  if (a === true) return '#22c55e';
  if (a === false) return '#ef4444';

  return '#cbd5e1';
}

export function drawFlightPath(
  svg: d3.Selection<SVGGElement, unknown, null, undefined>,
  from: [number, number],
  to: [number, number],
  color: string
) {
  const curve = d3.path();
  curve.moveTo(from[0], from[1]);
  curve.quadraticCurveTo(
    (from[0] + to[0]) / 2,
    from[1] - 80,
    to[0],
    to[1]
  );

  svg.append('path')
    .attr('d', curve.toString())
    .attr('fill', 'none')
    .attr('stroke', color)
    .attr('stroke-width', 2)
    .attr('stroke-dasharray', '6 6')
    .attr('opacity', 0.8)
    .call(path =>
      path
        .attr('stroke-dashoffset', 100)
        .transition()
        .duration(1200)
        .ease(d3.easeLinear)
        .attr('stroke-dashoffset', 0)
    );
}
