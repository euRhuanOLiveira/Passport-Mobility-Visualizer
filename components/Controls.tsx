import React from 'react';
import { CountryOption } from '../types';

interface ControlsProps {
  countries: CountryOption[];
  selectedPassport: string;
  onSelectPassport: (code: string) => void;
}

/**
 * Passport selector control.
 * Acts as the primary filter for the visualization.
 */
const Controls: React.FC<ControlsProps> = ({
  countries,
  selectedPassport,
  onSelectPassport,
}) => {
  return (
    <div className="w-full max-w-md">
      <label
        htmlFor="passport-select"
        className="block text-sm font-semibold text-slate-700 mb-2"
      >
        Select passport
      </label>

      <div className="relative">
        <select
          id="passport-select"
          value={selectedPassport}
          onChange={(e) => onSelectPassport(e.target.value)}
          className="
            block w-full
            rounded-lg border border-slate-300
            bg-white
            py-3 pl-4 pr-10
            text-slate-800
            shadow-sm
            focus:border-blue-500
            focus:ring-1 focus:ring-blue-500
            focus:outline-none
            sm:text-sm
          "
        >
          <option value="" disabled>
            Choose a country…
          </option>

          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>

        {/* Dropdown arrow */}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
          <svg
            className="h-4 w-4 fill-current"
            viewBox="0 0 20 20"
            aria-hidden
          >
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>

      <p className="mt-2 text-xs text-slate-500">
        Select a passport to see where you can travel without a visa.
      </p>
    </div>
  );
};

export default Controls;
