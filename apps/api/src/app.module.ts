import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import configuration from './config/configuration';
import { validate } from './config/env.validation';
import { WeatherModule } from './weather/weather.module';

// In production the Dockerfile copies the built React app into ./public
// next to dist/main.js, and NestJS serves it directly - one process, one
// port, which keeps the "gate it behind a VPN" story simple.
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/weather*'],
    }),
    WeatherModule,
  ],
})
export class AppModule {}
