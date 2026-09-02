process.env.OPENWEATHER_API_KEY = 'test-key';

import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { OpenWeatherClient } from '../src/weather/openweather/openweather.client';

describe('Weather API (e2e)', () => {
  let app: INestApplication;

  const fakeClient = {
    byCity: jest.fn().mockResolvedValue({
      name: 'Kyiv',
      sys: { country: 'UA' },
      coord: { lat: 50.45, lon: 30.52 },
      weather: [{ main: 'Clear', description: 'clear sky', icon: '01d' }],
      main: { temp: 20, feels_like: 19.5, humidity: 50, pressure: 1015 },
      wind: { speed: 2.1 },
    }),
    byZip: jest.fn(),
    byCoordinates: jest.fn(),
  };

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(OpenWeatherClient)
      .useValue(fakeClient)
      .compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ transform: true, whitelist: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /weather?city=... returns normalized weather data', () => {
    return request(app.getHttpServer())
      .get('/weather')
      .query({ city: 'Kyiv' })
      .expect(200)
      .expect((res) => {
        expect(res.body.location).toBe('Kyiv');
        expect(res.body.condition).toBe('Clear');
      });
  });

  it('GET /weather with no params returns 400', () => {
    return request(app.getHttpServer()).get('/weather').expect(400);
  });
});
