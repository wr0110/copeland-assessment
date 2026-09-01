import { plainToInstance } from 'class-transformer';
import { IsInt, IsOptional, IsString, Max, Min, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(65535)
  PORT?: number;

  @IsString()
  OPENWEATHER_API_KEY: string;

  @IsOptional()
  @IsString()
  OPENWEATHER_BASE_URL?: string;

  @IsOptional()
  @IsString()
  OPENWEATHER_UNITS?: string;
}

export function validate(config: Record<string, unknown>) {
  const validated = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validated, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(
      `Invalid environment configuration: ${errors.map((e) => e.toString()).join('; ')}`,
    );
  }

  return validated;
}
