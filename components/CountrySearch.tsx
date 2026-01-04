import React, { useState } from 'react';
import { CountryOption } from '../types';

interface CountrySearchProps {
  countries: CountryOption[];
  onSelect: (code: string | null) => void;
}

const CountrySearch: React.FC<CountrySearchProps> = ({ countries, onSelect }) => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);

  const filtered = countries.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  );

  const handleChange = (value: string) => {
    setQuery(value);
    setOpen(true);

    // 🔥 REGRA IMPORTANTE:
    // se o campo ficar vazio, limpa o highlight no mapa
    if (value.trim() === '') {
      onSelect(null);
      setOpen(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        placeholder="Search destination country…"
        value={query}
        onChange={(e) => handleChange(e.target.value)}
        onFocus={() => setOpen(true)}
        className="
          w-full rounded-lg border border-slate-300
          px-3 py-2 text-sm shadow-sm
          focus:outline-none focus:ring-1 focus:ring-blue-500
        "
      />

      {open && query && (
        <ul
          className="
            absolute bottom-full mb-2 w-full
            max-h-60 overflow-y-auto
            bg-white border border-slate-200
            rounded-lg shadow-xl z-50
          "
        >
          {filtered.length === 0 && (
            <li className="px-3 py-2 text-xs text-slate-400">
              No results
            </li>
          )}

          {filtered.map((country) => (
            <li
              key={country.code}
              onClick={() => {
                setQuery(country.name);
                setOpen(false);
                onSelect(country.code);
              }}
              className="
                px-3 py-2 text-sm cursor-pointer
                hover:bg-slate-100
              "
            >
              {country.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CountrySearch;
