import React, { useEffect, useState, useMemo } from 'react';
import {
  fetchWorldMap,
  fetchPassportData,
  createMobilityMap,
  extractCountryOptions,
} from './services/dataService';

import { CountryGeoJSON, MobilityMap, CountryOption } from './types';
import PassportMap from './components/PassportMap';
import Controls from './components/Controls';
import Legend from './components/Legend';
import InfoPanel from './components/InfoPanel';
import Footer from './components/Footer';
import CountrySearch from './components/CountrySearch';

const DEFAULT_PASSPORT = 'us';

const App: React.FC = () => {
  const [geoData, setGeoData] = useState<CountryGeoJSON | null>(null);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [loadingMap, setLoadingMap] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  const [infoOpen, setInfoOpen] = useState(false);
  const [highlightedCountry, setHighlightedCountry] = useState<string | null>(null);

  // Passport A
  const [selectedPassport, setSelectedPassport] = useState<string>(DEFAULT_PASSPORT);
  const [mobilityMap, setMobilityMap] = useState<MobilityMap>(new Map());

  // Passport B (comparação)
  const [comparePassport, setComparePassport] = useState<string | null>(null);
  const [compareMobilityMap, setCompareMobilityMap] = useState<MobilityMap>(new Map());

  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  const [headerVisible, setHeaderVisible] = useState(true);

  // ---------------------------
  // LOAD MAP
  // ---------------------------
  useEffect(() => {
    const loadMap = async () => {
      try {
        setLoadingMap(true);
        const geo = await fetchWorldMap();
        setGeoData(geo);
        setCountries(extractCountryOptions(geo));
      } catch {
        setMapError('Failed to load world map data.');
      } finally {
        setLoadingMap(false);
      }
    };
    loadMap();
  }, []);

  // ---------------------------
  // LOAD PASSPORT A
  // ---------------------------
  useEffect(() => {
    if (!selectedPassport) return;

    const load = async () => {
      try {
        setLoadingData(true);
        const data = await fetchPassportData(selectedPassport);
        setMobilityMap(createMobilityMap(data));
      } catch {
        setDataError(`No visa data for ${selectedPassport.toUpperCase()}`);
        setMobilityMap(new Map());
      } finally {
        setLoadingData(false);
      }
    };
    load();
  }, [selectedPassport]);

  // ---------------------------
  // LOAD PASSPORT B
  // ---------------------------
  useEffect(() => {
    if (!comparePassport) {
      setCompareMobilityMap(new Map());
      return;
    }

    const load = async () => {
      try {
        const data = await fetchPassportData(comparePassport);
        setCompareMobilityMap(createMobilityMap(data));
      } catch {
        setCompareMobilityMap(new Map());
      }
    };
    load();
  }, [comparePassport]);

  // ---------------------------
  // COMPARISON SUMMARY
  // ---------------------------
  const comparison = useMemo(() => {
    if (!comparePassport) return null;

    let onlyA = 0;
    let onlyB = 0;
    let both = 0;

    for (const [iso, a] of mobilityMap.entries()) {
      const b = compareMobilityMap.get(iso);
      if (a?.can_enter && b?.can_enter) both++;
      else if (a?.can_enter && !b?.can_enter) onlyA++;
    }

    for (const [iso, b] of compareMobilityMap.entries()) {
      if (!mobilityMap.get(iso)?.can_enter && b?.can_enter) {
        onlyB++;
      }
    }

    return { onlyA, onlyB, both };
  }, [mobilityMap, compareMobilityMap, comparePassport]);

  if (mapError) {
    return (
      <div className="flex h-screen items-center justify-center text-rose-600 font-semibold">
        {mapError}
      </div>
    );
  }

  if (loadingMap || !geoData) {
    return (
      <div className="flex h-screen items-center justify-center text-slate-600 animate-pulse">
        Loading map…
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* HEADER */}
      {headerVisible && (
        <header className="bg-white border-b border-slate-200 shadow-sm z-10">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
            <div>
              <h1 className="text-sm font-semibold text-slate-800">
                Passport Mobility Map
              </h1>
              <p className="text-[11px] text-slate-500">
                Compare real travel freedom
              </p>
            </div>

            <div className="flex items-center gap-3">
              <Controls
                countries={countries}
                selectedPassport={selectedPassport}
                onSelectPassport={(code) => {
                  setSelectedPassport(code);
                  setHighlightedCountry(null);
                }}
              />

              <select
                value={comparePassport ?? ''}
                onChange={(e) =>
                  setComparePassport(e.target.value || null)
                }
                className="text-xs border rounded px-2 py-1"
              >
                <option value="">Compare with…</option>
                {countries.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.name}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setHeaderVisible(false)}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                ⬆ Hide
              </button>
            </div>
          </div>


        </header>
      )}

      {/* MAP */}
      <main className="relative flex-grow bg-slate-100 overflow-hidden">
        <PassportMap
          geoData={geoData}
          mobilityData={mobilityMap}
          compareMobilityData={compareMobilityMap}
          selectedPassport={selectedPassport}
          comparePassport={comparePassport}
          highlightedCountry={highlightedCountry}
        />


        <div className="absolute bottom-6 left-6 z-20">
          <Legend />
        </div>

        <div className="absolute bottom-6 right-6 z-20 w-72">
          <CountrySearch
            countries={countries}
            onSelect={setHighlightedCountry}
          />
        </div>
      </main>

      <Footer />
      <InfoPanel open={infoOpen} onClose={() => setInfoOpen(false)} />
    </div>
  );
};

export default App;
