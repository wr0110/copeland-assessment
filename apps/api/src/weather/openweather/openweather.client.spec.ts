import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { NotFoundException, BadGatewayException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { OpenWeatherClient } from './openweather.client';

function makeConfig(): ConfigService {
  const values: Record<string, string> = {
    'openWeather.baseUrl': 'https://api.openweathermap.org',
    'openWeather.apiKey': 'test-key',
    'openWeather.units': 'metric',
  };
  return { get: (key: string) => values[key] } as unknown as ConfigService;
}

describe('OpenWeatherClient', () => {
  it('requests by city with the right query params', async () => {
    const get = jest.fn().mockReturnValue(of({ data: { name: 'Kyiv' } }));
    const http = { get } as unknown as HttpService;
    const client = new OpenWeatherClient(http, makeConfig());

    const result = await client.byCity('Kyiv');

    expect(result).toEqual({ name: 'Kyiv' });
    expect(get).toHaveBeenCalledWith(
      'https://api.openweathermap.org/data/2.5/weather',
      { params: { q: 'Kyiv', appid: 'test-key', units: 'metric' } },
    );
  });

  it('requests by zip with a country code', async () => {
    const get = jest.fn().mockReturnValue(of({ data: { name: 'New York' } }));
    const http = { get } as unknown as HttpService;
    const client = new OpenWeatherClient(http, makeConfig());

    await client.byZip('10001', 'us');

    expect(get).toHaveBeenCalledWith(
      'https://api.openweathermap.org/data/2.5/weather',
      { params: { zip: '10001,us', appid: 'test-key', units: 'metric' } },
    );
  });

  it('maps a 404 from OpenWeatherMap to NotFoundException', async () => {
    const get = jest
      .fn()
      .mockReturnValue(throwError(() => ({ response: { status: 404 } })));
    const http = { get } as unknown as HttpService;
    const client = new OpenWeatherClient(http, makeConfig());

    await expect(client.byCity('Nowhereville')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('maps any other failure to BadGatewayException', async () => {
    const get = jest.fn().mockReturnValue(throwError(() => new Error('boom')));
    const http = { get } as unknown as HttpService;
    const client = new OpenWeatherClient(http, makeConfig());

    await expect(client.byCity('Kyiv')).rejects.toBeInstanceOf(
      BadGatewayException,
    );
  });
});
