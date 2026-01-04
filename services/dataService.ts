import {
  CountryGeoJSON,
  MobilityMap,
  PassportDestination,
  CountryOption,
} from '../types';

/**
 * Load world map GeoJSON from public directory
 */
export const fetchWorldMap = async () => {
  const response = await fetch('countries.geo.json')
  if (!response.ok) {
    throw new Error(`Failed to load world map: ${response.statusText}`)
  }
  return response.json()
}

export const fetchPassportData = async (passportCode: string) => {
  const response = await fetch(`passports/${passportCode.toLowerCase()}.json`)
  if (!response.ok) {
    throw new Error(`Failed to load passport data`)
  }
  return response.json()
}

/**
 * Convert destinations list into a Map for fast lookup
 */
export const createMobilityMap = (
  destinations: PassportDestination[]
): MobilityMap => {
  const map: MobilityMap = new Map();

  for (const dest of destinations) {
    if (dest.to) {
      map.set(dest.to.toLowerCase(), dest);
    }
  }

  return map;
};

/**
 * Extract country list for passport selector dropdown
 */
export const extractCountryOptions = (
  geoData: CountryGeoJSON
): CountryOption[] => {
  const options: CountryOption[] = [];
  const seen = new Set<string>();

  for (const feature of geoData.features) {
    const props = feature.properties;
    if (!props) continue;

    const iso =
      (props.ISO_A2 ||
        props.iso_a2 ||
        props.ISO_A2_EH ||
        props.iso_a2_eh ||
        '') as string;

    const code = iso.toLowerCase();
    const name = props.NAME || props.ADMIN || props.name || 'Unknown';

    if (
      code &&
      code.length === 2 &&
      code !== '-99' &&
      !seen.has(code)
    ) {
      seen.add(code);
      options.push({ code, name });
    }
  }

  return options.sort((a, b) => a.name.localeCompare(b.name));
};
