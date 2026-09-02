import { Weather } from '../api/weather';

export function WeatherCard({ weather }: { weather: Weather }) {
  return (
    <div className="weather-card">
      <h2>
        {weather.location}
        {weather.country ? `, ${weather.country}` : ''}
      </h2>
      <div className="weather-main">
        <img
          src={`https://openweathermap.org/img/wn/${weather.icon}@2x.png`}
          alt={weather.description}
        />
        <span className="temperature">{Math.round(weather.temperature)}°</span>
      </div>
      <p className="description">{weather.description}</p>
      <ul className="details">
        <li>Feels like {Math.round(weather.feelsLike)}°</li>
        <li>Humidity {weather.humidity}%</li>
        <li>Wind {weather.windSpeed} m/s</li>
      </ul>
    </div>
  );
}
