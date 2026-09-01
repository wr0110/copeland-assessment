import { BadRequestException, Injectable } from '@nestjs/common';
import { OpenWeatherClient } from './openweather/openweather.client';
import { OpenWeatherResponse } from './openweather/openweather.types';
import { WeatherQueryDto } from './dto/weather-query.dto';
import { WeatherResponseDto } from './dto/weather-response.dto';

@Injectable()
export class WeatherService {
  constructor(private readonly client: OpenWeatherClient) {}

  async getCurrentWeather(query: WeatherQueryDto): Promise<WeatherResponseDto> {
    const hasCity = !!query.city;
    const hasZip = !!query.zip;
    const hasCoords = query.lat !== undefined && query.lon !== undefined;

    const modesProvided = [hasCity, hasZip, hasCoords].filter(Boolean).length;

    if (modesProvided === 0) {
      throw new BadRequestException(
        'Provide one of: city, zip (optionally with country), or lat & lon',
      );
    }

    if (modesProvided > 1) {
      throw new BadRequestException(
        'Provide only one of: city, zip, or coordinates - not several at once',
      );
    }

    let raw: OpenWeatherResponse;

    if (hasCity) {
      raw = await this.client.byCity(query.city!);
    } else if (hasZip) {
      raw = await this.client.byZip(query.zip!, query.country);
    } else {
      raw = await this.client.byCoordinates(query.lat!, query.lon!);
    }

    return this.normalize(raw);
  }

  private normalize(raw: OpenWeatherResponse): WeatherResponseDto {
    const [conditions] = raw.weather;

    return {
      location: raw.name,
      country: raw.sys?.country,
      coordinates: {
        lat: raw.coord.lat,
        lon: raw.coord.lon,
      },
      temperature: raw.main.temp,
      feelsLike: raw.main.feels_like,
      humidity: raw.main.humidity,
      windSpeed: raw.wind.speed,
      condition: conditions?.main ?? 'Unknown',
      description: conditions?.description ?? '',
      icon: conditions?.icon ?? '',
    };
  }
}
