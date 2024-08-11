import { plainToInstance } from 'class-transformer';
import {
  IsNumber,
  IsString,
  IsOptional,
  IsNotEmpty,
  validateSync,
  ValidationError,
} from 'class-validator';

export class EnvValidation {
  @IsNumber()
  PORT: number;

  @IsString()
  @IsNotEmpty()
  MONGO_URI: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvValidation, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(
      `Config validation error: ${errors
        .map((err: ValidationError) => JSON.stringify(err.constraints))
        .join(', ')}`,
    );
  }
  return validatedConfig;
}
