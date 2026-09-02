import { FormEvent, useState } from 'react';
import { WeatherQuery } from '../api/weather';

type Mode = 'city' | 'zip' | 'coordinates';

interface Props {
  onSearch: (query: WeatherQuery) => void;
  busy: boolean;
}

export function SearchForm({ onSearch, busy }: Props) {
  const [mode, setMode] = useState<Mode>('city');
  const [city, setCity] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('us');
  const [geoError, setGeoError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    if (mode === 'city') {
      if (!city.trim()) return;
      onSearch({ mode: 'city', city: city.trim() });
    } else if (mode === 'zip') {
      if (!zip.trim()) return;
      onSearch({ mode: 'zip', zip: zip.trim(), country: country.trim() || undefined });
    }
  }

  function useMyLocation() {
    setGeoError(null);

    if (!navigator.geolocation) {
      setGeoError('Geolocation is not supported by this browser');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        onSearch({
          mode: 'coordinates',
          lat: position.coords.latitude,
          lon: position.coords.longitude,
        });
      },
      (err) => setGeoError(err.message),
    );
  }

  return (
    <form onSubmit={handleSubmit} className="search-form">
      <div className="tabs">
        <button
          type="button"
          className={mode === 'city' ? 'active' : ''}
          onClick={() => setMode('city')}
        >
          City
        </button>
        <button
          type="button"
          className={mode === 'zip' ? 'active' : ''}
          onClick={() => setMode('zip')}
        >
          ZIP code
        </button>
        <button
          type="button"
          className={mode === 'coordinates' ? 'active' : ''}
          onClick={() => setMode('coordinates')}
        >
          My location
        </button>
      </div>

      {mode === 'city' && (
        <div className="field-row">
          <input
            aria-label="City name"
            placeholder="e.g. Kyiv"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          />
          <button type="submit" disabled={busy}>
            Get weather
          </button>
        </div>
      )}

      {mode === 'zip' && (
        <div className="field-row">
          <input
            aria-label="ZIP code"
            placeholder="e.g. 10001"
            value={zip}
            onChange={(e) => setZip(e.target.value)}
          />
          <input
            aria-label="Country code"
            className="country-input"
            placeholder="us"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
          />
          <button type="submit" disabled={busy}>
            Get weather
          </button>
        </div>
      )}

      {mode === 'coordinates' && (
        <div className="field-row">
          <button type="button" onClick={useMyLocation} disabled={busy}>
            Use my current location
          </button>
          {geoError && <span className="error">{geoError}</span>}
        </div>
      )}
    </form>
  );
}
