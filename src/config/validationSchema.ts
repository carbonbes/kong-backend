import * as Joi from 'joi'

export default Joi.object({
  DATABASE_URL: Joi.string().required(),
  REDIS_URL: Joi.string().required(),
  MAILER_HOST: Joi.string().required(),
  MAILER_PORT: Joi.number().integer().required(),
  MAILER_USER: Joi.string().required(),
  MAILER_PASS: Joi.string().required(),
  ACCESS_JWT_SECRET: Joi.string().required(),
  REFRESH_JWT_SECRET: Joi.string().required(),
  ACCESS_JWT_EXPIRES_IN: Joi.number().integer().required(),
  REFRESH_JWT_EXPIRES_IN: Joi.number().integer().required(),
  OTP_SALT_ROUNDS: Joi.number().integer().required(),
  OTP_EXPIRES_IN: Joi.number().integer().required(),
})
