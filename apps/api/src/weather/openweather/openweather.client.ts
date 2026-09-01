import { HttpService } from '@nestjs/axios';
import {
  BadGatewayException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { firstValueFrom } from 'rxjs';
import { OpenWeatherResponse } from './openweather.types';

// wraps OpenWeatherMap's "current weather" endpoint
@Injectable()
export class OpenWeatherClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly units: string;

  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
  ) {
    this.baseUrl = this.config.get<string>('openWeather.baseUrl')!;
    this.apiKey = this.config.get<string>('openWeather.apiKey')!;
    this.units = this.config.get<string>('openWeather.units')!;
  }

  async byCity(city: string): Promise<OpenWeatherResponse> {
    return this.request({ q: city });
  }

  async byZip(zip: string, country = 'us'): Promise<OpenWeatherResponse> {
    return this.request({ zip: `${zip},${country}` });
  }

  async byCoordinates(lat: number, lon: number): Promise<OpenWeatherResponse> {
    return this.request({ lat: String(lat), lon: String(lon) });
  }

  private async request(params: Record<string, string>): Promise<OpenWeatherResponse> {
    try {
      const { data } = await firstValueFrom(
        this.http.get<OpenWeatherResponse>(`${this.baseUrl}/data/2.5/weather`, {
          params: {
            ...params,
            appid: this.apiKey,
            units: this.units,
          },
        }),
      );
      return data;
    } catch (err) {
      const axiosErr = err as AxiosError;

      if (axiosErr.response?.status === 404) {
        throw new NotFoundException('No matching location found');
      }

      throw new BadGatewayException('Could not reach OpenWeatherMap');
    }
  }
}
