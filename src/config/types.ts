export interface DatabaseConfig {
  url: string
}

export interface JwtSignOptionsConfig {
  accessJwtSecret: string
  refreshJwtSecret: string
  accessJwtExpiresIn: number
  refreshJwtExpiresIn: number
}

export interface MailerConfig {
  host: string
  port: number
  user: string
  pass: string
}

export interface OtpConfig {
  saltRounds: number
  expiresIn: number
}

export interface RedisConfig {
  url: string
}
