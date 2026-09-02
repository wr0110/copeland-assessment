import { useState } from 'react';
import { fetchWeather, Weather, WeatherQuery } from './api/weather';
import { SearchForm } from './components/SearchForm';
import { WeatherCard } from './components/WeatherCard';

export function App() {
  const [weather, setWeather] = useState<Weather | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSearch(query: WeatherQuery) {
    setBusy(true);
    setError(null);

    try {
      const result = await fetchWeather(query);
      setWeather(result);
    } catch (err) {
      setWeather(null);
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="app">
      <h1>Weather</h1>
      <SearchForm onSearch={handleSearch} busy={busy} />
      {error && <p className="error">{error}</p>}
      {weather && <WeatherCard weather={weather} />}
    </main>
  );
}
