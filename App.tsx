import React, { useEffect, useState } from 'react';
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

  const [selectedPassport, setSelectedPassport] = useState<string>(DEFAULT_PASSPORT);
  const [mobilityMap, setMobilityMap] = useState<MobilityMap>(new Map());
  const [loadingData, setLoadingData] = useState(false);
  const [dataError, setDataError] = useState<string | null>(null);

  // 🔹 controle do header
  const [headerVisible, setHeaderVisible] = useState(true);

  // --- Load world map ---
  useEffect(() => {
    const loadMap = async () => {
      try {
        setLoadingMap(true);
        const geo = await fetchWorldMap();
        setGeoData(geo);
        setCountries(extractCountryOptions(geo));
      } catch (err) {
        console.error(err);
        setMapError('Failed to load world map data.');
      } finally {
        setLoadingMap(false);
      }
    };
    loadMap();
  }, []);

  // --- Load passport data ---
  useEffect(() => {
    if (!selectedPassport) return;

    const loadPassport = async () => {
      try {
        setLoadingData(true);
        const destinations = await fetchPassportData(selectedPassport);
        setMobilityMap(createMobilityMap(destinations));
      } catch {
        setDataError(`No visa data for ${selectedPassport.toUpperCase()}`);
        setMobilityMap(new Map());
      } finally {
        setLoadingData(false);
      }
    };

    loadPassport();
  }, [selectedPassport]);

  if (mapError) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-rose-600 font-semibold">
        {mapError}
      </div>
    );
  }

  if (loadingMap || !geoData) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <p className="animate-pulse text-slate-600">Loading map…</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* HEADER (COLAPSÁVEL) */}
      {headerVisible && (
        <header className="bg-white border-b border-slate-200 shadow-sm z-10">
          <div className="max-w-7xl mx-auto px-4 py-2 flex items-center justify-between">
            <div>
              <h1 className="text-sm font-semibold text-slate-800">
                Passport Mobility Map
              </h1>
              <p className="text-[11px] text-slate-500">
                Global visa access visualization
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Controls
                countries={countries}
                selectedPassport={selectedPassport}
                onSelectPassport={(code) => {
                  setSelectedPassport(code);
                  setHighlightedCountry(null);
                }}
              />

              <button
                onClick={() => setHeaderVisible(false)}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                ⬆ Hide header
              </button>
            </div>
          </div>
        </header>
      )}

      {/* MAIN */}
      <main className="relative flex-grow bg-slate-100 overflow-hidden">
        {/* BOTÃO CENTRAL PARA MOSTRAR HEADER */}
        {!headerVisible && (
          <div className="absolute top-4 left-0 right-0 z-30 flex justify-center pointer-events-none">
            <button
              onClick={() => setHeaderVisible(true)}
              className="
                pointer-events-auto
                flex items-center gap-3
                px-6 py-2
                rounded-full
                bg-white/90 backdrop-blur
                shadow-lg
                text-sm font-medium text-slate-800
                hover:bg-white
                transition
              "
            >
              <span className="opacity-40">────────</span>
              ⬇ Show header
              <span className="opacity-40">────────</span>
            </button>
          </div>
        )}

        {loadingData && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-blue-200 z-20">
            <div className="h-full bg-blue-600 animate-progress" />
          </div>
        )}

        <PassportMap
          geoData={geoData}
          mobilityData={mobilityMap}
          selectedPassport={selectedPassport}
          highlightedCountry={highlightedCountry}
        />

        {/* Legend + Info */}
        <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-2">
          <Legend />
          <button
            onClick={() => setInfoOpen(true)}
            className="text-xs text-slate-500 hover:text-slate-700"
          >
            ℹ️ About this map
          </button>
        </div>

        {/* Search */}
        <div className="absolute bottom-6 right-6 z-20 w-72">
          <CountrySearch
            countries={countries}
            onSelect={setHighlightedCountry}
          />
        </div>

        {dataError && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-rose-100 text-rose-700 px-4 py-2 rounded-md text-sm border border-rose-200">
            {dataError}
          </div>
        )}
      </main>

      <Footer />
      <InfoPanel open={infoOpen} onClose={() => setInfoOpen(false)} />
    </div>
  );
};

export default App;
