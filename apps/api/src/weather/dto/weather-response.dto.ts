export class WeatherResponseDto {
  location: string;
  country?: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  temperature: number;
  feelsLike: number;
  humidity: number;
  windSpeed: number;
  condition: string;
  description: string;
  icon: string;
}
