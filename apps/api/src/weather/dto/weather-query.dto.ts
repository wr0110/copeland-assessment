import { Type } from 'class-transformer';
import {
  IsLatitude,
  IsLongitude,
  IsOptional,
  IsString,
  ValidateIf,
} from 'class-validator';

// "exactly one of city/zip/lat+lon" is enforced in WeatherService, not here -
// class-validator doesn't have a clean way to express that across optional fields
export class WeatherQueryDto {
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsString()
  zip?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @ValidateIf((o) => o.lat !== undefined || o.lon !== undefined)
  @Type(() => Number)
  @IsLatitude()
  lat?: number;

  @ValidateIf((o) => o.lat !== undefined || o.lon !== undefined)
  @Type(() => Number)
  @IsLongitude()
  lon?: number;
}
