import React, { useEffect, useState } from 'react';
import {
  fetchWorldMap,
  fetchPassportData,
  createMobilityMap,
  extractCountryOptions,
} from './services/dataService';
import { fetchPoliticsData } from './services/dataServicePolitics';

import { CountryGeoJSON, MobilityMap, CountryOption } from './types';
import PassportMap from './components/PassportMap';
import Controls from './components/Controls';
import Legend from './components/Legend';
import Footer from './components/Footer';
import CountrySearch from './components/CountrySearch';

const DEFAULT_PASSPORT = 'us';

const DEMOCRACY_TYPES = [
  'Full democracy',
  'Flawed democracy',
  'Hybrid regime',
  'Authoritarian',
];

const App: React.FC = () => {
  const [geoData, setGeoData] = useState<CountryGeoJSON | null>(null);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [loadingMap, setLoadingMap] = useState(true);
  const [mapError, setMapError] = useState<string | null>(null);

  const [highlightedCountry, setHighlightedCountry] = useState<string | null>(null);

  // Passaportes
  const [selectedPassport, setSelectedPassport] = useState(DEFAULT_PASSPORT);
  const [mobilityMap, setMobilityMap] = useState<MobilityMap>(new Map());
  const [comparePassport, setComparePassport] = useState<string | null>(null);
  const [compareMobilityMap, setCompareMobilityMap] = useState<MobilityMap>(new Map());

  // Política
  const [politicsEnabled, setPoliticsEnabled] = useState(false);
  const [politicsData, setPoliticsData] = useState<Record<string, any> | null>(null);
  const [democracyFilters, setDemocracyFilters] = useState<string[]>([]);

  // 🧠 CONTROLE DE MODO
  const [analysisMode, setAnalysisMode] = useState<'neutral' | 'passport'>('passport');

  // MAPA BASE
  useEffect(() => {
    fetchWorldMap()
      .then((geo) => {
        setGeoData(geo);
        setCountries(extractCountryOptions(geo));
      })
      .catch(() => setMapError('Failed to load world map data.'))
      .finally(() => setLoadingMap(false));
  }, []);

  // PASSAPORTE A
  useEffect(() => {
    fetchPassportData(selectedPassport)
      .then((data) => setMobilityMap(createMobilityMap(data)))
      .catch(() => setMobilityMap(new Map()));
  }, [selectedPassport]);

  // PASSAPORTE B
  useEffect(() => {
    if (!comparePassport) {
      setCompareMobilityMap(new Map());
      return;
    }

    fetchPassportData(comparePassport)
      .then((data) => setCompareMobilityMap(createMobilityMap(data)))
      .catch(() => setCompareMobilityMap(new Map()));
  }, [comparePassport]);

  // POLÍTICA (lazy)
  useEffect(() => {
    if (!politicsEnabled || politicsData) return;

    fetchPoliticsData()
      .then(setPoliticsData)
      .catch(() => setPoliticsData(null));
  }, [politicsEnabled, politicsData]);

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
      <header className="bg-white border-b border-slate-200 shadow-sm z-10">
        <div className="max-w-7xl mx-auto px-4 py-2 flex flex-wrap items-center gap-3">
          <Controls
            countries={countries}
            selectedPassport={selectedPassport}
            onSelectPassport={(code) => {
              setSelectedPassport(code);
              setAnalysisMode('passport'); // 🔑 chave
              setHighlightedCountry(null);
            }}
          />

          <select
            value={comparePassport ?? ''}
            onChange={(e) => {
              setComparePassport(e.target.value || null);
              setAnalysisMode('passport');
            }}
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
            onClick={() => {
              setPoliticsEnabled((v) => !v);
              setAnalysisMode('neutral'); // 🔑 entra neutro
              setDemocracyFilters([]);
              setHighlightedCountry(null);
            }}
            className={`text-xs px-2 py-1 rounded border ${
              politicsEnabled
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-600'
            }`}
          >
            Politics {politicsEnabled ? 'ON' : 'OFF'}
          </button>

          {politicsEnabled && (
            <div className="flex gap-2 text-xs">
              {DEMOCRACY_TYPES.map((type) => (
                <label key={type} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={democracyFilters.includes(type)}
                    onChange={(e) =>
                      setDemocracyFilters((prev) =>
                        e.target.checked
                          ? [...prev, type]
                          : prev.filter((t) => t !== type)
                      )
                    }
                  />
                  {type}
                </label>
              ))}
            </div>
          )}
        </div>
      </header>

      <main className="relative flex-grow bg-slate-100 overflow-hidden">
        <PassportMap
          geoData={geoData}
          mobilityData={mobilityMap}
          compareMobilityData={compareMobilityMap}
          selectedPassport={selectedPassport}
          comparePassport={comparePassport}
          highlightedCountry={highlightedCountry}
          politicsEnabled={politicsEnabled}
          politicsData={politicsData ?? undefined}
          democracyFilters={democracyFilters}
          analysisMode={analysisMode}
        />

        <div className="absolute bottom-6 left-6 z-20">
          <Legend politicsEnabled={politicsEnabled} />
        </div>

        <div className="absolute bottom-6 right-6 z-20 w-72">
          <CountrySearch
            countries={countries}
            onSelect={setHighlightedCountry}
          />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default App;
