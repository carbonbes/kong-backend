import { IsNumber, IsString, validateSync } from 'class-validator'
import { plainToInstance } from 'class-transformer'

class EnvVariables {
  @IsString()
  DATABASE_URL: string

  @IsString()
  REDIS_URL: string

  @IsString()
  MAILER_HOST: string

  @IsNumber()
  MAILER_PORT: number

  @IsString()
  MAILER_USER: string

  @IsString()
  MAILER_PASS: string

  @IsString()
  ACCESS_JWT_SECRET: string

  @IsString()
  REFRESH_JWT_SECRET: string

  @IsNumber()
  ACCESS_JWT_EXPIRES_IN: number

  @IsNumber()
  REFRESH_JWT_EXPIRES_IN: number

  @IsString()
  OTP_CODE_NANOID_ALPHABET: string

  @IsNumber()
  OTP_CODE_NANOID_DEFAULT_SIZE: number

  @IsNumber()
  OTP_CODE_BCRYPT_ROUNDS: number

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
