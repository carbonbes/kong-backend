import { IsNumber, IsString, validateSync } from 'class-validator'
import { plainToInstance } from 'class-transformer'

class EnvVariables {
  @IsString()
  DATABASE_URL: string

  @IsString()
  REDIS_URL: string

  @IsString()
  MAIL_HOST: string

  @IsNumber()
  MAIL_PORT: number

  @IsString()
  MAIL_USER: string

  @IsString()
  MAIL_PASS: string

  @IsString()
  ACCESS_JWT_SECRET: string

  @IsString()
  REFRESH_JWT_SECRET: string

  @IsNumber()
  ACCESS_JWT_EXPIRES_IN: number

  @IsNumber()
  REFRESH_JWT_EXPIRES_IN: number

  @IsString()
  OTP_ALPHABET: string

  @IsNumber()
  OTP_SIZE: number

  @IsNumber()
  OTP_HASH_ROUNDS: number

  @IsNumber()
  OTP_EXPIRES_IN: number
}

export function validate(config: Record<string, any>) {
  const validatedConfig = plainToInstance(EnvVariables, config, {
    enableImplicitConversion: true,
  })

  const errors = validateSync(validatedConfig, { skipMissingProperties: false })

  if (errors.length > 0) {
    throw new Error(errors.toString())
  }

  return validatedConfig
}
