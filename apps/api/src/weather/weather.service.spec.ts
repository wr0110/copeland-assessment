import { BadRequestException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { OpenWeatherClient } from './openweather/openweather.client';
import { WeatherService } from './weather.service';

const sampleResponse = {
  name: 'Kyiv',
  sys: { country: 'UA' },
  coord: { lat: 50.45, lon: 30.52 },
  weather: [{ main: 'Clouds', description: 'broken clouds', icon: '04n' }],
  main: { temp: 17, feels_like: 17.3, humidity: 94, pressure: 1012 },
  wind: { speed: 1.6 },
};

describe('WeatherService', () => {
  let service: WeatherService;
  let client: { byCity: jest.Mock; byZip: jest.Mock; byCoordinates: jest.Mock };

  beforeEach(async () => {
    client = {
      byCity: jest.fn().mockResolvedValue(sampleResponse),
      byZip: jest.fn().mockResolvedValue(sampleResponse),
      byCoordinates: jest.fn().mockResolvedValue(sampleResponse),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        WeatherService,
        { provide: OpenWeatherClient, useValue: client },
      ],
    }).compile();

    service = moduleRef.get(WeatherService);
  });

  it('looks up by city and normalizes the response', async () => {
    const result = await service.getCurrentWeather({ city: 'Kyiv' });

    expect(client.byCity).toHaveBeenCalledWith('Kyiv');
    expect(result).toEqual({
      location: 'Kyiv',
      country: 'UA',
      coordinates: { lat: 50.45, lon: 30.52 },
      temperature: 17,
      feelsLike: 17.3,
      humidity: 94,
      windSpeed: 1.6,
      condition: 'Clouds',
      description: 'broken clouds',
      icon: '04n',
    });
  });

  it('looks up by zip, defaulting country when not given', async () => {
    await service.getCurrentWeather({ zip: '10001' });
    expect(client.byZip).toHaveBeenCalledWith('10001', undefined);
  });

  it('looks up by zip with an explicit country', async () => {
    await service.getCurrentWeather({ zip: '10001', country: 'us' });
    expect(client.byZip).toHaveBeenCalledWith('10001', 'us');
  });

  it('looks up by coordinates', async () => {
    await service.getCurrentWeather({ lat: 50.45, lon: 30.52 });
    expect(client.byCoordinates).toHaveBeenCalledWith(50.45, 30.52);
  });

  it('rejects a request with no lookup mode', async () => {
    await expect(service.getCurrentWeather({})).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('rejects a request mixing multiple lookup modes', async () => {
    await expect(
      service.getCurrentWeather({ city: 'Kyiv', lat: 50.45, lon: 30.52 }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
