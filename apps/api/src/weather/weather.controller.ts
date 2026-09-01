import { Controller, Get, Query } from '@nestjs/common';
import { WeatherQueryDto } from './dto/weather-query.dto';
import { WeatherResponseDto } from './dto/weather-response.dto';
import { WeatherService } from './weather.service';

@Controller('weather')
export class WeatherController {
  constructor(private readonly weatherService: WeatherService) {}

  @Get()
  getWeather(@Query() query: WeatherQueryDto): Promise<WeatherResponseDto> {
    return this.weatherService.getCurrentWeather(query);
  }
}
