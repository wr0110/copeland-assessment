export interface Weather {
  location: string;
  country?: string;
  coordinates: { lat: number; lon: number };
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  description: string;
  icon: string;
}

export type WeatherQuery =
  | { mode: 'city'; city: string }
  | { mode: 'zip'; zip: string; country?: string }
  | { mode: 'coordinates'; lat: number; lon: number };

export async function fetchWeather(query: WeatherQuery): Promise<Weather> {
  const params = new URLSearchParams();

  if (query.mode === 'city') {
    params.set('city', query.city);
  } else if (query.mode === 'zip') {
    params.set('zip', query.zip);
    if (query.country) params.set('country', query.country);
  } else {
    params.set('lat', String(query.lat));
    params.set('lon', String(query.lon));
  }

  const res = await fetch(`/weather?${params.toString()}`);

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.message ?? `Request failed (${res.status})`);
  }

  return res.json();
}
